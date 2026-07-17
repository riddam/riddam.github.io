---
title: "GCP PCA: 100 Practice Questions"
description: "One hundred scenario-based practice questions for the Google Cloud Professional Cloud Architect exam, with answers and explanations covering design, compute, storage, databases, networking, security, operations, data, migration, cost, and AI."
pubDate: 2026-07-17
tags: ["gcp", "cloud-architecture", "certification", "practice-questions"]
---

Scenario-based questions in Professional Cloud Architect style. Every question has an answer and an explanation, grouped by domain so you can drill weak spots. These are original study material, not real exam items.

## Solution Design

### Question 1

A retailer must move a large monolithic application to Google Cloud within a very tight deadline and wants minimal code changes. Which migration strategy fits best?

- **A.** Refactor the monolith into microservices on GKE
- **B.** Rehost (lift-and-shift) the VMs to Compute Engine using Migrate to Virtual Machines
- **C.** Rewrite the app as event-driven Cloud Run functions
- **D.** Repurchase an equivalent SaaS product

<details><summary>Answer</summary>

**B. Rehost (lift-and-shift) the VMs to Compute Engine using Migrate to Virtual Machines**

A tight deadline with minimal change points to **rehost**. Refactor and rewrite add value but cost far more time and risk; repurchase changes the product entirely.

</details>

### Question 2

A startup wants an HTTP API packaged as a container, pays only when requests arrive, and needs near-zero operational overhead. Which platform?

- **A.** Compute Engine with a MIG
- **B.** GKE Standard
- **C.** Cloud Run
- **D.** App Engine Flexible

<details><summary>Answer</summary>

**C. Cloud Run**

**Cloud Run** runs stateless containers, scales to zero, and bills per request with no infrastructure to manage — the lowest-overhead fit for an HTTP container API.

</details>

### Question 3

Two proposed designs both satisfy the functional requirements. Which reference should guide the trade-off decision on the exam?

- **A.** The cheapest option regardless of other factors
- **B.** The Google Cloud Well-Architected Framework pillars
- **C.** Whatever uses the newest services
- **D.** The option with the most managed services

<details><summary>Answer</summary>

**B. The Google Cloud Well-Architected Framework pillars**

The **Well-Architected Framework** (six pillars) is the intended tie-breaker. Pick the option that best serves the pillar the scenario stresses.

</details>

### Question 4

A business goal states checkout latency must stay under 200 ms at peak. How is this classified?

- **A.** A functional requirement
- **B.** A non-functional requirement
- **C.** A compliance control
- **D.** A migration dependency

<details><summary>Answer</summary>

**B. A non-functional requirement**

Latency, availability, and throughput targets are **non-functional requirements**. Functional requirements describe what the system does, not how well.

</details>

### Question 5

An application serves users on every continent from a single global IP and handles HTTP(S) traffic. Which entry point should the architecture use?

- **A.** Regional External Application Load Balancer
- **B.** Global External Application Load Balancer
- **C.** External Network passthrough Load Balancer
- **D.** Internal Application Load Balancer

<details><summary>Answer</summary>

**B. Global External Application Load Balancer**

The **Global External Application LB** provides one anycast IP worldwide with routing to the nearest healthy backend — ideal for global HTTP apps.

</details>

### Question 6

A company must expose internal APIs to external partners with quotas, authentication, versioning, and analytics. Which service?

- **A.** Cloud Endpoints only
- **B.** Apigee API Management
- **C.** Cloud Load Balancing
- **D.** Pub/Sub

<details><summary>Answer</summary>

**B. Apigee API Management**

**Apigee** is the full API-management layer: quotas, keys, monetization, versioning and analytics for partner-facing APIs.

</details>

### Question 7

An enterprise wants a cloud-first design that keeps compute portable across environments to avoid lock-in. Which approach fits?

- **A.** Build directly on proprietary managed runtimes only
- **B.** Containerize workloads and run on GKE
- **C.** Use only Compute Engine VMs with custom images
- **D.** Deploy everything as Cloud Run functions

<details><summary>Answer</summary>

**B. Containerize workloads and run on GKE**

**Containers on GKE** maximize portability across on-prem, GCP, and other clouds — the standard answer for avoiding lock-in while staying cloud-native.

</details>

### Question 8

Before selecting a migration approach for hundreds of servers, what should the architect do first?

- **A.** Start provisioning Compute Engine VMs
- **B.** Assess the estate with Migration Center for discovery, TCO, and dependencies
- **C.** Sign a Committed Use Discount
- **D.** Enable VPC Service Controls

<details><summary>Answer</summary>

**B. Assess the estate with Migration Center for discovery, TCO, and dependencies**

**Assess first.** Migration Center discovers inventory, maps dependencies, and estimates TCO so you can choose the right strategy per workload.

</details>

## Compute

### Question 9

A nightly batch rendering job is fault-tolerant and cost-sensitive; occasional interruption is acceptable. Which compute is most cost-effective?

- **A.** On-demand Compute Engine VMs
- **B.** Spot VMs
- **C.** Committed use N2 instances
- **D.** Sole-tenant nodes

<details><summary>Answer</summary>

**B. Spot VMs**

**Spot VMs** are up to ~91% cheaper and can be reclaimed with 30s notice — perfect for fault-tolerant batch work.

</details>

### Question 10

A team wants Kubernetes but does not want to manage nodes, and prefers paying per running pod. Which option?

- **A.** GKE Standard
- **B.** GKE Autopilot
- **C.** Compute Engine with kubeadm
- **D.** Cloud Run

<details><summary>Answer</summary>

**B. GKE Autopilot**

**GKE Autopilot** removes node management and bills per pod, with hardened defaults — the go-to when the scenario stresses operational simplicity.

</details>

### Question 11

A workload needs specific GPU types, custom node machine configurations, and privileged DaemonSets on Kubernetes. Which is required?

- **A.** GKE Autopilot
- **B.** GKE Standard
- **C.** Cloud Run
- **D.** App Engine Standard

<details><summary>Answer</summary>

**B. GKE Standard**

**GKE Standard** gives node-level control (custom machine types, GPUs, privileged DaemonSets) that Autopilot restricts.

</details>

### Question 12

A legacy application requires a specific OS kernel version and commercially licensed software tied to the host. Which platform?

- **A.** Cloud Run
- **B.** Compute Engine
- **C.** GKE Autopilot
- **D.** Cloud Run functions

<details><summary>Answer</summary>

**B. Compute Engine**

**Compute Engine** gives full OS/kernel control and supports bring-your-own-license workloads that serverless and Autopilot cannot.

</details>

### Question 13

An image should be processed automatically whenever a file lands in a Cloud Storage bucket. Which compute is the simplest fit?

- **A.** A always-on Compute Engine VM polling the bucket
- **B.** Cloud Run functions triggered by the storage event
- **C.** GKE CronJob
- **D.** App Engine Standard cron

<details><summary>Answer</summary>

**B. Cloud Run functions triggered by the storage event**

**Cloud Run functions** (event-driven) fire on the Cloud Storage finalize event — no idle compute, minimal code.

</details>

### Question 14

An enterprise runs Kubernetes clusters on-prem, in GCP, and in AWS, and needs consistent config and policy across all of them. Which product?

- **A.** GKE Standard in each cloud independently
- **B.** GKE Enterprise (Anthos)
- **C.** Cloud Run
- **D.** Compute Engine MIGs

<details><summary>Answer</summary>

**B. GKE Enterprise (Anthos)**

**GKE Enterprise (Anthos)** provides fleet management, Config Management, and Service Mesh across on-prem and multiple clouds.

</details>

### Question 15

A stateless web tier on VMs must automatically scale, self-heal failed instances, and roll out updates gradually. Which construct?

- **A.** Unmanaged instance group
- **B.** Managed Instance Group (MIG)
- **C.** A single large VM
- **D.** Sole-tenant node group

<details><summary>Answer</summary>

**B. Managed Instance Group (MIG)**

A **MIG** delivers autoscaling, autohealing, and rolling/canary updates across zones. Unmanaged groups are static.

</details>

### Question 16

A compliance rule forbids running on physical hardware shared with other tenants. Which Compute Engine feature satisfies this?

- **A.** Confidential VMs
- **B.** Sole-tenant nodes
- **C.** Preemptible VMs
- **D.** Shielded VMs

<details><summary>Answer</summary>

**B. Sole-tenant nodes**

**Sole-tenant nodes** dedicate a physical host to your project, meeting single-tenancy licensing/compliance needs.

</details>

### Question 17

A predictable production service runs 24/7 for years. How should the team reduce its compute cost with commitment?

- **A.** Switch it to Spot VMs
- **B.** Purchase Committed Use Discounts
- **C.** Rely only on Sustained Use Discounts
- **D.** Move it to App Engine

<details><summary>Answer</summary>

**B. Purchase Committed Use Discounts**

**Committed Use Discounts** (1 or 3 years) give the deepest savings for steady, predictable baseline load. Spot is wrong for an always-up service.

</details>

### Question 18

A regulated workload requires data to remain encrypted even while being processed in memory. Which feature?

- **A.** CMEK on the boot disk
- **B.** Confidential VMs
- **C.** VPC Service Controls
- **D.** Cloud HSM

<details><summary>Answer</summary>

**B. Confidential VMs**

**Confidential VMs** encrypt memory in-use, protecting data during processing — beyond the default at-rest and in-transit encryption.

</details>

## Storage

### Question 19

Regulatory records must be kept for seven years and are read roughly once a year. Which Cloud Storage class minimizes cost?

- **A.** Standard
- **B.** Nearline
- **C.** Coldline
- **D.** Archive

<details><summary>Answer</summary>

**D. Archive**

**Archive** is cheapest to store for data accessed less than once a year. Retrieval is pricier, but that is rare here.

</details>

### Question 20

An architect wants objects to move to cheaper classes automatically as they age, with no manual work. Which feature?

- **A.** Bucket Lock
- **B.** Object Lifecycle Management
- **C.** Object Versioning
- **D.** Turbo Replication

<details><summary>Answer</summary>

**B. Object Lifecycle Management**

**Object Lifecycle Management** auto-transitions objects between classes (or deletes them) by age — the standard cost-over-time answer.

</details>

### Question 21

Multiple VMs and GKE pods need a shared POSIX file system mounted concurrently. Which service?

- **A.** Cloud Storage with FUSE
- **B.** Filestore
- **C.** Local SSD
- **D.** Persistent Disk in read-write on one VM

<details><summary>Answer</summary>

**B. Filestore**

**Filestore** provides managed NFS shared file storage for concurrent mounts across VMs and GKE.

</details>

### Question 22

A workload needs the highest possible disk IOPS for scratch data and can tolerate losing that data when the VM stops. Which storage?

- **A.** Balanced Persistent Disk
- **B.** Local SSD
- **C.** Cloud Storage Standard
- **D.** Filestore

<details><summary>Answer</summary>

**B. Local SSD**

**Local SSD** offers the highest IOPS/lowest latency but is ephemeral — ideal for scratch/cache where loss on stop is acceptable.

</details>

### Question 23

A compliance mandate requires that stored objects cannot be modified or deleted for a fixed retention period (WORM). Which feature?

- **A.** Object Versioning
- **B.** Bucket Lock with a retention policy
- **C.** Signed URLs
- **D.** Requester Pays

<details><summary>Answer</summary>

**B. Bucket Lock with a retention policy**

**Bucket Lock** with a retention policy enforces immutable WORM storage for the retention window.

</details>

### Question 24

Objects must survive a full regional outage with the highest availability. Which bucket configuration?

- **A.** Single-region bucket
- **B.** Multi-region bucket
- **C.** Nearline single-region
- **D.** Local SSD replication

<details><summary>Answer</summary>

**B. Multi-region bucket**

A **multi-region** (or dual-region) bucket stores geo-redundant copies, surviving a regional failure with the highest availability.

</details>

### Question 25

Website assets are read constantly by many users worldwide. Which storage class is correct?

- **A.** Standard
- **B.** Nearline
- **C.** Coldline
- **D.** Archive

<details><summary>Answer</summary>

**A. Standard**

**Standard** class is for frequently accessed hot data with no retrieval fee — correct for actively served assets.

</details>

## Databases

### Question 26

A global financial ledger needs strong consistency across regions, horizontal scale, and a 99.999% availability SLA. Which database?

- **A.** Cloud SQL with cross-region replicas
- **B.** Spanner
- **C.** Bigtable
- **D.** Firestore

<details><summary>Answer</summary>

**B. Spanner**

**Spanner** uniquely offers globally strong-consistent relational data with horizontal scale and 99.999% multi-region availability. 'Financial + global' is the classic Spanner signal.

</details>

### Question 27

A regional web app uses standard OLTP on MySQL with no extreme scale needs. Which managed database?

- **A.** Spanner
- **B.** Cloud SQL
- **C.** Bigtable
- **D.** BigQuery

<details><summary>Answer</summary>

**B. Cloud SQL**

**Cloud SQL** fits standard single-region OLTP on MySQL/PostgreSQL/SQL Server. Spanner would be overkill and costly.

</details>

### Question 28

Connected sensors generate millions of time-series writes per second that must be stored with low-latency reads. Which database?

- **A.** Cloud SQL
- **B.** Firestore
- **C.** Bigtable
- **D.** BigQuery

<details><summary>Answer</summary>

**C. Bigtable**

**Bigtable** handles very high write throughput and low-latency reads for time-series/IoT at scale. 'Sensor/time-series' is the Bigtable signal.

</details>

### Question 29

A mobile app needs real-time data sync across devices and offline support with a flexible schema. Which database?

- **A.** Bigtable
- **B.** Firestore
- **C.** Cloud SQL
- **D.** Spanner

<details><summary>Answer</summary>

**B. Firestore**

**Firestore** provides real-time listeners, offline sync, and a serverless document model — built for mobile/web backends.

</details>

### Question 30

Analysts need serverless SQL over petabytes of historical data for dashboards and ad-hoc queries. Which service?

- **A.** Cloud SQL
- **B.** BigQuery
- **C.** Bigtable
- **D.** Memorystore

<details><summary>Answer</summary>

**B. BigQuery**

**BigQuery** is the serverless analytical warehouse for petabyte-scale SQL and BI — not an operational database.

</details>

### Question 31

A gaming backend needs a sub-millisecond cache for session data and leaderboards. Which service?

- **A.** Firestore
- **B.** Memorystore
- **C.** Cloud SQL
- **D.** BigQuery

<details><summary>Answer</summary>

**B. Memorystore**

**Memorystore** (Redis/Memcached) delivers sub-ms in-memory caching for sessions and leaderboards.

</details>

### Question 32

A team needs PostgreSQL compatibility with much higher performance and mixed transactional/analytical (HTAP) workloads. Which database?

- **A.** Cloud SQL for PostgreSQL
- **B.** AlloyDB
- **C.** Bigtable
- **D.** Firestore

<details><summary>Answer</summary>

**B. AlloyDB**

**AlloyDB** is PostgreSQL-compatible with far higher performance and strong HTAP capability.

</details>

### Question 33

A Cloud SQL instance is read-bound and the team must scale reads without changing the database engine. What should they add?

- **A.** Read replicas
- **B.** A second primary
- **C.** Shard manually across instances
- **D.** Migrate to Bigtable

<details><summary>Answer</summary>

**A. Read replicas**

**Read replicas** scale read traffic for Cloud SQL. Writes still go to the primary; replicas add eventual read lag.

</details>

### Question 34

A self-managed PostgreSQL database must move to Cloud SQL with minimal downtime and continuous replication during cutover. Which tool?

- **A.** Storage Transfer Service
- **B.** Database Migration Service
- **C.** Transfer Appliance
- **D.** Dataflow

<details><summary>Answer</summary>

**B. Database Migration Service**

**Database Migration Service** performs serverless, minimal-downtime migrations with continuous replication to Cloud SQL.

</details>

### Question 35

A Bigtable cluster shows hot-spotting and uneven node load. What is the most likely fix?

- **A.** Add secondary indexes
- **B.** Redesign the row key to distribute writes evenly
- **C.** Enable multi-region replication
- **D.** Switch to on-demand pricing

<details><summary>Answer</summary>

**B. Redesign the row key to distribute writes evenly**

Bigtable performance depends on **row-key design**. Sequential/monotonic keys cause hotspots; distribute the key to spread load.

</details>

### Question 36

A regional application needs ACID transactions and the team standardizes on SQL Server. Which service?

- **A.** Cloud SQL for SQL Server
- **B.** Spanner
- **C.** Bigtable
- **D.** Firestore

<details><summary>Answer</summary>

**A. Cloud SQL for SQL Server**

**Cloud SQL for SQL Server** provides managed, ACID-compliant SQL Server in a single region — Spanner is not needed without global scale.

</details>

### Question 37

A data team wants to train and run simple ML models directly on warehouse data using SQL, without moving data out. Which capability?

- **A.** Dataproc MLlib
- **B.** BigQuery ML (BQML)
- **C.** Memorystore
- **D.** Cloud SQL stored procedures

<details><summary>Answer</summary>

**B. BigQuery ML (BQML)**

**BigQuery ML** lets analysts build and run models with SQL inside BigQuery, avoiding data movement.

</details>

## Networking

### Question 38

An enterprise needs the highest-bandwidth private connection to Google with traffic that never traverses the public internet. Which option?

- **A.** HA VPN
- **B.** Dedicated Interconnect
- **C.** Partner Interconnect
- **D.** Cloud NAT

<details><summary>Answer</summary>

**B. Dedicated Interconnect**

**Dedicated Interconnect** is a direct physical fiber link (10/100 Gbps) to a Google PoP with no internet traversal — highest bandwidth, lowest latency.

</details>

### Question 39

A company cannot physically co-locate at a Google PoP but still wants a private, non-internet path to Google Cloud. Which option?

- **A.** Dedicated Interconnect
- **B.** Partner Interconnect
- **C.** Classic VPN
- **D.** Direct Peering only

<details><summary>Answer</summary>

**B. Partner Interconnect**

When you cannot reach a Google facility, **Partner Interconnect** connects through an approved provider (50 Mbps–50 Gbps).

</details>

### Question 40

A team needs a quick, encrypted hybrid link with modest bandwidth and a 99.99% availability SLA. Which option?

- **A.** Classic VPN single tunnel
- **B.** HA VPN
- **C.** Dedicated Interconnect
- **D.** Cloud CDN

<details><summary>Answer</summary>

**B. HA VPN**

**HA VPN** gives an encrypted IPsec link over the internet with a 99.99% SLA when configured with two tunnels — fast and cheap to set up.

</details>

### Question 41

An organization wants centralized network administration where several team projects share common subnets. Which pattern?

- **A.** VPC Peering between every project
- **B.** Shared VPC with a host project
- **C.** A separate VPC per project with VPN
- **D.** Legacy default network

<details><summary>Answer</summary>

**B. Shared VPC with a host project**

**Shared VPC** lets a host project own the network and share subnets with service projects — centralized admin, decentralized workloads.

</details>

### Question 42

VPC-A peers with VPC-B, and VPC-B peers with VPC-C. Can resources in VPC-A reach VPC-C directly?

- **A.** Yes, peering is transitive
- **B.** No, VPC Peering is non-transitive
- **C.** Only if a Cloud Router is added
- **D.** Only over the internet

<details><summary>Answer</summary>

**B. No, VPC Peering is non-transitive**

**VPC Peering is non-transitive.** A-to-C needs its own peering or a hub design (e.g., Network Connectivity Center).

</details>

### Question 43

VMs without external IP addresses must call Google APIs such as Cloud Storage privately. Which feature enables this?

- **A.** Cloud NAT
- **B.** Private Google Access
- **C.** External Application LB
- **D.** Cloud VPN

<details><summary>Answer</summary>

**B. Private Google Access**

**Private Google Access** (per-subnet) lets internal-only VMs reach Google APIs without external IPs.

</details>

### Question 44

A security team must ensure that even with valid credentials, data cannot be exfiltrated from BigQuery and Cloud Storage to outside a defined boundary. Which control?

- **A.** IAM Deny policies alone
- **B.** VPC Service Controls
- **C.** Cloud Armor
- **D.** Firewall rules

<details><summary>Answer</summary>

**B. VPC Service Controls**

**VPC Service Controls** create an API perimeter that blocks data movement outside the boundary, mitigating credential-based exfiltration.

</details>

### Question 45

A public web application needs protection from DDoS attacks and OWASP-style exploits at the global load balancer. Which service?

- **A.** Cloud NAT
- **B.** Cloud Armor
- **C.** VPC Service Controls
- **D.** Secret Manager

<details><summary>Answer</summary>

**B. Cloud Armor**

**Cloud Armor** provides WAF rules (OWASP) plus DDoS protection at the edge/global LB.

</details>

### Question 46

Private instances with no external IP need outbound internet access to download OS patches. Which service?

- **A.** Cloud NAT
- **B.** Private Google Access
- **C.** Cloud CDN
- **D.** Partner Interconnect

<details><summary>Answer</summary>

**A. Cloud NAT**

**Cloud NAT** provides managed egress to the internet for instances without external IPs.

</details>

### Question 47

A regional service uses a non-HTTP TCP protocol and the backend must see the client's original source IP. Which load balancer?

- **A.** Global External Application LB
- **B.** External Network passthrough Load Balancer
- **C.** Internal Application LB
- **D.** SSL Proxy LB

<details><summary>Answer</summary>

**B. External Network passthrough Load Balancer**

The **External Network (passthrough) LB** preserves the client source IP and handles arbitrary TCP/UDP, which Application LBs do not.

</details>

### Question 48

A consumer must privately reach a producer service published in another organization's VPC, without peering the whole networks. Which feature?

- **A.** VPC Peering
- **B.** Private Service Connect
- **C.** Cloud VPN
- **D.** Shared VPC

<details><summary>Answer</summary>

**B. Private Service Connect**

**Private Service Connect** exposes a specific service privately across VPCs/orgs without joining the full networks.

</details>

## High Availability and Disaster Recovery

### Question 49

A payments system states it cannot tolerate any data loss on failover (RPO near zero) and needs global reach. Which database configuration?

- **A.** Cloud SQL with async cross-region replica
- **B.** Spanner multi-region with synchronous replication
- **C.** Nightly Cloud Storage backups
- **D.** Single-zone Bigtable

<details><summary>Answer</summary>

**B. Spanner multi-region with synchronous replication**

RPO near zero requires **synchronous replication**; Spanner multi-region provides it globally. Async replicas risk losing recent writes.

</details>

### Question 50

A Cloud SQL database must automatically fail over if its zone goes down. What should be configured?

- **A.** Read replica in the same zone
- **B.** High Availability configuration with a standby in a second zone
- **C.** Manual export to Cloud Storage
- **D.** Bigtable replication

<details><summary>Answer</summary>

**B. High Availability configuration with a standby in a second zone**

Cloud SQL **HA configuration** maintains a standby in another zone with automatic failover — read replicas do not provide automatic failover.

</details>

### Question 51

Which metric defines the maximum acceptable downtime after an incident?

- **A.** RPO
- **B.** RTO
- **C.** SLA
- **D.** MTBF

<details><summary>Answer</summary>

**B. RTO**

**RTO** (Recovery Time Objective) is the maximum acceptable downtime; RPO measures acceptable data loss.

</details>

### Question 52

Which metric defines the maximum acceptable amount of data loss, measured in time?

- **A.** RTO
- **B.** RPO
- **C.** SLO
- **D.** QPS

<details><summary>Answer</summary>

**B. RPO**

**RPO** (Recovery Point Objective) is the maximum data loss window; lower RPO needs more frequent/synchronous replication.

</details>

### Question 53

A non-critical internal tool needs the cheapest DR approach and can tolerate hours of downtime and some data loss. Which pattern?

- **A.** Hot active-active multi-region
- **B.** Warm standby
- **C.** Backup and restore from Cloud Storage
- **D.** Synchronous multi-region database

<details><summary>Answer</summary>

**C. Backup and restore from Cloud Storage**

**Backup and restore** is the lowest-cost DR pattern, accepting higher RTO/RPO — appropriate for non-critical workloads.

</details>

### Question 54

A GKE workload must keep running if a single zone fails, with no manual intervention. How should the cluster be created?

- **A.** Zonal cluster with more nodes
- **B.** Regional cluster spanning three zones
- **C.** Two separate zonal clusters managed manually
- **D.** Autopilot in a single zone

<details><summary>Answer</summary>

**B. Regional cluster spanning three zones**

A **regional GKE cluster** spreads nodes and the control plane across three zones, surviving a zone outage automatically.

</details>

### Question 55

A mission-critical app requires near-zero RTO and cost is a secondary concern. Which DR strategy?

- **A.** Backup and restore
- **B.** Pilot light
- **C.** Hot / multi-region active-active
- **D.** Cold standby

<details><summary>Answer</summary>

**C. Hot / multi-region active-active**

**Hot active-active** across regions gives near-zero RTO/RPO at the highest cost — justified for mission-critical systems.

</details>

## Security

### Question 56

A GitHub Actions pipeline needs to deploy to GCP without storing long-lived service account keys. Which approach?

- **A.** Download and store an SA key in the repo secrets
- **B.** Workload Identity Federation
- **C.** Use the default Compute Engine service account key
- **D.** Share a user's credentials

<details><summary>Answer</summary>

**B. Workload Identity Federation**

**Workload Identity Federation** lets external identities (GitHub, AWS, on-prem) obtain short-lived tokens with no exported keys.

</details>

### Question 57

An application should only read objects from one bucket and nothing more. Which IAM approach follows least privilege?

- **A.** Grant roles/editor on the project
- **B.** Grant the predefined role roles/storage.objectViewer scoped to the bucket
- **C.** Grant roles/owner
- **D.** Grant Basic Viewer at the org level

<details><summary>Answer</summary>

**B. Grant the predefined role roles/storage.objectViewer scoped to the bucket**

Prefer a narrowly scoped **predefined role** (roles/storage.objectViewer). Basic roles like Editor/Owner are far too broad for production.

</details>

### Question 58

Employees must reach an internal web app based on identity and context, without a VPN. Which service?

- **A.** Cloud VPN
- **B.** Identity-Aware Proxy (IAP)
- **C.** Cloud NAT
- **D.** Cloud Armor

<details><summary>Answer</summary>

**B. Identity-Aware Proxy (IAP)**

**Identity-Aware Proxy** gates access to apps/VMs by verified identity and context — zero-trust access without a VPN.

</details>

### Question 59

A regulator mandates that encryption keys be generated and stored outside Google Cloud, under the customer's external key manager. Which option?

- **A.** Google-managed keys
- **B.** CMEK with Cloud KMS
- **C.** Cloud HSM
- **D.** Cloud External Key Manager (Cloud EKM)

<details><summary>Answer</summary>

**D. Cloud External Key Manager (Cloud EKM)**

**Cloud EKM** keeps keys in a supported third-party/external manager while GCP calls them — maximum separation and control.

</details>

### Question 60

A compliance requirement says the customer must control key rotation and be able to disable keys, but keys can stay in Google's KMS. Which option?

- **A.** Google-managed encryption keys
- **B.** Customer-Managed Encryption Keys (CMEK)
- **C.** No encryption
- **D.** Client-side only with no KMS

<details><summary>Answer</summary>

**B. Customer-Managed Encryption Keys (CMEK)**

**CMEK** (Cloud KMS) lets the customer manage rotation and disable keys while Google hosts them — the middle tier of control.

</details>

### Question 61

A platform team must ensure only trusted, signed container images can be deployed to GKE. Which control?

- **A.** Cloud Armor
- **B.** Binary Authorization
- **C.** VPC Service Controls
- **D.** Secret Manager

<details><summary>Answer</summary>

**B. Binary Authorization**

**Binary Authorization** enforces deploy-time policy so only attested/signed images run on GKE (and Cloud Run).

</details>

### Question 62

An app must store API keys and passwords centrally with versioning, rotation, and audit logging. Which service?

- **A.** Store them in environment variables in code
- **B.** Secret Manager
- **C.** Cloud Storage bucket with public access
- **D.** IAM custom roles

<details><summary>Answer</summary>

**B. Secret Manager**

**Secret Manager** centralizes secrets with versioning, rotation, IAM, and audit logging — never hardcode secrets.

</details>

### Question 63

Before loading customer data into analytics, the team must find and mask personally identifiable information. Which service?

- **A.** Sensitive Data Protection (DLP)
- **B.** Cloud Armor
- **C.** Security Command Center
- **D.** Cloud KMS

<details><summary>Answer</summary>

**A. Sensitive Data Protection (DLP)**

**Sensitive Data Protection (formerly DLP)** discovers, classifies, and de-identifies PII across data.

</details>

### Question 64

An org wants to enforce that no VM in any project can have an external IP. Which mechanism applies this guardrail hierarchy-wide?

- **A.** A firewall rule per project
- **B.** An Organization Policy constraint
- **C.** An IAM predefined role
- **D.** A VPC route

<details><summary>Answer</summary>

**B. An Organization Policy constraint**

**Organization Policies** apply preventive constraints (e.g., restrict external IPs) across the whole resource hierarchy.

</details>

### Question 65

A generative-AI application must be protected from prompt injection and from leaking sensitive data in responses. Which service?

- **A.** Cloud Armor
- **B.** Model Armor
- **C.** Binary Authorization
- **D.** Cloud CDN

<details><summary>Answer</summary>

**B. Model Armor**

**Model Armor** screens LLM prompts and responses for safety, prompt injection, and data leakage.

</details>

### Question 66

Leadership wants a single place to view security posture, misconfigurations, and active threats across the organization. Which service?

- **A.** Cloud Logging
- **B.** Security Command Center
- **C.** Cloud Monitoring
- **D.** Cloud Trace

<details><summary>Answer</summary>

**B. Security Command Center**

**Security Command Center** is the centralized posture-management and threat-detection platform for GCP.

</details>

### Question 67

To enforce separation of duties, a deploy pipeline must temporarily act as a higher-privileged identity only during deployment. Which mechanism?

- **A.** Exported service account keys
- **B.** Service account impersonation
- **C.** Sharing the owner role
- **D.** A shared password

<details><summary>Answer</summary>

**B. Service account impersonation**

**Service account impersonation** lets one principal assume another SA's permissions short-term, supporting separation of duties without static keys.

</details>

### Question 68

A workload requires cryptographic keys protected by hardware certified to FIPS 140-2 Level 3. Which service?

- **A.** Cloud KMS software keys
- **B.** Cloud HSM
- **C.** Cloud EKM
- **D.** Secret Manager

<details><summary>Answer</summary>

**B. Cloud HSM**

**Cloud HSM** provides FIPS 140-2 Level 3 hardware-backed keys managed within Google Cloud.

</details>

## Operations and Observability

### Question 69

Logs from dozens of projects must be centralized into one location for long-term retention and analysis. Which approach?

- **A.** Manually download logs weekly
- **B.** Aggregated Log Sink at the org/folder exporting to BigQuery or Cloud Storage
- **C.** Enable Data Access logs everywhere
- **D.** Increase Cloud Monitoring quota

<details><summary>Answer</summary>

**B. Aggregated Log Sink at the org/folder exporting to BigQuery or Cloud Storage**

An **aggregated Log Sink** exports logs across projects to BigQuery/GCS for centralized retention and querying.

</details>

### Question 70

A microservices app has intermittent latency and the team must see where time is spent across service calls. Which tool?

- **A.** Cloud Profiler
- **B.** Cloud Trace
- **C.** Error Reporting
- **D.** Cloud Logging

<details><summary>Answer</summary>

**B. Cloud Trace**

**Cloud Trace** provides distributed request tracing to pinpoint latency across microservices.

</details>

### Question 71

An engineering team wants ongoing, low-overhead insight into which functions consume the most CPU and memory in production. Which tool?

- **A.** Cloud Trace
- **B.** Cloud Profiler
- **C.** Cloud Monitoring uptime checks
- **D.** VPC Flow Logs

<details><summary>Answer</summary>

**B. Cloud Profiler**

**Cloud Profiler** continuously profiles CPU and heap usage in production with minimal overhead.

</details>

### Question 72

An SRE team must define measurable reliability targets and track how much unreliability budget remains. Which concepts?

- **A.** KPIs and OKRs
- **B.** SLIs, SLOs, and error budgets
- **C.** RTO and RPO
- **D.** CapEx and OpEx

<details><summary>Answer</summary>

**B. SLIs, SLOs, and error budgets**

Reliability is managed with **SLIs/SLOs and error budgets**, the core of the operational-excellence pillar.

</details>

### Question 73

An auditor needs an immutable record of who performed administrative actions via GCP APIs. Which log type?

- **A.** Data Access audit logs
- **B.** Admin Activity audit logs
- **C.** VPC Flow Logs
- **D.** Application logs

<details><summary>Answer</summary>

**B. Admin Activity audit logs**

**Admin Activity audit logs** are always-on and immutable, recording administrative API calls. Data Access logs are opt-in and high-volume.

</details>

### Question 74

To improve reliability, a team wants to proactively verify the system withstands failures and load before customers are affected. Which practices?

- **A.** Only monitor dashboards
- **B.** Chaos engineering, load testing, and penetration testing
- **C.** Disable alerting to reduce noise
- **D.** Increase log retention

<details><summary>Answer</summary>

**B. Chaos engineering, load testing, and penetration testing**

The reliability sub-domain calls for proactive validation via **chaos, load, and penetration testing**.

</details>

### Question 75

A GKE platform team wants managed, Prometheus-compatible metrics collection at scale. Which service?

- **A.** Cloud Trace
- **B.** Managed Service for Prometheus
- **C.** Error Reporting
- **D.** Cloud Profiler

<details><summary>Answer</summary>

**B. Managed Service for Prometheus**

**Managed Service for Prometheus** provides fully managed, Prometheus-compatible metrics for GKE and other workloads.

</details>

## Data and Analytics

### Question 76

A streaming pipeline must ingest high-volume events reliably as its entry point before processing. Which service?

- **A.** Cloud Storage
- **B.** Pub/Sub
- **C.** BigQuery
- **D.** Dataproc

<details><summary>Answer</summary>

**B. Pub/Sub**

**Pub/Sub** is the scalable async ingestion entry point for streaming pipelines.

</details>

### Question 77

A greenfield project needs one pipeline that handles both batch and streaming ETL without managing clusters. Which service?

- **A.** Dataproc
- **B.** Dataflow
- **C.** Cloud Composer
- **D.** Bigtable

<details><summary>Answer</summary>

**B. Dataflow**

**Dataflow** (Apache Beam) is serverless and unifies batch and stream processing — the preferred greenfield choice.

</details>

### Question 78

A company has extensive existing Apache Spark and Hive jobs and wants to move them with minimal rewrite. Which service?

- **A.** Dataflow
- **B.** Dataproc
- **C.** Pub/Sub
- **D.** BigQuery

<details><summary>Answer</summary>

**B. Dataproc**

**Dataproc** runs managed Spark/Hadoop/Hive, ideal for lifting existing jobs with minimal changes.

</details>

### Question 79

A data team needs to orchestrate a multi-step pipeline with dependencies, retries, and scheduling using Apache Airflow. Which service?

- **A.** Cloud Scheduler
- **B.** Cloud Composer
- **C.** Workflows
- **D.** Dataflow

<details><summary>Answer</summary>

**B. Cloud Composer**

**Cloud Composer** is managed Apache Airflow for complex pipeline orchestration.

</details>

### Question 80

Business analysts want to build ETL visually without writing code. Which service?

- **A.** Dataflow templates only
- **B.** Cloud Data Fusion
- **C.** Dataproc notebooks
- **D.** Cloud Functions

<details><summary>Answer</summary>

**B. Cloud Data Fusion**

**Cloud Data Fusion** provides a visual, code-free ETL/ELT builder for analysts.

</details>

### Question 81

An organization needs governed, reusable BI dashboards with a shared semantic model on top of BigQuery. Which tool?

- **A.** Looker
- **B.** Cloud Monitoring
- **C.** Data Studio raw only
- **D.** Bigtable

<details><summary>Answer</summary>

**A. Looker**

**Looker** offers a governed semantic model and embedded analytics on BigQuery.

</details>

### Question 82

For an IoT telemetry platform, which end-to-end pipeline order is canonical on the exam?

- **A.** BigQuery to Pub/Sub to Dataflow
- **B.** Pub/Sub to Dataflow to Bigtable and BigQuery
- **C.** Dataproc to Pub/Sub to Cloud SQL
- **D.** Cloud SQL to Dataflow to Firestore

<details><summary>Answer</summary>

**B. Pub/Sub to Dataflow to Bigtable and BigQuery**

The canonical pattern is **Pub/Sub → Dataflow → Bigtable (low-latency serving) + BigQuery (analytics)**.

</details>

### Question 83

A company needs unified data governance, cataloging, and lakehouse management across data assets. Which service?

- **A.** Dataplex
- **B.** Memorystore
- **C.** Cloud CDN
- **D.** Cloud Armor

<details><summary>Answer</summary>

**A. Dataplex**

**Dataplex** provides governance, cataloging, and lakehouse organization across distributed data.

</details>

## Migration

### Question 84

A company must move multiple petabytes to Cloud Storage but has limited network bandwidth. Which is fastest?

- **A.** gcloud storage cp over the internet
- **B.** Storage Transfer Service online
- **C.** Transfer Appliance (offline shipping)
- **D.** Database Migration Service

<details><summary>Answer</summary>

**C. Transfer Appliance (offline shipping)**

For petabyte-scale data with limited bandwidth, the offline **Transfer Appliance** is fastest.

</details>

### Question 85

An ongoing, scheduled transfer of objects from Amazon S3 and on-prem into Cloud Storage is needed. Which service?

- **A.** Transfer Appliance
- **B.** Storage Transfer Service
- **C.** Datastream
- **D.** Cloud Composer

<details><summary>Answer</summary>

**B. Storage Transfer Service**

**Storage Transfer Service** handles scheduled/online transfers from S3, on-prem, and other clouds to Cloud Storage.

</details>

### Question 86

A team wants to modernize existing VMs into containers running on GKE. Which tool?

- **A.** Migrate to Virtual Machines
- **B.** Migrate to Containers
- **C.** Database Migration Service
- **D.** Transfer Appliance

<details><summary>Answer</summary>

**B. Migrate to Containers**

**Migrate to Containers** converts VM workloads into containers on GKE.

</details>

### Question 87

Before a large migration, the team needs automated discovery, dependency mapping, and TCO estimates. Which service?

- **A.** Migration Center
- **B.** Cloud Deploy
- **C.** Config Connector
- **D.** Cloud Build

<details><summary>Answer</summary>

**A. Migration Center**

**Migration Center** provides discovery, dependency mapping, and TCO estimation to plan migrations.

</details>

### Question 88

For infrastructure as code, which is the preferred approach now that Deployment Manager is being retired?

- **A.** Deployment Manager templates
- **B.** Terraform / Infrastructure Manager
- **C.** Manual gcloud scripts
- **D.** Cloud Shell history

<details><summary>Answer</summary>

**B. Terraform / Infrastructure Manager**

**Terraform** (and Google's managed Infrastructure Manager) is the preferred IaC; Deployment Manager is deprecated.

</details>

## Cost Optimization

### Question 89

A fault-tolerant batch workload should minimize compute cost and can handle interruptions. Which option gives the deepest savings?

- **A.** On-demand VMs
- **B.** Spot VMs (up to ~91% off)
- **C.** Committed use for 3 years
- **D.** Sole-tenant nodes

<details><summary>Answer</summary>

**B. Spot VMs (up to ~91% off)**

**Spot VMs** give the deepest per-hour discount for interruptible, fault-tolerant work.

</details>

### Question 90

A stable production service runs continuously and the team wants predictable savings via commitment. Which lever?

- **A.** Spot VMs
- **B.** Committed Use Discounts
- **C.** Sustained Use only
- **D.** Preemptible only

<details><summary>Answer</summary>

**B. Committed Use Discounts**

**Committed Use Discounts** reward steady, predictable usage with 1- or 3-year commitments.

</details>

### Question 91

Storage costs are rising because old data stays in Standard class. What reduces cost automatically?

- **A.** Delete the bucket
- **B.** Object Lifecycle Management to tier to Nearline/Coldline/Archive
- **C.** Enable versioning
- **D.** Switch to a multi-region bucket

<details><summary>Answer</summary>

**B. Object Lifecycle Management to tier to Nearline/Coldline/Archive**

**Lifecycle policies** auto-tier aging objects to colder classes, cutting storage cost without manual work.

</details>

### Question 92

An architect wants to identify underutilized VMs to downsize and save money. Which tool surfaces this?

- **A.** Cloud Armor
- **B.** Recommender / Active Assist rightsizing recommendations
- **C.** VPC Flow Logs
- **D.** Security Command Center

<details><summary>Answer</summary>

**B. Recommender / Active Assist rightsizing recommendations**

**Recommender (Active Assist)** flags idle/underused resources with rightsizing recommendations.

</details>

### Question 93

Finance wants to be notified before spend exceeds a threshold, though not to hard-stop resources. Which feature?

- **A.** Quotas
- **B.** Budget alerts in Cloud Billing
- **C.** Committed Use Discounts
- **D.** Org Policy

<details><summary>Answer</summary>

**B. Budget alerts in Cloud Billing**

**Budget alerts** notify when spend approaches/exceeds a threshold; they do not automatically cap usage.

</details>

### Question 94

A company has heavy, predictable BigQuery analytics and wants cost control versus paying per query. Which approach?

- **A.** Always use on-demand pricing
- **B.** Use BigQuery editions/reservations (capacity-based)
- **C.** Export to Cloud SQL
- **D.** Disable caching

<details><summary>Answer</summary>

**B. Use BigQuery editions/reservations (capacity-based)**

For predictable heavy usage, **capacity reservations/editions** control cost better than on-demand per-query pricing.

</details>

## AI and Machine Learning

### Question 95

A company wants a chatbot that answers questions grounded in its internal documents and product catalog. Which approach?

- **A.** Train a large model from scratch
- **B.** Agent Builder with retrieval-augmented generation (RAG)
- **C.** A prebuilt Vision API
- **D.** Memorystore lookups

<details><summary>Answer</summary>

**B. Agent Builder with retrieval-augmented generation (RAG)**

**Agent Builder / Vertex AI Search** with RAG grounds a foundation model on your data — far cheaper and faster than training from scratch.

</details>

### Question 96

A team wants to choose from 200+ first- and third-party foundation models without building one. Where do they start?

- **A.** Model Garden
- **B.** Cloud Functions
- **C.** BigQuery
- **D.** Dataproc

<details><summary>Answer</summary>

**A. Model Garden**

**Model Garden** is the catalog of 200+ models (Gemini, Llama, etc.) to deploy or tune.

</details>

### Question 97

An architect wants in-console AI assistance to design, deploy, and troubleshoot their Google Cloud architecture. Which tool?

- **A.** Gemini Cloud Assist
- **B.** Model Armor
- **C.** NotebookLM
- **D.** AI Hypercomputer

<details><summary>Answer</summary>

**A. Gemini Cloud Assist**

**Gemini Cloud Assist** helps design, deploy, and troubleshoot cloud architecture directly in the console.

</details>

### Question 98

A research team needs to train very large models at scale using TPUs and GPUs with optimized consumption. Which offering?

- **A.** Cloud Run
- **B.** AI Hypercomputer
- **C.** App Engine
- **D.** Cloud SQL

<details><summary>Answer</summary>

**B. AI Hypercomputer**

**AI Hypercomputer** is the integrated infrastructure for large-scale training/serving across TPUs and GPUs.

</details>

### Question 99

A team needs off-the-shelf image labeling and document text extraction without any ML expertise. Which is best?

- **A.** Train a custom model on Agent Platform
- **B.** Use prebuilt AI APIs (Vision, Document AI)
- **C.** Deploy an open model on GKE
- **D.** Use BigQuery ML

<details><summary>Answer</summary>

**B. Use prebuilt AI APIs (Vision, Document AI)**

**Prebuilt AI APIs** (Vision, Document AI, Speech) deliver common capabilities instantly with no ML skills required.

</details>

### Question 100

A domain-specific task has poor accuracy with pretrained models and abundant labeled data is available. What is the right escalation?

- **A.** Keep using the prebuilt API
- **B.** Train or fine-tune a custom model on Gemini Enterprise Agent Platform (Vertex AI)
- **C.** Switch to Memorystore
- **D.** Use Cloud Armor

<details><summary>Answer</summary>

**B. Train or fine-tune a custom model on Gemini Enterprise Agent Platform (Vertex AI)**

When prebuilt accuracy is insufficient and you have labeled data, climb the ladder to **custom training/fine-tuning on Agent Platform (Vertex AI)**.

</details>
