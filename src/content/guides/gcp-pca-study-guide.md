---
title: "GCP Professional Cloud Architect — 2026 Blueprint"
description: "A last-minute review guide for the Google Cloud Professional Cloud Architect exam covering the format, all six domains, service trade-offs, scenario triggers, HA/DR, cost optimization, and the new 2026 AI focus."
pubDate: 2026-06-20
tags: ["gcp", "cloud-architect", "certification", "study-guide"]
---

*The review I'd hand an engineer the week before their GCP Professional Cloud Architect exam: all six domains, the service trade-offs that actually decide questions, and the reasoning I want them to carry in.*

| Questions | Duration | Fee | Validity | Case studies | Pass mark |
|---|---|---|---|---|---|
| 50–60 | 2 hours | $200 USD | 2 years | 2 of 4 · 20–30% | Not published |

> **⚠ 2026 naming change:** the exam is transitioning from **Vertex AI** to **Gemini Enterprise Agent Platform**. Both names may appear on questions. Renamed services are flagged here with the old name in brackets, e.g. *GKE Enterprise (Anthos)*.

## 00 — Exam Format & Domains

The PCA is Google Cloud's flagship architect credential. It rewards **architectural judgment and case-study reasoning, not memorization**. Roughly 20–30% of questions attach to a case study; the rest are standalone scenarios where you pick the *best* answer among several that all "work". The **Well-Architected Framework** is woven through every domain — treat its six pillars as your default tie-breaker.

### Standard vs Renewal exam

| Attribute | Standard exam | Renewal exam |
|---|---|---|
| Length | 2 hours | 1 hour |
| Fee | $200 | $100 |
| Questions | 50–60 MC & multi-select | 25 MC & multi-select |
| Case studies | 2 (from a pool of 4), 20–30% | 1, gen-AI focused, 90–100% |
| Who | First-timers / expired certs | Active cert, within renewal window |
| Languages | English, Japanese | English, Japanese |

### Six domains & weighting (2026 guide)

| Domain | Weight | Watch for |
|---|---|---|
| **1.** Designing & planning a cloud solution architecture | ~25% | Business→technical mapping, trade-offs, HA/DR, Gemini Cloud Assist |
| **2.** Managing & provisioning solution infrastructure | ~17.5% | Network topology, storage/compute config, Agent Platform ML workflows |
| **3.** Designing for security & compliance | ~17.5% | IAM hierarchy, KMS, VPC-SC, **Securing AI** (Model Armor) |
| **4.** Analyzing & optimizing processes | ~15% | SDLC, CI/CD, cost (CapEx/OpEx), stakeholder mgmt |
| **5.** Managing implementation | ~12.5% | Apigee, IaC/Terraform, `gcloud`/`gsutil`/`bq`, emulators |
| **6.** Ensuring solution & operations excellence | ~12.5% | Cloud Observability, SLO/alerting, chaos/load testing |

> **Read this first:** The case studies are **published in advance**. Read all four cold before exam day — know each company's existing tech, business goals, constraints and compliance needs so you don't burn time reading during the exam.

## 01 — The Four Case Studies (2026 pool)

The old pool (Mountkirk Games, TerramEarth, Helicopter Racing League) is **retired**. Several current cases explicitly use Google's **generative-AI solutions**. Learn each as *challenge → key services → themes*.

### Altostrat Media (Media)

- **Core challenge:** Global streaming/media platform; personalization & gen-AI content features, cost-efficient transcoding, global low-latency delivery.
- **Key services:** Global External App LB · Cloud CDN/Media CDN · Transcoder API · Agent Platform (Vertex AI) · BigQuery
- **Themes:** Global delivery, personalization, cost at scale, gen-AI features.

### Cymbal Retail (Retail)

- **Core challenge:** Omnichannel retailer; demand forecasting, recommendations/search, seasonal traffic spikes, unifying operational + analytical data.
- **Key services:** GKE / Cloud Run · Spanner or Cloud SQL · BigQuery · Agent Builder (search/recs) · Pub/Sub
- **Themes:** Elastic scale, recommendations, HTAP data, gen-AI search.

### EHR Healthcare (Healthcare)

- **Core challenge:** Multi-hospital EHR SaaS migrating off legacy on-prem; **HIPAA**, multi-region HA, hybrid connectivity, strict governance.
- **Key services:** Cloud Healthcare API · Cloud SQL (HA) · Shared VPC · Cloud Armor · Cloud KMS (CMEK) · VPC-SC · Assured Workloads
- **Themes:** Compliance, security, hybrid migration, minimal downtime.

### KnightMotives Automotive (Automotive / IoT)

- **Core challenge:** Connected-vehicle telemetry at massive scale; time-series ingest, predictive-maintenance ML, modern data platform.
- **Key services:** Pub/Sub · Dataflow · Bigtable · BigQuery · Agent Platform (Vertex AI) predictive models
- **Themes:** IoT pipeline, batch vs streaming, ML integration, data lifecycle.

> **Pattern to internalize:** Healthcare → compliance + Assured Workloads/CMEK. IoT telemetry → Pub/Sub → Dataflow → Bigtable/BigQuery. Retail/media personalization → Agent Platform (Vertex AI) + BigQuery.

## 02 — Service Renames — Old → New

Questions may use either name. These are the renames and deprecations most likely to trip you up in 2026.

| Current name | Old / former name | Note |
|---|---|---|
| Gemini Enterprise Agent Platform | Vertex AI | The headline change — unified ML + gen-AI + agent platform |
| GKE Enterprise | Anthos | Fleet mgmt, multicluster/multicloud, Config Mgmt, Service Mesh |
| Cloud Run functions | Cloud Functions | FaaS folded under the Cloud Run brand |
| Cloud Service Mesh | Traffic Director / Anthos Service Mesh | Managed Istio/Envoy mesh |
| Google Cloud Observability | Stackdriver | = Cloud Monitoring + Logging + Trace + Profiler |
| Sensitive Data Protection | Data Loss Prevention (DLP) | Discover/classify/de-identify PII |
| Artifact Registry | Container Registry (GCR) | GCR deprecated — use Artifact Registry |
| Infrastructure Manager | Deployment Manager | Terraform-based; Deployment Manager is being retired |
| Chrome Enterprise Premium | BeyondCorp Enterprise | Zero-trust context-aware access |
| Google Security Operations (SecOps) | Chronicle | SIEM/SOAR under Google SecOps |
| Spot VMs | Preemptible VMs | Spot = successor, no 24h cap; preemptible is legacy |
| Migrate to Virtual Machines | Migrate for Compute Engine | VM lift-and-shift |
| Migrate to Containers | Migrate for Anthos | VM → container modernization |
| Managed Service for Apache Spark | (new, complements Dataproc) | Serverless Spark option |
| Hyperdisk / Block Storage | Persistent Disk (still valid) | Hyperdisk = next-gen, decoupled IOPS/throughput |
| gcloud storage | gsutil | Newer, faster CLI for Cloud Storage |
| Dataplex Catalog | Data Catalog | Now part of Dataplex governance |

> **Deprecated — don't pick these:** Cloud Debugger (retired), Cloud IoT Core (retired — use Pub/Sub + partners), and Deployment Manager (superseded by Terraform / Infrastructure Manager). If an answer relies on a retired service, it's almost certainly a distractor.

## 03 — AI & ML — the 2026 Focus Area

AI now appears across **design (§1.3), provisioning (§2.4/2.5), and security (§3.1)**. Almost everything routes through the **Gemini Enterprise Agent Platform (Vertex AI)**. Learn the stack and how the pieces fit.

**Fig 03.1 — Gemini Enterprise Agent Platform stack**

| Layer | Components |
|---|---|
| Assist & agents (business value) | Gemini Cloud Assist · Agent Builder · Gemini Enterprise / AI Agents · NotebookLM · Code Assist |
| Models & APIs (build with) | Gemini LLMs · Model Garden (200+ models) · Search · Conversation · Vision · Image · Video · Audio (Speech) |
| MLOps (operate) | Agent Platform Pipelines (Vertex Pipelines) · Feature Store · Model Registry · Endpoints / serving |
| Infrastructure (train & serve) | AI Hypercomputer · GPUs · TPUs · Cloud Run functions |
| Securing AI (§3.1) | Model Armor · Sensitive Data Protection (DLP) · Secure model deployment / VPC-SC |

### What each piece is for

| Service | Choose when… | AWS analog |
|---|---|---|
| Gemini Enterprise Agent Platform (Vertex AI) | Any custom-model training, tuning, deployment, or end-to-end MLOps | SageMaker |
| Model Garden | Pick from 200+ first/third-party models (Gemini, Llama, etc.) without building from scratch | Bedrock catalog |
| Agent Builder | Build RAG / search / conversational agents grounded on your data, low-code | Bedrock Agents |
| Gemini Cloud Assist | AI help *designing, deploying & troubleshooting* the architecture itself (in-console) | Amazon Q Developer |
| AI Hypercomputer | Large-scale training/serving; integrates GPUs & TPUs, optimized consumption models | EC2 UltraClusters |
| Prebuilt AI APIs | Off-the-shelf Vision, Speech-to-Text, Text-to-Speech, Translation, Document AI | Rekognition / Transcribe |
| Conversational Agents (Dialogflow CX / CCAI) | Build virtual agents / contact-center bots (voice & chat) | Lex / Connect |
| Model Armor | Screen prompts/responses for safety, prompt injection, data leakage | Bedrock Guardrails |

> **Trade-off — prebuilt API vs custom model:** **Prebuilt API / Model Garden model** = fastest, cheapest, no ML expertise, but generic. **Custom-trained model on Agent Platform** = best domain accuracy, but needs labeled data, MLOps, GPU/TPU cost, maintenance. Default: reach for **prebuilt or a foundation model + RAG** unless the scenario says pretrained accuracy is insufficient.

> **Scenario triggers:** "Chatbot grounded on our docs/catalog" → **Agent Builder + RAG**. "Generate architecture / debug a failing deployment" → **Gemini Cloud Assist**. "Protect an LLM app from prompt injection / PII leakage" → **Model Armor + Sensitive Data Protection**. "Off-the-shelf image labels / transcription" → **prebuilt AI API**.

## 04 — Compute

| Service | Control | Choose when… | AWS |
|---|---|---|---|
| Compute Engine | Max (IaaS) | OS access, custom kernels, licensed software, lift-and-shift, GPUs | EC2 |
| GKE Standard | High | Kubernetes with node control, GPUs, custom node configs | EKS |
| GKE Autopilot | Medium | Kubernetes without node ops, pay-per-pod, simplified ops | EKS+Fargate |
| GKE Enterprise (Anthos) | High | Fleet mgmt across clusters / on-prem / multicloud | EKS Anywhere |
| Cloud Run | Low | Stateless containers, pay-per-request, scale-to-zero, HTTP | Fargate |
| Cloud Run functions (Functions) | Minimal | Event-driven code (Pub/Sub, HTTP triggers), short execution | Lambda |
| App Engine | Minimal | Opinionated PaaS web apps (Standard = runtimes; Flex = containers) | Beanstalk |
| Batch | Medium | Managed batch/HPC job scheduling | AWS Batch |

**Fig 04.1 — Compute decision tree**

- Need **specific OS / kernel / licensing / GPUs** or lift-and-shift? → **Compute Engine**
- Existing **Kubernetes** / need portability & fine control? → **GKE (Autopilot if no node ops)**
- Stateless **containerized** HTTP service, want scale-to-zero? → **Cloud Run**
- Small **event-driven** glue (Pub/Sub, Storage triggers)? → **Cloud Run functions**
- Multi-cluster / hybrid / **multicloud** fleet? → **GKE Enterprise**

### Compute Engine essentials

- **Spot VMs (Preemptible):** up to ~91% cheaper, reclaimed with 30s notice — fault-tolerant/batch only. Spot has **no 24-hour cap** (old preemptible did).
- **MIG:** autoscaling + autohealing + rolling/canary + regional multi-zone spread. Unmanaged = static, no autoscale.
- **CUDs** for steady state; **Sustained Use Discounts** apply automatically; **custom machine types** right-size vCPU/RAM.
- **Sole-tenant nodes** for compliance/licensing; **Confidential VMs** encrypt memory in-use.

> **Scenario triggers:** "Reduce operational overhead" → serverless (**Cloud Run / functions**). "Fine-grained control / custom nodes" → **Compute Engine or GKE Standard**. "Event-driven" → **Cloud Run functions**. "Operational simplicity for K8s" → **Autopilot**.

> **Trade-off — Cloud Run vs GKE:** **Cloud Run:** zero infra, scale-to-zero, per-request billing, fastest to ship — but HTTP/event-centric, less control. **GKE:** full K8s (DaemonSets, operators, mesh, stateful, GPUs), portability — but you own upgrades/scaling/node cost even when idle. Default Cloud Run unless you need K8s primitives.

> **GKE scaling (concept level):** GKE scales at **two layers**: the **Horizontal Pod Autoscaler (HPA)** adds/removes *pods* on CPU/memory/custom metrics, while the **Cluster Autoscaler** and **Node Auto-Provisioning** add/remove *nodes* to fit those pods. (Autopilot manages both for you.) You don't need kubectl or manifests for PCA — just know GKE autoscales pods and nodes separately, and that node pools can run on **Spot VMs** to cut cost.

> **Cloud Run: services vs jobs:** **Cloud Run services** handle requests (HTTP/events, scale-to-zero). **Cloud Run jobs** run to completion (batch/ETL/scheduled scripts) with no listening port — the answer for "containerized batch task" without standing up GKE.

## 05 — Storage

| Service | Type | Choose when… | AWS |
|---|---|---|---|
| Cloud Storage | Object | Unstructured data, backups, data lake, static sites, ML files | S3 |
| Persistent Disk / Hyperdisk | Block | VM boot & data disks; Hyperdisk decouples IOPS/throughput | EBS |
| Local SSD | Block (ephemeral) | Scratch/cache — highest IOPS, data lost on stop | Instance Store |
| Filestore | File (NFS) | Shared POSIX file storage for VMs/GKE | EFS |
| NetApp Volumes / Managed Lustre | File | Enterprise NFS/SMB; HPC parallel FS | FSx |

**Fig 05.1 — Cloud Storage classes (hotter → colder = cheaper storage, pricier retrieval)**

| Class | Access pattern | Retrieval cost |
|---|---|---|
| Standard | Frequent access · no min duration · hot data, serving | no retrieval fee |
| Nearline | < once / month · 30-day min · backups | low retrieval |
| Coldline | < once / quarter · 90-day min · DR | higher retrieval |
| Archive | < once / year · 365-day min · compliance | highest retrieval |

- **Location:** region (lowest latency/cost), dual-region, or multi-region (highest availability). Bucket location & name are immutable; names globally unique.
- **Object Lifecycle Management:** auto-transition classes or delete by age — the go-to for "reduce storage cost over time".
- **Autoclass:** automatically moves each object between classes based on its *actual* access pattern (no age rules to write) — pick this when access is unpredictable.
- **Bucket Lock + retention policy** for WORM/compliance; **versioning** for accidental deletes.
- **Signed URLs** give time-limited object access to users *without* Google accounts; **signed policy documents** constrain browser-based uploads.
- **Access control:** prefer **uniform bucket-level access** (IAM only, recommended) over **fine-grained** (IAM + legacy per-object ACLs).

> **Trade-off — colder classes:** Each colder class lowers **storage $/GB** but adds a **retrieval fee + minimum duration**. Frequently-read data in Coldline/Archive costs *more*. Match the class to true access frequency and let **lifecycle rules** tier automatically.

## 06 — Databases

The single most-tested topic — know the decision rule cold.

| Service | Model | Choose when… | AWS |
|---|---|---|---|
| Cloud SQL | Relational OLTP | MySQL/PostgreSQL/SQL Server, single region, standard OLTP | RDS |
| AlloyDB | Relational (PG) | High-perf PostgreSQL, HTAP, AI-ready | Aurora |
| Spanner | Relational, global | Multi-region strong consistency, 99.999% SLA, horizontal scale, >1000 TPS | Aurora Global |
| Firestore | NoSQL document | Mobile/web, real-time sync, offline, flexible schema | DynamoDB |
| Bigtable | NoSQL wide-column | IoT/time-series, high-throughput low-latency, >1TB | DynamoDB / Timestream |
| Memorystore | In-memory | Redis/Memcached caching, sessions, leaderboards, sub-ms | ElastiCache |
| BigQuery | Analytical OLAP | Petabyte analytics, warehouse, serverless SQL, BI | Redshift |

**Fig 06.1 — Database decision tree**

- Analytics / warehousing / SQL over huge datasets? → **BigQuery**
- Relational + **global** scale & strong consistency? → **Spanner**
- Relational, **regional** OLTP, standard engines? → **Cloud SQL (AlloyDB if high-perf PG/HTAP)**
- NoSQL, real-time **mobile/web**, offline sync? → **Firestore**
- NoSQL, **high write throughput**, time-series/IoT, >1TB? → **Bigtable**
- Sub-ms caching / session store? → **Memorystore**

> **Scenario triggers (memorize):** "**Financial transactions**" + "**global**" in one sentence → **Spanner**. "**Sensor data** / **time-series**" → **Bigtable**. Plain "**relational**" with no scale requirement → **Cloud SQL**. "Real-time mobile sync" → **Firestore**. "Ad-hoc SQL / dashboards / ML on history" → **BigQuery**.

> **Trade-off — Cloud SQL vs Spanner:** **Cloud SQL:** cheaper, familiar engines, easy migration — but vertical ceiling & regional (replicas scale reads only). **Spanner:** unlimited horizontal scale + global strong consistency + 99.999% — but expensive and needs key design to avoid hotspots. Choose Spanner only for **global writes or scale beyond one big instance**.

> **Trade-off — Firestore vs Bigtable:** **Firestore:** document model, real-time listeners, strong consistency, app backends — modest write throughput. **Bigtable:** wide-column, single-digit-ms at millions of ops/sec, ideal for time-series/IoT — no cross-row transactions, no secondary indexes, min 1-node cost. Row-key design is everything.

## 07 — Networking

| Service | Function | AWS |
|---|---|---|
| VPC | **Global** virtual network (spans all regions) | VPC (regional) |
| Subnet | **Regional** (spans all zones in region) | Subnet (per-AZ) |
| Shared VPC | Host project shares subnets with service projects — centralised network admin | VPC sharing (RAM) |
| VPC Peering | Private connectivity between VPCs — **non-transitive** | VPC Peering |
| Private Service Connect | Private access to services/APIs across VPCs/orgs | PrivateLink |
| Private Google Access | VMs without external IP reach Google APIs (per-subnet) | Gateway endpoints |
| Cloud Interconnect | Dedicated/Partner private link to on-prem | Direct Connect |
| Cloud VPN (HA VPN) | Encrypted IPsec over internet (99.99% w/ 2 tunnels) | Site-to-Site VPN |
| Cloud Router | Dynamic BGP for VPN & Interconnect | (TGW/DXGW) |
| Cloud Armor | WAF + DDoS at the global LB (IP/geo/OWASP) | WAF + Shield |
| Cloud NAT | Egress for private instances | NAT Gateway |
| Network Connectivity Center | Hub-and-spoke transit — connects many VPCs/sites (works around peering's non-transitivity) | Transit Gateway |
| Cloud DNS | Managed DNS — public & private zones, split-horizon | Route 53 |
| Cloud Service Mesh (Traffic Director) | Managed service-to-service traffic, mTLS, canary routing (Istio/Envoy) | App Mesh |
| Cloud IDS | Managed intrusion detection (inspects traffic for threats) | GuardDuty (network) |

### GCP vs AWS — the key mental model

| | GCP | AWS |
|---|---|---|
| VPC scope | **Global** — one VPC spans every region | Regional — one VPC per region |
| Subnet scope | **Regional** — spans all zones | Per-AZ |
| Global LB | Single anycast IP, one LB worldwide | CloudFront + regional LBs |

### Load balancer selection

| Scenario | Use |
|---|---|
| HTTP/HTTPS, global, multiple regions | Global External Application LB |
| HTTP/HTTPS, must stay in one region (data residency) | Regional External Application LB |
| TCP/UDP, preserve client IP, non-HTTP | External Network LB (passthrough) |
| Internal microservices / private VPC traffic | Internal Application or Network LB |

**Fig 07.1 — Hybrid connectivity: choosing the on-prem link**

- **Highest bandwidth**, dedicated physical fibre, lowest latency (10/100 Gbps)? → **Dedicated Interconnect**
- **Cannot co-locate** at a Google PoP / lower bandwidth (50 Mbps–50 Gbps)? → **Partner Interconnect**
- Quick / cheap / encrypted over public internet (<3 Gbps)? → **HA VPN (99.99%)**
- Reach Google APIs privately from on-prem/VMs? → **Private Google Access / PSC**

> **Scenario triggers:** "Cannot co-locate at a Google facility" → **Partner Interconnect**. "Dedicated physical link, highest bandwidth" → **Dedicated Interconnect**. "Global users, one IP, HTTP" → **Global External App LB**. "Preserve source IP / non-HTTP" → **Network (passthrough) LB**. Remember VPC peering is **non-transitive**.

> **Network observability:** For "diagnose connectivity / see traffic" answers: **VPC Flow Logs** (traffic records), **Firewall Rules Logging / Insights** (what rules allow/deny), and **Network Intelligence Center** (Connectivity Tests, Topology, Performance Dashboard) to troubleshoot reachability and latency.

> **IP / CIDR planning:** Before any hybrid connectivity, ensure **non-overlapping RFC 1918 ranges** across on-prem and every VPC/subnet — overlapping CIDRs break routing and can't be corrected without re-addressing. Plan ranges with headroom; subnet ranges can expand but must never overlap.

## 08 — High Availability & Disaster Recovery

### RTO vs RPO — know the difference cold

**RTO — Recovery Time Objective**

- Max acceptable **downtime** after a failure.
- "How long until we're back up?"
- Lower RTO → hot standby, automated failover, MIGs.

**RPO — Recovery Point Objective**

- Max acceptable **data loss** (measured in time).
- "How much recent data can we lose?"
- Lower RPO → synchronous replication, frequent snapshots.

**Fig 08.1 — DR strategy ladder (cheaper/slower → pricier/faster)**

- **Backup & Restore** — snapshots/exports to Cloud Storage → high RTO/RPO · lowest cost
- **Cold standby (pilot light)** — minimal core running, scale on failover → medium RTO
- **Warm standby** — scaled-down full env, promote on failover → low RTO
- **Hot / multi-region active-active** — no data loss → near-zero RTO/RPO · highest cost

### HA patterns by service

| Service | HA configuration |
|---|---|
| Compute Engine | Regional MIG across multiple zones + autoscaling + health checks |
| Cloud SQL | HA config with standby in a 2nd zone, automatic failover |
| Spanner | Multi-region config = 99.999%, synchronous replication |
| GKE | Regional cluster spreads nodes across 3 zones automatically |
| Cloud Storage | Multi-region / dual-region bucket = geo-redundant objects |
| BigQuery | Multi-region dataset; cross-region dataset replication for DR |
| Backup and DR Service | Centralized managed backup/restore for GCE, disks, databases — the managed backup answer |

> **Scenario triggers:** "Cannot tolerate **data loss**" (RPO≈0) → synchronous replication → **Spanner multi-region** or **Cloud SQL HA**. "Low-cost DR, some data loss acceptable" → async replication / cross-region GCS copy. "Survive a **zone** failure" → regional (multi-zone). "Survive a **region** failure" → multi-region.

> **Trade-off — availability tiers:** **Zonal** = cheapest, single point of failure. **Regional** (multi-zone) = survives a zone outage, the usual production baseline. **Multi-region** = survives a region outage, highest cost and higher write latency. Buy only the tier the SLA demands.

## 09 — IAM & Security

**Fig 09.1 — Resource hierarchy (policies inherit downward; org policies + deny rules override)**

Organization → Folder(s) → Project(s) → Resources (VMs, buckets, DBs)

- **Roles:** Basic (Owner/Editor/Viewer — too broad, never in prod) → Predefined (service-specific, recommended) → Custom (exact least-privilege permissions).
- **Service accounts:** both identity *and* resource. Prefer **attached SAs + short-lived tokens** and **impersonation** (separation of duties) over exported keys. **Workload Identity Federation** = GitHub Actions / AWS / on-prem auth *without* keys.
- **IAM Conditions:** attribute-based (time, resource, IP). **Deny policies** override allow.
- **Human identity:** Cloud Identity is the user/group directory (IdaaS). Google Cloud Directory Sync (GCDS) one-way syncs on-prem AD/LDAP → Cloud Identity. Use **SSO via SAML/OIDC** with an external IdP (Okta, Entra ID). Workforce Identity Federation lets external-IdP *employees* use GCP with short-lived creds and no user provisioning — the human analog to Workload Identity Federation.
- **Org policies:** preventive guardrails (restrict regions, block external IPs, enforce CMEK) applied hierarchy-wide.

| Service | Function | AWS |
|---|---|---|
| Cloud KMS / HSM / EKM | Managed / hardware / external key management (CMEK) | KMS / CloudHSM |
| Secret Manager | Secrets storage + rotation + versioning + audit | Secrets Manager |
| VPC Service Controls | Perimeter to stop data exfiltration from managed APIs | (no direct equal) |
| Identity-Aware Proxy (IAP) | Zero-trust access to apps/VMs without VPN | Verified Access |
| Access Context Manager | Defines access levels (IP, device, region) that power IAP & VPC-SC | (condition keys) |
| Chrome Enterprise Premium (BeyondCorp) | Context-aware zero-trust access | — |
| Binary Authorization | Only trusted/signed container images deploy to GKE/Run | (Signer) |
| Security Command Center | Posture mgmt, vuln scanning, threat detection | Security Hub |
| Cloud Asset Inventory | Search/export/monitor all resources & IAM across the org (governance, audits) | Config / Resource Explorer |
| Google Security Operations (Chronicle) | SIEM/SOAR — threat hunting & correlation (behind SCC Enterprise) | Security Lake + Detective |
| Sensitive Data Protection (DLP) | Discover / classify / de-identify PII | Macie |
| Assured Workloads | Compliance-controlled envs (residency, personnel) | (compliance controls) |
| Model Armor | Guardrails for LLM prompts/responses | Bedrock Guardrails |

> **Trade-off — key management tiers:** Encryption at rest is **always on**. **Google-managed keys** = zero effort. **CMEK** (Cloud KMS) = you control rotation/disable for compliance. **Cloud HSM** = FIPS 140-2 L3 hardware. **Cloud EKM** = key held by an external/third-party manager (max control & separation, most overhead). Escalate only as compliance demands.

> **Scenario triggers:** "Prevent data leaving a perimeter even with valid creds" → **VPC Service Controls**. "Access internal app, no VPN" → **IAP**. "External CI/CD auth without long-lived keys" → **Workload Identity Federation**. "Only signed images to GKE" → **Binary Authorization**. "Regulator requires keys off-cloud" → **Cloud EKM**. "Federate on-prem AD / external IdP for employees" → **Cloud Identity + GCDS + SSO** (or **Workforce Identity Federation** for no provisioning).

## 10 — Operations & Observability

All under **Google Cloud Observability (Stackdriver)**.

| Service | Function | AWS |
|---|---|---|
| Cloud Monitoring | Metrics, dashboards, uptime checks, SLOs, alerting | CloudWatch Metrics |
| Cloud Logging | Log ingest; **Log Sinks** export to BigQuery/GCS/Pub/Sub | CloudWatch Logs |
| Cloud Trace | Distributed latency tracing across microservices | X-Ray |
| Cloud Profiler | Continuous CPU/heap profiling | CodeGuru Profiler |
| Error Reporting | Aggregates + surfaces app errors in real time | — |
| Managed Service for Prometheus | Managed Prometheus for GKE/metrics | AMP |
| Cloud Audit Logs | Admin / Data Access / System / Policy logs | CloudTrail |

> **Scenario triggers:** "Centralise logs across all projects" → **Log Sinks** to a central project's logging/GCS bucket (aggregated sink at org/folder). "Long-term log retention/analytics" → sink to **BigQuery/GCS**. Admin Activity audit logs are **always-on & immutable**; Data Access logs are opt-in (high volume/cost).

> **SRE mindset (§6):** Reliability answers favor **SLIs/SLOs + error budgets**, alerting on symptoms not causes, and validating resilience with **chaos / load / penetration testing**.

### CI/CD & orchestration (§5 Managing implementation)

| Service | Function | AWS |
|---|---|---|
| Cloud Build | CI — build, test, containerize from source | CodeBuild |
| Artifact Registry (GCR) | Store build artifacts / container images | ECR / CodeArtifact |
| Cloud Deploy | CD — managed progressive delivery to GKE/Run | CodeDeploy |
| Eventarc | Event routing (Cloud/Audit/Pub-Sub events → services) | EventBridge |
| Workflows | Serverless orchestration of API/service steps | Step Functions |
| Cloud Scheduler | Managed cron for jobs/HTTP/Pub-Sub | EventBridge Scheduler |
| Cloud Tasks | Async task queue with rate/retry control | SQS (task-style) |

> **Scenario triggers:** Pipeline chain: **Cloud Build → Artifact Registry → Cloud Deploy**. "Trigger a service from a GCS/Audit event" → **Eventarc**. "Coordinate multi-step API calls" → **Workflows**. "Run on a schedule" → **Cloud Scheduler**. "Rate-limited async work queue" → **Cloud Tasks**. Note **Cloud Composer** (Airflow) is for heavy data pipelines; Workflows is lighter service orchestration.

## 11 — Data & Analytics

| Service | Function | AWS |
|---|---|---|
| Pub/Sub | Global async messaging — entry point for streaming pipelines | SNS+SQS / Kinesis |
| Dataflow | Managed Apache Beam — unified stream + batch ETL | Kinesis Data Analytics |
| Dataproc | Managed Hadoop/Spark — migrate existing jobs | EMR |
| Managed Service for Apache Spark | Serverless Spark | EMR Serverless |
| BigQuery | Serverless warehouse + BQML + BI Engine | Redshift |
| Cloud Composer | Managed Apache Airflow orchestration | MWAA |
| Cloud Data Fusion | Visual, code-free ETL/ELT | Glue (visual) |
| Dataplex | Governance, lakehouse, catalog | Lake Formation |
| Looker / Looker Studio | Governed BI & visualization on BigQuery | QuickSight |
| Datastream | Serverless change-data-capture (CDC) — replicate DB changes into BigQuery/GCS | DMS (CDC) |
| Cloud Healthcare API | Managed FHIR/HL7v2/DICOM store — the EHR-case ingestion/interop layer | HealthLake |

**Fig 11.1 — Canonical streaming pipeline (the IoT / telemetry answer)**

Pub/Sub → Dataflow (transform) → Bigtable (low-latency serving) + BigQuery (analytics)

> **Trade-off — Dataflow vs Dataproc:** **Dataflow:** serverless, autoscaling, one pipeline for batch *and* stream — preferred greenfield. **Dataproc:** when **migrating existing Hadoop/Spark/Hive** with minimal rewrite. Lift-and-shift Spark → Dataproc; net-new streaming → Dataflow.

## 12 — Migration Strategy (the 6 R's)

| Strategy | Meaning | GCP tooling |
|---|---|---|
| **Rehost** (lift & shift) | Move as-is, fastest | Migrate to VMs, Migration Center |
| **Replatform** | Minor optimization (self-managed DB → Cloud SQL) | Database Migration Service |
| **Refactor** / modernize | Re-architect to cloud-native | Migrate to Containers, GKE, Cloud Run |
| **Repurchase** | Switch to SaaS | — |
| **Retire** | Decommission unused | — |
| **Retain** | Keep on-prem for now (hybrid) | Interconnect / GKE Enterprise |

- **Assess first** with **Migration Center** (discovery, TCO, dependency mapping) — always the step before choosing a strategy.
- **Data transfer sizing:** Storage Transfer Service (online), **Transfer Appliance** (petabyte-scale offline), `gcloud storage` for smaller sets.

> **Trade-off — speed vs value:** **Rehost** = fastest, least cloud value, keeps tech debt. **Refactor** = highest long-term value but most time/cost/risk. "Tight deadline / minimize change" → rehost; "reduce operational burden / scale elastically" → refactor to managed/serverless.

## 13 — Cost Optimization

| Lever | Savings / trigger | Use when… |
|---|---|---|
| Committed Use Discounts (CUD) | up to ~57–70% for 1- or 3-yr commit | Steady-state, predictable baseline load |
| Spot VMs (Preemptible) | up to ~91% off; 30s reclaim notice | Batch, fault-tolerant, stateless workers |
| Sustained Use Discounts | automatic after >25% of the month | Always — no action needed (Compute Engine) |
| Rightsizing / Recommender | flags idle/underused VMs | Regular reviews; Active Assist |
| Storage Lifecycle policies | auto-tier to Nearline/Coldline/Archive | Aging data with dropping access frequency |
| Autoscaling / scale-to-zero | pay only for what runs | Spiky/variable traffic → Cloud Run, MIGs, Autopilot |
| BigQuery editions vs on-demand | reservations for heavy, on-demand for variable | Predictable heavy analytics → capacity/reservations |
| Budget alerts | catch overspend early | Always — set in Cloud Billing |
| Billing export to BigQuery | detailed spend analysis & dashboards | "Analyze / break down cloud spend" |
| Labels | tag resources for cost allocation & reporting | Chargeback / show-back by team/env |

> **Scenario triggers:** "Steady 24/7 workload, cut compute cost" → **CUDs**. "Batch jobs, cost-sensitive, interruptible" → **Spot VMs**. "Reduce storage cost over time" → **lifecycle policies**. "Right-size / find waste" → **Recommender / Active Assist**. "Prevent surprise bills" → **budget alerts** (they don't cap spend — they notify).

> **Trade-off — CUD vs Spot:** **CUD** guarantees capacity + discount but locks you into a 1/3-yr spend commitment (best for baseline). **Spot** is far cheaper with no commitment but can vanish in 30s (best for fault-tolerant/batch). Many designs combine: CUD for the steady baseline + Spot for burst/batch.

## 14 — Business, Process & Governance

Domain §4 (~15%) is **not about services** — it tests architect judgment: stakeholders, process maturity, buy-vs-build, and how responsibility is shared. These questions have no product in the answer; they reward the option that reflects sound engineering-organization practice.

### People & process

- **Stakeholder & change management:** identify stakeholders early, communicate trade-offs in business terms, and plan training/change so a technically correct design actually gets adopted.
- **Success = business KPIs**, not tech metrics. Tie the architecture to measurable outcomes (cost per transaction, time-to-market, latency SLA) and define them up front.
- **SDLC & DevOps maturity:** favor CI/CD, IaC, automated testing, and small frequent releases. The **DORA metrics** — deployment frequency, lead time for changes, change-failure rate, MTTR — are the standard health signals.
- **Team skills & topology:** assess current skills and plan upskilling; managed/serverless reduces the ops burden on a stretched team.

### Buy vs build

> **Default heuristic:** Prefer **managed services / SaaS (repurchase)** to remove undifferentiated heavy lifting; build custom only where it is a genuine competitive differentiator. "Reduce operational burden / focus engineers on the product" points to buy/managed.

### Shared Responsibility & Shared Fate

| Google secures ("of the cloud") | You secure ("in the cloud") |
|---|---|
| Hardware, network, hypervisor, physical DCs, managed-service internals | Your data, IAM & access, configuration, OS/patching (on IaaS), app code |

- The more managed the service, the more responsibility shifts to Google (IaaS → PaaS → serverless).
- **Shared fate** goes further: Google actively helps you succeed via secure blueprints, Assured Workloads, and Security Command Center.

### Compliance & data governance

- Certifications (ISO 27001, SOC 1/2/3, PCI-DSS, HIPAA, FedRAMP) — find attestations in the **Compliance Reports Manager**.
- **Data residency / sovereignty:** Assured Workloads enforces location + personnel controls; the **org policy resource-locations constraint** restricts where resources can be created.

### Deployment strategies

| Strategy | How it works | Trade-off |
|---|---|---|
| **Recreate** | Stop old, deploy new | Simplest; causes downtime |
| **Rolling** | Replace instances gradually | No downtime; mixed versions during rollout (MIG/GKE default) |
| **Blue/Green** | Full parallel env, switch traffic | Instant rollback; double the resources briefly |
| **Canary** | Route a small % to the new version first | Limits blast radius; needs good metrics/automation |
| **A/B** | Route by attribute to test variants | Experimentation, not just release safety |

> **Scenario triggers:** "Zero downtime, instant rollback" → **Blue/Green**. "Limit risk / test on real traffic first" → **Canary**. "No downtime, minimal extra cost" → **Rolling**. **Cloud Deploy** automates progressive (canary/rolling) delivery.

## 15 — Well-Architected Framework — 6 Pillars

Your **default tie-breaker** when two answers both "work". Explicitly referenced throughout the exam guide.

1. **Operational Excellence** — Observability, automation, incident response, deployment discipline.
2. **Security, Privacy & Compliance** — Least privilege, defense in depth, encryption, governance.
3. **Reliability** — HA/DR, redundancy, graceful degradation, SLOs & error budgets.
4. **Performance Optimization** — Right-sizing, autoscaling, caching, managed services.
5. **Cost Optimization** — CapEx→OpEx, commitment discounts, lifecycle tiering, cleanup.
6. **Sustainability** — Region carbon data, efficient utilization, right-sizing.

> **How to use it in questions:** Stuck between two valid options? Pick the one serving the pillar the scenario stresses: "always available" → reliability; "sensitive data" → security; "reduce spend" → cost. Managed/serverless usually wins on operational excellence.

## 16 — Trade-off Master List

The decisions examiners most love to test — memorize the "choose X when" trigger.

### Compute pricing models

**Cheaper:**

- **Spot VMs** — up to ~91% off, interruptible
- **CUDs** — steady, predictable load
- **Sustained Use** — automatic, no commitment
- **Autopilot / serverless** — pay for what runs

**Pricier but safer:**

- **On-demand VMs** — no interruption, no commit
- **Reserved capacity** — guaranteed availability
- **Over-provisioned nodes** — headroom, waste

### Consistency vs scale (databases)

**Strong consistency:**

- **Spanner** — global + strong (premium)
- **Cloud SQL / AlloyDB** — ACID, regional
- **Firestore** — strong within region

**Scale / throughput:**

- **Bigtable** — huge throughput, no cross-row txns
- **BigQuery** — analytics scale, not OLTP
- **Read replicas** — scale reads, eventual lag

### Managed vs self-managed

> **Default heuristic:** **Managed / serverless usually beats self-managed** — less ops = better operational excellence + often lower TCO. Choose self-managed (Compute Engine, self-hosted DB, Dataproc) only when you need OS control, a specific engine/version, licensing, or a low-effort lift-and-shift.

### AI build vs buy

> **Escalation ladder:** **Prebuilt API** → **Foundation model from Model Garden** → **RAG / Agent Builder on your data** → **Fine-tune** → **Train custom on Agent Platform + AI Hypercomputer**. Climb only when the cheaper rung can't meet accuracy/latency/data-control needs.

## 17 — Exam-Day Tips

- **Read the case studies days before.** Know each company's goals, existing tech, and constraints so questions become fast lookups.
- **Every answer maps to a WAF pillar.** When two options both work, pick the one serving the pillar the scenario emphasizes.
- **Least privilege & managed services** are the safe defaults for "best practice" questions.
- **Watch the qualifier:** "most cost-effective", "least operational overhead", "fastest to deploy", "minimize change", "global", "cannot tolerate data loss" — the qualifier decides between otherwise-valid answers.
- **Eliminate deprecated services** (Cloud Debugger, IoT Core, Deployment Manager) — they're distractors.
- **AI questions:** prefer prebuilt/RAG over custom training unless accuracy demands it; remember **Model Armor** + **Sensitive Data Protection** for securing AI.
- **Global VPC / regional subnets** — a recurring networking trick; VPC peering is non-transitive.
- **Compliance flags** (HIPAA, PCI, residency, sovereignty) → **Assured Workloads + CMEK/EKM + VPC-SC**.
- **Flag & move on.** ~2 min/question; mark for review and return.

## 18 — Exam FAQs

### How hard is the PCA, and how long should I prepare?

It's one of the harder GCP exams — 50–60 questions in 2 hours, heavily scenario-based. Most candidates with 2+ years of cloud experience pass in one attempt after 4–8 focused weeks, with the emphasis on case studies and service trade-offs rather than rote facts.

### What are the current official case studies?

The 2026 pool is **Altostrat Media, Cymbal Retail, EHR Healthcare, and KnightMotives Automotive** — you get 2 of the 4 on your exam. The older Mountkirk Games / TerramEarth / Helicopter Racing League set has been retired. Read all four in advance and map their requirements to services.

### Cloud SQL vs Spanner — when do I pick each?

**Cloud SQL** for standard OLTP in a single region (MySQL/PostgreSQL/SQL Server). **Spanner** when you need multi-region strong consistency, a 99.999% SLA, or horizontal scale beyond one instance (roughly >1,000 TPS or global writes). "Financial + global" in one sentence is almost always Spanner.

### GKE Autopilot vs Standard — quick rule?

**Autopilot** when the scenario prioritizes reduced operational burden — Google manages nodes, scaling, and patching, billed per pod. **Standard** when you need specific machine types, GPUs/TPUs, or custom node configs. On the exam, "operational simplicity" almost always points to Autopilot.

### Which storage class for archival / compliance data?

**Archive** for < once/year (regulatory records), **Coldline** for < once/quarter, **Nearline** for < once/month. Use **Object Lifecycle Management** to auto-transition so you never pay Standard rates for cold data. Colder = cheaper to store but pricier to retrieve.

### What changed for AI in 2026?

Generative AI is now explicitly in scope and the exam is moving from the **Vertex AI** name to **Gemini Enterprise Agent Platform**. Expect questions on Model Garden, Agent Builder (RAG), Gemini Cloud Assist, AI Hypercomputer, and securing AI with Model Armor + Sensitive Data Protection. Both old and new product names may appear.

### Standard vs renewal exam?

First-timers and expired certs take the **standard** exam (2 hrs, $200, 50–60 questions, 2 case studies). If you hold an active cert within the renewal window, you can take the shorter **renewal** exam (1 hr, $100, 25 questions, 1 gen-AI case study making up 90–100% of it).

## Appendix A1 — CLI Quick Reference

> **Recognition, not memorization:** The PCA is a **design** exam — it won't ask you to type commands with exact flags (that's the **Associate Cloud Engineer** exam). §5.2 only expects you to know *which tool does what* and to recognize a command in an answer choice. Learn the **tool-to-service mapping** below; don't over-invest here.

### The three CLIs — know the split

| Tool | Scope | Example |
|---|---|---|
| `gcloud` | Everything except the two below — compute, IAM, networking, GKE, projects, config | `gcloud compute instances list` |
| `gcloud storage` (gsutil) | Cloud Storage objects & buckets | `gcloud storage cp file gs://bucket` |
| `bq` | BigQuery datasets, tables, queries | `bq query 'SELECT ...'` |
| `kubectl` | In-cluster GKE objects — after `get-credentials` | `kubectl get pods` |

### Commands worth recognizing

| Area | Command | What it does |
|---|---|---|
| Config | `gcloud init` / `gcloud auth login` | Set up + authenticate the SDK |
| Config | `gcloud config set project PROJECT_ID` | Switch the active project |
| Projects | `gcloud projects create\|list` | Create / list projects in the hierarchy |
| Compute | `gcloud compute instances create\|list\|delete` | Manage individual VMs |
| Compute | `gcloud compute instance-templates create` | Define the VM blueprint for a MIG |
| Compute | `gcloud compute instance-groups managed create` | Create a MIG (autoscaling + autohealing) |
| GKE | `gcloud container clusters create --region ...` | Regional cluster = nodes across 3 zones (HA) |
| GKE | `gcloud container clusters get-credentials NAME` | Fetch kubeconfig → then use `kubectl` |
| IAM | `gcloud projects add-iam-policy-binding PROJECT --member=... --role=roles/...` | Grant a role to a principal (least privilege) |
| IAM | `gcloud iam service-accounts create NAME` | Create a service-account identity |
| Storage | `gcloud storage cp \| ls \| rm` | Copy / list / delete objects (old: `gsutil`) |
| BigQuery | `bq mk` · `bq load` · `bq query` | Make dataset · load data · run SQL |
| Pub/Sub | `gcloud pubsub topics create` / `subscriptions create` | Create streaming entry points |
| Network | `gcloud compute networks create --subnet-mode=custom` | Custom-mode VPC (global; subnets regional) |
| Network | `gcloud compute firewall-rules create` | Allow/deny VPC traffic |

> **The one fact that actually earns points:** It's the **tool-to-service mapping**, not flags: `bq` = BigQuery · `gcloud storage`/`gsutil` = Cloud Storage · `kubectl` (after `get-credentials`) = inside a GKE cluster. And for provisioning: prefer **Terraform / Infrastructure Manager** (IaC) over the deprecated **Deployment Manager**. Also know the emulators — Bigtable, Spanner, Pub/Sub, Firestore — exist for local testing without touching real resources.

> **Don't over-study this:** If you find yourself memorizing exact flag names or output formats, stop — you're studying for the ACE exam, not PCA. Spend that time on case studies and service trade-offs instead.

## Appendix A2 — Editions & Tiers

> **Why this matters:** The exam tests tiers *indirectly*: a scenario names a capability (threat detection, global backbone routing, high IOPS) and the right answer depends on knowing which tier provides it. Learn **what unlocks at each tier**, not the prices.

### Security Command Center

| Tier | Unlocks | Scenario signal |
|---|---|---|
| Standard (free) | Basic posture — Security Health Analytics (misconfigs, exposed resources), Web Security Scanner custom scans. GCP only. | "Free dashboard / find misconfigurations" |
| Premium | + Threat detection (Event / Container / VM), **attack-path simulation**, **compliance monitoring** (CIS, PCI-DSS, NIST, HIPAA, ISO). Org or project level. | "Detect active threats / monitor PCI-HIPAA / attack paths" |
| Enterprise | Multi-cloud CNAPP across **AWS/Azure**, integrated **Google SecOps** (SIEM/SOAR), CIEM. Org level only. | "One security view across GCP + AWS + Azure with SIEM" |

> **Note:** The SCC **Enterprise** tier is scheduled to shut down on **May 21, 2027**, with those orgs moving to **Premium**. If a question forces a choice, Premium is the safe "paid tier" default for threat detection + compliance.

### Network Service Tiers

**Premium (default):**

- Traffic rides Google's **global backbone** end-to-end
- Supports **global** load balancing & anycast
- Best performance & reliability

**Standard:**

- Egresses to public internet near the region
- **Regional** load balancing only
- Cheaper — trade performance/global reach for cost

> **Trigger:** "Minimize network egress cost, single-region app" → **Standard tier**. "Global users, best latency/reliability" → **Premium tier**.

### Other capability-gated choices

| Choice | Options (cheaper → pricier / more capable) | Pick on |
|---|---|---|
| Persistent Disk / Hyperdisk | pd-standard (HDD) → pd-balanced (default SSD) → pd-ssd → pd-extreme / **Hyperdisk** (tunable) | cost vs IOPS/latency |
| BigQuery compute | **On-demand** (per-TB scanned, spiky) vs **Editions** (Standard / Enterprise / Enterprise Plus — slot capacity + autoscale + commitments) | predictable heavy load → Editions |
| Firestore | **Native mode** (real-time sync + offline) vs **Datastore mode** (server-side, no real-time) | new apps → Native |
| GKE | Autopilot / Standard modes → **GKE Enterprise (Anthos)** for fleet/multicloud | hybrid/multicluster → Enterprise |
| Cloud VPN | Classic VPN (99.9%) → **HA VPN** (99.99%) | production → HA VPN |

---

*Built from the official Google Cloud exam guide and certification page. Verify current details at cloud.google.com/learn/certification/cloud-architect. Independent study aid, not affiliated with Google.*
