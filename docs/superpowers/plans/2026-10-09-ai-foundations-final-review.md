# AI Foundations — Final Review

Written 10 October 2026, after step 4. The series is complete and **entirely
local**: nothing in any of the four steps has been pushed, and track 4 is also
still `draft: true`, so none of its four posts is on the live site.

## What exists

| | Posts | Words | Reading time |
|---|---:|---:|---:|
| Track 1 — AI from the inside out | 6 | 19,854 | 91 min |
| Track 2 — How your AI coding tool works | 10 | 34,964 | 159 min |
| Track 3 — Working with AI, day to day | 2 | 5,767 | 27 min |
| Track 4 — Shipping AI in your own product | 4 | 13,919 | 64 min |
| Start-here map | 1 | | 7 min |
| The AI vocabulary | 1 | | 11 min |
| Harness engineering vocabulary | 1 | | 18 min |
| **Total** | **25** | | **377 min** |

46 Mermaid diagrams. Four `SERIES` entries, all registered in `src/consts.ts`.
31 tests pass; 54 pages build and index.

## Does it read as four finishable series or one sprawling one?

Four, but only because track 2 was allowed to be the long one and the others
were not padded to match it.

Track 2 at 159 minutes is not a sitting. It is a reference ladder, and it says so
— the start-here page sends people to the post that answers their question rather
than to post one. That is the right shape for the reader it was written for, who
arrives mid-problem.

Tracks 1, 3 and 4 are each finishable: 91, 27 and 64 minutes. Track 4 in
particular reads as a single arc — build the loop, measure it, decide whether to
customise the model, run it — and each post ends pointing at the next by name.
The series total of 377 minutes is never presented as a thing to do, and no page
suggests it is.

**The one structural risk** is that track 3 is short enough (two posts) to look
like an abandoned track rather than a deliberate one. The start-here page
addresses that in a sentence and then lists the four already-published posts the
track leans on, which is the honest version. It is worth re-reading that section
once in a few months with fresh eyes.

## Which diagrams earned their place

Track 4 ships eight, two per post, and I would keep seven.

**Earned.** 4.1's gate decision tree (the two questions that wrap every call) and
its tool-narrowing tree — the second one is the argument of the post and is
faster to read as a tree than as prose. 4.2's three-way failure triage
(retrieval / generation / source) is the clearest thing in that post. 4.4's
request path is the only place the four controls are shown as one path rather
than four sections, and 4.4's legal decision tree is the one diagram in the
series a non-engineer might screenshot.

**Weakest.** 4.2's "only the assertion changes" diagram is close to decoration —
it restates the preceding paragraph in boxes. It survives because it is the
visual that makes the post's one idea stick, and because it is cheap. If
anything gets cut on a later pass, it is that one.

4.3's customisation ladder earns its place on the lead times written on the
arrows rather than on the shape, which is worth remembering if it is ever
redrawn.

## Narrow viewports

Checked at 390px with device metrics overridden over CDP. Track 4's widest
diagram renders at 1,464px inside a 344px container with `overflow-x: auto`, so
it scrolls rather than breaking the layout, and `document.scrollWidth` never
exceeds the viewport on any of the four pages.

For context, the published posts already do this: `the-whole-thing-annotated`
has a diagram at 2,190px, `what-happens-when-you-press-enter` at 1,398px and
`who-is-allowed-to-do-what` at 1,386px. Track 4 is inside the existing range, so
there is nothing specific to fix here — but **horizontal scroll on a diagram is
a standing site-wide issue**, not a track 4 one, and a future pass that wanted to
improve it should start with the 2,190px one.

## Covers

`agent`/4, `mirror`/4, `training`/3 and `pipeline`/3. All unique; the collision
test passes.

**One rotation was rejected during review.** The plan specified `scales`/4 for
4.2. Rendered, it puts the pans above the beam opening upward and stands the post
on its head — the same failure already recorded for `scales`/3. It reads as
broken, not different. Replaced with `mirror`/4, which renders as two speech
bubbles facing each other across a dashed line, and which suits a post about a
model grading a model better than scales did anyway.

`training`/3 is a loss curve rotated 180°, so it falls at the right rather than
the left. It is not broken, but it is the weakest of the four, and a reader who
knows what a loss curve looks like may notice. Acceptable; flagged.

## The duplication cut

Twenty-two files carry the `ai-foundations` tag. The shared concepts were checked
by counting mentions across track 4 and reading the overlaps:

- **The context window / resending** appears in 4.3 and 4.4, both times as one
  sentence with a link to post 1.3. Not re-explained.
- **Prompt injection** appears only in 4.4, which runs a new experiment against a
  service and explicitly contrasts it with post 2.7's editor version rather than
  repeating it.
- **The tool-call boundary** appears in 4.1, three times, every time as a
  reference to post 2.2 with the sentence "the model asks, your code decides" and
  no re-derivation.
- **Chunking** is concentrated in 4.2, where it is the regression being induced,
  and points at post 1.5 for the mechanism.

Each track 4 post links six to nine other posts. Nothing was cut at this stage
because nothing restated; the discipline held during writing rather than needing
a pass afterwards.

**One genuine overlap survives and is deliberate.** 4.1's step budget and 4.4's
cost ceiling are the same idea in two denominations (steps, money). 4.4 names the
relationship in a sentence rather than pretending they are unrelated.

## Facts with a shelf life

For the monthly refresh. Each is a claim that will go stale, with where it
appears.

**Regulatory — check against the consolidated text, not secondary coverage.**

- *4.4 §08* — the AI Act timetable, taken from Article 113 of the consolidated
  text as amended to 27 July 2026 by Regulation (EU) 2026/1744 (Digital Omnibus
  on AI). **The high-risk dates moved** (now 2 December 2027 for Annex III and
  2 August 2028 for Annex I) and almost every article written before mid-2026
  still quotes the original. If the Act is amended again, this section is the
  first thing to re-read.
- *4.4 §08* — the Article 101 point: GPAI obligations applied from 2 August 2025,
  the Commission's power to fine for breaching them from 2 August 2026. This is
  the claim the post was written to settle; re-verify it survives any amendment.
- *4.4 §08* — GDPR Articles 6, 22, 28, 44–46. Stable, but the adequacy landscape
  under Article 45 is not.

**Vendor pricing and limits — all read from documentation, never measured.**

- *4.4 §03* — cache write 1.25× (5-minute) and 2× (1-hour); cache read 0.1× with
  lower per-model figures on the newest models; minimum cacheable prefix 512
  tokens on current models and up to 4,096 on older ones. These change.
- *4.4 §03* — Batches at 50% of standard prices, up to 100,000 requests per
  batch, most finishing within an hour and 24 hours maximum, results kept 29
  days.
- *4.4 §03* — the break-even arithmetic (two requests at the 5-minute TTL, three
  at the 1-hour) follows from the multipliers above and changes with them.

**OWASP identifiers.** `LLM01:2025`, `LLM02:2025`, `LLM06:2025`, `LLM10:2025` and
the Agentic AI threats guide, cited in 4.1 and 4.4. The list is versioned by
year; a 2026 revision would renumber. All URLs returned 200 on 10 October 2026.

**Model names and prices.** 4.3 names `Qwen/Qwen2.5-0.5B-Instruct` and 4.1, 4.2
and 4.4 name `Qwen/Qwen2.5-3B-Instruct`. These are the instruments the posts ran
on, so they should **not** be updated to newer models — a post that names the
model it ran on is reporting its apparatus. The per-token prices in 4.4's ledger
are explicitly labelled as an exercise.

**Nothing in 4.1, 4.2 or 4.3 has a date-sensitive claim** beyond the OWASP
references. Everything else in those three posts is a measurement taken on this
machine on 10 October 2026 and will stay true about that run forever.

## Is the original problem solved?

The series exists because two published posts named a whole layer nobody had
written down, and readers said they could not follow them.

**Yes, for the reader who bounced off the harness post.** That reader now has
track 2, which explains every term the harness post uses, and the start-here page
routes them by symptom rather than by curriculum. The test I would apply —
can somebody read `harness-engineering-vocabulary` after track 2 and find it
obvious — is one I cannot run myself, and it is the single most useful thing a
real reader could tell us.

**Track 4 solves a problem nobody reported**, and that is worth saying plainly.
It was written because the three AI guides are breadth-first catalogues for
people who already know the shape of the problem, and nothing on the site got
somebody to that shape. Whether anyone wanted that is untested. It is the track
most likely to be read by the fewest people and the one with the most reusable
code in it.

**The thing the series does that I did not plan** is that nine of eleven
measurements in steps 1 and 2 contradicted the brief, and step 4 continued the
run: the injection test's *control* condition failed before any injection was
attempted; a loosened prompt scored higher on the eval suite than the strict one;
a model judge was not fooled by length or confidence but failed a hedged correct
answer; and a fine-tune that recited a fact perfectly turned out to have learned
a string rather than a fact. Every one of those is in a post because the
measurement was run before the post was written. **That is the house technique
and it has now survived four steps.**

## What is left for Riddam

1. **The publish decision.** Track 4 is four `draft: true` files. Publishing is
   two edits, in this order:
   - flip `draft: true` to `draft: false` in the four
     `src/content/engineering/` files listed in the track 4 `SERIES` entry;
   - swap the track 4 block on `ai-foundations-start-here.md` from the four bold
     titles to the four links. The exact linked form is in this commit's history.

   `npm test` enforces the second: the moment a draft flag comes off, *the
   start-here page links every published AI Foundations post* fails until the
   links are added.
2. **The first-person lines**, as in earlier steps. 4.4 §09 ends on a paragraph
   about how to find this work inside a company, and 4.4's final thoughts close
   the whole series. Both are written in my voice and are the kind of thing only
   Riddam can confirm he means.
3. **Nothing is pushed.** The whole series, all four steps, is still local.

## Three test changes this step made, and why

Keeping a whole track as drafts broke three assumptions the test suite had, each
of which was really an assumption that a written post is a published post.

- `every series has at least one published post` became `every series is either
  live or fully drafted, never dangling`. The guard that mattered — no `SERIES`
  slug without a file behind it — is now asserted directly and is stronger than
  what it replaced.
- `every internal post link resolves to a published content file` now lets a
  draft link a draft. A published post linking a draft is still a failure,
  because that is a 404 for a reader; two drafts linking each other is not,
  because neither is on the live site, and a track written as a whole has to be
  able to cross-reference itself.
- `the start-here page links every published AI Foundations post` now skips
  drafts, and a new test requires the map to **name** every drafted post. The map
  still accounts for the whole series; it just cannot link to a page that is not
  there.
