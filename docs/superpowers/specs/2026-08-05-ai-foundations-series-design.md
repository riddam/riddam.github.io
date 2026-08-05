# AI Foundations — an eight-post series from zero to production

**Date:** 2026-08-05
**Status:** approved design, ready for implementation planning

## Problem

The site has three AI guides — `ai-architecture-master-guide`, `model-training-finetuning-eval`,
`mlops-production-guide` — plus the `ai-assisted-coding-playbook`. All four are breadth-first:
catalogues, tool tables, and trade-off matrices. They map the landscape well for someone who
already knows the territory, and they teach a beginner nothing. A junior engineer who reads
`## 05 — RAG Architectures` learns that RAG has variants; they do not learn what an embedding is
or why retrieval fails.

The gap is instructional, not informational. Nothing on the site takes an engineer who can code
but has never touched a model and walks them to competence.

## Goal

Eight posts that take a working junior or medior engineer from "what is a token" to "I can run
this in production", with runnable code in every post. Each post readable standalone; the eight
together form a strictly increasing ladder.

## Non-goals

- No maths derivations. Backpropagation and attention get explained by mechanism and analogy, not
  by equation. A reader who wants the maths gets pointed at a source.
- No framework tutorials. LangChain, LlamaIndex, and similar appear only under "Go deeper".
- No raster images and no new cover SVGs. Every visual is a Mermaid fence.
- No rewriting of the three existing guides. One optional pointer line is the only edit.
- No push to `origin`. The repo has 18 unpushed commits already; publishing stays a separate,
  explicit decision.

## Audience and entry point

A working engineer, comfortable with Python and HTTP APIs, who has never built with a model.
Post 1 starts at tokens. It does not start at linear algebra, and it does not assume prior
ChatGPT-power-user knowledge.

Both juniors and mediors are served by the same post, via a ladder *inside* each post — see
"Post anatomy" below.

## Placement

A fifth content collection, `ai-foundations`, labelled **"AI Foundations"** in the UI, served at
`/ai-foundations/`.

Section description:

> AI from first principles for working engineers — eight posts that start at what a token is and
> end at running a system in production.

Everything on the site derives from `SECTIONS` in `src/consts.ts`: header nav, the homepage
section blocks, `/archive`, `/[section]/` routing, per-section RSS, and OG image generation. One
array entry produces all of it.

### Touch points

| File | Change |
|---|---|
| `src/content.config.ts` | Add `'ai-foundations': makeCollection('ai-foundations')` |
| `src/consts.ts` | Add `'ai-foundations'` to the `Section['id']` union; add the `SECTIONS` entry; add the `SERIES` entry |
| `src/motifs.ts` | Add `'ai-foundations'` to the `SectionId` union (line 35) |
| `src/styles/global.css` | Add three `.cover.tint-ai-foundations` rules alongside the existing four, at lines 77–91 |
| `src/content/ai-foundations/` | New directory: nine Markdown files |

Header nav goes from four items to five. Verify mobile layout after the first build.

### Accent colour

The cover palette is deliberately all-violet and the four existing hues are taken, so the fifth is
necessarily a near-neighbour. Take the cooler, deeper end of the range, distinct from `guides`
indigo-violet (`#5348c9`):

- Light: `#3f4fbf`
- Dark: `#8f9cf0`

### Series registration

A `SERIES` entry so the existing series nav and prev/next render the ladder:

```
title: 'AI from scratch, for working engineers'
sectionId: 'ai-foundations'
slugs: [ the eight post slugs, in order ]
```

The glossary is **not** in `slugs`. It is a reference page, not a rung.

## Post anatomy

Every post uses the same skeleton. Headers are numbered `##`, matching the instructional
precedent set by `ai-assisted-coding-playbook` and the three guides.

```
--- frontmatter: title, description, pubDate, tags, cover ---

italic one-line intro (site convention on guides)

## TL;DR                              five bullets
## Where This Sits                    one line: what post N-1 gave you, what this adds
                                      (post 1: what the series as a whole will give you)
## Prerequisites                      exact installs, measured API cost in cents,
                                      and a link to the glossary
## 01 — The Failure You'll Recognise  the scenario hook
## 02 ... — <topic>                   concept -> runnable code -> what just happened -> what breaks
##  ..  — Medior+: <topic>            the under-the-hood rung, last numbered section
## Try It Yourself                    two or three exercises with stated expected outcomes
## Common Mistakes                    four to six, the ones juniors actually make
## Go Deeper                          links into the three guides + canonical external sources
## Final Thoughts
```

No emoji anywhere. The site auto-generates a table of contents at three or more H2s, so every post
gets one.

### The junior/medior ladder inside each post

Every numbered section before the last one is the junior path: a reader who stops at "Try It
Yourself" can use the technique correctly. The single `Medior+` section is always the final
numbered section — numbered in sequence, so it reads as part of the post rather than as an
appendix. It covers why the naive version breaks at scale, what the
trade-off costs, and what you would argue in a design review. Labelling it explicitly means
nobody feels lost and nobody feels patronised.

### Teaching devices

**One anchor analogy per post**, carried from the opening scene through to "Common Mistakes". A
single sustained analogy teaches; a fresh metaphor each section confuses. The eight anchors are
listed in the post table below.

**A scenario spine.** Every `01 — The Failure You'll Recognise` uses the same fictional product:
an internal IT helpdesk assistant at a mid-size company. It breaks in a new way each post.
Scenarios compound across the series without making any post depend on the previous one, and the
product is deliberately generic — no employer fingerprint, and every reader has met that helpdesk.

**Up to two Mermaid diagrams per post:** one showing the mechanism, plus a before/after or
data-flow sketch where it earns its place. Mermaid rendering and lavender theming already work on
the site.

### Three through-lines

These are what make it a series rather than eight posts:

1. **Hallucination** — post 1 explains why it happens, post 3 mitigates it, post 6 measures it.
2. **Cost** — introduced as a real measured number in post 2, controlled in post 8.
3. **The helpdesk assistant** — a new failure in every opening scene.

## Code standards

- Python 3.12+, environments via `uv`, which cross-links to the existing
  `uv-one-tool-to-rule-your-python` post.
- The Anthropic SDK is the spine. Ollama covers posts 1, 3, and 7, where poking at a local model
  *is* the lesson. Post 1 uses Ollama with a copy-paste fallback: the real printed output appears
  in the post, so a reader who will not install a 4GB model still gets the lesson.
- Every snippet self-contained and under roughly 40 lines, printing something the reader can
  compare against. **Expected output appears in a fenced block underneath.** This is what makes it
  teaching rather than decoration.
- **No frameworks in posts 1–5.** RAG and the agent loop are built by hand, roughly 30 lines each.
  This is the central anti-"too high level" decision: a reader who has written the retrieval loop
  understands RAG in a way no framework tutorial delivers.
- API keys from environment variables only, never inline. Post 8 covers secret handling properly.
- Costs are **measured by running the code**, never estimated. Any number in a post that came from
  a real run says so; nothing is invented.
- Model IDs, pricing, and parameters come from the `claude-api` skill at write time, not from
  memory.

## The eight posts

| # | Title / slug | Cover | Anchor analogy | Runnable centrepiece | Medior+ section |
|---|---|---|---|---|---|
| 1 | What a Model Actually Is `what-a-model-actually-is` | `ai` | A very well-read person guessing the next word — never retrieving, always guessing | Tokenise a sentence; print top-10 next-token probabilities from a local model and watch temperature reshape the distribution | Why context length is quadratic, and what that costs |
| 2 | Talking to a Model Properly `talking-to-a-model-properly` | `assist` | The context window as a desk, not a filing cabinet | One prompt run four ways, with token counts and measured cost printed per run | Reasoning models and extended thinking: when the budget pays for itself and when it is waste |
| 3 | Giving a Model Your Data `giving-a-model-your-data` | `network` | Closed-book exam to open-book exam; chunking is choosing which pages | RAG in ~30 lines with no vector database — then break it with a bad chunk size and show the wrong answer it produces | Hybrid search, reranking, and why pure vector search plateaus |
| 4 | Giving a Model Hands `giving-a-model-hands` | `lever` | Giving it a phone. It still cannot do the thing — it can only ask someone who can | A two-tool loop with no agent framework; then make a tool throw and handle it | Tool schemas as API design, and MCP as the portable form — introduced and consumed, not built; building a server lands in series 2 |
| 5 | Letting It Decide: Agents `letting-it-decide-agents` | `agent` | A capable junior with a to-do list and no manager: fast, literal, confidently wrong at step four | A hand-written agent loop with a step budget, printing its reasoning each turn | Human-in-the-loop: approval gates, step budgets, and surfacing reasoning — what makes an agent shippable |
| 6 | Knowing Whether It Works `knowing-whether-it-works` | `scales` | Unit tests for judgement — the assertion is not `==`, it is "good enough" | A 20-case eval harness that fails the build on regression | Evaluating retrieval separately from generation: recall@k and MRR |
| 7 | Making the Model Yours `making-the-model-yours` | `training` | Fine-tuning teaches an accent, not facts — and most people reach for it to fix facts | A small real LoRA run on a local model, before/after on the same 10 prompts | Quantisation, and the local-versus-API decision on privacy and cost |
| 8 | Running It in Production `running-it-in-production` | `pipeline` | An ordinary web service with one weird dependency: the dependency is non-deterministic | Instrument a call path — cache, retry, log, and a cost ceiling that actually trips | Prompt injection and guardrails that survive a motivated user |

Additional required coverage, placed rather than given its own post:

- **Streaming and perceived latency** — post 2. A 6-second streamed response beats a 3-second
  blocking one.
- **Benchmark literacy** — post 2. How to read a model card; why leaderboards mislead.
- **Prompt caching and batch APIs** — post 8, named explicitly as the two largest cost levers
  rather than hidden inside a generic "caching" bullet.
- **What you may legally send to an API** — post 8. GDPR, data residency, PII, EU AI Act
  awareness. This is the question that actually stops juniors from shipping.
- **Where to go next** — post 8 "Final Thoughts": what to learn, and how to find AI work inside
  your current company.

Post 8 closes by pointing at `mlops-production-guide` for operational depth rather than
duplicating it.

## The glossary

A ninth file, `ai-vocabulary-glossary`, cover `book`, outside the series order:

**"The AI Vocabulary: 40 Terms That Unlock Everything Else"**

Roughly 40 terms, each one sentence plus one concrete example, grouped by the post that needs
them. Linked from every post's "Prerequisites". Juniors cannot read *any* AI writing until they
own the vocabulary, and a standalone page is both sendable on its own and findable from post 6 —
neither of which a post-1 appendix would be.

## Cross-linking

- Each "Go Deeper" targets a specific guide section: post 3 to `## 05 — RAG Architectures` in
  `ai-architecture-master-guide`, post 7 to `model-training-finetuning-eval`, post 8 to
  `mlops-production-guide`.
- All eight posts plus the glossary carry a shared `ai-foundations` tag, plus two or three
  topical tags each, so the existing tag-based "Keep reading" works.
- Post 1 links to `uv-one-tool-to-rule-your-python` for environment setup.
- **One optional edit to existing content:** a single italic line at the top of
  `ai-architecture-master-guide.md` pointing newcomers at post 1. It is the guide most likely to
  land on a junior who is not ready for it.

## Delivery

**Step 1 — plumbing plus post 1, then stop.**
Collection wiring, the glossary, and post 1 written in full. Every post-1 snippet actually run so
the printed outputs in the text are real rather than plausible. Verified with `npm run build`.
Then the voice, depth, and code density get judged before the remaining seven are written.

**Step 2 — posts 2 through 8**, on approval of post 1.

Commits are grouped per step and stay local.

## Verification

- `npm run build` — never bare `astro build`; the bare command skips Pagefind and breaks
  `/search` in production.
- Every code snippet in every post executed, with its real output pasted into the post.
- `node --test` to confirm existing unit tests still pass.
- Grep the new posts for emoji; the site policy is none.
- Check the five-item header nav on a narrow viewport.
- Confirm `/ai-foundations/`, its RSS feed, the OG image, the series prev/next links, and the
  auto-generated table of contents all render.

## Risks

**Code rot.** Snippets against a moving SDK and moving model IDs go stale. Mitigated by stating
the SDK version each post was written against, and by `updatedDate` when revised — the same
pattern the existing guides already use.

**Depth calibration.** Eight posts written at the wrong depth is eight posts of rework. Mitigated
by the step-1 gate: post 1 is judged before the rest exist.

**Series drift.** Eight posts written over time lose their common voice and skeleton. Mitigated by
the fixed post anatomy above, which is a checklist at write time rather than a guideline.

## Roadmap: series 2

Written after series 1 ships, into the same collection as a second `SERIES` entry. Recorded here
so it is not lost.

**"Harness engineering: building the scaffolding around the model"** — context engineering and
compaction · MCP in depth, including building a server · tool design as an API design problem ·
sandboxing and permissions · subagents and parallel fan-out · multi-agent orchestration and
handoff · trajectory evals for agents · multimodal · test-time compute and reasoning-model
advances · post-training advances from RLHF through DPO to GRPO · long-horizon memory · red-teaming
agents, including injection through tool output.

Multimodal, multi-agent orchestration, and MCP-in-depth were deliberately excluded from series 1:
adding them would flatten the ladder. Series 1 is the prerequisite for all of series 2, which is
the right dependency direction.
