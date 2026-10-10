# AI Foundations — Step 1 Review

**Status: complete.** All seven posts, both `SERIES` registrations, the content
tests, and the entry points from the published posts.

The one substitution worth recording up front. The plan specified that four of
these posts take their measurements from a hosted Claude model. No
`ANTHROPIC_API_KEY` was available, and no `ant` profile either. Rather than
invent output — which the plan forbids and which would have been the single
worst thing to do in a series whose pitch is "these are real numbers, go and
check" — every capture was re-run against a **local** model (`Qwen2.5-0.5B` for
the probability work, `Qwen2.5-3B-Instruct` for everything conversational).

That turned out better than the plan's design, for a reason worth carrying into
step 2: a reader with no API key and no account can reproduce every number in
the series on a laptop. The constraint improved the work.

| Post | Slug | Read | Diagrams |
|---|---|---|---|
| Vocabulary page | `the-ai-vocabulary` | 10 min | 0 (deliberate) |
| 1.1 What a Model Actually Is | `what-a-model-actually-is` | 12 min | 2 |
| 1.2 Why It Sounds Certain When It's Wrong | `why-it-sounds-certain-when-its-wrong` | 12 min | 2 |
| 1.3 The Context Window Is the Entire Memory | `the-context-window-is-the-entire-memory` | 13 min | 2 |
| 2.1 What Actually Happens When You Press Enter | `what-happens-when-you-press-enter` | 15 min | 3 |
| 2.2 A Tool Call Is a Request, Not an Action | `a-tool-call-is-a-request-not-an-action` | 12 min | 2 |
| 2.3 MCP, Explained Without the Spec | `mcp-explained-without-the-spec` | 15 min | 2 |

## Voice and depth

The level holds. The thing that makes 1.1 and 2.3 work is the same thing in
both: a real number the reader can reproduce, placed where an assertion would
normally go. In 1.1 that is the top-five token distribution — the fact that
`' Amsterdam'` wins with 61 per cent and `' Rotterdam'` is sitting there at 0.87
per cent does more teaching than three paragraphs about probability would. In
2.3 it is the tool-list measurement: 13,713 characters, 3,374 tokens, on every
turn.

Too shallow, if anything: section 03 of 1.1, "Tokens become numbers". It is three
short paragraphs that say "embeddings exist, a later post covers them". That is
the right call for scope and the wrong feel for a reader — it reads like a
placeholder. When 1.5 exists it should be a two-sentence pointer rather than a
section with a heading, or it should earn its heading with one concrete thing.

Too deep: nothing. The closest is 2.3's section 08, which names five attack
classes from the specification's security page. It is a list of names with one
clause each and an explicit hand-off to 2.5, which is the correct shape — but it
is the one section where a reader who stops reading has learned vocabulary rather
than a mechanism.

## Diagram density

Two per post was right for both. Neither wanted a third, and nothing in either
is decoration — the 1.1 loop diagram and the 2.3 sequence diagram are both doing
work the prose cannot do as compactly.

The vocabulary page having none is worth keeping as a rule, not an accident: a
glossary with a flowchart on it looks like it is hiding something.

One finding, raised in review and now fixed. The plan's content test only checks
that a Mermaid fence is closed, non-empty and starts with a known diagram type —
none of which is a syntax check, so `flowchart LR\n A["unclosed` passes it. That
was exactly the failure the plan's Review Focus named. `src/content/mermaid-syntax.test.ts`
now parses every fence with the site's own Mermaid 11 under `jsdom` (34 diagrams,
0 failures), verified by breaking a bracket and watching it fail. The cost is
`jsdom` as a devDependency and about half a second on `npm test`.

## Reading time

All three landed in their target bands, but only after deliberate expansion:
first drafts came in at 9, 9 and 13 minutes against targets of 10–12, 12–15 and
15–18. That is a consistent bias worth naming for step 2. Writing to the plan's
outline exactly produces a post about 20 per cent shorter than the plan's own
reading-time target, because the outline's section list is a skeleton and the
targets assume flesh on it.

The material that closed the gap was not padding, which is the encouraging part:
tokeniser differences across providers, what "knowledge" means concretely as a
file of numbers, why a model cannot take back a token it has written, the
credential shape of stdio versus HTTP servers. Step 2's plans should either
budget two or three such passages per post explicitly, or lower the targets.

## The anchor analogies

**1.1 — "a very well-read person guessing the next word, who never stops to look
anything up."** Survives. It is introduced in "Where this sits", carried through
section 04 where the pile-of-numbers explanation leans on it directly, and the
first Common Mistake is literally "thinking it looked something up".

**2.3 — "a standard plug socket."** Survives, but more thinly. It does its work
in section 02 and in the caption, then disappears until the final section. The
honest reading is that the analogy is load-bearing for one idea — *it is agreed,
not clever* — and does not stretch to cover transports or security, so it stops.
That is better than forcing it, but it means 2.3 is carried by its measurements
rather than by its image.

## Duplication found and cut

One real overlap. The AI architecture guide's §09 already has MCP's three
primitives in a reference table with a direction column, plus the design advice
on tool-description quality. Post 2.3 section 04 explains the same three.

Resolution: kept the explanation (the guide's table is a reference; 2.3's version
is a worked example with a ticketing system), and added a link from 2.3 into
`/guides/ai-architecture-master-guide/#09--tool-use--mcp` so the reader gets the
table from the place that owns it. Nothing was cut.

Checked and found clean: "context window" appears in the playbook and the harness
post in their own senses; the vocabulary page's harness section is one line per
term pointing at the harness post rather than summarising it; "tokeniser" appears
only in the two new posts.

## Corrected in review

Two things a reader could have caught, both found by the whole-branch review and
both fixed before this document was finalised.

**The temperature tables in 1.1 did not agree with each other.** The numbers were
real and reproducible, but the softmax ran in the model's own reduced precision,
so dividing the logits by each temperature rounded differently — and a reader
back-solving the logit gaps from the 0.7 table and the 1.5 table would get
different answers. Running the softmax in float32 fixes it at the cause: the gaps
now agree exactly (0.4375, 2.5625, 2.6250, 2.9375 at both settings). The post
says why, because anyone reproducing it will hit the same thing. The near-zero
table is trimmed to its one meaningful row, with the reason stated.

The general lesson for step 2: when a post's credibility rests on printed
numbers, check that the printed numbers are consistent *with each other*, not
only that the script ran.

**2.3 said it was "the third post in" a series whose nav renders "Part 1 of 1".**
Correct prose, correct nav, contradiction on the page — a direct consequence of
writing out of order. It now says so.

## Every reference resolves

All six external URLs across the three posts return 200 as of 2026-10-09,
including both MCP specification pages at revision `2025-11-25` and the Claude
Code MCP page. The MCP revision is current, not archived.

## What step 2 should change

1. **Budget the depth, not just the outline.** See "Reading time" above. Either
   name two or three "going deeper" passages per post in the plan, or drop the
   targets by three minutes.
2. **Make the forward-link rule explicit in every post task.** The plan states it
   once in Review Focus and then writes outlines that link forward anyway — 1.1's
   hand-offs to 1.2 and 1.3, 2.3's to 2.2, and Task 8's harness pointer into 2.1
   all had to be cut or rephrased. Either write the outlines link-free and add
   links in a final wiring task, or publish strictly in ladder order.
3. **Decouple series registration from post 1 of its track.** The constraint is
   only that a series has *one* published post, not its first. Track 2 was
   registered with 2.3 and the suite stayed green. Say that in the plan so the
   next executor does not think the pairing is load-bearing.
4. **Check numbers against each other, not just against the script.** See
   "Corrected in review". A plan that says "paste the real output" is not enough;
   it should say what relationship between the printed numbers has to hold.
5. **Specify the measurement, not the snippet.** The plan's 1.1 snippet used a
   prompt whose top token on a base model is `' __'`, a fill-in-the-blank
   artefact — real output, useless teaching. A Q/A-shaped prompt on the same model
   gave the distribution the post needed. Plans should state what the number has
   to demonstrate and leave the prompt to the writer.
6. **Plan for a local model first, not as a fallback.** This step's four hardest
   posts were specified against a hosted model and delivered against a local
   one, and the local version is strictly better for the reader: no key, no
   account, no cost, and the script in the post is the script they run. Step 2
   should mark each post with what it needs — nothing, a local model, an API
   key, a live MCP server — and prefer the lowest rung that demonstrates the
   point.

7. **Name the model in every post that prints model output.** Four posts
   initially did not, which quietly broke the reproduction promise their own
   ledes made. Make it part of the post anatomy.

## What the second review caught

A fresh review of the four local-capture posts found nine things. Two were the
kind a reader could catch, and both are instructive for step 2.

**1.3's narrative contradicted its own measurement.** The prose said turn 1 was
the file paste; turn 1 measured 65 tokens, and the paste was turn 2. Worse, the
growth it attributed to "carrying the file" was mostly the model's own answers
accumulating. The fix made the post better — section 03 now shows the per-turn
deltas and tells the more interesting story — but the lesson is that a number
can be real, correctly captured, and still be described wrongly in the sentence
next to it.

**1.2 presented an editorial summary as captured output.** Two control questions
were shown as a hand-written "runs 1-5: ... (all five identical, and correct)"
line inside a ```text fence, in the post whose lede promises verbatim output.
Nothing in it was false. The *form* claimed capture, which in this series is the
thing that cannot be allowed to drift. Replaced with the ten real lines.

The rest: a cited Claude Code docs URL that had the wrong page behind it
(`/docs/en/iam` is Authentication; permissions are `/docs/en/permissions`); a
cache-cost figure that assumed a 90/10 split it never stated; a section labelled
a control experiment that changed two variables; `stop_reason` narrated as a
field the local capture returned when the loop in fact derives it; two claims
asserted rather than run; and — the one that mattered most for the whole
substitution — no post named the model it used.

## A correction owed to a published post

`harness-engineering-vocabulary.md` cites `https://code.claude.com/docs/en/iam`
in three places as the reference for permissions. That page is now
**Authentication**; the permission system lives at `/docs/en/permissions`, with
`/docs/en/permission-modes` for modes. Left unfixed here because it is outside
this plan's range and belongs to a published post, but it should be corrected —
and the post's own advice about path rot is the reason it needs doing on a
schedule rather than once.

## Not done

- **Visual check of the thirteen new diagrams in light and dark theme at a
  narrow viewport.** No browser in the execution environment. All thirteen parse
  under the site's own Mermaid 11 and render as `pre.mermaid` in `dist`, and
  they use the same constructs as the existing diagrams, but a human has not
  looked at them. This is the one open item before publishing.
