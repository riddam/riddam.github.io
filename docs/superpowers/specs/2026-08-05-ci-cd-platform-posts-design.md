# Design — two engineering posts on the CI/CD platform rebuild

**Date:** 2026-08-05
**Status:** split agreed; post A specified and being written, post B outlined pending material

## Why two posts

Section 1 of `leadership/leading-without-authority.md` carried two stories doing
different jobs: the platform *evaluation* that produced the mandate (which is the
leadership point) and the *rebuild* that followed (which is engineering content sitting
in front of the wrong audience). The rebuild moves out.

Reading the two source repositories showed the rebuild is itself two stories:

- **Post A — infrastructure.** How a self-hosted CI platform is hosted: agent tiers,
  queue-driven scaling, breaking the bootstrap dependency, preventing base-image drift,
  and making the server disposable.
- **Post B — automation and guardrails.** Pipeline synchronisation between repositories
  and the server, compliance and stale detection, PR validation, release management,
  repository scaffolding, audit logging.

One post covering both would flatten the drift-prevention thread, which is the most
interesting idea in either repository.

## Anonymisation (applies to both posts)

The source repositories contain live AWS account IDs, internal hostnames, IAM role and
S3 bucket names, a monitoring vendor's secret ARN, internal Confluence and Slack links,
and Google Sheets URLs. **None of it appears.** Per the standing rule, this is achieved by
writing generically, with no disclaimer or meta-commentary.

Specifically: the CI product is never named (it is "the CI server" / "the platform"), the
monitoring vendor is never named, the internal account and environment topology is
described only as ordinary DTAP-style environments, and no identifiers, hostnames, role
names, bucket names, or sizing that ties to a specific estate are reproduced. Named
third-party technologies that are subject matter rather than stack reveals — AWS, CDK,
GitHub Actions, Aurora/MySQL, EFS, Fargate, spot fleets — are fine, and have precedent
across nine existing posts.

## Post A — "Rebuilding CI/CD Without Changing Platforms"

Slug `rebuilding-ci-cd-without-changing-platforms`, in `engineering/`. Plain `##` headers,
no emoji and no numbering — the site convention for technical posts, unlike the
leadership pieces. Target ~1,800 words. New cover motif `bootstrap`.

Frontmatter tags: `["cicd", "platform-engineering", "infrastructure-as-code", "aws-cdk"]`
— all four already exist in the engineering vocabulary, so the post wires into the
existing tag graph rather than starting a new cluster.

### Sections

1. **The premise.** Migrating platforms does not fix a legacy setup; it relocates it and
   adds a migration bill. Links back to the leadership post.
2. **Two agent tiers, and why.** VM agents exist for Docker-in-Docker work, which needs
   privileges a managed container platform will not grant. Everything else runs as
   containers. Framework-specific images (Python, TypeScript, .NET) rather than one fat
   image carrying every toolchain. The VM fleet is heterogeneous — general-purpose x86,
   ARM, compute-optimised, and Mac metal for mobile builds.
3. **Scale on the queue, not on CPU.** Build queue depth is the actual demand signal;
   CPU is a lagging proxy. Agents provision on queue events and scale back after an idle
   timeout, so idle cost approaches zero.
4. **Don't let the CI system deploy itself.** The strongest section. The platform's own
   infrastructure is defined as code and deployed from a *different* system: pull request
   opens → plan/diff per environment as the review artifact; merge → apply, environments
   sequentially so they cannot race. The test is whether you could rebuild the platform
   from nothing if it were gone.
5. **The base image will drift unless something stops it.** A golden image published to a
   parameter store, and a scheduled reconciler that rewrites the agent fleet
   configuration to the current image and its snapshot, staggered across environments so
   a bad image is caught in test before production. **Connects explicitly to the AL2
   → AL2023 story in the leadership post**: that migration hurt precisely because the
   base had been allowed to drift for years, and this is the mechanism that stops it
   recurring.
6. **Make the server disposable.** State off the box — managed database cluster and
   shared encrypted storage, plus object-storage backups — so an upgrade is an instance
   replacement rather than in-place surgery. Rolling replacement one node at a time,
   gated on a success signal so a failed boot blocks the rollout instead of taking the
   platform down. Be accurate that this is not a highly available server: it is a
   disposable one, and the availability lives in the state tier.
7. **Credentials that expire, scoped per environment.** The agent pool a pipeline
   requests determines which environment's credentials it can obtain, so environment
   isolation is enforced at the agent layer rather than by convention. Federated
   short-lived identity is named as the direction of travel, in general terms only —
   no statement about any current gap.
8. **What's still unfinished.** Self-service image builds, and spot interruption
   handling. Honest close; do not invent resolutions.

### Known gaps in post A

Riddam has not yet supplied: spot *interruption* behaviour mid-build, any scale numbers
(teams, pipelines, build volume, before/after timings, cost delta), and the base-image or
scanning policy for team-supplied images. Section 8 covers the first and third honestly
as open edges. **No fabricated numbers** — the post ships without them rather than
guessing, and they can be added later.

## Post B — "Guardrails That Scale" (working title, outline only)

Material exists in the automation repository but has only been skimmed. Needs a proper
read before specifying: pipeline synchronisation (reconciling repository-declared
pipelines against server state, create vs. update), compliance and stale detection, PR
and repository validation, release management, cookiecutter-based scaffolding, Slack and
GitHub integration, audit logging. The through-line is likely self-service with
guardrails — teams own their pipelines, the platform owns the invariants — which pairs
with section 8 of the leadership post.

## Leadership post changes

Section 1's six-bullet rebuild list compresses to one short paragraph plus a forward
link to post A. The "what that bought" outcomes paragraph and the "keep the tool, fix the
setup" pull-quote both stay — they carry the leadership point. `updatedDate` gets set.

## Verification

`npm run build` (never a bare `astro build`), then confirm: the post renders, the new
motif draws inside the x 350–845 thumbnail-safe window (see the cover-motif crop note),
the ToC appears, every internal link resolves, Pagefind indexes the post, and a
fingerprint grep for the CI product, the monitoring vendor, the employer name, account
IDs, and internal hostnames returns zero.
