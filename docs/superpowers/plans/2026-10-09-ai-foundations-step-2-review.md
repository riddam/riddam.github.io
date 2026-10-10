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
| 2.10 The Whole Thing, Annotated | `the-whole-thing-annotated` | 16 min | 2 | `mirror`/3 |
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

## The whole-branch review, and the second fix wave

The finished branch went to a whole-branch review, which came back *ship after
three one-line fixes* — and called the series' voice and shape better than
eleven independent agents has any right to produce, with the no-duplication rule
holding across all sixteen posts. Four of the five findings this sweep had
skipped were upheld as genuinely fine. Ten findings came back; all ten are now
fixed.

**The three that blocked.**

1. **The map promised a cold start its own routes deny.** "Each goes straight to
   the post that explains it, and none of them needs the ones before it" — and
   all four targets open by naming a prerequisite in their second paragraph.
   It is the first sentence a lost reader reads. Reworded: each route still goes
   straight to the question, and the page now says each post names what it
   assumes within a paragraph, so you back up only when told to.
2. **The false promise fixed in 2.9 survived in 2.8.** Its closing also said the
   post after next "puts a whole assembled request on the page at once". Fixed
   the same way.
3. **"The description is the trigger" survived on the map.** 2.8 measured this
   and disproved it; its own TL;DR says the name *and* the description. The
   earlier decision to leave 2.8's heading alone stands, because the corrected
   caption sits right under it — but the map has no caption and is where a
   reader meets the claim first. The map now says both.

**The seven others.** 2.9's ~36,000-token child-window floor was attributed to
2.6's ladder, which 2.6 measures at 23k and 29,732; three numbers for one
mechanism with nothing reconciling the third, now named as three vantage points
with the gap acknowledged rather than papered over. 2.7's most quotable sentence
— "an instruction file held thirteen times in fifteen" — now carries its
instrument in both places it appears; it was the only claim in the series the
reviewer found outrunning its evidence. The capstone gained the spec-mandated
**Try it yourself**, which it is better suited to than any other post in the
series because every script in it runs against the reader's own transcripts with
no model and no key; 2.5 still has none, deliberately, because exercises there
would be attack recipes. 2.6 gained the house date-hedging preamble, which it
needed most of any post and had least. 2.10's "27 tests" now reconciles with the
28 a reader will actually see, without falsifying the snapshot it describes.
2.10's description said "to merged change" when nothing merged; it now says
landed commits, as the post itself does.

**The model-ID finding did not survive checking.** It looked like an
inconsistency — 2.6, 2.9 and 2.10 cite `claude-opus-5` against 1.6's table of
`claude-opus-5-5` — but checked against the `claude-api` skill, both are real,
current, differently priced models in the same line, and 1.6's claim that every
ID is a pinned snapshot is exactly right. Renaming anything would have made
three posts misreport what they ran on. 1.6 gained one clause instead: read the
whole string, because `claude-opus-5` is the previous model in that line, not a
short form of `claude-opus-5-5`.

**The two revisits.** `updatedDate` is gone from 2.3 and from
`what-a-model-actually-is` — both unpublished, both had the field set by this
series' own work, and on an unpublished post it is noise that will mislead
later. It stays on `harness-engineering-vocabulary`,
`claude-code-plugins-what-i-actually-use` and `ai-assisted-coding-playbook`,
which are genuinely published and genuinely were revised afterwards. And 1.2 and
1.3 swapped `pubDate`, so reading order and publication order now agree in the
section index, the archive and RSS.

## Refresh schedule

The reviewer's dating of what will rot first, kept here because nothing else in
the repository records it.

| Within | What to re-check |
|---|---|
| Three months | 1.6's price table and its cost script — the prices are current as of writing and are the fastest-moving numbers in the series. |
| Three to six months | The MCP wire-versus-page split across 2.3, 2.4 and 2.5. The day an SDK negotiates `2026-07-28` through `initialize`, all three need re-reading together. |
| Three to six months | Claude Code version facts: the 2.1.205 captures, `onFailure: "block"`, the `/context` output format, `plugin details`, the subagent default, and the `subagents/*.jsonl` layout. |
| Six to twelve months | The fourteen `code.claude.com/docs/en/*` paths, plus the VS Code and Copilot pages. Four already moved during this one sweep. |

On the open question of whether to centralise the "fetched on 10 October 2026 …
paths move" preamble: the ruling is to leave it as house form. Four posts
repeating one disclosure sentence is cheaper than a shared partial, and a fix
wave is the wrong place to add a mechanism.

## Still open for the repo owner

1. **Four skipped parked findings stand**, upheld on review: the
   `content-rules.test.ts` variant assertion and the `Cover.astro` per-render
   lookup (both brief-mandated and harmless), 2.8's "twenty-five session
   transcripts" (covered by the post's own snapshot caveat), and task 12's
   assertion matching only `/engineering/<slug>/`, which would falsely fail a
   future `ai-foundations` post filed under `leadership/`. That last one is the
   only one with a future cost, and it is cheap to fix the day a cross-section
   post exists.
2. **2.8's section 03 heading still reads "The description is the interface".**
   The map is fixed and 2.8's corrected caption sits under the heading, so this
   is no longer anywhere a reader meets the claim cold. Changing it means
   changing a brief-mandated diagram node; left as a judgement call.
3. **Two diagrams are reinforcement rather than explanation** — 2.10's triage
   tree and 1.5's chunk-boundary tree. Both defensible. If the house rule is
   ever tightened to "a diagram must show something the prose cannot", these are
   the two to revisit.
4. **2.10's timeline diagram is 2,190 px wide**, the widest in the series, after
   its solid edges were labelled. It scrolls in its container as the house rules
   intend, and reads correctly in both themes, but it is the one to trim if
   scrolling diagrams ever stop being acceptable.
5. **Nothing is pushed.** Eighteen posts, two complete tracks and a map are
   sitting on `main` locally, waiting on a publishing decision that is yours.

## What steps 3 and 4 should change in the spec

- **The local-model technique is now load-bearing, not a workaround.** Every
  number in sixteen posts came off `Qwen2.5-0.5B`, `Qwen2.5-3B-Instruct` or
  `all-MiniLM-L6-v2` on a laptop. Steps 3 and 4 should state it as the method up
  front instead of specifying hosted models and discovering the constraint again.
- **Name the instrument every time the number is quotable.** The one claim the
  whole-branch review found outrunning its evidence was 2.7's "held thirteen
  times in fifteen", disclosed properly at the top of the post and then repeated
  twice without it. The rule is not "disclose once"; it is "disclose wherever
  the sentence could be lifted out".
- **Two diagrams per post looks like the right number.** The only three-diagram
  post in the series, 2.1, draws the loop twice — once as a flowchart and once
  as a sequence diagram of the same round trip. Both are good drawings and the
  third still earns less than the other two. Steps 3 and 4 should treat "three
  where the brief says so" as something to justify rather than something to use.
- **Say which revision, and say it once per post.** The 2.3 problem was not that
  the URLs were wrong when written; it was that nothing in the post pinned the
  revision to a date the author could check later. Every spec-citing post in
  steps 3 and 4 should carry the revision in its opening italic line, the way
  2.5 does — and every post citing a living vendor page should carry the
  fetched-on preamble, which 2.6 was missing and needed most.
- **Budget a measured control for every comparison.** The 1.5 cosine problem was
  one number placed beside another from a different distribution. It cost one
  script and ninety seconds to fix properly. The spec should ask for the control
  at write time rather than at review time.
- **A forward promise made in one post is a cross-post claim.** The same false
  promise about the capstone appeared in 2.8 and 2.9, written by different
  tasks, and the first sweep caught only one of them. Any sentence describing a
  post that does not exist yet should be checked against that post the day it
  lands, in every post that makes it.
- **The entry page is the last thing to write and the first thing to re-check.**
  The map's opening sentence contradicted four posts it routes to, which could
  only have been caught by reading the map against its targets after they
  existed. Steps 3 and 4 should schedule that read explicitly.
