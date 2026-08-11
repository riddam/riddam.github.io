# Portable Document Extraction Platform

### Python · Kubernetes · GCP + Azure + on-prem · PDF/document extraction · Postgres

---

## What changes from the generic guide

Your constraints move four things:

| Generic advice | Your version | Why |
|---|---|---|
| "S3-compatible storage everywhere" | **fsspec/obstore abstraction in Python** | Azure Blob is not S3-native. Abstract at the Python layer, not the protocol layer. |
| "Serving platform with KServe + gateway" | **Queue-driven batch workers + KEDA** | Extraction is async throughput work. TTFT is irrelevant; pages/sec/$ is everything. |
| "AI gateway is the key abstraction" | **Parser interface is the key abstraction** | Your swappable component is the *document parser*, not the chat model. |
| "pgvector as a starter choice" | **Postgres is the architecture** | You're already modelling in Postgres. It should be queue, metadata store, vector store, and system of record. |

You do **not** need: KServe, Kubeflow, Ray, Istio, a service mesh, or a vector database. Cutting those is the single biggest win available to you.

You **do** need: a parser abstraction, a portable queue, GPU workers with queue-driven autoscaling, a provenance-first Postgres schema, and compliance-aware routing.

---

## 1. The architecture

```
  Ingest (GCS / Azure Blob / on-prem MinIO / SFTP drop)
        │
        ▼
  ┌──────────────┐   classify: tenant, doc type, sensitivity
  │  Router      │───────────────────────────────────────────┐
  └──────┬───────┘                                            │
         │ sensitive=false                       sensitive=true│
         ▼                                                     ▼
  ┌────────────────────────┐                     ┌────────────────────────┐
  │  CLOUD SITE (GKE/AKS)  │                     │  ON-PREM SITE (RKE2)   │
  │                        │                     │                        │
  │  pgmq queue: parse     │                     │  pgmq queue: parse     │
  │  ├─ CPU workers ──┐    │                     │  ├─ CPU workers        │
  │  │  text-layer    │    │                     │  ├─ GPU workers        │
  │  ├─ GPU workers   │    │                     │  └─ local VLM only     │
  │  │  Docling/VLM   │    │                     │                        │
  │  └─ LLM fallback ─┘    │                     │  ⚠ no cloud egress     │
  │     (via gateway)      │                     │                        │
  │                        │                     │                        │
  │  Postgres (Cloud SQL / │                     │  Postgres (CloudNativePG)│
  │  Azure Flexible Server)│                     │                        │
  └────────────────────────┘                     └────────────────────────┘
         │                                                     │
         └──────────► same schema, same code, same chart ◄──────┘
```

**Both sites run the identical container image and Helm chart.** The only differences are values: which storage backend, which parser tier is enabled, whether cloud LLM fallback is permitted.

---

## 2. Abstraction #1 — the parser interface

This is the most important 40 lines of code in your system. Every parser, cloud service, and VLM goes behind it.

```python
# core/parsing/base.py
from dataclasses import dataclass
from typing import Protocol, Literal
from pathlib import Path

@dataclass(frozen=True)
class Block:
    page: int
    kind: Literal["heading", "paragraph", "table", "figure", "list", "formula", "caption"]
    text: str | None
    bbox: tuple[float, float, float, float]   # normalized 0-1, ALWAYS populate
    reading_order: int
    confidence: float | None = None
    html: str | None = None                    # for tables

@dataclass(frozen=True)
class ParsedDocument:
    blocks: list[Block]
    page_count: int
    markdown: str
    raw: dict                                  # parser-native output, straight to JSONB
    parser: str                                # "docling"
    parser_version: str                        # "2.58.0"
    model_versions: dict[str, str]             # {"layout": "rt-detr-v2", "table": "tableformer-1.1"}
    duration_ms: int
    page_costs: dict[str, float] | None = None

class DocumentParser(Protocol):
    name: str
    def supports(self, mime: str) -> bool: ...
    def parse(self, path: Path, *, page_range: tuple[int, int] | None = None) -> ParsedDocument: ...
```

Implement `DoclingParser`, `VlmOcrParser`, `AzureDocIntelligenceParser`, `GoogleDocAIParser`, `TextLayerParser`. Nothing else in your codebase imports a parser library directly.

**Why this matters more than usual for you:** the OCR field is churning monthly. Wrapping everything behind one `parse(path) -> StructuredDoc` function lets you A/B parsers, fall back between them, and swap in the current leader without touching downstream code. Given how fast this space moved through 2025–2026, that optionality is worth building on day one.

### Parser selection

| Parser | License | Runs on | Use for | Watch out |
|---|---|---|---|---|
| **PyMuPDF text layer** | AGPL (commercial license available) | CPU, ~ms/page | Born-digital PDFs — often 50–70% of enterprise corpora | AGPL. Budget for the commercial license or use pypdfium2. |
| **Docling** (IBM) | MIT | **CPU or GPU** | Your default. Structured `DoclingDocument`, handles PDF/DOCX/PPTX/XLSX/HTML/images | Not on public accuracy leaderboards — benchmark on your own docs |
| **VLM OCR** (dots.ocr, PaddleOCR-VL, DeepSeek-OCR, olmOCR-2) | Mostly MIT/Apache | GPU | Scans, handwriting, stamps, poor-quality images | 3–8+ GB VRAM each; sizes your worker concurrency |
| **Marker** (Datalab) | **GPL-3.0 code + RAIL-M weights** | GPU | Raw speed | ⚠️ **The RAIL-M weight license restricts commercial use above a revenue threshold.** Get legal sign-off before it enters your build. This has bitten a lot of enterprises. |
| **MinerU** | AGPL | GPU | CJK, complex academic layouts, formulas | Its HTML-style structural tags are a poor fit for text-based field extraction |
| **Azure Document Intelligence / Google Document AI** | Commercial | Cloud only | Structured forms, prebuilt invoice/receipt models | **Cannot run on-prem.** Only for non-sensitive classes. |

**Recommended default for you: Docling.** MIT license, pure-CPU capable (huge for on-prem sites without GPUs), broad format support beyond PDF, and a structured output model designed for exactly this. On layout detection its RT-DETR model reaches above 85% mAP on DocLayNet's standard element classes, and TableFormer hits TEDS above 91% on FinTabNet in accurate mode — cell-level table accuracy is usually the number that decides whether your extracted financials are trustworthy.

Add a VLM tier behind it. Built-in OCR fallbacks in the pipeline parsers handle clean scans fine but struggle with low-quality scans, handwriting, stamps, and mixed scripts; routing those pages to a VLM first gives substantially better text.

### The routing ladder

Run the cheapest path that works. This is where your cost lives.

```python
def route(page) -> str:
    if page.has_text_layer:            return "text_layer"    # ~$0, ms
    if page.is_clean_scan:             return "docling"       # CPU or 1 GPU
    if page.is_degraded_or_handwritten:return "vlm_ocr"       # GPU
    if needs_semantic_understanding:   return "llm_extract"   # most expensive
```

The routing decision for the first branch is trivially cheap: PyMuPDF's `get_text()` returns an empty string on image-only pages. One call, no model.

The economics justify the ladder. Self-hosted VLM OCR runs roughly **$140–$700 per million pages** on H100-class hardware versus **$1,500+** for cloud vision APIs — one analysis puts self-hosted pipelines around 167× cheaper per page than commercial vision API calls, and olmOCR-2 lands near $178/million pages on an H100 with vLLM. DeepSeek-OCR can push 200k+ pages/day on a single 40 GB A100. At your likely volume, the ladder plus self-hosting is the difference between a line item and a crisis.

⚠️ **Benchmark on your own documents.** Performance across document types and languages varies enormously, and your domain is probably not well represented in public benchmarks. Collect 200–500 representative pages with ground truth before you commit to any parser.

---

## 3. Abstraction #2 — storage across GCS, Azure Blob, and MinIO

Do this at the Python layer. `fsspec` gives you one API over `gcsfs`, `adlfs`, and `s3fs`.

```python
# core/storage.py
import fsspec
from functools import lru_cache

@lru_cache
def fs():
    # STORAGE_URL: gs://bucket | abfs://container@account.dfs.core.windows.net | s3://bucket
    return fsspec.core.url_to_fs(settings.STORAGE_URL)[0]

def read_bytes(key: str) -> bytes:
    with fs().open(f"{settings.STORAGE_ROOT}/{key}", "rb") as f:
        return f.read()
```

Credentials come from the platform, never from code:
- **GKE** → Workload Identity → the GCS SDK picks it up
- **AKS** → Azure Workload Identity → `DefaultAzureCredential`
- **On-prem** → MinIO access key from External Secrets Operator → Vault

One env var (`STORAGE_URL`) is the entire difference between your three environments.

---

## 4. The queue: use Postgres

You already run Postgres in all three environments. Pub/Sub and Azure Service Bus are not portable; Kafka/NATS is infrastructure you don't need yet. **Use `pgmq` or plain `SELECT ... FOR UPDATE SKIP LOCKED`.**

```sql
CREATE EXTENSION IF NOT EXISTS pgmq;
SELECT pgmq.create('parse_cpu');
SELECT pgmq.create('parse_gpu');
SELECT pgmq.create('parse_restricted');   -- on-prem workers only
```

The decisive advantage: **KEDA has a native PostgreSQL scaler**, so queue-driven GPU autoscaling works identically on GKE, AKS, and bare metal, with no cloud-specific scaler configuration.

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata: {name: parse-gpu-workers}
spec:
  scaleTargetRef: {name: parse-gpu-worker}
  minReplicaCount: 0            # scale to zero — GPUs idle at night cost real money
  maxReplicaCount: 12
  cooldownPeriod: 300           # long: model load is slow, don't thrash
  triggers:
    - type: postgresql
      metadata:
        query: "SELECT count(*) FROM pgmq.q_parse_gpu WHERE vt <= now()"
        targetQueryValue: "20"  # ~20 queued docs per worker
        connectionFromEnv: DATABASE_URL
```

Scale-to-zero on GPU workers is the single biggest cost lever in this architecture. Batch extraction has no latency SLA — let the queue absorb the burst.

**Sizing rule:** worker count is bounded by VRAM, not CPU. Marker sits around 3–5 GB per worker and MinerU-class models want ≥8 GB VRAM; that ceiling is what OOM-kills a worker at 2 a.m. Set replica limits from measured peak memory under real batch sizes, not from nominal model size.

---

## 5. The Postgres data model

This is where you'll get the most durable value, so here it is properly. Four design commitments:

1. **Content-addressed.** Documents are identified by SHA-256 of bytes. Reprocessing the same file is free and idempotent.
2. **Extraction runs are immutable and versioned.** You will re-extract everything when you upgrade a parser. Never overwrite — add a run and promote it.
3. **Every extracted value carries provenance** (page + bbox + block + run). Non-negotiable for compliance, and it's also what powers "click the number, see it highlighted in the PDF."
4. **JSONB for raw, columns for queried.** Keep the parser's native output verbatim; project out only what you filter and join on.

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─────────────────────────────────────────────────────────────
-- Layer 1: physical bytes (deduplicated across tenants)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE blobs (
    sha256          bytea PRIMARY KEY,
    byte_size       bigint      NOT NULL,
    mime_type       text        NOT NULL,
    storage_url     text        NOT NULL,       -- gs:// | abfs:// | s3://
    page_count      int,
    has_text_layer  boolean,
    is_encrypted    boolean     DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- Layer 2: logical documents (business identity + governance)
-- ─────────────────────────────────────────────────────────────
CREATE TYPE sensitivity AS ENUM ('public','internal','confidential','restricted');

CREATE TABLE documents (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid        NOT NULL,
    blob_sha256         bytea       NOT NULL REFERENCES blobs(sha256),
    source_system       text        NOT NULL,
    source_ref          text,                        -- external ID for reconciliation
    filename            text        NOT NULL,
    doc_type            text,                        -- invoice | contract | policy | ...
    sensitivity         sensitivity NOT NULL DEFAULT 'internal',
    residency           text        NOT NULL DEFAULT 'any',   -- any | eu | onprem_only
    current_run_id      uuid,                        -- FK added below (promoted run)
    received_at         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, source_system, source_ref)
);
CREATE INDEX ON documents (tenant_id, doc_type, received_at DESC);
CREATE INDEX ON documents (blob_sha256);
CREATE INDEX ON documents USING gin (filename gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────
-- Layer 3: extraction runs — immutable, comparable, promotable
-- ─────────────────────────────────────────────────────────────
CREATE TYPE run_status AS ENUM ('queued','running','succeeded','failed','partial');

CREATE TABLE extraction_runs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     uuid        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    parser          text        NOT NULL,        -- docling | vlm_ocr | azure_di | text_layer
    parser_version  text        NOT NULL,
    model_versions  jsonb       NOT NULL DEFAULT '{}',
    params          jsonb       NOT NULL DEFAULT '{}',
    site            text        NOT NULL,        -- gcp-eu | azure-we | dc1  (audit trail)
    status          run_status  NOT NULL DEFAULT 'queued',
    error           text,
    pages_processed int,
    duration_ms     int,
    cost_usd        numeric(12,6),
    raw_output      jsonb,                       -- parser-native, verbatim
    started_at      timestamptz,
    finished_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON extraction_runs (document_id, created_at DESC);
CREATE INDEX ON extraction_runs (parser, parser_version, status);

ALTER TABLE documents
  ADD CONSTRAINT documents_current_run_fk
  FOREIGN KEY (current_run_id) REFERENCES extraction_runs(id);

-- ─────────────────────────────────────────────────────────────
-- Layer 4: structure — pages and layout blocks
-- ─────────────────────────────────────────────────────────────
CREATE TABLE pages (
    run_id          uuid    NOT NULL REFERENCES extraction_runs(id) ON DELETE CASCADE,
    page_no         int     NOT NULL,
    width_pt        real,
    height_pt       real,
    rotation        int     DEFAULT 0,
    had_text_layer  boolean,
    route_taken     text,                        -- text_layer | docling | vlm_ocr
    image_url       text,                        -- rendered PNG, for the review UI
    PRIMARY KEY (run_id, page_no)
);

CREATE TYPE block_kind AS ENUM
    ('heading','paragraph','table','figure','list','formula','caption','header','footer');

CREATE TABLE blocks (
    id              bigserial PRIMARY KEY,
    run_id          uuid       NOT NULL REFERENCES extraction_runs(id) ON DELETE CASCADE,
    page_no         int        NOT NULL,
    parent_id       bigint     REFERENCES blocks(id),   -- section hierarchy
    kind            block_kind NOT NULL,
    reading_order   int        NOT NULL,
    bbox            box        NOT NULL,                -- normalized 0-1
    text            text,
    html            text,                               -- table structure
    confidence      real,
    FOREIGN KEY (run_id, page_no) REFERENCES pages(run_id, page_no) ON DELETE CASCADE
);
CREATE INDEX ON blocks (run_id, page_no, reading_order);
CREATE INDEX ON blocks USING gin (text gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────
-- Layer 5: the business payload — extracted fields with provenance
-- ─────────────────────────────────────────────────────────────
CREATE TABLE extracted_fields (
    id              bigserial PRIMARY KEY,
    run_id          uuid    NOT NULL REFERENCES extraction_runs(id) ON DELETE CASCADE,
    document_id     uuid    NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    field_key       text    NOT NULL,            -- invoice.total | contract.party.name
    value_text      text,
    value_numeric   numeric,
    value_date      date,
    value_json      jsonb,
    unit            text,                        -- currency code, UoM
    confidence      real,
    method          text    NOT NULL,            -- regex | layout | llm | human
    -- provenance: this is the part people skip and regret
    source_block_id bigint  REFERENCES blocks(id),
    source_page_no  int,
    source_bbox     box,
    UNIQUE (run_id, field_key)
);
CREATE INDEX ON extracted_fields (document_id, field_key);
CREATE INDEX ON extracted_fields (field_key, value_numeric) WHERE value_numeric IS NOT NULL;

-- Human corrections: your audit trail AND your eval set AND your training data
CREATE TABLE field_corrections (
    id              bigserial PRIMARY KEY,
    document_id     uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    field_key       text NOT NULL,
    corrected_value jsonb NOT NULL,
    previous_value  jsonb,
    reviewer        text NOT NULL,
    reason          text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- Layer 6: retrieval chunks (only if you need RAG)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE chunks (
    id              bigserial PRIMARY KEY,
    document_id     uuid    NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    run_id          uuid    NOT NULL REFERENCES extraction_runs(id) ON DELETE CASCADE,
    tenant_id       uuid    NOT NULL,                    -- denormalized for filtered ANN
    ordinal         int     NOT NULL,
    text            text    NOT NULL,
    token_count     int,
    block_ids       bigint[],                            -- provenance back to layout
    embedding_model text    NOT NULL,
    embedding       vector(1024),
    UNIQUE (run_id, ordinal)
);
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
CREATE INDEX ON chunks (tenant_id, document_id);
```

### The pattern that saves you later: promotion

```sql
-- Re-extract everything with a new parser, compare, then promote atomically.
BEGIN;
UPDATE documents d
SET current_run_id = r.id
FROM extraction_runs r
WHERE r.document_id = d.id
  AND r.parser = 'docling' AND r.parser_version = '2.60.0'
  AND r.status = 'succeeded'
  AND d.tenant_id = $1;
COMMIT;
```

Old runs stay queryable. Rollback is one UPDATE. You can diff two parsers over the same corpus with a plain SQL join — which is exactly the eval harness you need to safely upgrade.

### Reads go through a view, always

```sql
CREATE VIEW v_document_fields AS
SELECT d.id AS document_id, d.tenant_id, d.doc_type,
       f.field_key,
       COALESCE(c.corrected_value #>> '{}', f.value_text) AS value_text,
       f.value_numeric, f.value_date,
       (c.id IS NOT NULL) AS human_verified,
       f.confidence, f.source_page_no, f.source_bbox
FROM documents d
JOIN extracted_fields f ON f.run_id = d.current_run_id
LEFT JOIN field_corrections c
       ON c.document_id = d.id AND c.field_key = f.field_key;
```

Application code queries the view. It never needs to know about runs, promotion, or corrections.

### Scale notes

- **Partition** `blocks` and `chunks` by `run_id` hash or by month once you pass ~100M rows. `blocks` grows fastest — roughly 50–200 rows per page.
- **pgvector limits:** comfortable to roughly 10M chunks, workable to 50–100M, past which HNSW rebuild times get painful (6+ hour rebuilds are reported on production datasets). Use pgvector 0.8+ **iterative index scans** so your tenant filters don't silently destroy recall — that's the failure mode that actually bites, not raw scale. If memory becomes the constraint, `pgvectorscale`'s StreamingDiskANN keeps the footprint bounded on NVMe. Only consider Qdrant/Milvus at billions of vectors, sub-20ms p99 requirements, or heavy re-embedding churn causing MVCC bloat.
- **Re-embedding churn is your likely pain point,** not vector count — every parser upgrade re-embeds the corpus. Write new chunk rows under a new `run_id` and drop the old partition rather than updating in place.

### If "data modelling" also means analytics

Keep the operational schema above as the source of truth, and build marts on top with **dbt** (`dbt-postgres` works identically in all three environments). Operational tables stay normalized and provenance-heavy; marts are denormalized and wide. Don't let BI requirements distort the extraction schema.

---

## 6. Compliance routing

Enforce residency at the queue, not in application logic. Application-level checks get bypassed; queue topology cannot be.

```python
def enqueue(doc: Document) -> str:
    if doc.sensitivity == "restricted" or doc.residency == "onprem_only":
        return "parse_restricted"        # only on-prem workers poll this
    if doc.needs_gpu:
        return "parse_gpu"
    return "parse_cpu"
```

Back it with infrastructure:

- On-prem workers poll **only** `parse_restricted`; cloud workers have no grant on that queue (Postgres role-level, not code-level).
- Cloud LLM/Document AI backends are **absent from the on-prem values file entirely** — the config to reach them doesn't exist there.
- Default-deny egress NetworkPolicy on on-prem worker namespaces, with an allow-list that contains no public endpoints.
- `extraction_runs.site` records where every page was processed. That column is your audit answer to "prove this document never left the building."

For GDPR/residency across GCP and Azure, add region to the same mechanism: `residency='eu'` maps to EU-region queues and EU-region model endpoints.

---

## 7. GKE vs AKS: the small delta

Ninety percent of your Helm chart is shared. The differences:

| Concern | GKE | AKS | On-prem |
|---|---|---|---|
| Identity | Workload Identity (`iam.gke.io/gcp-service-account` annotation) | Azure Workload Identity (`azure.workload.identity/client-id` label) | ESO → Vault |
| Storage URL | `gs://bucket` | `abfs://container@acct.dfs.core.windows.net` | `s3://bucket` (MinIO) |
| Postgres | Cloud SQL + Cloud SQL Auth Proxy sidecar | Flexible Server + private endpoint | CloudNativePG operator |
| GPU nodes | `cloud.google.com/gke-accelerator` nodeSelector, GPU driver DaemonSet | `sku=gpu` taint + NVIDIA device plugin | NVIDIA GPU Operator |
| StorageClass | `premium-rwo` / Filestore for RWX | `managed-csi-premium` / Azure Files for RWX | `ceph-rbd` / CephFS |
| Ingress | GKE Gateway or ingress-nginx | AGIC or ingress-nginx | ingress-nginx or MetalLB |

**Use ingress-nginx and the NVIDIA GPU Operator on all three** rather than each cloud's native option. Slightly less integrated, dramatically less divergence to maintain.

Everything above lives in `values-gcp.yaml` / `values-azure.yaml` / `values-onprem.yaml`. If a difference can't be expressed as a value, push it into a per-cloud Terraform output instead of a chart conditional.

---

## 8. Worker ops — the things that break at 2 a.m.

**Cache by content hash.** Documents get reprocessed constantly — re-ingests, retries, pipeline reruns. Key the cache on `(sha256, parser, parser_version, params_hash)`. Parsing is expensive enough that this pays for itself in week one, and your schema already gives it to you for free.

**Cap per-document time and fall back, don't drop.** A 900-page scanned appendix will hang a GPU worker indefinitely. Set a hard timeout; on breach, fall back to a cheaper path (Docling pipeline, or raw text-layer extraction) and mark the run `partial`. Silently dropping documents is the worst possible failure mode in a compliance context.

**Split large documents by page range.** `parse(path, page_range=(0, 50))` lets you fan a 2,000-page PDF across workers and merge by `reading_order`. Without this, tail latency is unbounded.

**Make workers stateless and idempotent.** Message redelivery is guaranteed to happen. `INSERT ... ON CONFLICT (run_id, field_key) DO UPDATE` everywhere.

**Pre-bake models into the image or a shared RWX PVC.** Downloading model weights on pod start turns a 30-second scale-up into five minutes and will break your air-gapped site outright.

**Watch memory, not latency.** Set `resources.limits.memory` from measured peak under real batch sizes and let the pod OOM-kill fast rather than degrade the node.

**Track these metrics from day one:** pages/sec per worker, cost per 1k pages by route, route distribution (what % hit each ladder tier), parser failure rate by doc type, GPU utilization and VRAM headroom, queue depth and age of oldest message.

---

## 9. Build order

**Weeks 1–2 — Vertical slice, one environment**
Python worker + `DocumentParser` protocol with two implementations (text-layer, Docling) + the full Postgres schema + pgmq. Run it in your existing cluster. Process 500 real documents end to end. *Exit: you can query `v_document_fields` and get correct values with page/bbox provenance.*

**Weeks 3–4 — Benchmark and route**
Build the ground-truth set (200–500 pages spanning your actual document mix). Benchmark Docling vs. one VLM vs. Azure Document Intelligence on *your* documents. Implement the routing ladder. Measure cost per 1k pages per route. *Exit: a defensible parser choice backed by your own numbers, plus a repeatable eval you can rerun on every upgrade.*

**Weeks 5–6 — Portability**
Extract the storage abstraction. Split values into `values-gcp.yaml` / `values-azure.yaml`. Deploy to the second cloud. Add KEDA scale-to-zero on GPU workers. *Exit: second cloud onboarded in under a week; the values delta is under 30 lines.*

**Weeks 7–9 — On-prem and compliance**
RKE2 cluster, CloudNativePG, MinIO. Deploy with `values-onprem.yaml` and CPU-only Docling if you lack GPUs there. Implement queue-level residency routing and egress lockdown. Argo CD pulling outbound only. *Exit: a restricted document is provably processed on-prem, with `extraction_runs.site` as evidence.*

**Weeks 10–12 — Harden**
Re-extraction and promotion workflow. Human review UI driven by bbox provenance. Corrections feeding the eval set. dbt marts. Air-gap bundle if required. *Exit: you can upgrade a parser across the whole corpus, compare against the previous run in SQL, and roll back with one UPDATE.*

---

## 10. Things I'd flag as risks in your specific setup

1. **Marker's licensing.** GPL-3.0 code plus RAIL-M weights with a commercial revenue threshold. If anyone has already prototyped with it, get legal involved now rather than after it's load-bearing.
2. **PyMuPDF is AGPL.** Very commonly used for the text-layer fast path and very commonly missed in license review. pypdfium2 (BSD/Apache) is the clean alternative.
3. **If on-prem has no GPUs**, Docling's CPU path is what makes this architecture viable at all — verify throughput on your hardware early, because it's the assumption the whole compliance story rests on.
4. **Cloud egress costs** between GCP and Azure if you process in one and store in the other. Keep processing co-located with storage; don't let the two clouds become one distributed system.
5. **The review UI is not optional.** Extraction accuracy is never 100%. Without human corrections captured in `field_corrections`, you have no eval set, and without an eval set you can never safely upgrade a parser — your "portable" platform freezes on whatever you deployed first.
6. **Don't add a vector database.** With Postgres already central, pgvector will carry you well past where you think it won't, and one fewer stateful system to replicate across three environments is worth a lot.

---

*Parser landscape, model names, and benchmark numbers move fast in this space — re-verify parser choices at each major upgrade, and treat your own ground-truth benchmark as the authority over any published comparison.*
