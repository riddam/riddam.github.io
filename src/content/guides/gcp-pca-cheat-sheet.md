---
title: "GCP PCA One-Page Cheat Sheet"
description: "A last-minute reference card for the Google Cloud Professional Cloud Architect exam covering databases, compute, networking, security, cost optimization, migration, and exam strategy."
pubDate: 2026-07-17
tags: ["gcp", "cloud-architect", "certification", "cheat-sheet"]
---

## Exam at a Glance

**2026** · 50–60 questions · 2 hours · $200 · 2 of 4 case studies (20–30%)

Domains: Design **25%** · Provision **17.5%** · Security **17.5%** · Optimize **15%** · Implement **12.5%** · Ops **12.5%**

## Databases (most-tested)

| Service | Use case |
| --- | --- |
| Cloud SQL | Regional OLTP (MySQL/PG/SQLServer) |
| Spanner | Global + strong consistency, 99.999% |
| AlloyDB | High-perf PostgreSQL, HTAP |
| Firestore | NoSQL doc, mobile real-time/offline |
| Bigtable | NoSQL wide-col, IoT/time-series, >1TB |
| Memorystore | Redis/Memcached, sub-ms cache |
| BigQuery | Serverless OLAP warehouse + BQML |

Trigger words:

- **financial + global** → Spanner
- **sensor / time-series** → Bigtable
- **plain relational** → Cloud SQL
- **ad-hoc SQL / dashboards** → BigQuery

## Compute

| Service | Use case |
| --- | --- |
| Compute Engine | OS control, licensing, lift-shift, GPUs |
| GKE Standard | K8s + node control, GPUs |
| GKE Autopilot | K8s, no node ops, pay/pod |
| GKE Enterprise | (Anthos) fleet/hybrid/multicloud |
| Cloud Run | Stateless containers, scale-to-0 |
| Run functions | (Cloud Functions) event-driven |

Trigger words:

- **low ops** → serverless (Run)
- **event-driven** → Run functions
- **K8s simplicity** → Autopilot
- **autoscale + heal VMs** → MIG
- **GKE scale:** HPA = pods · Cluster Autoscaler/NAP = nodes (Autopilot = both)
- **Run jobs** = batch/run-to-completion vs **Run services** = requests

## Storage Classes

| Class | Access pattern |
| --- | --- |
| Standard | frequent · no min · no retrieval fee |
| Nearline | <1/mo · 30-day min |
| Coldline | <1/qtr · 90-day min |
| Archive | <1/yr · 365-day min · compliance |

- Colder = cheaper store, pricier retrieval
- **Lifecycle policies** = auto-tier by age
- **Autoclass** = auto-tier by actual access
- **Bucket Lock** = WORM/retention
- **Signed URLs** = time-limited, no-account access
- Access: **uniform** (IAM, use) vs fine-grained (ACLs)
- Multi-region = geo-redundant HA

| Service | Use case |
| --- | --- |
| Filestore | NFS shared file |
| Local SSD | ephemeral, top IOPS |
| Hyperdisk | (PD) block, tunable IOPS |

## Networking

- **VPC = global**, **subnet = regional**
- Peering = **non-transitive** · CIDRs must **not overlap** (hybrid)

| Service | Use case |
| --- | --- |
| Shared VPC | central net admin, service projects |
| PSC | private access to a service/API |
| Priv Google Access | no-ext-IP VM → Google APIs |
| Cloud NAT | egress for private VMs |
| Cloud Armor | WAF + DDoS at LB |
| NCC | hub-spoke transit (beats non-transit peering) |
| Cloud DNS | public/private zones |
| Service Mesh | (Traffic Director) svc-to-svc, mTLS |
| Cloud IDS | managed intrusion detection |

Trigger words:

- **highest BW, no internet** → Dedicated Interconnect
- **no Google PoP** → Partner Interconnect
- **quick encrypted** → HA VPN (99.99%)
- **global HTTP, 1 IP** → Global Ext App LB
- **preserve src IP / non-HTTP** → Network passthrough LB

## HA / DR

- **RTO** = max downtime
- **RPO** = max data loss (time)
- DR ladder (cheap → fast): backup/restore → pilot light → warm → hot active-active

| Service | HA approach |
| --- | --- |
| GCE | regional MIG, multi-zone |
| Cloud SQL | HA config, standby + failover |
| Spanner | multi-region 99.999% sync |
| GKE | regional = 3 zones |
| Backup + DR Svc | managed backup/restore |

Trigger words:

- **no data loss (RPO ≈ 0)** → sync replication (Spanner MR / SQL HA)
- **zone fail** → regional · **region fail** → multi-region

## IAM & Security

- Hierarchy: Org → Folder → Project → Resource (inherit down; deny/org-policy override)
- Roles: Basic **(avoid)** → Predefined **(use)** → Custom

| Service | Use case |
| --- | --- |
| Workload Id Fed | ext auth, no keys |
| SA impersonation | separation of duties |
| VPC-SC | anti-exfiltration perimeter |
| IAP | app access, no VPN |
| Access Ctx Mgr | access levels for IAP/VPC-SC |
| Binary Auth | only signed images → GKE |
| Secret Manager | secrets + rotation |
| Sens Data Prot | (DLP) find/mask PII |
| Assured Workloads | residency/compliance |
| SCC | posture + threats |
| Asset Inventory | search/audit all resources |
| Google SecOps | (Chronicle) SIEM/SOAR |
| Cloud Identity | user dir; GCDS syncs AD; SSO SAML |
| Workforce Id Fed | ext-IdP employees, no provisioning |

Keys: Google-managed → **CMEK** (KMS) → **HSM** (FIPS L3) → **EKM** (off-cloud)

## Data & Analytics

| Service | Use case |
| --- | --- |
| Pub/Sub | ingest / stream entry |
| Dataflow | Beam, batch + stream, greenfield |
| Dataproc | migrate Spark/Hadoop |
| Composer | Airflow orchestration |
| Data Fusion | visual code-free ETL |
| Dataplex | governance/catalog/lakehouse |
| Looker | governed BI on BQ |
| Datastream | CDC → BigQuery/GCS |
| Healthcare API | FHIR/HL7/DICOM (EHR case) |

IoT pipeline: Pub/Sub → Dataflow → Bigtable + BigQuery

## AI & ML (focus)

**Gemini Enterprise Agent Platform** (formerly Vertex AI)

Key components: Model Garden 200+ · Agent Builder RAG · Gemini Cloud Assist · AI Hypercomputer TPU/GPU · Model Armor · NotebookLM

Build ladder: prebuilt API → Model Garden → RAG/Agent Builder → fine-tune → custom train

Trigger words:

- **chatbot on your docs** → Agent Builder (RAG)
- **design/debug arch** → Gemini Cloud Assist
- **protect LLM (injection/PII)** → Model Armor + DLP
- **off-the-shelf vision/OCR** → prebuilt AI API
- **contact-center / chatbot voice** → Conversational Agents (Dialogflow CX/CCAI)

## Cost Optimization

| Lever | Detail |
| --- | --- |
| Spot VMs | up to ~91% off · batch/interruptible |
| CUD | ~57–70% off · 1/3-yr steady load |
| Sustained Use | auto after >25% of month |
| Lifecycle | auto-tier aging storage |
| Recommender | rightsize idle VMs |
| Budget alerts | notify (no hard cap) |
| Billing → BigQuery | detailed spend analysis |
| Labels | cost allocation/chargeback |
| BQ editions | reservations vs on-demand |

Combine: CUD baseline + Spot burst

## Migration (6 R's)

| Strategy | Tool |
| --- | --- |
| Rehost | lift-shift → Migrate to VMs |
| Replatform | → DB Migration Service |
| Refactor | → Migrate to Containers/GKE |
| Repurchase · Retire · Retain | — |

- **Assess first** = Migration Center (TCO/deps)
- PB offline = **Transfer Appliance**
- Online = Storage Transfer Service
- IaC = **Terraform / Infra Manager**

**deadline / min change** → rehost · **reduce ops** → refactor

## Ops / Observability

Google Cloud Observability (formerly Stackdriver)

| Tool | Purpose |
| --- | --- |
| Monitoring | metrics/SLO/alerts |
| Logging | Log Sinks → BQ/GCS |
| Trace | latency across services |
| Profiler | CPU/heap in prod |
| Audit Logs | Admin = always-on/immutable |

- **centralize logs** → aggregated Log Sink
- SRE: SLI/SLO + error budget; chaos/load/pen test
- **CI/CD:** Cloud Build → Artifact Registry → Cloud Deploy
- **event trigger** → Eventarc · **step orchestration** → Workflows · **cron** → Scheduler · **task queue** → Cloud Tasks

## Renames & Retired

| New name | Old name |
| --- | --- |
| Agent Platform | Vertex AI |
| GKE Enterprise | Anthos |
| Run functions | Cloud Functions |
| Cloud Service Mesh | Traffic Director |
| Observability | Stackdriver |
| Sens Data Prot | DLP |
| Artifact Registry | Container Registry |
| Infra Manager | Deployment Mgr |
| Chrome Ent Prem | BeyondCorp |
| Spot VMs | Preemptible |
| gcloud storage | gsutil |

**Retired (distractors):** Cloud Debugger, IoT Core, Deployment Manager

## Editions & Tiers (capability-gated)

- **SCC:** Standard (free posture) · **Premium** (threat detect, attack paths, PCI/HIPAA compliance) · Enterprise (multi-cloud + SecOps SIEM)
- **Net Service Tiers:** Premium = Google backbone + global LB · Standard = internet egress, regional, cheaper
- **PD/Hyperdisk:** standard (HDD) → balanced → ssd → extreme/Hyperdisk (cost vs IOPS)
- **BigQuery:** on-demand (spiky) vs Editions/slots (predictable heavy)
- **Firestore:** Native (real-time) vs Datastore mode
- **VPN:** Classic 99.9% vs HA VPN 99.99%

## Business & Governance (Section 4, ~15%)

- Success = **business KPIs**, not tech metrics
- Stakeholder + change management; plan training/adoption
- DevOps health = **DORA** (deploy freq, lead time, CFR, MTTR)
- **Buy > build:** managed/SaaS unless it's a differentiator
- **Shared responsibility:** Google = infra/of-the-cloud · You = data/IAM/config/in-the-cloud (more managed = more Google)
- **Compliance:** Compliance Reports Manager (attestations) · Assured Workloads + resourceLocations org policy (residency)
- **Deploy:** Rolling (no downtime, mixed) · Blue/Green (instant rollback, 2x cost) · Canary (small % first) · A/B (experiment)

## WAF Pillars + Exam Tips

**6 pillars:** Ops Excellence · Security · Reliability · Performance · Cost · Sustainability — the tie-breaker

- Read all 4 case studies in advance
- Watch the qualifier: cheapest / least ops / fastest / global / no data loss
- Default: least privilege + managed/serverless
- Eliminate retired services
- Compliance → Assured Workloads + CMEK/EKM + VPC-SC
- ~2 min per question; flag and move on

CLI: `bq` = BigQuery · `gcloud storage` = GCS · `kubectl` = in-GKE (recognition only)

Case studies: Altostrat Media · Cymbal Retail · EHR Healthcare · KnightMotives Automotive
