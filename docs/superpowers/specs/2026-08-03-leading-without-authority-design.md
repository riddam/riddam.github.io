# Design — "Leading Without Authority" (leadership post)

**Date:** 2026-08-03
**Status:** approved in conversation, pending spec review

## Why this post

The `leadership` section holds exactly one published post,
`core-principles-every-corporate-leader-should-know.md`. It argues that leadership is
influence rather than authority, then illustrates the claim with a CEO, a founder, and
a man who could fire anyone in the building. The argument is sound; the evidence
undercuts it.

Everything else leadership-adjacent on the site sits in `book-notes/` — Lencioni, Voss,
Covey, Erikson, Burnison. Those are other people's frameworks. So the leadership
section currently contains no writing drawn from the author's own practice, while the
`engineering` section is entirely first-person and specific.

This post closes that gap. The staff-engineer seat is where "influence, not authority"
stops being a slogan: you are promoted for org-wide impact and given nobody to direct.
The post is the practice to the existing post's principle, and the two link to each
other.

## Frontmatter

```yaml
title: "Leading Without Authority: Lessons from the Staff Engineer's Chair"
description: "What it takes to lead engineers when you have no reports — earning a mandate, writing ADRs that land, building a bench of complementary working styles, spending your vetoes, and encoding influence into defaults."
pubDate: 2026-08-03
tags: ["leadership", "staff-engineer", "influence", "communication"]
cover: lever
```

`communication` is deliberate: it already appears on the Voss and Erikson book notes, so
the tag graph wires this post into the book-notes cluster without any manual linking.
`leadership` connects it to the sister post and the Lencioni and Burnison notes.
`staff-engineer` and `influence` are new to the vocabulary.

Target length ~1,900 words — longer than the 900-word principles post, in line with the
engineering pieces. Nine sections at 1,500 words would average under 170 words each,
which is too thin to carry an anchor story per section. Original writing, so **no** Medium
provenance footer.

## Structure

Opening pull-quote as a `>` blockquote, then nine emoji-prefixed numbered `##`
sections, closing with "Final thoughts" and the LinkedIn call to action. Body starts at
`##` — no H1. The site renders its automatic table of contents at three or more H2s
(`src/layouts/Post.astro:74`), so nine easily qualifies.

Nine sections rather than seven mirroring the sister post. Sections 7 and 9 are the two
most useful and neither survives being folded into the other; sections 5 and 6 are both
about people but answer different questions (who is on the team vs. who gets a given
piece of work).

### 1. 🧭 Authority is a shortcut you no longer have

A manager can spend authority; an individual contributor has to earn a mandate per
decision. What replaces it: track record, reciprocity, and doing the work that makes the
answer undeniable.

**Anchor story — CI/CD platform choice.** An organisation running a self-hosted CI
server evaluates moving to hosted CI. GitHub Actions and GitLab CI are both named as the
evaluated challengers; the incumbent stays unnamed. Findings, as of a 2021 evaluation:
Actions was expensive under per-minute billing at scale and its security and
dependency-scanning features were still immature; GitLab CI offered a broad feature set
but the pieces that mattered were incomplete under proof-of-concept. Weighed against
migration effort, billing, the security posture that required on-premises hosting, and
bundling with products the business already licensed, the answer was to stay put.

The lesson is the mandate: the author ran the calculations, and the recommendation
carried because the costing, the POC, and the migration estimate existed — not because
anyone preferred an outcome. Write it in those terms; "I did the numbers that decided it"
is the claim, and it is a different and stronger claim than having had an opinion in the
room. And the verdict was "don't migrate," which is the recommendation nobody makes to
look impressive.

### 2. 🔍 Do the reading nobody else did

The cheapest durable influence is being the only person in the room who actually read
the incident timeline, the contract, or the code.

**Anchor:** the author's own arc through development, then testing, then DevOps
operations. Three vantage points on the same failure. Breadth is what lets you name the
blocker that will show up two quarters out, and naming it early — correctly — is what
buys you the room's attention later.

### 3. 📝 Write it down so it travels without you

The design document is the individual contributor's real instrument of power: it works
in rooms you are not in.

**Anchor:** always write the ADR. Where a decision spans domains, put every viable
solution path in front of the relevant domain owners with the impact of each spelled
out, present it properly, and take the vote.

Why ADRs die: the decision is buried instead of stated up front, the alternatives are
strawmanned, and the cost is left out. An ADR that argues one side honestly beats one
that pretends there was never a trade-off.

### 4. 🤝 Go and collect the perspectives you don't have

A proposal should never be a surprise in review, and the review is not where you should
first hear the objection.

**Framing — behavioural axes only.** People differ along lines you can actually observe:
some want to try it out on Monday, others need a plan from stage 1 to stage n; some
optimise for speed, others for detail; some have been burned by this exact class of
change and some have not. Go find the ones unlike you on purpose, because the objection
you cannot generate yourself is the one that kills the project later.

Explicitly **not** framed on gender or age. That framing is a protected-characteristic
generalisation in a public post on a topic adjacent to hiring and promotion, and it is
also the weaker version of the insight — the behavioural axes predict better and tell a
reader what to actually do.

Links to the *Never Split the Difference* notes on tactical empathy.

### 5. 🧩 Build the bench, not just the headcount

Distinct from section 4: that section is about whose objections you seek at decision
time, this one is about who is on the team at all. It matters most when you are losing
people and backfilling, because that is the moment you can either rebuild the shape you
had or rebuild the shape you need.

The argument: a team of one archetype fails predictably, so recruit for complementary
working styles.

- **People who will just try it.** High risk appetite, fast to move. They are who you
  want running a proof of concept, and who you want in an outage, where a decided-now
  answer beats a perfect one.
- **People who want to plan before they act.** They are who turns a proof of concept into
  a product without gaps in the flow or half-finished paths — which matters most in
  customer-facing systems, where an incomplete implementation is visible to the customer.
- **Translators.** People who convert high-level to low-level design, or business
  requirements into technical ones. This is a distinct and scarce skill, not a junior
  version of design.
- **Steady executors**, who reliably deliver a well-defined scope without relitigating
  it, and **explorers**, who go and find what nobody asked them to look for.

State plainly that the steady-executor archetype is not a lower rung. Predictable
throughput is a strength, and a team of nothing but explorers ships nothing. Keep the
whole section on working-style axes, consistent with section 4 — no demographics.

The leadership content: you rarely get to pick your team, but you almost always get
input on the next hire, and that input is one of the highest-leverage things an engineer
without authority actually controls.

### 6. 🪜 Take the work that matters, then go find the people who can do it

Take on what is genuinely important — what moves customer satisfaction or the financial
picture — even when it sits outside your expertise. You are not required to know
everything; you are required to close the gap. Sometimes that means recruiting a
domain expert, and sometimes it means a junior who wants to explore and will learn it
faster than you would.

**Anchor — observability and monitoring, no vendor named.** The delegation split is the
substance here, and it was not arbitrary: the *migration* went to domain experts, while
*exploring the platform's feature surface* went to fast-learning juniors so they could
build the expertise. That is the principle worth stating plainly — match the work to the
consequence of getting it wrong. A migration is risky and largely one-way, so it goes to
people who have done one. Feature exploration is low-risk and high-learning, so it is the
best thing you can hand someone who wants to grow, and hoarding it is how seniors
accidentally starve their teams.

Stating that split is what keeps the section from collapsing into "delegate to experts,"
which is the most clichéd advice available. This is also where trust is minted, and it
pairs with giving the credit away.

Links to the *Five Dysfunctions of a Team* notes — trust is the base of the pyramid.

### 7. ⚔️ Pick the hill, then actually die on it

You get a handful of vetoes a year. Senior engineers get tuned out by spending them on
everything.

**Anchor:** an in-memory cache migration. When the upstream licence shifted, the choice
between a newer Redis version and Valkey was worth reviewing properly and worth
committing to. Product names stay — they are the subject matter, not employer stack.

### 8. 🔁 Make the good path the easy path

Influence encoded into defaults, templates, and CI outlives any meeting.

**Anchor, in the author's own framing:** make the standards and guidelines so easy to
use that developers do not notice they are on a track. In an automation framework, the
hard operational setup is absorbed and abstracted away so product teams can stay on
feature work.

Links to `config-as-data-for-infrastructure-repos` and
`path-filtered-ci-cd-for-infra-monorepos`.

### 9. 🧯 When you get overruled anyway

The section most posts skip.

**Anchor:** listen first and genuinely understand the other position. If you still judge
the decision wrong or too risky, document it — the decision, a risk assessment, and
mitigations where you know them; flag the risks where you do not. Then commit honestly.
The point of the written record is not vindication: it is that when the first risk
lands, the team can move to the alternative immediately instead of re-arguing from
scratch. Recurring examples: naming conventions, and whether cloud accounts follow full
DTAP or collapse to prod / non-prod.

## Anonymisation

The standing constraint applies: no employer-stack fingerprints, and **no disclaimers or
meta-commentary about sanitisation** — the generic writing must simply stand on its own.

Applied here:
- The incumbent CI server is never named. GitHub Actions and GitLab CI are named as
  evaluated market options (agreed 2026-08-03).
- No vendor named for the observability work. The platform in question is on the standing
  banned-fingerprint list, and it occupies the same role there as the unnamed CI
  incumbent does in §1 — the thing the organisation runs. Same rule, same treatment.
- Redis and Valkey stay — public industry subject matter, not an internal stack reveal.
- "The organisation" / "a team", never the employer.
- The career arc (development → testing → DevOps) stays: it is a public professional
  fact, not a stack fingerprint.

## Cover art

All 19 existing motifs are used by exactly one post each, so the site follows a
one-motif-per-post convention. This post needs a new motif, `lever`: a fulcrum and beam —
force applied without force, which is the post's whole argument.

Two files change, which is exactly what `src/motifs.ts` documents ("Adding one means
adding an SVG case to Cover.astro and a name here — nowhere else"):
- `src/motifs.ts` — add `lever` to the `COVER_MOTIFS` array. This is the source of truth;
  `src/content.config.ts` imports the enum from here and needs no edit.
- `src/components/Cover.astro` — add the `motif === 'lever'` branch, matching the
  existing minimal-SVG style and using `--cover-accent` so it section-tints like the
  rest.

## Reciprocal link

Add a line to `core-principles-every-corporate-leader-should-know.md` section 1, pointing
from the principle to this post's practice. Section 1 there already argues influence over
authority, so the link belongs in that section rather than the footer. That post carries
a `pubDate` of 2025-04-17; per the site convention, a material revision also sets
`updatedDate`.

## Verification

- `npm run build` (astro build + pagefind — never a bare `astro build`).
- Confirm the post renders at `/leadership/leading-without-authority/`, the new `lever`
  cover draws, the ToC appears, and the reciprocal link resolves.
- Confirm the post appears in Pagefind search against `dist` via `npm run preview`.

## Out of scope

- The two unwritten alternatives from this conversation — a mentoring post and an
  "architecture decisions as leadership" post. Both remain good candidates later.
- Any restructuring of the `leadership` section itself.
