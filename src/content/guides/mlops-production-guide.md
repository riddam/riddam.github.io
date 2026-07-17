---
title: "MLOps & AI Production Operations: The 2026 Guide"
description: "An end-to-end guide to CI/CD and production operations for AI systems, covering the MLOps pipeline, tooling, cloud infrastructure, deployment and release patterns, monitoring, drift, LLMOps, cost optimization, and governance."
pubDate: 2026-07-17
tags: ["mlops", "ci-cd", "llmops", "cloud-infrastructure"]
---

End-to-end pipeline from code commit to production monitoring — infrastructure, tooling, deployment patterns & observability.

## 01 — DevOps vs MLOps: What's Different

MLOps extends DevOps principles to machine learning — but ML systems have fundamentally different properties that traditional CI/CD wasn't built for.

| | Traditional DevOps | MLOps |
|---|---|---|
| **What you version** | Code | Code + data + model weights + hyperparameters + environment |
| **What you test** | Correctness (unit/integration) | Correctness + accuracy + fairness + drift + latency |
| **What degrades** | Bugs (introduced by code changes) | Bugs + **model drift** (performance degrades even without code changes, because real-world data shifts) |
| **Deployment artifact** | Container / binary | Container + model weights + feature schema + serving config |
| **Rollback** | Revert to last good container | Revert model version + verify feature compatibility + validate data pipeline |
| **Monitoring** | Latency, errors, CPU, memory | All the above + prediction quality + data distribution + feature drift + business KPIs |

> **The fundamental difference:** In software, code is the complete specification — if the code hasn't changed, the behavior hasn't changed. In ML, the **data is part of the specification** — the model can degrade silently even when no code changes, because the real-world data distribution shifted. This is why MLOps adds **continuous training** and **continuous monitoring** to the DevOps loops.

## 02 — The MLOps Pipeline (End-to-End)

The production MLOps pipeline:

```
Data ingestion (sources → lake)
  → Data validation (schema + quality)
  → Feature engineering (feature store)
  → Model training (GPU/TPU cluster)
  → Evaluation (metrics + tests)
  → Model registry (versioning)
  → CI/CD gate (approve / reject)
  → Deployment (container + endpoint)
  → Monitoring (drift + quality)
  → ⤴ Retrain
```

### What each stage does

| Stage | What happens | Key tool(s) |
|---|---|---|
| Data ingestion | Collect data from sources (DBs, APIs, streams, files) into storage | Pub/Sub, Kinesis, Airflow, dbt |
| Data validation | Schema checks, null detection, distribution validation — reject bad data before it reaches training | Great Expectations, TFX Data Validation, Evidently |
| Feature engineering | Transform raw data into model features; store in feature store for consistency between training and serving | Feast, Vertex AI Feature Store, SageMaker Feature Store |
| Model training | Run training job on GPU/TPU cluster; track experiments, hyperparameters, metrics | PyTorch/TF, MLflow, W&B, cloud training services |
| Evaluation | Compare new model against baseline on held-out test set + fairness/bias checks | MLflow, Evidently, custom eval harnesses |
| Model registry | Version and store the trained model with metadata, lineage, and lifecycle stage (staging → production) | MLflow Model Registry, cloud registries |
| CI/CD gate | Automated tests pass → human approval (optional) → promote to production | GitHub Actions, GitLab CI, Jenkins, cloud pipelines |
| Deployment | Package model into container, deploy to serving endpoint (real-time/batch/serverless) | Docker, KServe, Seldon, cloud endpoints |
| Monitoring | Track prediction quality, data drift, latency, cost, business KPIs — trigger retraining when needed | Evidently, Arize, Langfuse, Prometheus+Grafana |

> **The 20/80 rule:** Training a model is ~20% of the effort. The other 80% is testing, packaging, versioning, deploying, monitoring, and maintaining it. Teams that treat ML like one-off experiments instead of production software always fail at scale.

## 03 — CI/CD for ML: The Three Loops

Traditional DevOps has one CI/CD loop (code change → test → deploy). ML has **three**:

**Loop 1 — Continuous Integration (code):** code change → lint + unit tests → integration tests → data validation tests → model training tests (small subset)

**Loop 2 — Continuous Training (model):** new data arrives or drift detected → feature pipeline runs → training job executes → evaluation against baseline → register new model version

**Loop 3 — Continuous Deployment + Monitoring:** promote model to staging → canary/shadow deploy → monitor quality + drift → auto-rollback if degraded → trigger retraining if drift exceeds threshold

### Google's MLOps maturity levels

| Level | Description | Automation |
|---|---|---|
| Level 0 | Manual — data scientists train in notebooks, hand-off model as a file, manual deployment | None |
| Level 1 | ML pipeline automation — automated training pipeline, but deployment is still manual or semi-auto | Training automated |
| Level 2 | CI/CD for ML — automated testing, automated deployment, continuous training triggered by data/drift, monitoring closes the loop | Full automation |

> **Target:** Most teams start at Level 0. The goal is **Level 2** — where new data automatically triggers retraining, evaluation gates ensure quality, and deployment is hands-free with auto-rollback. Level 1 (automated training, manual deploy) is a practical intermediate milestone.

## 04 — DevOps / MLOps Tool Catalog

Organized by function. Pick one tool per row — don't try to use all of them.

### Core DevOps tools (you still need these)

| Function | Tools | Notes |
|---|---|---|
| Version control | Git (GitHub, GitLab, Bitbucket) | Foundation for everything — code, configs, IaC |
| CI/CD runner | GitHub Actions, GitLab CI, Jenkins, CircleCI | GitHub Actions is the default for most teams in 2026 |
| Containers | Docker, Podman | Containerize everything: training, serving, pipelines |
| Container orchestration | Kubernetes (GKE, EKS, AKS), Docker Compose | K8s for production scale; Compose for local dev |
| Container registry | Artifact Registry (GCP), ECR (AWS), ACR (Azure), Docker Hub | Store training + serving container images |
| Infrastructure as Code | Terraform, Pulumi, CloudFormation, Bicep | Terraform is cross-cloud default; use cloud-native for single-cloud |
| Secrets management | Vault, Secret Manager (GCP/AWS), Azure Key Vault | Never hardcode API keys, model weights paths, DB creds |

### ML-specific tools

| Function | Tools | Choose when |
|---|---|---|
| Experiment tracking | MLflow, Weights & Biases, Comet, Neptune | MLflow (open-source, self-host) is the default; W&B for teams wanting managed + collaboration |
| Data versioning | DVC, LakeFS, Delta Lake | DVC for small teams; LakeFS/Delta for lake-scale versioning |
| Feature store | Feast, Tecton, Vertex AI/SageMaker built-in | Feast (open-source) or cloud-native for managed simplicity |
| Pipeline orchestration | Kubeflow Pipelines, Airflow, Prefect, Dagster, cloud pipelines | Airflow for general orchestration; Kubeflow for K8s-native ML pipelines |
| Model registry | MLflow Model Registry, cloud registries | MLflow for portability; cloud-native for tight integration |
| Model serving | vLLM, TGI, KServe, Seldon Core, BentoML, cloud endpoints | vLLM/TGI for LLM serving; KServe for K8s; cloud endpoints for managed |
| Data quality / validation | Great Expectations, Evidently, Pandera | Great Expectations for schema; Evidently for drift + quality reports |
| Model format | ONNX, SafeTensors, GGUF, TorchScript | ONNX for portability; SafeTensors for safe LLM weights; GGUF for local inference |

### LLM-specific tools

| Function | Tools | Choose when |
|---|---|---|
| LLM observability | Langfuse, LangSmith, Arize Phoenix, Helicone | Langfuse (open-source, self-host); LangSmith (LangChain teams); Arize (RAG debugging) |
| LLM gateway / proxy | LiteLLM, Portkey, TrueFoundry Gateway, custom | Multi-provider routing, failover, cost tracking, rate limiting |
| Prompt management | Langfuse, PromptLayer, Humanloop, Agenta | Version prompts like code; A/B test prompt variants |
| LLM evaluation | DeepEval, RAGAS, Confident AI, custom judges | DeepEval / RAGAS for RAG eval; LLM-as-judge for generation quality |
| Vector database | Qdrant, Pinecone, Weaviate, Chroma, pgvector | Qdrant (greenfield); pgvector (existing Postgres); Pinecone (managed) |

> **Starter stack (if you're choosing today):** **Git + GitHub Actions + Docker + Terraform + MLflow + Evidently + vLLM + Langfuse + Qdrant** covers 90% of production needs for both traditional ML and LLM systems. Add Kubernetes and Feast as you scale. Avoid tool sprawl — one tool per function.

## 05 — Cloud Infrastructure Selection

### Training infrastructure

| Option | Best for | Trade-off |
|---|---|---|
| Cloud managed (SageMaker/Vertex/Azure ML) | Most teams — spin up training, tear down after | 20–40% premium over raw VMs but zero cluster management |
| Raw GPU VMs + custom stack | Teams with MLOps expertise, steady high utilization | Cheapest per hour but you manage scaling, fault tolerance, storage |
| TPU pods (GCP only) | Large-scale training (>10B params), research | Best $/FLOP for large models; requires JAX/XLA expertise |
| Spot/preemptible instances | Fault-tolerant training (checkpoint frequently) | 60–91% cheaper but can be interrupted; use with checkpointing |

### Inference infrastructure

| Pattern | Latency | Cost | Use when |
|---|---|---|---|
| Real-time endpoint (always-on) | Low (ms) | Steady — pay even at zero traffic | User-facing, low-latency requirements |
| Serverless inference (scale-to-zero) | Higher (cold start) | Pay per request | Dev/staging, low-traffic, variable demand |
| Batch inference | Hours | Cheapest per prediction | Overnight scoring, recommendations, ETL |
| Multi-model endpoint | Low | Shared infra (up to 80% savings) | Many models with moderate traffic each |
| Edge inference | Lowest | Device cost | Offline, privacy-sensitive, real-time on-device |

### Infrastructure decision tree

| Question | Answer |
|---|---|
| User-facing, <100ms latency required? | Real-time endpoint (GPU) |
| Variable traffic, can tolerate cold starts? | Serverless inference |
| Bulk scoring, overnight, not time-sensitive? | Batch inference (cheapest) |
| Many models, moderate traffic each? | Multi-model endpoint |
| Privacy / offline / on-device? | Edge (quantized model) |

> **Trade-off — managed vs self-hosted serving:** **Managed endpoint** (SageMaker/Vertex/Azure ML) = autoscaling, monitoring, blue-green deployment built in — but higher per-hour cost and less control. **Self-hosted** (vLLM on K8s) = cheapest at scale, full control over batching/quantization — but you build your own scaling, health checks, and rollback. Start managed; migrate to self-hosted when monthly inference spend exceeds ~$10K and you have dedicated ops capacity.

## 06 — Model Deployment Patterns

The model packaging and deployment pipeline:

```
Trained model (from registry)
  → Containerize (Docker + serving runtime)
  → Push to registry (ECR / Artifact Registry)
  → Deploy to endpoint (real-time / batch / serverless)
  → Health check (smoke test + canary)
  → Live traffic
```

### Serving runtimes for LLMs

| Runtime | Best for | Key feature |
|---|---|---|
| vLLM | Production LLM inference — the 2026 default | PagedAttention, continuous batching, OpenAI-compatible API, ~2–4x throughput vs naive |
| TGI (Text Generation Inference) | Hugging Face models, production serving | Tensor parallelism, watermarking, streaming |
| Ollama | Local development and testing | One-command local LLM serving; not for production |
| TensorRT-LLM | Maximum NVIDIA GPU throughput | NVIDIA-optimized; best throughput but NVIDIA-only |
| Cloud endpoints | Managed, zero-ops serving | SageMaker/Vertex/Azure ML handle everything |

## 07 — Release Strategies for Models

| Strategy | How it works | Use when |
|---|---|---|
| Shadow deploy | New model receives real traffic but its predictions aren't served to users — only logged for comparison | First deployment of a new model; validate on real data without risk |
| Canary release | Route 5–10% of traffic to new model; watch metrics; gradually increase | Model updates; limit blast radius |
| Blue/green | Two full environments; instant switch + instant rollback | Critical models where fast rollback is essential |
| A/B testing | Route traffic by user segment; measure business outcomes over weeks | Competing model architectures; product experiments |
| Multi-armed bandit | Dynamically shift traffic toward the better-performing model variant | Recommendation / ranking models where real-time optimization matters |

> **ML-specific release difference:** In software, a canary catches code bugs. In ML, a canary catches **accuracy degradation under real traffic** — which is much harder to detect because the model returns HTTP 200 even when its predictions are wrong. You need **quality metrics** (accuracy, latency percentiles, business KPIs) in your canary monitoring, not just error rates.

## 08 — Monitoring & Observability

ML monitoring has **four layers** — each catches different failure modes.

**Layer 1 — Infrastructure monitoring (DevOps standard):** CPU/GPU utilization, memory, latency (p50/p95/p99), error rate, throughput (QPS), disk/network

**Layer 2 — Model performance monitoring (ML-specific):** prediction accuracy, precision / recall / F1, confidence distribution, prediction vs actual (when labels arrive)

**Layer 3 — Data / feature monitoring (drift detection):** input feature distributions, data schema validation, missing value rates, statistical drift tests (PSI, KL, JS)

**Layer 4 — Business KPI monitoring (the only one that really matters):** conversion rate, revenue impact, customer satisfaction, false positive cost, escalation rate

### Monitoring tool stack

| Layer | Open-source | Managed |
|---|---|---|
| Infrastructure | Prometheus + Grafana | Datadog, New Relic, CloudWatch, Cloud Monitoring |
| Model performance | Evidently, MLflow | Arize, WhyLabs, SageMaker Model Monitor, Vertex AI Model Monitoring |
| Data/drift | Evidently, Great Expectations | Arize, WhyLabs, cloud monitoring |
| Business KPIs | Grafana dashboards, custom metrics | Looker, Power BI, Datadog Business Monitoring |
| LLM-specific | Langfuse, Arize Phoenix | LangSmith, Helicone, Confident AI |

> **Common mistake:** Teams monitor Layer 1 (infrastructure) and think they're covered. The model returns HTTP 200 even when predictions are garbage. **Infrastructure can be perfectly healthy while the model is silently failing.** You need all four layers.

## 09 — Model Drift & Retraining

### Three types of drift

| Type | What shifts | Example | Detection |
|---|---|---|---|
| Data drift (covariate) | Input feature distributions change | Customer demographics shift; new product categories | Statistical tests (PSI, KL divergence, JS distance) on input features |
| Concept drift | Relationship between inputs and outputs changes | What "spam" looks like evolves; customer preferences shift | Monitor prediction accuracy vs actual labels (delayed) |
| Prediction drift | Output distribution changes | Model suddenly predicts mostly one class | Monitor output distribution (class balance, score histogram) |

### Retraining strategies

| Strategy | When to use |
|---|---|
| Scheduled (time-based) | Stable environments; retrain weekly/monthly regardless. Simple, predictable. |
| Drift-triggered | When drift metrics cross a threshold → automatically kick off retraining pipeline |
| Performance-triggered | When accuracy/business KPI drops below a threshold (requires ground truth labels) |
| Continuous training | Models retrain on every new data batch (streaming or micro-batch). Most mature but complex. |

> **Trade-off — retrain frequency:** More frequent = more current model, less drift — but more compute cost, more operational complexity, and more risk of training on noisy/insufficient data. Less frequent = cheaper, simpler — but model degrades between retrains. Match frequency to data volatility: fraud models retrain weekly, product recs daily, medical models with regulatory review quarterly.

## 10 — LLMOps: What's Different for LLMs

LLMs add new concerns that traditional MLOps doesn't cover well. Think of LLMOps as an extension layer.

| Concern | Traditional MLOps | LLMOps (what's new) |
|---|---|---|
| **What you version** | Code + data + model weights | + **prompts** (system prompt, few-shot examples, templates) |
| **Testing** | Accuracy metrics on test set | + **eval harnesses** (faithfulness, hallucination, safety, tool-use accuracy) |
| **Deployment artifact** | Containerized model | Often just **API calls** to a provider + prompt config — no weights to deploy |
| **Cost model** | Compute hours for training + inference | + **per-token costs** that scale with prompt length and output length |
| **Failure mode** | Accuracy drops silently | + **hallucination** (confidently wrong), **prompt injection**, **tool misuse** |
| **Monitoring** | Feature drift, accuracy | + **semantic drift** (embedding space shifts), **prompt regression**, **retrieval quality** |

### LLMOps pipeline additions

```
Prompt versioning (track + A/B test)
  → LLM evaluation (judge + metrics)
  → Prompt caching (90% cheaper reads)
  → Model gateway (route + failover)
  → Guardrails (input/output filters)
  → LLM observability (traces + quality scores)
```

### LLM observability: what to monitor

- **Quality metrics:** faithfulness (is the output grounded in context?), relevance (does it answer the question?), safety (no toxicity/PII/bias).
- **RAG metrics:** retrieval precision, context relevance, groundedness — is the retrieval pipeline returning useful chunks?
- **Operational metrics:** tokens per request, time to first token (TTFT), cache hit rate, cost per session, agent step count.
- **Drift metrics:** embedding drift (semantic shift in queries/outputs), prompt regression (quality drops after prompt edit), model version regression.
- **Agent metrics:** tool selection accuracy, planning quality, loop count, escalation rate.

> **The key insight:** LLMs fail silently — a hallucinated answer returns HTTP 200. Infrastructure monitoring *cannot* catch this. You need **quality scoring on every trace** (or a sample). The best practice is to run an LLM-as-judge on 5–10% of production traces and alert on statistically significant quality drops.

## 11 — Cost Optimization

| Lever | Savings | How |
|---|---|---|
| Model right-sizing | 60–80% | Use Haiku for routing, Sonnet for main work, Opus only for hardest tasks |
| Prompt caching | 90% on cached reads | Cache static system prompts, tool definitions, reference docs; 5-min TTL |
| Batch API | 50% | Async processing for non-real-time workloads (24-hr window) |
| Spot/preemptible GPUs | 60–91% | For training jobs with checkpointing; not for serving |
| Quantization | 2–4x throughput | INT8/INT4 quantization reduces model size; slight accuracy trade-off |
| Token budgets | Variable | Set per-user/per-team/per-project token limits; alert on anomalies |
| Progressive summarization | Variable | Compress older conversation turns; reduces per-request token count |
| Committed/reserved capacity | 30–64% | SageMaker Savings Plans, GCP CUDs, Azure EA for steady-state workloads |
| Auto-scaling + scale-to-zero | Variable | Serverless inference for dev/staging; autoscale production endpoints |

> **Measure cost per outcome, not cost per token:** A cheaper model that gets the answer wrong 30% of the time costs *more* than an expensive model that's right 95% of the time — because you pay for retries, escalations, and lost customers. Track **cost per successful resolution**, not just token spend.

## 12 — Security & Governance

- **Version everything:** code (Git), data (DVC/LakeFS), models (MLflow registry), prompts (Langfuse/version control), infrastructure (Terraform). If you can't reproduce it, you can't audit it.
- **Access control:** RBAC on model registry (who can promote to production?), IAM on training resources, API auth on serving endpoints.
- **Data lineage:** track which data trained which model, which model is serving which endpoint. Metadata stores (MLflow, cloud registries) maintain this.
- **Audit trail:** log every training run, evaluation result, deployment, and rollback. Required for EU AI Act, HIPAA, SOC2.
- **Model cards:** document each model's purpose, training data, known limitations, fairness evaluations, and intended use. This is both good practice and increasingly required by regulation.
- **Supply chain security:** scan model weights for trojans (backdoors injected during training). Don't download untrusted models from the internet without verification. Use SafeTensors format, not pickle.
- **Prompt injection defense:** input validation + output verification + separation of trusted/untrusted content + guardrail hooks.

> **The EU AI Act (2024–2026):** High-risk AI systems must demonstrate: transparency, explainability, human oversight, data governance, accuracy/robustness testing, and a conformity assessment. MLOps pipelines that version, test, monitor, and audit are how you demonstrate compliance. **If your pipeline can't reproduce a training run and explain a prediction, you're not EU AI Act compliant.**

## 13 — Trade-off Master Reference

| Decision | Option A | Option B | Default |
|---|---|---|---|
| Managed platform vs self-hosted | SageMaker / Vertex / Azure ML | Raw VMs + custom stack | Managed unless >$10K/mo + dedicated MLOps team |
| Training on spot vs on-demand | Spot (60–91% off) | On-demand (guaranteed) | Spot with checkpointing for training; on-demand for serving |
| Real-time vs batch inference | Real-time endpoint | Batch transform | Real-time for user-facing; batch for scoring/ETL |
| Model serving: vLLM vs managed | Self-hosted vLLM on K8s | Cloud managed endpoint | Managed to start; self-hosted when scale justifies ops cost |
| Experiment tracking | MLflow (open-source) | W&B (managed) | MLflow for portability and cost; W&B for team collaboration |
| Pipeline orchestration | Airflow / Prefect | Cloud-native (Vertex/SageMaker Pipelines) | Cloud-native for single-cloud; Airflow for multi-cloud |
| Monitoring: open-source vs managed | Prometheus + Grafana + Evidently | Datadog + Arize | Open-source for cost; managed for faster setup |
| LLM observability | Langfuse (self-hosted) | LangSmith / Arize (managed) | Langfuse for data sovereignty; managed for speed |
| Retraining trigger | Scheduled (time-based) | Drift-triggered (automated) | Scheduled to start; drift-triggered at maturity (Level 2) |
| Model release strategy | Blue/green (instant rollback) | Canary (gradual rollout) | Shadow first → canary for ongoing updates → blue/green for critical |
| IaC tool | Terraform (multi-cloud) | CloudFormation / Bicep (cloud-native) | Terraform unless deeply single-cloud |
| Container orchestration | Kubernetes | Serverless (Cloud Run / Lambda) | K8s for complex serving; serverless for simple functions |
| CI/CD platform | GitHub Actions | GitLab CI / Jenkins | GitHub Actions is the 2026 default; Jenkins for legacy/complex |
| Data versioning | DVC (lightweight) | LakeFS / Delta (lake-scale) | DVC for small teams; LakeFS when data exceeds TB scale |

---

*Built from current industry practice and production patterns. Independent reference — not affiliated with any vendor. Tools and pricing change rapidly; verify before procurement decisions.*
