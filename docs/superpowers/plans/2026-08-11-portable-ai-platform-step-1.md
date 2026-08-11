# Portable AI Platform — Step 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish post 2 of the series — *Connecting Cloud and On-Premises* — plus the series plumbing it needs, so voice, depth, diagram density and the de-duplication discipline can all be judged on one finished post before posts 1, 3 and 4 are written.

**Why post 2 first, not post 1.** Post 2 is the only post in the series that loses nothing to de-duplication, so it is the cleanest test of whether the source material survives the rewrite. The spec also recommends writing post 1 **last**, because its final scope depends on what posts 2–4 actually needed — writing it first would mean guessing. Post 2 is additionally the strongest post in the series, so if the series is ever cut short, this is the one that should exist.

**Architecture:** The `guides` section, its collection, its cover tint, its routing, RSS and OG generation all already exist — unlike the AI Foundations case, this series needs **no new section plumbing**. The only structural change is one `SERIES` entry in `src/consts.ts`. Content then lands as ordinary Markdown.

But Task 1 first fixes a real bug found while planning: series navigation does not tolerate a partially written series. This blocks incremental publishing for this series *and* for AI Foundations.

**Tech Stack:** Astro 5 content collections, TypeScript, `node --test` with native type stripping, Pagefind, Mermaid. No reader-facing code in this post — it is an architecture post, and its code blocks are YAML/HCL/shell configuration, not runnable programs.

**Scope note:** This plan covers **post 2 and its plumbing only**. The spec (`docs/superpowers/specs/2026-08-11-portable-ai-platform-series-design.md`) is still marked draft pending Riddam's review, and three of its four open questions are unanswered. None of them block this plan — see "Decisions needed before starting" — but posts 1, 3 and 4 get their own plan written after this post is reviewed.

---

## Decisions needed before starting

**1. ~~Series title~~ — resolved 2026-08-11.** `Running AI beyond one cloud`, confirmed by Riddam. Use it verbatim; it appears in the series nav box on every post in the series and is asserted by the test in Task 1 Step 1.

**2. ~~Post 2's slug~~ — resolved 2026-08-11.** `connecting-cloud-and-on-premises`, confirmed. The title changed after this plan was first written (see below) but the slug did not, so nothing about the plumbing moves.

Open questions 2 (three posts or four) and 3 (post 3's domain specificity) do not affect this plan at all — both concern posts 1 and 3.

---

## Global Constraints

Every task's requirements implicitly include this section.

- **No emoji anywhere.** Site policy is none; decorative emoji were deliberately stripped in an earlier pass, so adding them is a regression.
- **No new npm dependencies.** Standing repo rule. This is also why `npx astro check` cannot be run — it wants `@astrojs/check` + `typescript`.
- **No new cover SVGs and no raster images.** Every visual is a ` ```mermaid ` fence. Post 2 uses `cover: network`, a second use of an existing motif.
- **Build with `npm run build`, never bare `astro build`.** The bare command skips Pagefind and breaks `/search` in production.
- **Numbered H2s in the form `## 01 — Topic`** (two digits, space, em dash, space), matching the other guides. `## 05 — RAG Architectures` renders `id="05--rag-architectures"`.
- **Post body starts at `##`.** No H1 — the title renders from frontmatter.
- **Diagram captions in the form `**Fig 02.1 — Title**`** on the line before the fence, matching `ai-architecture-master-guide`.
- **The de-duplication contract in the spec is binding.** Post 2's two exposures are named in Task 2 Step 1. Do not restate published material; link the verified anchor instead.
- **Every external link must resolve.** All URLs this plan hands you were verified 2026-08-11 and are pasted below — use them verbatim. **Do not add a URL from memory.** If you want a source this plan does not provide, verify it with `curl -sS -o /dev/null -w '%{http_code}' -L <url>` first, and drop it if it does not return 200.
- **Nothing invented.** No figure ships that is not either derived and shown, or attributed to a source you have linked. The spec's numbers table governs; the two entries that affect post 2 are resolved in Task 2 Step 5.
- **Anonymization by writing generically, never by disclaimer.** Source A is already generic, so post 2 needs no rewrite pass — but do not introduce specificity that isn't in the source, and do not add any note about sanitization.
- **No push to `origin`.** There are 3 unpushed commits already. Publishing stays Riddam's separate, explicit decision.

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `src/consts.test.ts` | **Create.** Pins that every `SERIES` slug resolves to a real content file, and that partial series are handled. The guard that makes incremental series publishing safe. | 1 |
| `src/pages/[section]/[...slug].astro` | **Modify.** Filter series slugs to those that resolve before building nav (the `series` block, lines 64–82). | 1 |
| `src/consts.ts` | **Modify.** One `SERIES` entry, appended after `'Building and running AI systems'` (closes line 56). | 1 |
| `src/content/guides/connecting-cloud-and-on-premises.md` | **Create.** Post 2 — the series flagship and the calibration gate for posts 1, 3 and 4. | 2 |
| `src/content/guides/ai-architecture-master-guide.md` | **Modify.** One pointer line in §15. | 3 |
| `src/content/guides/mlops-production-guide.md` | **Modify.** One pointer line in §05. | 3 |
| `src/content/engineering/multi-cloud-terraform-vs-pulumi.md` | **Modify.** One pointer line. | 3 |

---

### Task 1: Make partial series safe, then register the series

**The bug, verified 2026-08-11.** `src/pages/[section]/[...slug].astro:73` builds series nav by mapping over **every** slug in the `SERIES` entry with no existence check, falling back to the raw slug for the title:

```ts
items: seriesDef.slugs.map((slug, i) => ({
  order: i + 1,
  href: `/${seriesDef.sectionId}/${slug}/`,
  title: all.find((p) => p.sectionId === seriesDef.sectionId && p.id === slug)?.title ?? slug,
  current: slug === entry.id,
})),
```

`src/layouts/Post.astro:170-178` then renders each as an `<a href>`. So a four-slug entry with one published post ships **three links to 404s, titled with raw kebab-case slugs**, and a "Part 1 of 4" eyebrow claiming posts that do not exist.

All three existing series are complete, which is why nobody has hit this. It matters now because this series publishes incrementally.

**It also means the AI Foundations plan is wrong on this point.** `docs/superpowers/plans/2026-08-11-ai-foundations-step-1.md` Task 1 Step 4 states that the nav "skips misses, so a partially written series renders only the posts that exist". It does not. That plan intends to land an eight-slug entry with two posts published, which would ship six broken links. Fixing it here fixes it there too — **note this in the commit message so the other plan's claim gets corrected when someone reads it.**

**Files:**
- Create: `src/consts.test.ts`
- Modify: `src/pages/[section]/[...slug].astro` (the `series` block, lines 64–82)
- Modify: `src/consts.ts` (append to `SERIES`, after line 56)

**Interfaces:**
- Consumes: nothing.
- Produces: a `SERIES` entry whose `slugs[1]` is `'connecting-cloud-and-on-premises'`, which Task 2's filename must match exactly; and a series nav that renders only published posts.

- [ ] **Step 1: Write the failing test**

Create `src/consts.test.ts`. Note it reads `src/content/guides/` from disk rather than importing the collection — `astro:content` cannot resolve under `node --test`.

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { SECTIONS, SERIES } from './consts.ts';

const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

const publishedSlugs = (sectionId: string): Set<string> => {
  const dir = new URL(`./content/${sectionId}/`, import.meta.url);
  const out = new Set<string>();
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md') || f.startsWith('_')) continue;
    if (/^draft:\s*true/m.test(readFileSync(new URL(f, dir), 'utf8'))) continue;
    out.add(f.replace(/\.md$/, ''));
  }
  return out;
};

test('every series points at a real section', () => {
  const ids = new Set(SECTIONS.map((s) => s.id));
  for (const series of SERIES) {
    assert.ok(ids.has(series.sectionId), `series "${series.title}" has unknown section`);
  }
});

test('series slugs are unique within a series', () => {
  for (const series of SERIES) {
    assert.equal(
      new Set(series.slugs).size,
      series.slugs.length,
      `series "${series.title}" repeats a slug`
    );
  }
});

test('every series has at least one published post', () => {
  for (const series of SERIES) {
    const published = publishedSlugs(series.sectionId);
    const live = series.slugs.filter((s) => published.has(s));
    assert.ok(live.length > 0, `series "${series.title}" has no published posts`);
  }
});

test('series nav filters slugs that have no published post', () => {
  // A SERIES entry may list slugs ahead of their posts, so the nav builder must
  // filter rather than map -- otherwise it renders links to 404s. See
  // [section]/[...slug].astro.
  const page = read('./pages/[section]/[...slug].astro');
  assert.match(
    page,
    /slugs\s*\n?\s*\.filter\(/,
    'series nav must .filter() slugs before building items'
  );
});

test('the portable AI platform series is registered', () => {
  const series = SERIES.find((s) => s.title === 'Running AI beyond one cloud');
  assert.ok(series, 'portable AI platform series missing');
  assert.equal(series.sectionId, 'guides');
  assert.equal(series.slugs.length, 4, 'the series is four posts');
  assert.equal(series.slugs[1], 'connecting-cloud-and-on-premises', 'post 2 is second');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`

Expected: the first three tests **pass** (they describe the three existing complete series correctly — a real invariant, not scaffolding). `series nav filters slugs...` and `the portable AI platform series is registered` both **fail**.

Note `npm test` currently matches `src/**/*.test.ts` and there are no test files at all, so this is the repo's first test. Confirm the runner picks the file up — if it reports zero tests, the glob did not match and that is the problem to fix, not the assertions.

- [ ] **Step 3: Fix the series nav builder**

`src/pages/[section]/[...slug].astro` — replace the `series` block (currently lines 64–82). The change: resolve each slug to a published post **first**, drop the misses, then derive `current` and `total` from what survived.

```ts
// If this post belongs to a curated series, build ordered navigation for it.
// Slugs may be listed ahead of their posts, so filter to what actually exists --
// otherwise the nav renders links to 404s titled with the raw slug.
const seriesDef = SERIES.find(
  (s) => s.sectionId === section.id && s.slugs.includes(entry.id)
);
const seriesLive = seriesDef
  ? seriesDef.slugs
      .filter((slug) =>
        all.some((p) => p.sectionId === seriesDef.sectionId && p.id === slug)
      )
      .map((slug) => ({
        slug,
        title: all.find(
          (p) => p.sectionId === seriesDef.sectionId && p.id === slug
        )!.title,
      }))
  : [];
const series = seriesDef
  ? {
      title: seriesDef.title,
      current: seriesLive.findIndex((s) => s.slug === entry.id) + 1,
      total: seriesLive.length,
      items: seriesLive.map((s, i) => ({
        order: i + 1,
        href: `/${seriesDef.sectionId}/${s.slug}/`,
        title: s.title,
        current: s.slug === entry.id,
      })),
    }
  : undefined;
```

Behaviour for the three existing complete series is unchanged: every slug resolves, so the filter removes nothing and `current`/`total` are identical to before. Verify that in Step 6 rather than assuming it.

`Post.astro` needs no change — it already renders whatever `items` contains.

- [ ] **Step 4: Add the `SERIES` entry**

`src/consts.ts` — append as a new array element after the `'Building and running AI systems'` entry, which closes at line 56. Keep the existing comment style.

```ts
  {
    // Where AI runs, as opposed to what it does. The existing AI arc assumes a
    // managed cloud underneath; this one removes that assumption. Post 2 is the
    // centre of gravity -- hybrid and on-prem appear nowhere else on the site.
    // Post 1 is written last: de-duplication against the three AI guides sets
    // its scope, so it can only be sized once 2-4 exist.
    title: 'Running AI beyond one cloud',
    sectionId: 'guides',
    slugs: [
      'portable-ai-platform-contract',
      'connecting-cloud-and-on-premises',
      'document-extraction-at-scale',
      'extraction-data-modelling-with-provenance',
    ],
  },
```

Three of these four files do not exist yet. That is now safe, because of Step 3.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`

Expected: all five tests pass. `the portable AI platform series is registered` passes on the `consts.ts` entry; `every series has at least one published post` still passes because post 2 lands in Task 2 — **if it fails here, that is expected and correct**, and it turns green at the end of Task 2. If you are running tasks strictly in order, note that this one test is legitimately red between Task 1 Step 4 and Task 2, and say so rather than weakening the assertion.

- [ ] **Step 6: Confirm the existing series are unaffected**

Run: `npm run build`, then check one post from each existing complete series still shows its full nav:

```bash
grep -o 'Part [0-9] of [0-9]' dist/engineering/config-as-data-for-infrastructure-repos/index.html   # expect Part 1 of 4
grep -o 'Part [0-9] of [0-9]' dist/engineering/self-service-with-guardrails/index.html             # expect Part 2 of 2
grep -o 'Part [0-9] of [0-9]' dist/guides/ai-architecture-master-guide/index.html                  # expect Part 1 of 3
grep -c 'series-item' dist/guides/mlops-production-guide/index.html                                # expect 3
```

Any change here is a regression in Step 3 — the filter should be a no-op for complete series.

- [ ] **Step 7: Commit**

```bash
git add src/consts.test.ts src/consts.ts "src/pages/[section]/[...slug].astro"
git commit -m "Let a series be published incrementally

Series nav mapped over every slug in the SERIES entry and fell back to
the raw slug for a missing post's title, so a partially written series
shipped links to 404s and a 'Part 1 of 4' claiming posts that do not
exist. All three existing series are complete, which is why this never
surfaced. Filter to published posts and derive current/total from what
survives.

Also corrects the AI Foundations step-1 plan, which states the nav skips
misses -- it does not, and that plan would have shipped six broken links
with its eight-slug entry.

Adds the repo's first test file to pin it, plus the four-post entry for
the portable AI platform series."
```

---

### Task 2: Post 2 — Connecting Cloud and On-Premises

The series flagship, ~2,400 words. Source: `_originals/portable-ai-platform-guide.md` §7 and §8. Read those two sections in full before writing.

**The argument the post has to land:** hybrid AI platforms fail at the network boundary, not the model layer. Everything above the boundary is the easy part.

**Files:**
- Create: `src/content/guides/connecting-cloud-and-on-premises.md`

**Interfaces:**
- Consumes: `SERIES.slugs[1]` from Task 1 — the filename must match exactly or the post silently drops out of series nav.
- Produces: `/guides/connecting-cloud-and-on-premises/`, which Task 3's three pointer lines link to.

- [ ] **Step 1: Read the de-duplication contract and note post 2's two exposures**

Post 2 is the lowest-overlap post in the series, but it is not zero. Two collisions, both verified against `dist/` on 2026-08-11:

| Exposure | Already published | What post 2 may say |
|---|---|---|
| "Train in cloud, serve on-prem" (§7.5) | `/guides/ai-architecture-master-guide/#multi-cloud-ai-patterns` — first bullet is "train on one cloud, infer on another" | Frame explicitly as the hybrid variant of a pattern that guide already introduces, and link it. The new content is that weights are a bounded one-time transfer while data would be continuous — that is *why* it is the highest-value hybrid pattern. Do not re-explain the general idea. |
| Identity, secrets, supply chain (§7.4 and parts of §9) | `/guides/mlops-production-guide/#12--security--governance` — versioning, RBAC, lineage, audit, model cards, supply chain, prompt injection, EU AI Act | Only what is specific to crossing a trust boundary: SPIFFE/SPIRE trust-domain federation, and why cloud IAM cannot express a policy that means the same thing on both sides. Link for everything else. |

- [ ] **Step 2: Write the frontmatter and intro**

```markdown
---
title: "Connecting Cloud and On-Premises Without Firewall Tickets"
description: "Hybrid AI platforms fail at the network boundary, not the model layer — outbound-only architecture, CIDR planning, choosing between Cilium Cluster Mesh, Istio and no mesh at all, and portable identity across the edge."
pubDate: 2026-08-11
tags: ["hybrid-cloud", "kubernetes", "networking", "on-premises"]
cover: network
---

*One or two italic lines, first person, matching the other guides' intros.*
```

The italic intro should say plainly that this is the section of a hybrid project that consumes more time than everything above it combined, and that the constraint driving the whole design — no inbound connectivity — turns out to be a feature.

**The intro now carries that effort claim alone.** An earlier draft title ended "The Part That Actually Takes the Time"; the published title promises an outcome instead, so the "this is where the time goes" argument has no other home. Do not drop it.

- [ ] **Step 3: Write sections 01–05**

Follow the spec's outline. Word counts are guidance, not gates.

`## 01 — Assume No Inbound Connectivity, Ever` (~250 words). The premise, stated as a design rule rather than a complaint: firewall change requests are where hybrid projects die, so design every interaction as outbound-initiated from on-premises. Close on the reframe — this constraint forces an architecture that is also more secure and easier to reason about. Carries **Fig 02.1**.

`## 02 — Pick a Topology First` (~350 words). The four patterns as an escalation ladder: independent islands, egress-only spoke, federated mesh, stretched cluster. Start at 1 or 2; graduate to 3 only against a named use case; never 4. Include the source's observation that most "we need a service mesh across clouds" requirements dissolve under questioning into "we need on-prem to read a cloud bucket". Carries **Fig 02.2**.

`## 03 — CIDR Planning, Or a Rebuild Later` (~250 words). The non-negotiable prerequisite for anything past pattern 1: non-overlapping pod, service and node CIDRs across every site, planned before the first cluster exists. Overlapping RFC1918 between a datacenter and a VPC is the most common hybrid blocker and retrofitting means rebuilding clusters. Link Kubernetes' networking concepts page for the CIDR model.

`## 04 — Getting IP Reachability` (~350 words). The four options in order of increasing commitment — WireGuard mesh, tunnel services, site-to-site IPsec, dedicated interconnect — as a table with setup time, bandwidth and the catch. WireGuard-based overlays are the recommended starting point by a wide margin: outbound-only, NAT-traversing, no firewall tickets.

`## 05 — Cross-Cluster Service Discovery` (~450 words). The section's most useful move is putting "no mesh at all" on equal footing with the three meshes. Cilium Cluster Mesh as the greenfield default (eBPF, global services, no sidecars; requires node-level IP connectivity). Istio multi-cluster if already invested or L7 policy is needed (east-west gateway, shared root CA, `AUTO_PASSTHROUGH` so mTLS routes by SNI without terminating). Submariner when the CNI cannot be standardized, at the cost of more components to keep version-compatible. Then: expose each site's AI gateway through normal ingress with mTLS and let sites call each other's public API — less elegant, dramatically easier to operate, debug and audit, and often correct. Include the `affinity: local` point: inference should stay local and only spill cross-site under pressure, because cross-site token streaming is miserable. Carries **Fig 02.3**.

- [ ] **Step 4: Write sections 06–10**

`## 06 — Identity Across the Boundary` (~300 words). Scoped per Step 1. Cloud IAM stops at the cloud's edge, so authorization policies that reference IP ranges or cloud principals cannot mean the same thing on both sides. SPIFFE/SPIRE with trust-domain federation; every workload gets an X.509 SVID; policies reference workload identity. Human identity federates to one OIDC provider with groups mapped to RBAC identically at every site.

`## 07 — Move the Compute, Not the Data` (~400 words). The strongest hybrid architectures minimize what crosses. Inference at the data; embed and index locally; train in cloud and serve on-premises (scoped per Step 1); read-through caches for weights and images at each site; measure egress in week one. Include the point that vectors are partially invertible, so shipping "only vectors" does not neutralize sensitivity.

`## 08 — The Locked-Down Datacenter Checklist` (~250 words). The five outbound channels — config, images, model weights, telemetry, secrets — each over outbound 443, then the one thing that is impossible: cloud calling in. The inversion is the answer: the datacenter polls, or holds a long-lived outbound stream, which is how every agent-based fleet manager works. This section pairs with Fig 02.1; do not repeat the diagram's content in prose, interpret it.

`## 09 — Air-Gap as a First-Class Path` (~300 words). Mirror images by parsing the rendered chart rather than hand-maintaining a list; bundle chart, weights and checksums; sign the manifest; load to an internal registry on the far side and install with a registry override. The load-bearing advice: test the air-gap path in CI from day one using a runner with no egress, because a bundle only tested at delivery time is a bundle that fails at delivery time. Note that retrofitting air-gap support into a platform that assumed internet access is a rewrite, not a feature.

`## 10 — What Breaks First` (~350 words). **This section is new — it is not in the source.** Symptom, cause, fix, in rough order of likelihood:
1. Overlapping CIDRs discovered after both clusters exist. Symptom: some pods unreachable, or traffic silently landing in the wrong site. Fix: rebuild. Prevention is section 03.
2. MTU mismatch across the tunnel. Symptom: small requests fine, large payloads and model pulls hang — the worst kind of bug because it looks like a storage problem.
3. Trust-domain or certificate misconfiguration. Symptom: fails asymmetrically, so site A reaches B but not the reverse, and the error surfaces far from the cause.
4. A mesh version pinned incompatibly against a Kubernetes upgrade. On-premises clusters upgrade slowly, so you will support N-2 whether you planned to or not.
5. A registry or weight mirror that silently stops syncing. Symptom: nothing, until a scale-up pulls an image that is not there. Fix: alert on mirror age, not just mirror success.

- [ ] **Step 5: Resolve the two borrowed figures**

Post 2 carries exactly two numbers from the source, both in section 04. The spec's numbers table says both are vendor-documented and must be linked or softened. **Use these verified links (all returned 200 on 2026-08-11) rather than stating the figures bare:**

| Figure | Handling | Link |
|---|---|---|
| IPsec "~1.25 Gbps per tunnel" | State as a documented per-tunnel ceiling and link the quota page. Note it is per tunnel, so aggregate throughput means multiple tunnels with ECMP — that is the practical point, not the number. | https://docs.aws.amazon.com/vpn/latest/s2svpn/vpn-limits.html |
| Dedicated interconnect "1–100 Gbps" | Say "from 1 Gbps up to 100 Gbps depending on provider and port type" and link one provider's documentation rather than asserting a universal range. | https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html · https://learn.microsoft.com/en-us/azure/expressroute/expressroute-introduction · https://cloud.google.com/network-connectivity/docs/interconnect |

Everything else in post 2 is architectural claim rather than measurement, which is why this post's verification burden is small. **If you find yourself wanting to add a throughput or latency number that is not in this table, that is a signal to cut it, not to source it.**

- [ ] **Step 6: Add the three diagrams**

Paste from the spec (`docs/superpowers/specs/2026-08-11-portable-ai-platform-series-design.md`, Post 2 section) — they are already designed and are not to be redrawn from scratch. Renumber captions to the `Fig 02.N` convention and place each immediately after the prose that introduces it:

- **Fig 02.1 — Outbound-only, and the one thing that is impossible** → section 01
- **Fig 02.2 — Topology as an escalation ladder** → section 02
- **Fig 02.3 — Choosing a service-connectivity mechanism** → section 05

Arrows inside Mermaid fences are ASCII (`-->`, `-.->`), so they will not trip the emoji grep. ER diagrams are supported per the section templates, but post 2 uses only `flowchart`.

- [ ] **Step 7: Write the closing section**

`## Tools and Further Reading`. A table of only what post 2 actually referenced — not the spec's full inventory. Use these verbatim; all verified 2026-08-11:

| Tool | Link |
|---|---|
| Cilium Cluster Mesh | https://docs.cilium.io/en/stable/network/clustermesh/clustermesh/ |
| Istio multi-cluster | https://istio.io/latest/docs/setup/install/multicluster/ |
| Submariner | https://submariner.io/getting-started/ |
| ingress-nginx | https://kubernetes.github.io/ingress-nginx/ |
| SPIFFE | https://spiffe.io/docs/latest/spiffe-about/overview/ |
| SPIRE | https://spiffe.io/docs/latest/spire-about/ |
| WireGuard | https://www.wireguard.com/ |
| Tailscale | https://tailscale.com/kb/ |
| Headscale | https://github.com/juanfont/headscale |
| NetBird | https://docs.netbird.io/ |
| Argo CD | https://argo-cd.readthedocs.io/en/stable/ |
| External Secrets Operator | https://external-secrets.io/latest/ |
| Harbor | https://goharbor.io/docs/ |
| Zot registry | https://github.com/project-zot/zot |
| Skopeo | https://github.com/containers/skopeo |
| MinIO `mc mirror` | https://min.io/docs/minio/linux/reference/minio-mc/mc-mirror.html |
| Sigstore cosign | https://docs.sigstore.dev/cosign/signing/overview/ |
| Kubernetes cluster networking | https://kubernetes.io/docs/concepts/cluster-administration/networking/ |

Then the site links, using these exact verified anchors:

- [AI Architecture: A Practitioner's Field Guide](/guides/ai-architecture-master-guide/#multi-cloud-ai-patterns) — multi-cloud AI patterns, which this post extends to on-premises.
- [MLOps & AI Production Operations](/guides/mlops-production-guide/#12--security--governance) — the security and governance ground this post does not repeat.
- [Network Connectivity Patterns for Managed Database Platforms](/engineering/network-connectivity-for-managed-database-platforms/) — the same transit-versus-peering reasoning, for databases.

Close with the source's own caveat, in your voice: field names, chart versions and CRD schemas move quickly, so treat manifests as structurally correct patterns and verify against the pinned version.

- [ ] **Step 8: Verify content constraints**

```bash
F=src/content/guides/connecting-cloud-and-on-premises.md
grep -c '^## ' $F                          # expect 11 -- ten numbered plus Tools and Further Reading
grep -n '^## ' $F                          # confirm 01..10 numbering and order
grep -c '^```mermaid' $F                   # expect 3
grep -c '^\*\*Fig 02\.' $F                 # expect 3 -- one caption per diagram
grep -nP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' $F || echo "no emoji — good"
grep -n 'sk-ant\|ANTHROPIC_API_KEY\|OCID\|arn:aws' $F || echo "no secrets or identifiers — good"
wc -w $F                                   # expect roughly 2200-2600
```

Then confirm every external link in the post resolves — this is the check that catches a URL typed from memory:

```bash
grep -oE 'https?://[^)"< ]+' $F | sort -u | while read -r u; do
  printf '%s  %s\n' "$(curl -sS -o /dev/null -w '%{http_code}' -L --max-time 15 "$u")" "$u"
done
```

Expected: every line `200`. Anything else gets fixed or the link gets dropped. Note `milvus.io` returns 403 to non-browser clients — it is not referenced by post 2, and if you add it, link the GitHub repo instead.

- [ ] **Step 9: Build and verify the post renders**

Run: `npm run build`

```bash
P=dist/guides/connecting-cloud-and-on-premises/index.html
ls $P dist/og/guides/connecting-cloud-and-on-premises.png
grep -o 'On this page' $P | head -1
grep -c 'mermaid' $P
grep -o 'Running AI beyond one cloud' $P | head -1
grep -o 'Part [0-9] of [0-9]' $P
grep -c 'series-item' $P
grep -c '<item>' dist/guides/rss.xml
```

Expected: both files exist; `On this page` present (TOC at 11 H2s); mermaid grep non-zero; the series title present, proving Task 1's entry matched this slug; **`Part 1 of 1`** and **one** `series-item`, proving Task 1 Step 3's filter works on a real partial series — this is the payoff check for the whole of Task 1. RSS count rises to 6.

- [ ] **Step 10: Run the tests**

Run: `npm test`

Expected: all five pass, including `every series has at least one published post`, which was legitimately red after Task 1.

- [ ] **Step 11: Check the diagrams render in both themes**

Three Mermaid diagrams is the most of any post on the site, and Fig 02.1 has two subgraphs with a dotted cross-subgraph edge — the construct most likely to render badly or overflow.

Serve the built site and drive Chrome over the DevTools Protocol: Node has a global `WebSocket`, so `Emulation.setDeviceMetricsOverride`, `Emulation.setEmulatedMedia` and `Page.captureScreenshot` need no new dependencies. Headless Chrome defaults to a **dark** `prefers-color-scheme`, so set it explicitly per shot.

```bash
npm run preview   # then drive the running server over CDP
```

Check at 1280px and 375px, in both themes:
- No horizontal scrollbar on `body`. Wide diagrams must scroll inside their own container, not push the page.
- Fig 02.1's subgraph labels are legible and the dotted "not possible" edge is visibly distinct from the solid ones.
- Fig 02.3's decision-node text is not clipped.
- The `network` motif cover is distinguishable from the same motif on `network-connectivity-for-managed-database-platforms`, which shares it. Both are second uses of one motif and there is no new tint to separate them — **if they are hard to tell apart in listings, report it as a finding for Riddam rather than adding a motif**, since the no-new-SVGs rule is deliberate.

- [ ] **Step 12: Commit**

```bash
git add src/content/guides/connecting-cloud-and-on-premises.md
git commit -m "Playbooks: connecting cloud and on-premises

The series flagship, and the only post in it that loses nothing to
de-duplication -- hybrid and on-prem appear nowhere else on the site.
Outbound-only as a design rule, topology as an escalation ladder, CIDR
planning as the thing that forces a rebuild, and 'no mesh at all' given
equal footing with the three meshes, because it is often the right call.

The two bandwidth figures are linked to vendor documentation rather than
asserted, and 'what breaks first' is new -- the source had no failure
content for this material."
```

---

### Task 3: Cross-links, then full-site verification

Three one-line edits so the new series is reachable from published content, then the spec's verification list.

**Files:**
- Modify: `src/content/guides/ai-architecture-master-guide.md` (§15, `### Multi-cloud AI patterns`)
- Modify: `src/content/guides/mlops-production-guide.md` (§05, `## 05 — Cloud Infrastructure Selection`)
- Modify: `src/content/engineering/multi-cloud-terraform-vs-pulumi.md`

**Interfaces:**
- Consumes: `/guides/connecting-cloud-and-on-premises/` from Task 2.
- Produces: nothing downstream. Last task of Step 1.

- [ ] **Step 1: Add the three pointer lines**

One italic line each, in the site's existing cross-link voice. **Do not restructure anything else in these files.**

In `ai-architecture-master-guide.md`, at the end of `### Multi-cloud AI patterns` — this is the closest published material to the new series' thesis:

```markdown
*The on-premises and hybrid case gets its own treatment in [Connecting Cloud and On-Premises](/guides/connecting-cloud-and-on-premises/), including what happens when a site accepts no inbound connections at all.*
```

In `mlops-production-guide.md`, at the end of `## 05 — Cloud Infrastructure Selection`:

```markdown
*This section assumes a managed cloud underneath. For the hybrid and on-premises case — outbound-only delivery, cross-cluster connectivity, air-gapped installs — see [Connecting Cloud and On-Premises](/guides/connecting-cloud-and-on-premises/).*
```

In `multi-cloud-terraform-vs-pulumi.md`, wherever the multi-cloud strategy argument closes:

```markdown
*For what this looks like when the workload is AI and one of the sites is your own datacenter, see [Connecting Cloud and On-Premises](/guides/connecting-cloud-and-on-premises/).*
```

- [ ] **Step 2: Run the tests and build**

```bash
npm test          # expect 5 passing
npm run build     # expect exit 0, Pagefind summary at the end
ls dist/pagefind/pagefind.js
```

- [ ] **Step 3: Verify the post end to end**

```bash
# The three pointer lines survived into HTML
for f in dist/guides/ai-architecture-master-guide/index.html \
         dist/guides/mlops-production-guide/index.html \
         dist/engineering/multi-cloud-terraform-vs-pulumi/index.html; do
  grep -c 'connecting-cloud-and-on-premises' "$f" | sed "s|^|$f -> |"
done

# Section surfaces
grep -c 'connecting-cloud-and-on-premises' dist/guides/index.html dist/archive/index.html
grep -o 'hybrid-cloud' dist/tags/index.html | head -1
ls dist/tags/hybrid-cloud/index.html dist/tags/on-premises/index.html

# Search index picked the post up
grep -rl 'Connecting Cloud' dist/pagefind/ | head -3
```

Expected: at least 1 in each of the three source files; hits on the section index and archive; the two new tag pages exist; and Pagefind has indexed the post.

- [ ] **Step 4: Confirm the de-duplication anchors still resolve**

A heading edit in an existing guide would silently break the post's outbound links. Re-check the three the post uses:

```bash
grep -o 'id="multi-cloud-ai-patterns"' dist/guides/ai-architecture-master-guide/index.html
grep -o 'id="12--security--governance"' dist/guides/mlops-production-guide/index.html
ls dist/engineering/network-connectivity-for-managed-database-platforms/index.html
```

Expected: all three found.

- [ ] **Step 5: Grep the new content for emoji and leaked identifiers**

```bash
grep -rnP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2190}-\x{21FF}\x{2B00}-\x{2BFF}]' \
  src/content/guides/connecting-cloud-and-on-premises.md || echo "no emoji — good"
grep -rn 'sk-ant\|ANTHROPIC_API_KEY=\|arn:aws\|ocid1\.' src/content/guides/ || echo "no identifiers — good"
```

- [ ] **Step 6: Commit**

```bash
git add src/content/guides/ai-architecture-master-guide.md \
        src/content/guides/mlops-production-guide.md \
        src/content/engineering/multi-cloud-terraform-vs-pulumi.md
git commit -m "Point the cloud-native guides at the hybrid post

Three italic lines. All three posts stop where a managed cloud stops;
this names where the rest of the story is instead of duplicating it."
```

- [ ] **Step 7: Confirm nothing was pushed**

```bash
git log --oneline origin/main..main
git status --short
```

Expected: the 3 pre-existing commits plus this plan's 3, all local; clean tree. **Do not push.**

---

## Review gate

Stop here and report to Riddam. Posts 1, 3 and 4 are deliberately not in this plan — post 2 is the calibration gate, and the things worth judging on it are:

- **Depth and register.** Does it read as a Playbook alongside the existing guides, or has the source's density survived in a way that reads as a dump?
- **Diagram density.** Three is the most of any post on the site. Too many, or right?
- **The "what breaks first" section.** New to this material. If it works, it goes in all four posts; if it reads as filler, cut it from the remaining three.
- **De-duplication in practice.** Does linking instead of restating leave gaps a reader falls into, or does it read as confident?
- **Word count.** ~2,400 would make it the **shortest post in the Playbooks section** — the current shortest guide is 3,660 words and the longest is 7,705. That is intentional, since de-duplication is what keeps it short, but it is the clearest signal of whether the approach reads as tight or as thin. If thin, posts 1, 3 and 4 need re-sizing before they are written.

## What the next plan covers

- **Post 3** (`document-extraction-at-scale`) and **post 4** (`extraction-data-modelling-with-provenance`), from `_originals/doc-extraction-platform-gcp-azure-onprem.md`. Post 3 needs the anonymization rewrite pass in the spec's table — source B is written in second person to a specific team and must not ship that way. Post 4 needs none; it is already generic.
- **Post 1** (`portable-ai-platform-contract`) **last**, per the spec, so its scope is set by what 2–4 actually needed rather than guessed. It is also the post that may not survive its own de-duplication — the fallback is shipping three.
- **Post 3's open question is unresolved:** whether document extraction plus GCP plus Azure plus on-premises reads as too close to real work. Spec, "Anonymization", final paragraph. Get Riddam's answer before writing it.
- **The spec's numbers table has ten unresolved entries left** after post 2 takes two. Most belong to post 3 — the OCR cost and accuracy figures — and several need a source hunt or a directional rewrite. Budget for that; it is the largest single piece of work remaining in the series.
- **Post 1 carries the six additions** that are not in either source: the portability tax, gateway-before-Kubernetes, multi-tenancy, the honest DR claim, and its own "what breaks first". Those are the sections with no source text to lean on, so they are the slowest to write.
