# AI Foundations — Step 3 Review

**Date:** 2026-10-10
**Plan:** `docs/superpowers/plans/2026-10-09-ai-foundations-step-3.md`
**Commits:** `32b6b25..` (five commits, local only, nothing pushed)

Track 3 is complete: two new posts, one new `SERIES` entry, two additive
sections in published posts, and the start-here map updated to link both rungs.

## What shipped

| Item | File | Read time |
|---|---|---|
| 3.1 Is It Actually Making You Faster? | `engineering/is-it-actually-making-you-faster.md` | 13 min |
| 3.2 Rolling It Out to a Team | `engineering/rolling-it-out-to-a-team.md` | 12 min |
| E1 §12 Repository Ergonomics | `engineering/ai-assisted-coding-playbook.md` | +~470 words |
| E2 §9 Reviewing code you didn't write | `leadership/learning-to-build-software-when-ai-writes-the-code.md` | +~430 words |

## The three things the plan asked the review to check

**1. Did a new post restate the playbook?** No. 3.1 is about measurement and
never teaches prompting technique; it links the playbook once, in references,
as "the practice being measured here". 3.2 handles the two places where
restatement was most likely by deferring explicitly: §04's blast-radius
exception points at the permissions post rather than re-explaining deny rules,
and §05 opens by naming what the plugins post already covers (marketplace
mechanics, and the argument for a versioned plugin over one long shared
instructions file) so that it can be about ownership and rot only.

The audit found three places where a new paragraph *referred* to another post in
prose without linking it — "the model card post", "the junior-developer post"
twice. All three are now links; a bare prose reference is the first step toward
restating something, because the reader cannot get there.

New playbook §12 was checked against §11 line by line. §11 owns instruction
files and grounding; §12 mentions instruction files exactly once, to add the
length argument and hand off to `where-the-context-comes-from`.

**2. Did an edit renumber a published post badly?** Both edits renumber, which
was Riddam's explicit call over inserting `11a`. The playbook shifted §12–§15 to
§13–§16; four inbound anchor links from the junior and spec-driven posts were
updated. The junior post shifted §9–§10 to §10–§11; its only inbound anchor
targets §4 and was unaffected.

Every anchor was then checked against the built HTML rather than assumed — six
in the playbook, five in the junior post, plus the new cross-link from 3.2 into
the junior post's new §9. All resolve. The table-of-contents order is correct
and no heading number is duplicated.

The residual risk is external: a link from outside the site to the playbook's
old `#12`, `#13` or `#15` now lands on the wrong section. That was accepted
knowingly.

**3. Measurement claims with no measurement behind them.** This was the plan's
biggest exposure and the post was restructured to remove it. The plan's Task 1
Step 1 required two weeks of Riddam's own logged work, which could not be
produced. Rather than invent it, 3.1 is now a method post: it opens with a note
saying no measurement of its own is reported, section 04's worked log is
labelled invented in bold in its first sentence, and section 05's task kinds are
stated as patterns rather than as results.

The post is not weaker for it. The two real studies it leans on were read
against their primary sources — METR's July 2025 trial (16 developers, 246
tasks, 19% slower against an expected 24% faster, and a 20% *perceived* speedup
afterwards) and the February 2026 follow-up, whose confidence intervals include
zero and whose control condition collapsed because 30–50% of participants would
not do tasks without AI. That last detail is now the argument of section 07: if
a funded lab cannot hold a control group, one developer's fortnight is a record,
not an experiment. That is a stronger and more honest spine than a personal
table would have been.

## What changed against the plan

- **Diagram 1 in 3.1 was rewritten.** The plan's exact mermaid — `flowchart LR`
  with two subgraphs — renders as a *vertical* stack with "With an agent" above
  "Without an agent", reversing the before/after reading and running to 1332px
  tall. Fixed with `flowchart TB`, `direction LR` inside each subgraph, and a
  `~~~` link to pin the order. It now reads as two rows in the right order. It
  is wider than the column and scrolls horizontally, which is the site's
  deliberate behaviour for wide diagrams (`useMaxWidth: false`, see
  `Base.astro`) and matches the published MCP post.
- **Diagram 1 in 3.2 was rewritten, and it is the best thing in the post.** The
  plan drew three levels: organisation above repository above personal. The
  documentation says five, and personal settings sit at *two* of them — project
  local (level 3) beats the team's committed file (level 4), while user settings
  (level 5) lose to it. The plan's version was wrong in exactly the way its own
  caption predicted people would be wrong. Section 02 was retitled from "Three
  places config lives", since the section disproves that number.
- **Covers.** The plan assigned `speed`/2 and `personas`/2; both pairs were
  already taken. Changed to `speed`/3 and `personas`/3.
- **Task 5 Step 1 was pulled forward** into Tasks 1 and 2. `content-rules.test.ts`
  requires every AI Foundations post to be linked from the start-here page, so
  deferring the links would have left the suite red between tasks.

## Verification

`npm test` → 29/29 pass. `npm run build` → 50 pages, Pagefind index rebuilt.

All four new diagrams were rendered in both themes over the Chrome DevTools
Protocol and inspected as images. **A note for step 4:** the theme must be
written to `localStorage` *before* navigating to the page. Setting
`documentElement.dataset.theme` after load switches the page CSS but leaves
mermaid rendered in the previous theme, which produces dark nodes on a light
page and grey boxes behind the edge labels. That looks exactly like a site-wide
styling bug and is not one — it cost a detour this step, including a wrong
conclusion about a published post before the method was corrected. The working
script is `verify.mjs` in the session scratchpad; the pattern is: navigate to
any same-origin page, set `localStorage`, then navigate to the target.

Also note that the preview server came up on **4322** because something stale
was already serving 4321. Verifying against 4321 would have tested an old build.

## What step 4 should change

1. **Specify diagrams as intent, not as literal mermaid.** Two of this step's
   four diagrams did not render as the plan's source implied, and one of them
   was substantively wrong about its subject. A plan that says "draw the five
   documented precedence levels, highest first" survives a renderer quirk and a
   documentation change; a copy-paste block does not.
2. **Stop writing plan steps that require data only Riddam has.** Track 4's
   posts on evals and fine-tuning are the same shape as 3.1: if a step says
   "measure your own X for two weeks", it will block. Either the data is
   gathered first, or the post is scoped as a method from the start.
3. **Check cover assignments against what is already used** when writing the
   plan, not when executing it. Three of three cover pairs specified across
   steps 2 and 3 collided.
4. **Keep checking vendor facts against the documentation.** The settings
   precedence stack was the single most valuable paragraph in either post, and
   it exists only because the plan said to check rather than recall.

## Still open

Riddam offered to supply the personal material and has not yet. Two places are
written impersonally and would improve with his own lines:

- **3.1 §05** — kinds of task where an agent has reliably cost him more than it
  saved.
- **3.2 §07** — adoption failures he has actually watched on a team, with the
  ones he witnessed separated from the ones he is inferring.

Neither is a gap a reader would notice; both would make the posts his rather
than correct.
