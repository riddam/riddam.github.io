# AI Foundations — Step 2 Review

**Status: complete.** Tracks 1 and 2 are finished — six posts and ten. Step 2
added eleven content pages (1.4, 1.5, 1.6, 2.4–2.10, and the start-here map)
plus one cover-system change, across twelve commits, then this fix wave and
verification sweep on top.

Everything stays local. Nothing was pushed.

| Post | Slug | Read | Diagrams | Cover |
|---|---|---|---|---|
| 1.4 How It Learned to Follow Instructions | `how-it-learned-to-follow-instructions` | 15 min | 2 | `training`/2 |
| 1.5 Embeddings, and Why Retrieval Beats Memorising | `embeddings-and-why-retrieval-beats-memorising` | 19 min | 2 | `network`/3 |
| 1.6 Reading a Model Card Without Guessing | `reading-a-model-card-without-guessing` | 19 min | 2 | `speed`/2 |
| 2.4 Build a Small MCP Server and Watch the Wire | `build-a-small-mcp-server` | 16 min | 2 | `code`/2 |
| 2.5 What Can Go Wrong With an MCP Server | `what-can-go-wrong-with-an-mcp-server` | 14 min | 2 | `gate`/3 |
| 2.6 Where the Context Comes From | `where-the-context-comes-from` | 17 min | 2 | `pyramid`/3 |
| 2.7 Who Is Allowed to Do What | `who-is-allowed-to-do-what` | 19 min | 2 | `gate`/4 |
| 2.8 How a Skill Gets Found and Loaded | `how-a-skill-gets-found-and-loaded` | 16 min | 2 | `assist`/2 |
| 2.9 Subagents: Why Isolation Is the Point | `subagents-why-isolation-is-the-point` | 16 min | 2 | `agent`/3 |
| 2.10 The Whole Thing, Annotated | `the-whole-thing-annotated` | 15 min | 2 | `mirror`/3 |
| S2 AI Foundations: Start Here | `ai-foundations-start-here` | 6 min | 0 (deliberate) | `personas`/2 |

Reading times run 14–19 minutes, all inside the twenty-minute gate. The map is
deliberately short and deliberately has no diagram: it is a routing page, and a
diagram on it would be a second table of contents.

## Do the two tracks read as one thing?

Yes, and the mechanism is the cross-reference discipline rather than a shared
voice. A nine-gram overlap scan across all sixteen posts plus the map found no
pair sharing more than forty nine-word runs, and every one of the largest
overlaps turned out to be house boilerplate — the "every vendor page below was
fetched on 10 October 2026 … treat each as a pointer to the current page"
reference preamble, the `## 01 — The thing you have already noticed` heading
shape, and the titles of posts being linked. Not one was a restatement of a
neighbour's argument.

The two places most at risk both held up on inspection:

- **Context.** Track 1's 1.3 owns statelessness and the resend; track 2's 2.6
  opens by citing it in one sentence and then goes straight to assembly order.
  1.6's context-length section explicitly says "post 1.3 argued that at length
  and nothing here changes it" instead of re-arguing it.
- **Injection.** 2.1, 2.4, 2.7 and the map all touch prompt injection. 2.7 is
  the only one that explains it; the others name it and link.

One gap was closed in this sweep: 2.3's section 08 listed the specification's
attack classes and promised "it is getting one later in this series" without
naming the post. 2.5 now exists, so the sentence links it.

## Which diagrams turned out to be decoration

None were cut, but two are carrying noticeably less than their neighbours:

- **2.10's triage tree.** It is a four-leaf decision tree whose leaves are post
  numbers. It works, but it is doing the map's job inside the capstone.
- **1.5's chunk-boundary diagram.** Two paths, one good and one bad. The prose
  above it already said both. It is a reinforcement, not an explanation.

The strongest diagrams in the step are 2.6's assembly order and 2.9's fan-out
timeline — both show a *shape* the prose can only describe serially.

## The fix wave

Thirty parked findings were worked through. Three were structural.

**(a) Post 2.3 cited a superseded specification revision.** Four page URLs and
its reference line named `2025-11-25` as *the* current MCP revision while 2.4
and 2.5 both cite `2026-07-28`. All four now point at `2026-07-28`, each URL
fetched before citing. The wire-level JSON in section 06 still shows
`2025-11-25` because that is what the handshake actually negotiated, and a new
paragraph says so and hands the reader to 2.4, which takes the distinction
apart properly. Section 08's list was renamed with the revision — session
hijacking became **state handle hijacking** when the revision dropped
protocol-level sessions — and the transports reference clause was rewritten,
because session management is no longer what that page is about.
`updatedDate: 2026-11-01` set.

**(b) Post 2.9 promised a post 2.10 does not deliver.** Its closing said the
next post "puts one whole assembled request on the page at once, annotated line
by line". 2.10 annotates a whole *session*, excerpted, not one request. The
sentence in 2.9 was rewritten; the capstone is right as built.

**(c) The start-here map's references.** A sixth entry was added for
`spec-driven-development-tdd-bdd-ai-agents` — the workflow the tracks assume and
never re-explain. Six entries is still inside the two-to-six rule, and it
satisfies both readings of the brief's ambiguous "four published posts this
series was written in response to".

The substantive minor was 1.5's section 06, which set 0.95 / 0.89 / 0.81
(statement vs statement) against 0.344 (question vs statement) as though they
were comparable, inviting the conclusion that near-duplicate ticket numbers rate
three times a correct match — undercutting the post's own "cosine is a ranking,
not a percentage" lesson two sections earlier. The fix was to measure the
missing control rather than to hedge the sentence. The same model, the same
`util.cos_sim`, now runs two unrelated statement-vs-statement pairs alongside
the three near-duplicates: 0.222 and 0.087 against 0.950 and 0.885. Those five
share a distribution and can be read as one group, which is the whole point. The
passage now says plainly that setting 0.95 beside 0.344 is exactly the
percentage thinking section 02 warned about. That change also closes the second
finding on the same block — it had no script above it, and now it has the script
that produced it.

Post 2.7's "the classifier treats it as a block signal" had no source. There is
one, nearly verbatim: *Choose a permission mode*, section "Boundaries you state
in conversation", which says the classifier "treats boundaries you state in the
conversation as a block signal", and in the next paragraph gives the compaction
caveat the post makes its point out of. Both are now linked and quoted.

The remaining minors applied were wording and accuracy: hedging two numbers in
2.9 that a reader multiplying would not reproduce (the fifteen reads are
fourteen duplications; the ~36,000-token window floor is one machine's setup,
not a general price), replacing an unhedged counterfactual in 2.9 with the
arithmetic that actually supports it, attributing 2.10's `knew.py` claim to the
transcript reading rather than to a script that does not print it, folding the
seven-hour / seven-and-a-half-hour wall-clock difference into 2.10's existing
reconciliation paragraph, labelling the five unlabelled solid edges on 2.10's
timeline diagram, adding the real top match (0.344) to 1.5's first diagram so it
no longer contradicts the table above it, softening two over-stated phrases in
2.5 and one each in 1.4, 2.4 and 2.6, and restoring a lost blank line before
2.6's `## Final thoughts`.

Five findings were skipped deliberately; they are listed under *Still open*.

## The sweep

**Suite and build.** `npm test` — 28 tests, 28 pass, 0 fail. `npm run build` —
complete, Pagefind indexed 48 pages. Both re-run after the fix wave.

**Both ladders.** Verified against the built HTML rather than by clicking. Every
one of the sixteen posts renders a `series-box` nav whose list is exactly its
track's `SERIES` order with the current post replaced by a non-link marked
`aria-current`, and whose eyebrow reads "Part N of 6" or "Part N of 10"
correctly at both ends. Track 1 ends at 6 of 6, track 2 at 10 of 10. Both match
`src/consts.ts` and the spec's tables.

Worth knowing, and not a bug: the *second* nav on each page, "More in this
section", is chronological across the whole engineering section, not the series.
A reader following it from 1.2 lands in track 2. That is the site's long-standing
behaviour and the series box is the ladder.

**Covers.** All eleven new pages render a distinct motif in both themes, checked
side by side on `/engineering/`. A repository-wide scan of all 48 covered pages
found no duplicate `cover` + `coverVariant` pair. The four reassignments are in
place and read correctly: `speed`/2 on 1.6, `assist`/2 on 2.8, `personas`/2 on
the map, `code`/2 on 2.4.

**Diagrams in both themes.** `--force-dark-mode` and `--blink-settings` do
nothing on this site, because `Base.astro` sets `data-theme` from localStorage
before paint. What works: copy `dist`, inject `data-theme="light"` and
`data-theme="dark"` into each `<html>`, serve both copies, and screenshot those.
Theme was confirmed by sampling pixels, not by trusting a flag — light pages
read `rgb(247, 245, 252)` at the corner, dark pages `rgb(22, 18, 33)`.

All twenty diagrams across the ten new posts rendered under a 30-second
virtual-time budget, in both themes, with identical geometry and no syntax-error
node; so did 2.3's two, which this sweep revised. The map has none by design.
 The widest is 2.10's timeline at 2,190 px; it scrolls in its container, as
the house rules intend.

**Duplication.** Covered above. Nothing was cut in this sweep; one
cross-reference was added.

**Reference URLs.** All 46 distinct external URLs across the eleven new pages
and 2.3 were fetched. Every one returns 200. Five redirected and four were updated to
the destination:

| Was | Now |
|---|---|
| `code.visualstudio.com/docs/copilot/chat/chat-sessions` | `/docs/agents/run/sessions/manage-sessions` |
| `code.visualstudio.com/docs/copilot/customization/custom-instructions` | `/docs/agent-customization/custom-instructions` |
| `docs.github.com/…/provide-context/use-mcp/extend-copilot-chat-with-mcp` | `/…/copilot-in-your-ide/customize-copilot/extend-copilot-with-tools-and-context/extend-copilot-chat-with-mcp` |
| `modelcontextprotocol.io/specification/<rev>/basic/security_best_practices` | `modelcontextprotocol.io/docs/<rev>/tutorials/security/security_best_practices` |

The fifth, `doi.org/10.6028/NIST.AI.600-1`, redirects to the NIST PDF by design
and was left alone — the DOI is the stable citation.

The known rot was confirmed and fixed: `claude.com/blog/ciso-guide-to-agentic-ai`
301s to `claude.com/resources/articles/…`, and 2.7 cited the old form. It now
cites the new one, with the author and date the page gives.

**Anonymisation.** Grepped the eleven new pages for `riddam`, `jain`,
`coolblue`, `/Users/`, `myp-guide`, `.superpowers`, scratchpad paths, email
addresses, UUIDs, and the names of every plugin and skill installed on this
machine. Clean. Every `~/.claude/...` path in the posts is a documented location
with a `<slug>` or `<project>` placeholder, not a real one. The one scratchpad
path, in 2.3's stderr paste, is already elided to `.../scratchpad/mcpdemo`.

## Still open for the repo owner

1. **`updatedDate` on unpublished posts.** 2.3's is now `2026-11-01`, after its
   own `pubDate` of `2026-10-16`, because the whole series is scheduled into the
   future and nothing here is pushed. If "updated" is meant to mean *updated
   after publication*, the field is premature on every AI Foundations post that
   carries one, including 1.1 and the vocabulary page from step 1. One decision
   covers all of them.
2. **Post 1.2 and 1.3 publish out of order.** 1.2's `pubDate` is `2026-10-13`
   and 1.3's is `2026-10-12`. The series ladder is explicit so it reads
   correctly, but the section index, the archive and RSS will show 1.3 first.
   This predates step 2; fixing it is a one-line date swap.
3. **Five parked minors were skipped on purpose.** The two test and component
   nits from task 1 (`content-rules.test.ts` asserts string presence rather than
   the variant-to-transform mapping; `Cover.astro` rebuilds its lookup object
   per render) are brief-mandated code and harmless. Task 12's assertion only
   matches `/engineering/<slug>/`, so a future `ai-foundations` post in
   `leadership/` would fail it falsely — real, but it is the brief's code
   verbatim and the series has no cross-section post yet. Task 8's
   "twenty-five session transcripts" is covered by the post's own snapshot
   caveat. Task 9's two soft echoes of the disproved "the description is the
   interface" framing were judged survivable by the re-reviewer and the caption
   underneath carries the correction; changing them means changing a
   brief-mandated diagram node.
4. **Two diagrams are reinforcement rather than explanation** — 2.10's triage
   tree and 1.5's chunk-boundary tree. Both are defensible. If the house rule
   is tightened to "a diagram must show something the prose cannot", these are
   the two to revisit.
5. **The MCP wire-versus-page split will go stale by itself.** Three posts now
   turn on the fact that implementations negotiate `2025-11-25` while the
   published revision is `2026-07-28`. The day the SDK ships `2026-07-28`
   through `initialize`, 2.3's new paragraph, 2.4's section on it and 2.5's
   revision comparison all need re-reading together. Worth a calendar note
   rather than a code comment.

## What steps 3 and 4 should change in the spec

- **The local-model technique is now load-bearing, not a workaround.** Every
  number in sixteen posts came off `Qwen2.5-0.5B`, `Qwen2.5-3B-Instruct` or
  `all-MiniLM-L6-v2` on a laptop. Steps 3 and 4 should state it as the method up
  front instead of specifying hosted models and discovering the constraint again.
- **Two diagrams per post looks like the right number.** The only three-diagram
  post in the series, 2.1, draws the loop twice — once as a flowchart and once
  as a sequence diagram of the same round trip. Both are good drawings and the
  third still earns less than the other two. Steps 3 and 4 should treat "three
  where the brief says so" as something to justify rather than something to use.
- **Say which revision, and say it once per post.** The 2.3 problem was not that
  the URLs were wrong when written; it was that nothing in the post pinned the
  revision to a date the author could check later. Every spec-citing post in
  steps 3 and 4 should carry the revision in its opening italic line, the way
  2.5 does.
- **Budget a measured control for every comparison.** The 1.5 cosine problem was
  one number placed beside another from a different distribution. It cost one
  script and ninety seconds to fix properly. The spec should ask for the control
  at write time rather than at review time.
- **The reference preamble is now boilerplate across four posts.** "Every vendor
  page below was fetched on <date>. These are living pages with no revision of
  their own and their paths move." It is correct and it is the largest source of
  text duplication in the series. Either accept it as a house form or move it to
  a single page the posts link.
