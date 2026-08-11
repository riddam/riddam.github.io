# Building a Cloud-Portable AI Platform

### Run the same AI stack on AWS, Azure, GCP, OCI, a sovereign cloud, or your own datacenter — and let them talk to each other

---

## 0. The short answer

There is no "install this one package" solution. What actually exists is a **portability contract**: a small set of open standards that every cloud and every on-prem environment implements. If you build strictly against that contract, your AI platform becomes a set of Helm charts you can `helm install` anywhere in about 20 minutes.

The contract, in one line:

> **OCI containers + Kubernetes + OpenAI-compatible HTTP + S3-compatible object storage + OpenTelemetry + Postgres/pgvector + GitOps.**

Everything below is an elaboration of that sentence. The consensus production stack as of 2026 is **Kubernetes as substrate, vLLM as the inference engine, KServe as the serving control plane, Kueue for GPU scheduling, Ray for distributed training**, an AI gateway in front, and Argo CD reconciling it all from Git.

**Time-to-value expectation:** a working single-cluster stack in 1–2 days, a production multi-cloud + on-prem topology in 6–10 weeks.

---

## 1. First, decide what you're actually building

"AI framework" means at least three very different things. Most failed platform projects tried to build all three at once. Pick your entry point:

| Fork | You need | Skip |
|---|---|---|
| **A. Inference platform** — serve models (LLMs, embeddings, classic ML) behind an API | Serving runtime, GPU scheduling, autoscaling, gateway, model registry | Training infra, pipelines |
| **B. Training / MLOps platform** — fine-tune, batch jobs, experiments | Job orchestration, distributed training, experiment tracking, feature/artifact store | Low-latency serving, gateway |
| **C. Application / agent platform** — RAG, agents, tools, chat products | Gateway, vector store, tracing/evals, workflow engine, secrets | Custom training operators |

**Most organizations should start with A, add C, and only build B when they have a proven need to train.** Fine-tuning is cheaper to rent than to operate.

The rest of this guide builds a stack that covers **A + C fully and B optionally**, because that's the highest-value portable core.

---

## 2. The portability contract — eight rules

These are the rules that decide whether you can move. Violate one and you've bought a migration project later.

1. **Kubernetes is the only runtime abstraction you're allowed to depend on.**
   Not Lambda, not Cloud Run, not SageMaker Endpoints, not Vertex Pipelines. Every hyperscaler, every sovereign cloud, and every on-prem distro (OpenShift, Rancher/RKE2, k3s, Talos, Kubespray) gives you a conformant API. That API is your portability layer.

2. **Every model is served behind an OpenAI-compatible HTTP interface.**
   `/v1/chat/completions`, `/v1/completions`, `/v1/embeddings`. This is now the de facto lingua franca. It means a self-hosted vLLM pod, Bedrock, Azure OpenAI, and Anthropic's API are all interchangeable behind one gateway. Never let application code import a vendor SDK directly.

3. **All artifacts live in S3-compatible object storage.**
   Model weights, datasets, checkpoints, indices. AWS S3, GCS (S3 interop), Azure Blob (via a shim), MinIO/Ceph RGW on-prem — one `boto3`/`s3fs` code path everywhere. Address them with a config value, never a hardcoded scheme.

4. **State lives in Postgres, not a proprietary datastore.**
   Metadata, job state, app state, and — for most teams — vectors too, via `pgvector`. Postgres is the single most portable stateful service in existence (RDS, Cloud SQL, Azure Database, CloudNativePG on-prem).

5. **Infrastructure is declared in OpenTofu/Terraform; workloads in Helm; delivery via GitOps.**
   Cloud-specific code is quarantined into thin per-cloud modules that all expose the *same outputs* (cluster endpoint, node pools, bucket, DB DSN). The workload layer never knows which cloud it's on.

6. **Observability is OpenTelemetry.**
   OTLP out of every component into a collector you own. The collector is the only thing that knows whether the backend is Datadog, Grafana Cloud, or a self-hosted LGTM stack.

7. **Identity is OIDC + SPIFFE, not cloud IAM.**
   Use IRSA/Workload Identity for the *cloud edges only*. Service-to-service identity inside and across clusters should be workload certificates (SPIFFE/SPIRE or your mesh's built-in CA), which work identically on-prem.

8. **Assume no inbound connectivity to on-prem, ever.**
   Design every on-prem↔cloud interaction as **outbound-initiated from on-prem**. Firewall change requests are where hybrid projects go to die. (Section 7 covers this in depth.)

---

## 3. Reference architecture

```
                              ┌─────────────────────────────────────┐
                              │   Git (single source of truth)      │
                              │   infra/ · platform/ · apps/        │
                              └──────────────┬──────────────────────┘
                                             │ pull (outbound only)
        ┌────────────────────────────────────┼────────────────────────────────────┐
        │                                    │                                    │
┌───────▼──────────┐              ┌──────────▼─────────┐              ┌───────────▼────────┐
│  CLOUD A (EKS)   │              │  CLOUD B (GKE/AKS) │              │  ON-PREM (RKE2)    │
│                  │              │                    │              │                    │
│  Argo CD agent   │              │  Argo CD agent     │              │  Argo CD agent     │
│  ─────────────   │              │  ─────────────     │              │  ─────────────     │
│  AI Gateway      │◄────mesh────►│  AI Gateway        │◄────mesh────►│  AI Gateway        │
│  KServe + vLLM   │   (mTLS,     │  KServe + vLLM     │   (mTLS,     │  KServe + vLLM     │
│  Kueue / GPU Op  │    SPIFFE)   │  Kueue / GPU Op    │    SPIFFE)   │  Kueue / GPU Op    │
│  Postgres+pgvec  │              │  Postgres+pgvec    │              │  Postgres+pgvec    │
│  MinIO/S3        │              │  GCS/Blob          │              │  MinIO on Ceph     │
│  OTel Collector  │              │  OTel Collector    │              │  OTel Collector    │
└──────────────────┘              └────────────────────┘              └─────────┬──────────┘
                                                                                 │
                                                                     ┌───────────▼──────────┐
                                                                     │  Systems of record   │
                                                                     │  Oracle/SAP/SMB/NFS  │
                                                                     │  AD / LDAP           │
                                                                     └──────────────────────┘
```

**The key property:** each site is a *complete, self-sufficient* instance of the same chart. Sites are peers, not a hub with dumb spokes. Any site can be destroyed and rebuilt from Git plus object storage. Cross-site traffic is an optimization, never a dependency for basic function.

---

## 4. The component stack

Three tiers. Start at Tier 0 even if you know you need Tier 2 — the tiers are additive, not alternatives.

### Layer-by-layer choices

| Layer | Tier 0 (weeks 1–2) | Tier 1 (production) | Tier 2 (regulated / scale) | Why portable |
|---|---|---|---|---|
| **Cluster** | k3d / kind locally | Managed K8s per cloud (EKS/GKE/AKS/OKE) + RKE2 or k3s on-prem | + Talos or OpenShift, Cluster API | Conformant K8s API |
| **Inference engine** | vLLM (single pod) | vLLM; Triton for non-LLM/multi-framework; llama.cpp for CPU/edge | + llm-d or KServe's disaggregated prefill/decode for 70B+ | OpenAI-compatible HTTP |
| **Serving control plane** | Raw Deployment + Service | **KServe** (`InferenceService` / `LLMInferenceService`) | + multi-model, canary, scale-to-zero | CNCF, runtime-pluggable |
| **Alternative serving** | — | Ray Serve (if already on Ray), BentoML (if Python-team-led) | — | Pick one, not three |
| **GPU enablement** | — | NVIDIA GPU Operator (or AMD ROCm equivalent) | + MIG partitioning, time-slicing, DRA | Same operator on every cloud & bare metal |
| **GPU scheduling / queueing** | default scheduler | **Kueue** | + Volcano for gang-scheduled training | Kubernetes-native |
| **AI gateway** | none (call service directly) | **Envoy AI Gateway** (K8s-native, Gateway API) or LiteLLM proxy | + policy engine, token budgets, guardrails | One endpoint, many backends |
| **Vector store** | `pgvector` in Postgres | pgvector, or Qdrant / Milvus / Weaviate if >50M vectors | + Milvus with tiered storage | All self-hostable, all have Helm charts |
| **Relational / metadata** | Postgres pod | CloudNativePG operator, or managed Postgres per cloud | + HA, PITR, pgBackRest to S3 | Postgres everywhere |
| **Object storage** | MinIO | Native (S3/GCS/Blob) in cloud, MinIO/Ceph RGW on-prem | + object-lock, replication | S3 API |
| **Model registry** | S3 prefix + Git tag | **MLflow** or OCI artifacts (models as OCI images) | + signed models, provenance attestation | OCI registry is universal |
| **Pipelines / jobs** | Kubernetes `Job` | **Argo Workflows** (general) or **Flyte** (typed, lineage-first) | + Kubeflow Pipelines if you want the full ML platform | Compile to K8s objects |
| **Distributed training** | — | **KubeRay** (Ray) or Kubeflow Training Operator | + Kueue integration, checkpointing to S3 | Ray runs anywhere |
| **Agent / app framework** | plain Python + FastAPI | LangGraph / Pydantic AI / Mastra — whatever your team knows | + durable execution (Temporal) for long-running agents | Keep this layer thin and swappable |
| **LLM observability** | stdout | **Langfuse** or **Phoenix** (both self-hostable) | + eval harness in CI, drift alerts | OTel GenAI semantic conventions |
| **Infra observability** | — | Prometheus + Grafana + Loki/Tempo via OTel Collector | + long-term store (Mimir/Thanos) | OTLP |
| **Secrets** | K8s Secrets | **External Secrets Operator** + Vault / cloud KMS | + sealed hardware root, rotation policy | ESO abstracts the backend |
| **Policy** | — | **Kyverno** (or Gatekeeper/OPA) | + image signature verification (cosign), SBOM gates | Admission API |
| **Delivery** | `helm install` | **Argo CD** + ApplicationSets (or Flux) | + pull-model agents for locked-down sites | Git |
| **IaC** | none | **OpenTofu**/Terraform, one module per cloud, identical outputs | + Crossplane for in-cluster provisioning | HCL |

### A note on two specific picks

**AI gateway — Envoy AI Gateway vs. LiteLLM.** LiteLLM has by far the widest provider coverage and the fastest path to something working, and it's the right call for prototyping and for teams that want virtual keys, budgets, and spend attribution out of the box. Envoy AI Gateway reached 1.0 and is the better fit if you're already Kubernetes-native and want CRD-driven config, Envoy-grade performance, and Gateway API semantics. One caveat worth knowing before you standardize: LiteLLM was hit by a supply-chain compromise in late March 2026, which prompted a lot of teams to re-evaluate. That's not a reason to rule it out — it's a reason to pin digests, vendor your images, and verify signatures regardless of which gateway you choose.

**KServe vs. "just run vLLM."** These aren't competitors; they're different layers. vLLM is the engine that runs the model. KServe is the control plane that turns that single process into a distributed, autoscaling, canary-deployable service with a storage initializer, and it's runtime-pluggable across vLLM, Triton, TGI, and custom runtimes. Start with plain vLLM to learn the engine; adopt KServe the moment you have more than two models or need traffic splitting.

---

## 5. Repository layout

One repo (or a small set) that is the entire platform:

```
ai-platform/
├── infra/                              # OpenTofu — thin, per-cloud, identical outputs
│   ├── modules/
│   │   ├── cluster-aws/                # → outputs: kubeconfig, oidc_issuer, gpu_nodepool
│   │   ├── cluster-gcp/                # → same outputs
│   │   ├── cluster-azure/              # → same outputs
│   │   └── cluster-onprem/             # RKE2/k3s via Ansible or Cluster API
│   └── envs/
│       ├── aws-prod/main.tf
│       ├── gcp-prod/main.tf
│       └── dc1-prod/main.tf
│
├── platform/                           # The umbrella Helm chart — THE product
│   ├── Chart.yaml                      # dependencies: kserve, gateway, otel, cnpg, minio...
│   ├── values.yaml                     # portable defaults
│   ├── values-aws.yaml                 # storageClass: gp3, s3 native, IRSA annotations
│   ├── values-gcp.yaml
│   ├── values-azure.yaml
│   ├── values-onprem.yaml              # storageClass: ceph-rbd, minio enabled, no cloud IAM
│   ├── values-airgap.yaml              # registry override, no external endpoints
│   └── templates/
│
├── models/                             # One file per served model
│   ├── qwen3-8b.yaml                   # KServe InferenceService
│   ├── llama-3.3-70b.yaml
│   └── bge-m3-embeddings.yaml
│
├── apps/                               # Your actual AI applications
│   └── rag-service/
│
└── gitops/
    ├── argocd/
    │   ├── applicationset-platform.yaml   # fan platform/ out to every registered cluster
    │   └── applicationset-models.yaml
    └── clusters/                          # cluster registrations w/ labels: cloud, region, gpu
```

**The critical discipline:** `platform/` must never contain a cloud-specific resource. Anything cloud-specific is expressed as a *value*, and the per-cloud values files supply it. If you find yourself writing `{{ if eq .Values.cloud "aws" }}` more than twice, you've leaked a cloud concept into the portable layer — push it down into infra outputs instead.

---

## 6. Step-by-step build

### Step 0 — Prerequisites

```bash
# Toolchain (versions: pin these in a .tool-versions / mise.toml)
brew install kubectl helm k3d argocd opentofu cilium-cli kustomize cosign
# or asdf/mise equivalents on Linux
```

### Step 1 — A local cluster that behaves like the real ones

Do all development here. If it works in k3d it will work in EKS.

```bash
k3d cluster create aiplat \
  --agents 2 \
  --k3s-arg "--disable=traefik@server:0" \
  -p "8080:80@loadbalancer" \
  --registry-create aiplat-registry:0.0.0.0:5000
```

> **No GPU locally?** Serve a small model on CPU (`Qwen3-0.6B`, `all-MiniLM` embeddings) or point the gateway at a hosted API. The *shape* of the deployment is what you're testing, not throughput.

### Step 2 — Bootstrap the platform chart

`platform/Chart.yaml`:

```yaml
apiVersion: v2
name: ai-platform
version: 0.1.0
dependencies:
  - name: kserve-crd
    version: "0.15.*"
    repository: oci://ghcr.io/kserve/charts
  - name: kserve
    version: "0.15.*"
    repository: oci://ghcr.io/kserve/charts
  - name: cloudnative-pg
    version: "0.23.*"
    repository: https://cloudnative-pg.github.io/charts
    condition: postgres.selfHosted
  - name: minio
    version: "5.*"
    repository: https://charts.min.io/
    condition: objectStore.selfHosted
  - name: opentelemetry-collector
    version: "0.*"
    repository: https://open-telemetry.github.io/opentelemetry-helm-charts
  - name: external-secrets
    version: "0.*"
    repository: https://charts.external-secrets.io
  - name: kyverno
    version: "3.*"
    repository: https://kyverno.github.io/kyverno
```

`platform/values.yaml` — the portable defaults:

```yaml
global:
  site: "local"                     # local | aws-prod | dc1-prod ...
  imageRegistry: ""                 # set to your mirror for air-gap
  storageClass: ""                  # "" = cluster default

objectStore:
  selfHosted: true                  # false in cloud, true on-prem
  endpoint: "http://minio:9000"
  bucket: "models"
  region: "us-east-1"
  credentialsSecret: "objectstore-creds"

postgres:
  selfHosted: true
  dsnSecret: "platform-db"

gateway:
  enabled: true
  # backends are declared as data, not code
  backends:
    - name: local-qwen
      type: openai-compatible
      url: http://qwen3-8b-predictor.models.svc.cluster.local/v1
    - name: cloud-fallback
      type: anthropic
      apiKeySecret: llm-provider-keys

gpu:
  enabled: false                    # true on GPU sites
  operator: nvidia                  # nvidia | amd

observability:
  otlpEndpoint: "http://otel-collector.observability:4317"
```

`platform/values-onprem.yaml` — the deltas, and nothing more:

```yaml
global:
  storageClass: "ceph-rbd"
  imageRegistry: "registry.corp.internal/mirror"
objectStore:
  selfHosted: true
  endpoint: "https://minio.dc1.corp.internal"
postgres:
  selfHosted: true
gpu:
  enabled: true
gateway:
  backends:
    - name: local-llama-70b
      type: openai-compatible
      url: http://llama-3-3-70b-predictor.models.svc.cluster.local/v1
    # note: NO cloud-fallback here — data must not leave the DC
```

Install:

```bash
helm dependency update platform/
helm upgrade --install ai-platform ./platform \
  -n platform --create-namespace \
  -f platform/values.yaml
```

### Step 3 — GPU enablement (per GPU-bearing site)

The NVIDIA GPU Operator is the same on EKS, GKE, AKS, and bare metal. That uniformity is exactly why you use it instead of each cloud's GPU device plugin.

```bash
helm repo add nvidia https://nvidia.github.io/gpu-operator
helm upgrade --install gpu-operator nvidia/gpu-operator \
  -n gpu-operator --create-namespace \
  --set driver.enabled=true          # false on managed nodes with preinstalled drivers
```

Verify: `kubectl get nodes -o json | jq '.items[].status.capacity["nvidia.com/gpu"]'`

Then add Kueue so GPU jobs queue fairly instead of head-of-line blocking each other. Fair-share queueing is the single highest-leverage change for GPU utilization — shared clusters commonly sit in the 25–35% range without it and reach 60–85% with it.

```bash
kubectl apply --server-side -f https://github.com/kubernetes-sigs/kueue/releases/latest/download/manifests.yaml
```

```yaml
# A ResourceFlavor + ClusterQueue: teams get guaranteed shares, can borrow idle capacity
apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: gpu-shared
spec:
  namespaceSelector: {}
  cohort: "datacenter"              # cohorts allow borrowing across queues
  resourceGroups:
    - coveredResources: ["cpu", "memory", "nvidia.com/gpu"]
      flavors:
        - name: "h100"
          resources:
            - name: "nvidia.com/gpu"
              nominalQuota: 16
              borrowingLimit: 8
```

### Step 4 — Deploy a model portably

`models/qwen3-8b.yaml`:

```yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: qwen3-8b
  namespace: models
  annotations:
    serving.kserve.io/deploymentMode: RawDeployment   # avoids a hard Knative dependency
spec:
  predictor:
    minReplicas: 1
    maxReplicas: 4
    model:
      modelFormat: {name: huggingface}
      runtime: kserve-vllm
      # s3:// works identically against AWS S3, GCS interop, and on-prem MinIO
      storageUri: "s3://models/qwen3-8b"
      args:
        - --max-model-len=32768
        - --gpu-memory-utilization=0.90
      resources:
        limits: {nvidia.com/gpu: "1", memory: 48Gi}
        requests: {nvidia.com/gpu: "1", memory: 48Gi}
```

**Two things make this portable:**

- `storageUri: s3://` — the endpoint comes from a secret, so the *same manifest* pulls from AWS S3 in one site and MinIO-on-Ceph in another.
- `RawDeployment` mode — Knative Serving is powerful but adds a heavy dependency that's painful on constrained on-prem clusters. Use raw Deployments plus HPA/KEDA unless you specifically need scale-to-zero.

**For models too large for one GPU** (e.g. a 70B in bf16 needs ~144 GB), use tensor parallelism across the GPUs in one node, and give it a PVC — the weights will usually exceed the node's ephemeral storage limit, which is a very common first failure:

```yaml
      args: ["--tensor-parallel-size=8"]
      resources:
        limits: {nvidia.com/gpu: "8"}
      storage:
        path: /mnt/models
        # back with a 250Gi+ PVC, and share it across replicas (RWX) if your CSI supports it
```

**Model caching matters more than you expect.** A cold pull of a 140 GB model can dominate your scale-up time. Pre-warm weights onto a shared RWX volume or a node-local cache DaemonSet at each site.

### Step 5 — The gateway: one endpoint, many backends

This is the single most important piece for portability, because it's what lets application code stop caring where a model lives.

```yaml
# Envoy AI Gateway style — an AIServiceBackend per model source
apiVersion: aigateway.envoyproxy.io/v1alpha1
kind: AIServiceBackend
metadata: {name: qwen3-local, namespace: platform}
spec:
  schema: {name: OpenAI}
  backendRef: {name: qwen3-8b-predictor, kind: Service, port: 80}
---
apiVersion: aigateway.envoyproxy.io/v1alpha1
kind: AIGatewayRoute
metadata: {name: chat, namespace: platform}
spec:
  rules:
    - matches: [{headers: [{name: "x-ai-model", value: "fast"}]}]
      backendRefs: [{name: qwen3-local, weight: 100}]
    - matches: [{headers: [{name: "x-ai-model", value: "frontier"}]}]
      backendRefs: [{name: cloud-provider, weight: 100}]
```

Your applications now only ever know one URL: `http://ai-gateway.platform.svc/v1`. Routing, failover, rate limits, token budgets, spend attribution, and audit logging all become infrastructure config instead of application code. **This is the abstraction that makes "run anywhere" real** — the same app binary runs against a self-hosted 8B on-prem and a frontier API in cloud, with no rebuild.

### Step 6 — Observability from day one, not day 90

```yaml
# OTel Collector: components emit OTLP, the collector decides the destination
receivers:
  otlp: {protocols: {grpc: {endpoint: 0.0.0.0:4317}}}
processors:
  batch: {}
  resource:
    attributes:
      - {key: deployment.site, value: "${SITE}", action: upsert}
      - {key: cloud.provider, value: "${CLOUD}", action: upsert}
exporters:
  prometheusremotewrite: {endpoint: "${METRICS_ENDPOINT}"}
  otlp/traces: {endpoint: "${TRACES_ENDPOINT}"}
service:
  pipelines:
    metrics: {receivers: [otlp], processors: [batch, resource], exporters: [prometheusremotewrite]}
    traces:  {receivers: [otlp], processors: [batch, resource], exporters: [otlp/traces]}
```

Track these four from the start; you'll regret it otherwise:

| Signal | Metric | Why |
|---|---|---|
| Latency | TTFT (time to first token), TPOT (time per output token) | Aggregate p99 latency is meaningless for streaming LLMs |
| Throughput | tokens/sec, requests in flight, queue depth | Drives autoscaling decisions |
| Utilization | GPU util %, KV-cache utilization %, batch size | KV-cache pressure is the real capacity ceiling |
| Quality/cost | tokens per request by tenant, eval scores, refusal/error rate | Cost attribution and regression detection |

Pair infra telemetry with LLM-level tracing (Langfuse or Phoenix — both self-host cleanly, including air-gapped) so you can see prompts, tool calls, and eval scores next to the infra metrics.

### Step 7 — GitOps: make Git the only way to change anything

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata: {name: ai-platform, namespace: argocd}
spec:
  generators:
    - clusters:
        selector:
          matchLabels: {platform: "ai"}
  template:
    metadata:
      name: 'ai-platform-{{name}}'
    spec:
      project: platform
      source:
        repoURL: https://git.corp/ai-platform.git
        targetRevision: HEAD
        path: platform
        helm:
          valueFiles:
            - values.yaml
            - 'values-{{metadata.labels.cloud}}.yaml'   # aws | gcp | azure | onprem
      destination: {server: '{{server}}', namespace: platform}
      syncPolicy:
        automated: {prune: true, selfHeal: true}
```

Register a new site by adding a cluster secret with the right labels. That's the whole onboarding process — one YAML file per new cloud or datacenter.

**At fleet scale, flip to a pull model.** A single Argo CD hub pushing to every cluster works for a dozen clusters, but past that the hub becomes a bottleneck: CPU, memory, and etcd usage scale linearly with the spoke count, causing API throttling and instability — and the hub ends up holding privileged kubeconfig credentials for every cluster, which is a nasty single point of failure. The fix is to invert it: the hub *generates* the desired state, and an agent in each cluster pulls it over an outbound connection and reconciles locally. Red Hat ACM's ManifestWork/Klusterlet is one implementation; Argo CD agent-based topologies and Rancher Fleet are others. **This is also exactly what on-prem sites need anyway** (see rule 8), so pick the pull model early and you solve both problems at once.

### Step 8 — Real clusters via OpenTofu

```hcl
# infra/envs/aws-prod/main.tf
module "cluster" {
  source = "../../modules/cluster-aws"
  name           = "ai-prod-use1"
  gpu_node_pools = [{ instance_type = "g6e.12xlarge", min = 0, max = 8, spot = true }]
}

# The contract: EVERY cluster module exposes exactly these outputs.
output "kubeconfig"    { value = module.cluster.kubeconfig }
output "oidc_issuer"   { value = module.cluster.oidc_issuer }
output "bucket_name"   { value = module.cluster.bucket_name }
output "db_dsn_secret" { value = module.cluster.db_dsn_secret }
```

Swap `cluster-aws` for `cluster-gcp` and the rest of the platform doesn't notice. That identical-output contract is the whole trick.

---

## 7. Connecting cloud and on-premises

This is the part people underestimate. Budget more time here than for everything above combined.

### 7.1 Pick your pattern first

| Pattern | What it means | Use when | Cost |
|---|---|---|---|
| **1. Independent islands** | Each site runs the full stack; only Git and container images are shared | Data must never cross; simplest to operate | Lowest — start here |
| **2. Egress-only spoke** | On-prem pulls config and pushes telemetry outbound; nothing inbound | Strict firewall policy; most enterprises | Low |
| **3. Federated mesh** | Cross-site service discovery and mTLS; services call each other by name | You need cloud burst, or cloud apps calling on-prem data services | Medium-high |
| **4. Stretched cluster** | One control plane, nodes in both places | **Almost never.** Latency and partition behavior will hurt you | Don't |

**Start at 1 or 2. Graduate to 3 only when you have a named use case that requires it.** Most "we need a service mesh across clouds" requirements dissolve under questioning into "we need on-prem to read a cloud bucket."

### 7.2 The network layer

You need IP reachability before anything else works. Options, roughly in order of increasing commitment:

| Option | Setup | Bandwidth | Notes |
|---|---|---|---|
| **WireGuard mesh** (Tailscale / Netbird / self-hosted Headscale) | Hours | Good | Outbound-only, NAT-traversing, no firewall tickets. Best starting point by a wide margin. |
| **Cloudflare Tunnel / ngrok** | Minutes | Moderate | Expose specific services outbound-only. Great for a single API, not a fabric. |
| **Site-to-site IPsec VPN** | Days | ~1.25 Gbps/tunnel | The standard enterprise answer. Requires network team involvement. |
| **Direct Connect / ExpressRoute / Cloud Interconnect** | Weeks–months | 1–100 Gbps, low jitter | Required for large data movement or strict latency SLAs. Expensive; plan redundant circuits. |

**Non-negotiable prerequisite for anything beyond option 1: non-overlapping CIDRs.** Plan pod, service, and node CIDR allocation across every site *before* you build the first cluster. Overlapping RFC1918 ranges between a datacenter and a VPC is the most common and most painful hybrid blocker, and retrofitting means rebuilding clusters.

### 7.3 The service-connectivity layer

Once IP reachability exists, pick one mechanism for cross-cluster service discovery. Do not pick two.

**Cilium Cluster Mesh** — my default recommendation for a greenfield hybrid fabric. It connects clusters into a single logical network using eBPF, so pods in one cluster reach services backed by endpoints in another via *global services*, and network policies can reference remote endpoints directly. It's explicitly cloud-agnostic and works across EKS/GKE/AKS and on-prem; the requirement is that nodes have IP-level connectivity to each other. No sidecars, no separate gateway component.

```bash
# Each cluster needs a unique name and cluster ID
cilium clustermesh enable --context dc1 --service-type LoadBalancer
cilium clustermesh enable --context aws-prod --service-type LoadBalancer
cilium clustermesh connect --context dc1 --destination-context aws-prod
cilium connectivity test --context dc1 --multi-cluster aws-prod
```

Then mark a service global and it load-balances across sites automatically:

```yaml
metadata:
  annotations:
    service.cilium.io/global: "true"
    service.cilium.io/affinity: "local"    # prefer local backends, fail over cross-site
```

That `affinity: local` annotation is important for AI workloads: you want inference to stay local and only spill to a remote site under pressure, because cross-site token streaming is miserable.

**Istio multi-cluster** — the right choice if you already run Istio or need L7 policy, traffic mirroring, and fine-grained routing across the boundary. The pattern is: shared root CA (or SPIRE federation) for common trust, an **east-west gateway** in each cluster on port 15443 using `AUTO_PASSTHROUGH` TLS mode (it routes mTLS by SNI without terminating), and remote secrets so each control plane can discover the other's services.

```bash
samples/multicluster/gen-eastwest-gateway.sh \
  --mesh hybrid --cluster dc1 --network dc1-net | istioctl install -y -f -
istioctl create-remote-secret --context dc1 --name dc1 | kubectl apply --context aws-prod -f -
```

**Submariner** — designed specifically for this problem, CNI-agnostic, uses a central broker plus per-cluster gateway engines and a Lighthouse DNS server for cross-cluster discovery. Choose it when you can't standardize on one CNI. The trade-off is another set of components with its own release cadence to keep compatible with your K8s version.

**Or: no mesh at all.** Expose the AI gateway at each site through normal ingress with mTLS and let sites call each other's *public API*, not each other's internal services. This is often the correct answer. It's less elegant and dramatically easier to operate, debug, and audit.

### 7.4 Identity across the boundary

Cloud IAM stops at the cloud's edge, so you need a portable workload identity. Use **SPIFFE/SPIRE** with trust-domain federation, or your mesh's built-in CA with a shared root. Every workload gets an X.509 SVID; authorization policies reference `spiffe://dc1.corp/ns/models/sa/inference` rather than IP ranges. This is what lets you write one authorization policy that means the same thing in AWS and in your datacenter.

For human identity, federate everything to one OIDC provider (Entra ID, Okta, Keycloak) and map groups to Kubernetes RBAC identically at every site.

### 7.5 Data: move the compute, not the data

The strongest hybrid architectures minimize what crosses the boundary. Patterns worth knowing:

- **Inference at the data.** If sensitive records live on-prem, run the model on-prem and send only the *result* to cloud. This inverts the usual instinct and is almost always cheaper and more compliant.
- **Embed locally, index locally.** Never ship raw documents to a cloud embedding API if the documents are the sensitive thing. Run an embedding model on-prem; if you must, ship only vectors — and know that vectors are partially invertible, so treat them as sensitive too.
- **Train in cloud, serve on-prem.** Fine-tune on rented GPUs using de-identified or synthetic data, then ship the *weights* (a few hundred GB, one-time) down to the datacenter. This is the highest-value hybrid pattern for most enterprises.
- **Cache aggressively at the boundary.** A read-through cache for model weights and container images at each on-prem site turns a 140 GB cross-WAN pull into a local read.
- **Watch egress fees.** Cloud egress is the silent budget killer in hybrid AI. Measure it in week one, not quarter three.

### 7.6 The locked-down datacenter checklist

If your on-prem site cannot accept inbound connections (assume it can't):

1. **Config:** Argo CD agent in the DC pulls from Git over HTTPS 443 outbound. ✅
2. **Images:** an in-DC registry (Harbor/Zot) mirrors from upstream on a schedule, outbound. ✅
3. **Models:** an in-DC MinIO syncs weights from a cloud bucket via `mc mirror`, outbound. ✅
4. **Telemetry:** the OTel Collector pushes OTLP outbound to your backend. ✅
5. **Secrets:** External Secrets Operator polls Vault/cloud KMS outbound. ✅
6. **Cloud→on-prem calls:** ❌ Not possible. Invert it — the DC polls a queue, or holds a long-lived outbound gRPC stream (this is how every agent-based fleet manager works).

Everything runs over outbound 443. Zero firewall exceptions. This constraint is a *feature*: it forces an architecture that also happens to be more secure and easier to reason about.

---

## 8. Packaging it as something you can actually ship

You asked for a "package that's easy to deploy." Here's what that concretely means.

### The deliverable is an umbrella Helm chart in an OCI registry

```bash
helm package platform/
helm push ai-platform-1.4.0.tgz oci://registry.corp/charts
```

A new environment is then genuinely one command:

```bash
helm install ai-platform oci://registry.corp/charts/ai-platform \
  --version 1.4.0 -f values-onprem.yaml
```

### Ship a bootstrap CLI (a thin wrapper, not a framework)

A ~200-line Go or Python binary that: detects the environment → validates prerequisites (K8s version, CSI, GPU operator, CIDR conflicts) → renders the right values file → installs → runs smoke tests. The preflight validation is the part that saves you: 80% of failed installs are a missing StorageClass, an unschedulable GPU node, or a registry the cluster can't reach. **Catch those before `helm install`, not during.**

### Air-gap bundle procedure

```bash
# 1. Mirror every image (parse the chart, don't hand-maintain a list)
helm template platform/ | grep 'image:' | awk '{print $2}' | sort -u > images.txt
while read img; do
  skopeo copy docker://$img docker-archive:bundle/$(echo $img|tr '/:' '__').tar
done < images.txt

# 2. Bundle chart, model weights, and checksums
helm pull oci://registry.corp/charts/ai-platform --version 1.4.0 -d bundle/
mc mirror s3/models bundle/models/
sha256sum -r bundle/**/* > bundle/MANIFEST.sha256
cosign sign-blob bundle/MANIFEST.sha256 --output-signature bundle/MANIFEST.sig

# 3. Ship on physical media; on the far side, load to the internal registry
#    and install with --set global.imageRegistry=registry.internal
```

Test the air-gap path in CI from day one by running installs in a network-namespaced runner with no egress. A bundle that's only tested at delivery time is a bundle that fails at delivery time.

### Versioning discipline

- Chart version = platform release. Semver. Components pinned to exact versions and **digests**, never tags.
- Every release ships an SBOM and cosign signatures; Kyverno at each site rejects unsigned images.
- Maintain an explicit compatibility matrix: platform version × Kubernetes version × GPU driver version. On-prem clusters upgrade slowly, so you will support N-2 whether you plan to or not.
- Upgrades are Argo CD syncs of a bumped chart version, with automated rollback on failed health checks.

---

## 9. Security and governance

| Control | Implementation |
|---|---|
| Workload identity | SPIFFE/SPIRE or mesh CA; no static service credentials |
| Secrets | External Secrets Operator → Vault/KMS; nothing in Git, ever |
| Supply chain | cosign signing + Kyverno verification; SBOM per image; pinned digests |
| Network | Default-deny NetworkPolicy; explicit allow-lists; egress control on model pods |
| Multi-tenancy | Namespace per tenant + ResourceQuota + Kueue ClusterQueue + gateway virtual keys |
| Prompt/response safety | Guardrails at the gateway (Presidio for PII redaction, injection detection) — all run air-gapped |
| Audit | Every gateway request logged with identity, model, tokens, and cost; immutable store |
| Data residency | Per-site gateway config declares which backends are permissible; policy-enforced, not convention |
| Model provenance | Registry with signed weights and a recorded training/fine-tune lineage |

**The single most valuable control:** make the gateway mandatory. If applications can bypass it and call providers directly, you have no audit trail, no spend control, no residency enforcement, and no portability. Enforce with egress NetworkPolicy that blocks direct outbound to provider domains from application namespaces.

---

## 10. Cost and GPU efficiency

GPUs are the entire budget. In rough order of payback:

1. **Queue with Kueue.** Fair-share scheduling and preventing head-of-line blocking is the biggest single utilization win on shared clusters.
2. **Right-size the engine.** Tune `--max-model-len` and `--gpu-memory-utilization` to your actual traffic. Over-provisioned context length silently wastes KV-cache capacity, which is usually your real bottleneck.
3. **Quantize.** FP8/INT8/AWQ typically cuts memory 2–4× with modest quality loss. Test on *your* evals, not on published benchmarks.
4. **Scale to zero for dev/batch.** KEDA on queue depth, or KServe with Knative if you accept the dependency. Never scale-to-zero a latency-sensitive endpoint — cold-start on a large model is minutes.
5. **Spot/preemptible for training and batch inference**, on-demand for serving. Checkpoint to S3 every N steps so preemption costs minutes, not hours.
6. **Route by task.** Send the 70% of requests that are simple to a small local model and reserve frontier APIs for genuinely hard ones. Gateway config, one line, often the largest cost reduction available.
7. **Cache.** Prompt/prefix caching in vLLM, plus semantic caching at the gateway. Repetitive enterprise traffic caches remarkably well.
8. **Then do the buy-vs-build math.** Self-hosting reaches cost parity with API pricing at meaningful volume, but the crossover depends on your utilization, not on list prices. A GPU server at 15% utilization loses to an API every time. Model your *actual* duty cycle.

---

## 11. Anti-patterns

- **Building the abstraction layer before the second environment exists.** Deploy to one cloud, then port to a second, then abstract what actually hurt. Speculative abstraction is how platforms die.
- **Adopting Kubeflow "because it's the ML platform."** It's a large surface area. Take the pieces you need (KServe, Training Operator) and skip the rest unless you're committed to the whole thing.
- **Three serving frameworks.** Someone brings KServe, someone brings Ray Serve, someone brings BentoML. Pick one. The second one costs more than the problem it solves.
- **Stretching one cluster across sites.** Etcd across a WAN will teach you about partition tolerance in the worst possible way.
- **Letting apps import provider SDKs.** Every direct `import anthropic` / `import openai` in application code is a future migration ticket. Gateway only.
- **Treating vector DB choice as the architecture decision.** It's the least consequential choice on the list. Start with pgvector; you'll know when you've outgrown it.
- **Ignoring CIDR planning.** Discussed above. It will cost you a rebuild.
- **Deferring the air-gap path.** Retrofitting air-gap support into a platform that assumed internet access is a rewrite, not a feature.
- **No eval harness.** Without automated evals in CI, you cannot safely upgrade a model, and your "portable" platform is frozen on whatever you deployed first.

---

## 12. A 90-day plan

**Days 1–14 — Prove the core**
Local k3d cluster. Umbrella chart with KServe + vLLM + Postgres + MinIO + OTel. One model served. One demo app calling it through the gateway. Everything in Git. *Exit criterion: a colleague can clone the repo and get a working stack in under 30 minutes.*

**Days 15–35 — Prove portability**
Stand up cloud #1 with OpenTofu. Deploy the identical chart with only a values file changed. Add the GPU Operator and Kueue. Add Argo CD and delete your ability to `kubectl apply` by hand. *Exit criterion: `values-aws.yaml` contains fewer than 30 lines.*

**Days 36–55 — Prove it twice**
Cloud #2 (or a sovereign cloud). Every divergence you hit is a bug in your abstraction — fix it in the chart, not with a conditional. Add observability, evals in CI, and cost attribution per tenant. *Exit criterion: onboarding cloud #2 took under a week.*

**Days 56–75 — On-prem**
Install RKE2/k3s on your hardware. Deploy with `values-onprem.yaml`. Establish outbound-only connectivity: Argo CD pull, registry mirror, model sync, telemetry push. Do not attempt a mesh yet. *Exit criterion: on-prem site fully functional with zero inbound firewall rules.*

**Days 76–90 — Federate and harden**
Only now, if a real use case demands it: Cilium Cluster Mesh or Istio multi-cluster across sites. Then SPIRE federation, Kyverno policies, cosign verification, the air-gap bundle, and a documented DR restore. *Exit criterion: you have restored a site from Git + object storage, timed it, and written it down.*

---

## 13. Questions that will change these recommendations

Answer these and the design sharpens considerably:

1. **Serving, training, or applications?** (Section 1 — determines two-thirds of the stack.)
2. **Do you have GPUs on-prem, and how many of what?** Determines whether on-prem is a serving site or just an app site.
3. **What is the actual data constraint?** "Prefers on-prem" and "legally cannot leave the building" produce very different architectures.
4. **How many environments in 12 months?** Two clusters need no fleet management. Twenty need a pull-model control plane from day one.
5. **How locked-down is the datacenter?** Outbound 443 available, or true air gap? The latter roughly doubles the packaging effort.
6. **Existing platform investments?** If you already run OpenShift, Istio, or Rancher, use them. Consistency with what your team can operate beats theoretical elegance every time.
7. **Who operates this at 3 a.m.?** If the answer is "two people who also have other jobs," cut the stack to Tier 0 + gateway and stop there. An operable simple platform beats an unoperable complete one.

---

*Note: specific API fields, chart versions, and CRD schemas move quickly in this ecosystem — treat the manifests here as structurally correct patterns and verify field names against the version you pin.*
