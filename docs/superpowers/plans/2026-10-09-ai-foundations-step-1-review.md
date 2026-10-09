# AI Foundations — Step 1 Review (partial)

**Status: step 1 is three of its seven posts.** Tasks 3, 4, 5 and 6 — posts 1.2,
1.3, 2.1 and 2.2 — were not written, because every one of them is built on
measurements that need a hosted model and `ANTHROPIC_API_KEY` was not available
in the execution environment. The plan forbids invented output, and rightly. The
decision to proceed with the rest rather than stall was Riddam's, taken on
2026-10-09.

What shipped:

| Post | Slug | Read | Diagrams |
|---|---|---|---|
| Vocabulary page | `the-ai-vocabulary` | 10 min | 0 (deliberate) |
| 1.1 What a Model Actually Is | `what-a-model-actually-is` | 12 min | 2 |
| 2.3 MCP, Explained Without the Spec | `mcp-explained-without-the-spec` | 15 min | 2 |

Plus the four content-rule tests, both `SERIES` registrations, and three entry
points from the published posts.

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

One finding for step 2. The plan's own content test only checks that a Mermaid
fence is closed, non-empty and starts with a known diagram type. It does not
check that the diagram *parses*, which was exactly the failure the plan's Review
Focus named. A headless check using the site's own Mermaid version and `jsdom`
does catch it, and running it is thirty seconds:

```js
// scratchpad only, not committed: jsdom + mermaid.parse() over every fence in src/content
// result on this branch: parsed 34 diagrams, 0 failed
```

Step 2 should decide whether that becomes a committed test (cost: `jsdom` as a
devDependency) or stays an authoring-time habit. My recommendation is the
devDependency, once there are twenty more diagrams on the site.

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
4. **Specify the measurement, not the snippet.** The plan's 1.1 snippet used a
   prompt whose top token on a base model is `' __'`, a fill-in-the-blank
   artefact — real output, useless teaching. A Q/A-shaped prompt on the same model
   gave the distribution the post needed. Plans should state what the number has
   to demonstrate and leave the prompt to the writer.
5. **Say which posts can be written without a hosted model.** Three of this
   step's seven could; four could not, and that was discovered during execution
   rather than during planning. Step 2's plan should mark each post with what it
   needs to run: nothing, a local model, an API key, or a live MCP server.

## Not done

- **Visual check of all four diagrams in light and dark theme at a narrow
  viewport.** No browser in the execution environment. All four parse under the
  site's own Mermaid 11 and render as `pre.mermaid` in `dist`, and they use the
  same constructs as the thirty existing diagrams, but a human has not looked at
  them.
- **Posts 1.2, 1.3, 2.1, 2.2**, and the harness post's pointer into 2.1.
