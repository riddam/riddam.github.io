---
title: "Rebuilding CI/CD Without Changing Platforms"
description: "What it takes to host a self-hosted CI platform properly — two agent tiers, queue-driven scaling, breaking the bootstrap dependency, stopping base-image drift, and making the server disposable."
pubDate: 2026-08-05
tags: ["cicd", "platform-engineering", "infrastructure-as-code", "aws-cdk"]
cover: bootstrap
---

When a CI/CD platform becomes painful, the instinct is to shop for a new one. Sometimes that's right. Often the pain has nothing to do with the product and everything to do with what has accumulated around it: build agents configured by hand years ago, pipelines assembled by clicking through a UI, a server nobody dares upgrade.

Migrating platforms doesn't fix any of that. It relocates it, and adds a migration to the bill.

I've written about [the decision not to migrate](/leadership/leading-without-authority/) and how you make that case credibly. This is the other half — what the rebuild actually consisted of, and which parts of it I'd do the same way again.

For a sense of scale, what this now carries is roughly 1,400 projects and around 2,400 build configurations, with a few dozen more archived. That's worth holding in mind through the rest of this, because most of the decisions below only start to matter somewhere in the high hundreds.

## Two agent tiers, and why

The instinct is one kind of build agent, uniformly configured. That breaks on the first job that needs Docker inside Docker.

Nested container workloads need privileges a managed container platform won't grant you, and shouldn't. So there are two tiers, and the split is a rule rather than a preference:

- **VM agents** for anything needing Docker-in-Docker, privileged operations, or a full machine. They cost more and start slower.
- **Container agents** for everything else, which is the large majority of builds.

The container tier runs framework-specific images — one for Python, one for TypeScript, one for .NET — rather than a single image carrying every toolchain any team might want. A fat image is appealing for about a month, until it takes eleven minutes to pull, and every team's dependency upgrade becomes everyone's problem. Narrow images fail independently, which is the property you want.

The VM tier is deliberately heterogeneous too: general-purpose x86 for most work, ARM instances where the workload benefits, compute-optimized shapes for the heavy jobs, and Mac metal for mobile builds, because iOS builds leave you no choice.

> A single build image is a shared-fate decision disguised as a simplification.

## Scale on the queue, not on CPU

Build capacity is bursty in a way that defeats ordinary autoscaling. Nothing for two hours, then forty jobs land because a release branch merged.

CPU utilization is the wrong signal here — it's a lagging proxy for demand. The build queue *is* the demand signal: it knows exactly how much work is waiting and what kind of agent each job needs. So agents provision in response to queue depth, and scale back down after an idle period.

Two things follow from this that are worth stating plainly. Idle cost approaches zero, because at three in the morning there are no agents running at all. And the scale-down timer is a real tuning decision, not a default to accept: too aggressive and you pay the cold-start cost on every commit during working hours; too lax and you're paying for idle agents all afternoon. An hour of idle tolerance turned out to be a reasonable balance, but it's the kind of number worth revisiting against your own commit patterns rather than inheriting from a blog post.

Build capacity also runs on spot, and *which* workload gets the spot capacity is where the actual thinking went. Pull request inspection is the obvious candidate: it generates by far the deepest queue, every run is short, and every run is safe to repeat. So that's where spot points.

Which makes interruption handling much less interesting than it sounds, and deliberately so. When spot capacity gets reclaimed, the container tier absorbs the work — runners spin up there and the queue drains a little slower rather than stalling. That's a better answer than clever retry logic, because it requires no coordination and no new moving parts: the fallback is a capacity type that was already running everything else.

> The cheapest way to handle a failure mode is to arrange for something else to already be able to do the work.

## Don't let the CI system deploy itself

This is the piece I'd argue hardest for, and the one I see skipped most often.

The platform's infrastructure — the server, the agent fleets, the networking, the roles — is defined as code. The question is what applies that code. The tempting answer is the CI platform itself: it's right there, teams already know it, and it can reach everything.

Don't. If the system that rebuilds your pipeline system *is* your pipeline system, you have a circular dependency. It costs you nothing on an ordinary day and everything on the day the server won't start, which is precisely the day you need to deploy a change to it.

So that pipeline lives somewhere else entirely — in our case GitHub Actions, deliberately not the platform under management:

- **A pull request runs a plan** against every environment and posts the diff. The diff is the review artifact; you approve a described change, not an intention.
- **Merging applies it**, environment by environment, with concurrency pinned to one so two environments can never converge on the same state simultaneously.
- **Environments go in order**, test first. The blast radius of a mistake is a test environment, and you learn about it before production.

The test for whether you've actually broken the dependency is uncomfortable and worth asking out loud: *if the CI server were gone right now, could I rebuild it?* If the answer routes through the CI server, you haven't broken anything — you've just written the circular dependency down.

There's a subtlety worth naming. Not everything that touches the platform has to avoid it. A reconciliation job that calls the server's API to keep configuration current legitimately depends on the server being up, because it has nothing to do when the server is down. Bootstrap and steady-state are different problems, and only bootstrap needs the separation.

## The base image will drift unless something stops it

This is the section I'd most like people to take seriously, because I learned it the expensive way.

I once estimated two weeks to move a fleet from Amazon Linux 2 to Amazon Linux 2023 and spent five. The operating system migration was never the problem. The problem was that the applications running on it had been quietly held together by an old base image for years — runtimes several versions behind, OpenSSL moving from the 1.0.2 and 1.1.1 era to 3.0, Python 2 gone entirely. I hadn't estimated a migration. I'd estimated an unmeasured maintenance backlog.

Drift isn't an event. It's the default state of any long-lived image that nothing actively updates. So something has to actively update it:

- A **golden image** is built by a pipeline and its identifier published to a parameter store, so there is exactly one answer to "what should agents be running?"
- A **scheduled reconciler** reads that parameter, resolves the image and its snapshot, and rewrites the agent fleet configuration to match. Agents replaced after that point come up on the current image.
- The schedule is **staggered across environments** — test on one day, then the others through the week. A bad image surfaces in test before it reaches anything that matters.

The staggering is the part that's easy to skip and shouldn't be. Refreshing everything at once converts a routine hygiene job into a simultaneous fleet-wide outage the one time the new image is broken.

> Nothing about this is clever. It's a scheduled job that keeps a number in sync with another number. That's exactly why it works — and why the five-week version of my week-two estimate never has to happen again.

## Scan the images, and mean it

The VM side of the fleet has drift handled. The container side has a different problem: an agent image is a supply chain, and it's one you're pulling into a system that holds deployment credentials.

Container agent images come out of a managed image-build pipeline into a registry with scanning enabled, and they're exercised in a test phase *after* the build rather than trusted on the strength of having built successfully. A green build says the Dockerfile is valid. It says nothing about whether the result works or what it now contains.

The part that matters is what happens on a critical finding: the image is removed before it is used for any deployment. Not flagged for triage, not added to a backlog with a due date — deleted, under a policy that doesn't negotiate about it.

> A scanner whose findings you triage at leisure is a compliance artifact. A scanner that can delete an artifact before it ships is a control.

That distinction is worth being honest about, because scanning is one of the easiest things to install and one of the easiest to render meaningless. Almost everyone has scanning. Far fewer have a rule that stops a flagged image from being used, and the rule is the entire value.

## Make the server disposable

The server was the thing nobody wanted to touch, which is how you end up years behind on versions.

The fix isn't making the server more robust. It's making it disposable, which means getting the state off it:

- **The database** moves to a managed cluster — more than one instance, encrypted, with a real backup retention window and a defined maintenance window.
- **The data directory** moves to shared encrypted network storage, so it survives the instance entirely.
- **Backups** go to object storage on top of that, because a managed cluster protects you from hardware failure, not from a bad decision.

With state elsewhere, upgrading stops being surgery on a precious box and becomes replacing an instance. It runs in an autoscaling group behind a load balancer, replaced one node at a time, and — the important detail — **the rollout waits on a success signal from the new instance and requires it before proceeding.** A server that fails to come up blocks its own rollout rather than taking the platform down with it. The group also always tracks the newest launch template version, so an image change propagates on the next replacement instead of needing anyone to remember.

One honest note, because this gets oversold: that is not a highly available server. It's a single node, and there's a window during replacement when it isn't serving. The availability lives in the state tier — the database cluster and the shared storage — while the compute is deliberately cheap to throw away. For an internal build platform that's the right trade, and it's worth being precise about which property you actually bought.

> Highly available and disposable are different goals. Disposable is usually the one that makes upgrades boring, and boring upgrades are how you stop drifting.

## Credentials that expire, scoped by environment

The legacy setup's worst habit was credentials living in pipeline configuration. Two changes fixed the shape of it.

**Credentials are issued, not stored.** A pipeline declares that it needs cloud access and receives a short-lived, scoped credential at build time. Nothing durable sits in the pipeline definition, so nothing leaks out of it in a screenshot or a config export.

**The agent pool is the boundary.** Each environment has its own agent pool, and the pool a pipeline requests determines which environment's credentials it can obtain at all. A pipeline that asks for a test agent cannot get production credentials, because the association is structural rather than a naming convention someone has to respect. Environment isolation you can enforce beats environment isolation you have to remember — and it fails closed, which convention never does.

The direction to keep heading is federated identity, where the CI system proves who it is to the cloud provider and no long-lived key exists anywhere in the chain. Any credential with no expiry is a credential you will eventually find in a place you didn't put it.

## What's still unfinished

One honest edge, and it's the one with our name on it.

**Image builds aren't self-service yet.** Agent images are built centrally, so a team wanting a new toolchain files a request and waits for us. The scanning and deletion policy above is exactly the sort of guardrail that makes handing that over safe — teams build their own images against a policy rather than asking permission, which is the pattern that already works for [pipelines and repositories](/engineering/self-service-with-guardrails/). The guardrail exists. The self-service hasn't been built on top of it yet.

## What I'd keep

If I were doing this again on a different platform, four things would come along unchanged: **two agent tiers with a hard rule about which is which**, **scaling on queue depth rather than a proxy metric**, **the platform's own deployment living outside the platform**, and **something scheduled that keeps the base image current whether or not anyone is paying attention.**

None of that is specific to a product. All of it is what the legacy setup was missing — which is why replacing the product would have solved nothing.
