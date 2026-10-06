---
title: "Claude Code Plugins: What I Actually Use, and What a Plugin Even Is"
description: "I checked which Claude Code plugins I actually reach for, and found one I was certain I used and never had. What a plugin really is, the integrations that let me find developer-experience gaps instead of guessing at them, why an idle plugin is usually a role mismatch rather than a bad one, and where to start."
pubDate: 2026-10-06
tags: ["claude-code", "ai-assisted-coding", "developer-productivity", "plugins"]
cover: agent
coverVariant: 2
draft: false
---

## Install rate is not usage rate

I have far more Claude Code plugins installed than I use. Most people reading
this will too, and that gap is the subject of this post.

Not as a confession — installing is free, and an unused plugin is not a moral
failing. The gap is interesting because of what sits in it. Every "best plugins"
post I have read is a list of what the author installed, and nobody writes the
other half: the ones that turned out to be somebody else's tool, the ones doing a
job something you already had does better, and the ones that are genuinely good
and simply never fire. Those three are different problems with different fixes,
and only one of them is solved by uninstalling anything.

I also found, going through this, a plugin I would have told you I used daily and
have never once invoked. That story is further down. It is the most useful thing
in here, and I did not find it by remembering.

So: what a plugin actually is, the handful I genuinely reach for, the larger
group I don't and why, how to check your own set rather than trusting mine, and a
starting ladder if you have none yet.

None of it is about prompting or about how I decide what to build — those are the
[AI coding playbook](/engineering/ai-assisted-coding-playbook/) and
[spec-driven development](/engineering/spec-driven-development-tdd-bdd-ai-agents/)
respectively. This is only about the tools sitting in the session while that work
happens.

## What is in the box

A plugin is not a thing you use. It is a box, and the interesting question is
what somebody put in it.

[A Claude Code plugin](https://code.claude.com/docs/en/plugins) is a directory
with a manifest and any combination of skills, subagents, slash commands, hooks
and MCP servers. I went through the shapes of my own in
[the companion post](/engineering/harness-engineering-vocabulary/#how-it-is-packaged),
and the short version is that they have almost nothing in common structurally:
one ships a single agent, another a single command, another three MCP servers.

That matters here for one practical reason. "Is this plugin worth it" is never
one question — it is a question about whatever is inside, and the parts have very
different costs and very different trigger behaviour:

| Layer | Answers | Triggered by |
| --- | --- | --- |
| Skill | "How do I do X well?" | The model, on judgement |
| Subagent | "Who should do X, in its own context?" | The model delegating |
| Slash command | "Run X now" | You, explicitly |
| Hook | "This must happen every time" | The harness, deterministically |
| MCP server | "Talk to a system outside the repo" | Tool call |
| Settings / `CLAUDE.md` | "What is always true here?" | Always loaded |

That table is a reminder, not a lesson. I wrote the lesson separately — what each
layer is for, how they differ, and the same map in GitHub Copilot — in
[the words for the layer around the model](/engineering/harness-engineering-vocabulary/).
If any row is new to you, read that first and come back; the rest of this post
assumes it.

## The one rule this post needs

One line carries over, and it explains most of what follows:

> **Anything that must happen every time is a hook or a setting, never a skill.**

A skill is advice the model may route around when the session gets long. A hook
is the harness executing code. Both are useful; only one comes with a guarantee.
I defend that properly in the other post — here it matters because it is the
reason for one of the groups in my idle list below: good tools wired to a trigger
that depends on me remembering them, which I reliably do not.

**One caveat before the lists, because it shapes both of them.** The way I
checked this was to go through my session logs for skills invoked and tools
called, which is the only trace these things leave. Plugins that work through
hooks or language servers leave no trace at all: `security-guidance` runs on edit
and on stop, `typescript-lsp` answers code-intelligence queries, and neither will
ever show up.

That blind spot is worth sitting with, because of what it is blind to. The check
is silent about exactly the deterministic layer that the rule above calls the
most valuable. It is good at finding plugins you forgot you installed. It is bad
at valuing the ones that never needed your attention.

## What I actually use

In order of how much they changed my work.

**superpowers.** ([obra/superpowers](https://github.com/obra/superpowers))
Far and away the one that mattered, and the reason this list is short rather than
long. Two of its skills account for most of that on their own — the debugging one
and the brainstorming one — with its planning and test-first skills close behind.
What it replaced is not a tool, it is a habit. I used to start
coding before I had decided what I was building, and brainstorming-then-spec is
now the thing that happens instead. The cost is real and it is the point: it is
opinionated, and it slows the start of every piece of work on purpose. On a
genuinely small change that friction is not worth paying, and I skip it. That
deliberate slowness is also the thing I would least want a junior engineer to
turn off, for reasons I set out in
[learning to build software when AI writes the code](/leadership/learning-to-build-software-when-ai-writes-the-code/).

**deploy-on-aws.** Three MCP servers covering AWS
documentation, pricing and infrastructure-as-code validation. It replaced
tab-switching to the AWS docs and guessing at what something would cost, which
are two of the slowest parts of infrastructure work. The cost is the clearest
example of the context tax in my whole setup: three servers' worth of tool
definitions sit in every session I open, whether or not I touch AWS that day.

**datadog.** An MCP server over logs, metrics, traces, dashboards and monitors,
plus a few skills for setting it up. This one is in my day-to-day rather than my
occasionally: the thing it removes is the context switch out of the codebase and
into a browser tab in the middle of working out why something is behaving oddly.
Asking about an error rate where I am already reading the code that produces it
is a genuinely different experience from going and looking it up. Same cost as
any MCP plugin — tool definitions in every session — and the same discipline
applies: it is for reading production, not changing it.

**frontend-design.** Fires when I am building UI, and the output stops looking
like a template with the colours changed. Narrow by design — it does nothing at
all for the infrastructure work that is most of my week, so it fires rarely, and
that is the correct amount rather than a disappointing one.

**context7.** ([upstash/context7](https://github.com/upstash/context7))
Pulls current library documentation in over MCP. I reach for it rarely enough
that it is the weakest entry on this list, and I am not going to dress that up. I
keep it for one specific failure: the model confidently writing an API that was
renamed two versions ago, which costs an hour of debugging something that was
never going to work. Low frequency, high cost when it hits. By the standard of
this post it is on probation.

**mattpocock-skills.** Its `codebase-design` skill gave me a vocabulary for
module boundaries. I have used it once. It changed how I named a seam, and I kept
it for that — and I am listing it because leaving it out would have made my set
look tidier and more considered than it really is.

### The plugin I was sure I used, and have never used

Here is the part I did not expect to write.

My first pass at this had the `code-review` plugin confidently in the list above.
It is not in the list above, because every one of those reviews went to a Claude
Code **built-in** — `/review`, and a built-in also called `code-review` — neither
of which is a plugin at all. The plugin's own skill, the one that exists only
because I installed it, has never been invoked.

I had been using a built-in for months and crediting a plugin for it. Nothing
about my experience would ever have told me otherwise: the work got done, the
reviews were good, and the plugin's name sat right there in my installed list
looking like the explanation.

Two things follow. First, a plugin and a built-in sharing a name are different
things, and the ambiguity is not hypothetical — it fooled me while I was writing
a post about being rigorous. Second, and more usefully: I only know because I
went and looked. No amount of reflecting on my own workflow was going to surface
it, because my workflow felt exactly the same either way.

Where that plugin actually belongs is the first group of the next section.

## The ones that connect it to everything else

The list above is the plugins that change how I *work*. There is a second group
that changes what I can *see*, and I nearly left them out because they feel less
like tools and more like plumbing. That would have been a mistake, because they
are the ones I would miss first.

**GitHub.** Pull requests, issues, reviews and repository search, without leaving
the session. The obvious use is mechanical — open a PR, read a review thread. The
one I did not expect is using it to ask questions across repositories rather than
inside one: where a pattern got introduced, which teams hit the same problem, how
long a particular kind of change usually sits waiting. That is a different
activity from coding and it is the one that has changed how I spend my time.

**TeamCity.** Builds, logs, queues and agents from the same place I am reading
the code that failed. Diagnosing a red build normally means a browser tab, a
search through log output, and a reconstruction of what changed; doing it in the
session collapses all three, because the thing reading the log already has the
diff in front of it.

**Datadog**, which is in the list above, does the same job for runtime that
TeamCity does for the pipeline.

Those three together are why I think this category deserves its own heading.
Individually they each remove a context switch. Together they let me ask a
question I could not easily ask before: **where is the developer experience
actually bad?** Not where does it feel bad — where do the numbers say people are
waiting, retrying, or going around the process. Build times and failure rates
live in one of them, review latency in another, runtime noise in the third, and
when all three answer in the same conversation the gaps stop being anecdotes.
Most of the platform work I have picked up in the last year started as something
I noticed that way rather than something anyone reported.

**Slack.** The one that is least about my own work. Being able to search
discussions and threads from inside a session means that when someone asks me
something, I can go and read what they have already tried and what was already
said about it, instead of asking them to summarise it for me. The honest value is
not speed — it is that the answer I give is based on their actual situation
rather than my reconstruction of it.

A note on where these come from, because it matters for the point this post keeps
making. All four exist as plugins in the official marketplace: `github`, `slack`,
`teamcity-cli` — that one authored by JetBrains, and a skill around their CLI
rather than an MCP server — and `datadog`. But several of them are *also*
available as connectors you can enable without installing a plugin at all, and if
you have the connector you do not need the plugin. Check which one you are
actually running before you install the other. I did not, which is how I ended up
with the story in the previous section.

## The ones I don't

Before the names: **idle is not the same as bad**, and of the four reasons a
plugin sits unused, only one is a reason to uninstall anything. The reason is the
whole lesson here. "I don't use it" tells you about my week; it tells you nothing
about the plugin.

**Doing a job something else already does.** `code-review` — the one above —
because Claude Code's built-in review does it and I reach for that
without thinking. `code-simplifier`, because the cleanup it offers overlaps the
review pass I already run. `skill-creator` and `feature-dev`, because
`superpowers` covers both — its own skill tooling, and a feature workflow I had
already settled into before I installed anything else. This is the only group where
"remove it" is reasonable advice, and even then it is *pick one*, not *this one is
worse*. Two tools competing for the same moment is a cost, because the model has
to choose between them and you will not see which it chose.

**Right job, wrong role.** The big group, and the reason a best-plugins list
without a job title attached is nearly useless. `superdesign` is dead weight on
my infrastructure work and would be somebody's most-used plugin if they designed
interfaces for a living. `claude-security` is a deliberate deep scan that I run
occasionally and that a security consultant would run weekly. Nothing is wrong
with either of them. They are not wrong *for me*, and that is a different
sentence.

**Right job, wrong trigger.** `claude-md-management` and `hookify` are both good
and both wait for me to remember a command. I don't. This is the slash-command
failure mode showing up in my own habits, which is a more uncomfortable way to
learn it than reading about it.

**Idle on paper, probably not idle.** `security-guidance` works through hooks and
`typescript-lsp` through a language server, so neither leaves the kind of trace I
was looking for. They are in this section because that is where my method put
them, and I think my method is wrong about them.

`typescript-lsp` is the one I would defend hardest. TypeScript is not what I
write most days, which is exactly why I want a language server answering for me
when I am in it — and I am in it more than that sentence suggests, because the
places where application code meets infrastructure code tend to be the places
where I am least fluent and most likely to edit the wrong symbol. A language
server is cheap, silent, and most useful precisely when you are working somewhere
you do not live.

There is one more I am not naming, because it comes from a private team
marketplace. That is itself a small illustration of the last section: a plugin
can be built for an audience of one team, and that is a perfectly good reason for
it to exist.

Two things follow, and they are the useful output of the whole exercise.

For the role group: keep it if you expect to change hats, drop it if you don't —
and if you are ever recommending a set to a team, split the recommendation by
role rather than publishing one list and letting everyone take the whole thing.
Most of what I don't use would be somebody else's core.

For the trigger group: the fix is not more discipline. I have had months to
remember those commands and I have not. The fix is to change the trigger — move
the behaviour to a hook, or put a line in `CLAUDE.md` so the model raises it
instead of waiting for me. That is the rule from the top of this post, applied to
my own set, and it is the one change I am actually going to make.

## Count your own

You should not take my list on faith, and you do not have to. Claude Code keeps
session transcripts as JSONL under `~/.claude/projects/`, and every skill
invocation and tool call is in there. Two commands will tell you which of your
plugins have ever actually fired.

```bash
# Which skills fired, deduplicated by tool-call id
grep -rhoE '"id":"toolu_[A-Za-z0-9]+","name":"Skill","input":\{"skill":"[^"]+"' \
  ~/.claude/projects --include='*.jsonl' \
  | sed 's/.*"id":"\(toolu_[A-Za-z0-9]*\)".*"skill":"\([^"]*\)"/\1 \2/' \
  | sort -u | awk '{print $2}' | sort | uniq -c | sort -rn

# Which plugin MCP tools were called, same treatment
grep -rhoE '"id":"toolu_[A-Za-z0-9]+","name":"mcp__plugin_[a-z0-9_-]+' \
  ~/.claude/projects --include='*.jsonl' \
  | sed 's/.*"id":"\(toolu_[A-Za-z0-9]*\)","name":"mcp__plugin_\([a-z0-9-]*\).*/\1 \2/' \
  | sort -u | awk '{print $2}' | sort | uniq -c | sort -rn
```

Those are uglier than they look like they should be, and the ugliness is the
lesson — three things will mislead you if you take the obvious shortcut, and I
walked into all three.

**Deduplicate by tool-call id.** A single call gets written into the transcript
more than once, so anything built on a plain `grep -c` runs high. That is why
both commands pull the `toolu_` id and `sort -u` on it. I had a full set of
inflated figures before I noticed, and nothing about them looked wrong, because
inflating everything leaves the ranking intact.

**Do not filter on the namespaced `plugin:skill` form alone.** It is tempting,
because a colon reliably means a plugin. But Claude Code began namespacing skill
names partway through the period most transcripts cover, so older plugin calls
are recorded bare, and filtering on the colon silently drops them. It hid half of
one plugin's usage from me.

**A namespaced name is not automatically a plugin.** The first command also
returns bundled skill sets that ship with Claude Code. Check whatever it reports
against your actual installed list rather than assuming the two agree.

The inverse of that last point is how I got caught: a bare name may be a built-in
*or* an old plugin record, and the only way to tell is whether you have a plugin
by that name and when the calls happened. My `code-review` calls were recent —
after namespacing started — so they were the built-in.

Two further limits. You are measuring the sessions still on disk, not all of
history. And, as above, hook-driven and language-server plugins never appear, so
read silence as "left no trace" rather than "did nothing". If you would rather
not grep, the official `session-report` plugin gives you a per-session breakdown
of tokens, subagents and skills.

Run it before you trust anyone's recommendations, including mine. It takes a
minute, and it is the only way to find out whether your setup is helping you or
just resident.

## What a plugin costs you

Three costs, in the order you will meet them.

**Context.** Every installed plugin's skill descriptions, and every connected MCP
server's full tool definitions, are in your prompt before you type a character.
Skills are cheap — a name and a line. MCP servers are not: a server exposes its
whole tool list with names, descriptions and parameter schemas. My own largest
bill is `deploy-on-aws`, which is three servers, and I pay it on days I never
touch AWS. That is a trade I have decided to make; the point is that it is a
trade and most people have never priced it.

**Trigger collisions.** When two things have overlapping descriptions the model
picks one, and you do not get told which. My own set has the built-in review
skill competing with the `code-review` plugin — the exact collision that fooled
me above — and two different `skill-creator`s. Nothing breaks. You just stop
being able to reason about which thing ran.

**Drift.** Plugins install from a git repository and update under you. A workflow
that behaved one way last month can behave differently today, and the first sign
is usually output that feels subtly off rather than an error. I do not pin mine,
because I would rather have the improvements — but I read the release notes when
something I rely on starts acting differently, instead of assuming I imagined it.

## Where to start, if you are starting now

A ladder, not a catalogue. Everything here is Anthropic-authored and from the
[official marketplace](https://github.com/anthropics/claude-plugins-official),
which is large enough that browsing it is its own afternoon. These are the ones I
would reach for first.

- **First, before anything**: `claude-code-setup`. It reads *your* codebase and
  recommends hooks, skills and subagents for it. Letting it tell you what you
  need beats copying someone else's list, including this one.
- **One workflow plugin**: `superpowers` for the full process ladder, or
  `feature-dev` if you want something lighter and feature-shaped.
- **Review**: `code-review`, or `pr-review-toolkit` if you would rather have
  reviewers separated by concern — tests, error handling, type design.
- **Language intelligence**: `pyright-lsp`, `typescript-lsp`, `gopls-lsp`,
  `rust-analyzer-lsp` and the rest. Nearly free in prompt terms and they stop a
  whole class of edits to the wrong symbol.
- **Safety nets**: `security-guidance`, which is hook-driven and therefore works
  without you remembering anything, and `claude-security` for a deliberate deep
  scan.
- **Housekeeping**: `commit-commands`, `claude-md-management`, `session-report`.
- **Building your own**: `plugin-dev` for a plugin, `skill-creator` for a single
  skill.

Then, separately from that ladder, the integrations: `github`, `slack`,
`datadog`, and `teamcity-cli` if you are on TeamCity. These are not
Anthropic-authored — `teamcity-cli` is JetBrains', the others are vendor
integrations — and they are the ones I would add first after the basics, for the
reasons in the section above. Check whether you already have the equivalent as a
connector before installing any of them.

Several of those — `feature-dev`, `code-review`, `claude-security`,
`claude-md-management` — are in my idle list above. That is not a contradiction I
want to hide: they are recommended on their merits, and they are idle for me
because something else got there first, or because of role and trigger reasons. If you install them, the thing worth doing is deciding up front how they
will fire, rather than trusting yourself to remember.

## Marketplaces your team controls

The last piece is how any of this reaches other people.

Running a private marketplace is a pattern I covered mechanically in the
companion post, so here is only the part that belongs in a post about what to
install: **why a team should bother**, when the obvious alternative is one long
shared `CLAUDE.md` that everyone already has.

The answer is everything this post has been about. A shared instructions file
is always-loaded, so every rule in it taxes every prompt from every person,
including the rules that only matter to one repository. A plugin versions
properly, scopes to the repos that need it, and its skills load on demand. The
difference is not organisational tidiness. It is that one of them scales with
your team and the other gets slowly worse as it grows.

## References and further reading

Checked on 6 October 2026.

**Claude Code documentation**

- [Plugins](https://code.claude.com/docs/en/plugins) and
  [plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) —
  what a plugin contains, and how to publish or install a marketplace.
- [Skills](https://code.claude.com/docs/en/skills) and
  [slash commands](https://code.claude.com/docs/en/slash-commands) — the two
  triggers that most plugin behaviour arrives through.
- [Hooks](https://code.claude.com/docs/en/hooks) and
  [settings](https://code.claude.com/docs/en/settings) — the deterministic layer,
  and the fix for everything in my "wrong trigger" group.
- [MCP](https://code.claude.com/docs/en/mcp) — the protocol behind the most
  expensive plugins in context terms.
- [Memory and `CLAUDE.md`](https://code.claude.com/docs/en/memory) — the
  always-loaded alternative that a team marketplace replaces.

**The marketplace and the plugins named above**

- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
  — the official marketplace.
- [Superpowers](https://github.com/obra/superpowers), by Jesse Vincent.
- [Context7](https://github.com/upstash/context7), by Upstash.
