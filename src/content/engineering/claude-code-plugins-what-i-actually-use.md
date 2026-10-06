---
title: "Claude Code Plugins: What I Actually Use, and What a Plugin Even Is"
description: "Seventeen plugins installed, five actually used — counted from my own session logs, including the one the count proved I was wrong about. What a plugin really is, why an idle plugin is usually a role mismatch rather than a bad plugin, and which official ones are worth starting with."
pubDate: 2026-10-06
tags: ["claude-code", "ai-assisted-coding", "developer-productivity", "plugins"]
cover: agent
coverVariant: 2
draft: false
---

## Install rate is not usage rate

I have seventeen Claude Code plugins installed. I use five.

I know that because I counted, and I am leading with it because the counting is
the only interesting part. Every "best plugins" post I have read is a list of
what the author installed, and installing is free. What costs you something is
the plugin that sits in every prompt you send and never earns it, and you cannot
find those by remembering — I tried, and the count caught me claiming daily use
of a plugin I have never once invoked. That story is further down, because it
turned out to be the most useful thing in here.

This post is three things: a short account of what a plugin actually is, the five
I use with the numbers behind them, and the twelve I don't — grouped by *why*,
because only one of those reasons is a reason to uninstall anything. Then the
method, so you can run it against your own set, and a starting ladder if you have
none yet.

Every number was counted on 6 October 2026 from my own session logs.

## What is in the box

A plugin is not a thing you use. It is a box, and the interesting question is
what somebody put in it.

[A Claude Code plugin](https://code.claude.com/docs/en/plugins) is a directory
with a manifest and any combination of skills, subagents, slash commands, hooks
and MCP servers. "Any combination" is literal, and you can see it in the four I
have open right now: `superpowers` ships skills and hooks; `code-simplifier`
ships a single agent and nothing else; `code-review` ships one command;
`deploy-on-aws` ships skills, hooks and three MCP servers. Four plugins, four
different shapes. The word tells you how something was delivered, not what it is.

Which means you cannot judge a plugin without knowing those parts:

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
reason roughly a third of my installed plugins have never fired. They are good
tools wired to a trigger that depends on me remembering them.

**Before any number: what this method cannot see.** I counted skill invocations
and MCP tool calls, because those are what the logs record. Plugins that work
through hooks or language servers never appear as either. `security-guidance`
runs on edit and on stop; `typescript-lsp` answers code-intelligence queries. Both
will read as zero below no matter how much they did for me, and I have no way to
measure them from here.

That blind spot is worth sitting with, because of what it is blind to. The method
under-reports exactly the deterministic layer that the rule above says is the most
valuable one. A count like this is good at finding plugins you forgot you
installed. It is bad at valuing the ones that never needed your attention.

## What I actually use

Five, in order of how much they changed my work. Counts are invocations from my
session logs, 6 October 2026.

**superpowers — 91 invocations.** ([obra/superpowers](https://github.com/obra/superpowers))
Far and away the one that mattered, and the reason this list is short rather than
long. The breakdown is more interesting than the total: systematic-debugging 25,
brainstorming 23, writing-plans 12, test-driven-development 10, then
executing-plans, verification-before-completion and subagent-driven-development
behind them. What it replaced is not a tool — it is a habit. I used to start
coding before I had decided what I was building, and brainstorming-then-spec is
now the thing that happens instead. The cost is real and it is the point: it is
opinionated, and it slows the start of every piece of work on purpose. On a
genuinely small change that friction is not worth paying, and I skip it.

**deploy-on-aws — 43 MCP tool calls.** Three MCP servers covering AWS
documentation, pricing and infrastructure-as-code validation. It replaced
tab-switching to the AWS docs and guessing at what something would cost, which
are two of the slowest parts of infrastructure work. The cost is the clearest
example of the context tax in my whole setup: three servers' worth of tool
definitions sit in every session I open, whether or not I touch AWS that day.

**frontend-design — 6 invocations.** Fires when I am building UI, and the output
stops looking like a template with the colours changed. Narrow by design — it
does nothing at all for the infrastructure work that is most of my week, which is
why six is the right number rather than a disappointing one.

**context7 — 2 MCP tool calls.** ([upstash/context7](https://github.com/upstash/context7))
Pulls current library documentation in over MCP. Two calls is not a strong
endorsement and I am not going to dress it up as one. I keep it because of what
those two calls were for: the specific failure where a model confidently writes
an API that was renamed two versions ago, which costs an hour of debugging
something that was never going to work. Low frequency, high cost when it hits.

**mattpocock-skills — 1 invocation.** Its `codebase-design` skill gave me a
vocabulary for module boundaries. I used it once, it changed how I named a seam,
and I kept it for that. One use is one use; I am listing it because leaving it
out would have made my set look tidier than it is.

### The plugin I was sure I used, and have never used

Here is the part I did not expect to write.

My first pass at this counted thirteen uses of the `code-review` plugin and put
it confidently in the list above. It is not in the list above, because that count
was wrong. The thirteen were Claude Code's **built-in** review skill, which is
not a plugin at all. The plugin's own skill — the one that only exists because I
installed it — has been invoked **zero** times.

I had been using a built-in for months and crediting a plugin for it. Nothing
about my experience would ever have told me otherwise: the work got done, the
reviews were good, and the plugin's name was right there in my installed list
looking like the explanation.

Two things follow. First, a plugin and a built-in with the same name are
different things, and the ambiguity is not hypothetical — it fooled me while I
was writing a post about being rigorous. Second, and more usefully: the only
reason I know is that I counted, and the method caught an error the author of the
method was making. That is the whole argument for the section further down.

Where that plugin actually belongs is the first group of the next section.

## The twelve I don't

Before the names: **idle is not the same as bad**, and of the four reasons a
plugin sits unused, only one is a reason to uninstall anything. The reason is the
whole lesson here. "I don't use it" tells you about my week; it tells you nothing
about the plugin.

**Doing a job something else already does.** `code-review` — the one the count
caught — because Claude Code's built-in review does it and I reach for that
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
occasionally and that a security consultant would run weekly. `datadog` belongs
to whoever owns the dashboards, which on my team is not me. `typescript-lsp`
earns its place in a TypeScript product codebase; mine is AWS CDK, where the win
is thinner. Nothing is wrong with any of these. They are not wrong *for me*, and
that is a different sentence.

**Right job, wrong trigger.** `claude-md-management` and `hookify` are both good
and both wait for me to remember a command. I don't. This is the slash-command
failure mode showing up in my own data, which is a more uncomfortable way to
learn it than reading about it.

**Measured as zero, probably not zero.** `security-guidance` works through hooks
and `typescript-lsp` through a language server, so neither can appear in a count
of invocations. I am listing them in the idle section because that is where the
numbers put them, and flagging that the numbers are wrong about them.

That is eleven names. The twelfth comes from a private team marketplace and I am
not going to name it here, which is itself a small illustration of the last
section: a plugin can be built for an audience of one team, and that is a
perfectly good reason for it to exist.

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

The method is two commands. Claude Code keeps session transcripts as JSONL under
`~/.claude/projects/`, and every skill invocation and tool call is in there.

```bash
# Which plugin skills actually fired
grep -rhoE '"skill":"[a-z0-9_-]+:[a-z0-9_:-]+"' ~/.claude/projects --include='*.jsonl' \
  | sort | uniq -c | sort -rn

# Which plugin MCP tools were called
grep -rho '"name":"mcp__plugin_[a-z0-9_-]*' ~/.claude/projects --include='*.jsonl' \
  | sed 's/.*mcp__plugin_//' | cut -d_ -f1 | sort | uniq -c | sort -rn
```

The detail that matters is in the first regex, and it is the one I got wrong the
first time: match the **namespaced** form, `plugin:skill`. An unqualified name in
those logs may be a built-in that happens to share a name with something you
installed. Counting unqualified names is how I ended up crediting a plugin with
thirteen uses it never had.

Two limits. The counts are retention-bound — you are measuring the sessions still
on disk, not all of history. And, as above, hook-driven and language-server
plugins will not show up at all, so read a zero as "no recorded invocation"
rather than "did nothing". If you would rather not grep, the official
`session-report` plugin produces a per-session breakdown of tokens, subagents and
skills.

Run it against your own set before you trust anyone's recommendations, including
mine. It takes a minute and it is the only way to find out whether your setup is
helping you or just resident.

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
skill competing with the `code-review` plugin — the exact collision that produced
my miscount — and two different `skill-creator`s. Nothing breaks. You just stop
being able to reason about which thing ran.

**Drift.** Plugins install from a git repository and update under you. A workflow
that behaved one way last month can behave differently today, and the first sign
is usually output that feels subtly off rather than an error. I do not pin mine,
because I would rather have the improvements — but I read the release notes when
something I rely on starts acting differently, instead of assuming I imagined it.

## Where to start, if you are starting now

A ladder, not a catalogue. Everything here is from the
[official marketplace](https://github.com/anthropics/claude-plugins-official) and
authored by Anthropic — 39 of its 315 plugins are, and these are the ones I would
reach for first.

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

Four of those — `feature-dev`, `code-review`, `claude-security` and
`claude-md-management` — are in my idle list above. That is not a contradiction I
want to hide: they are recommended on their merits, and they are idle for me
because something else got there first, or because of role and trigger reasons. If you install them, the thing worth doing is deciding up front how they
will fire, rather than trusting yourself to remember.

## Marketplaces your team controls

The last piece is how any of this reaches other people.

A [marketplace](https://code.claude.com/docs/en/plugin-marketplaces) is a git
repository with a manifest listing plugins. The official one is public; nothing
stops a team from running its own. Put your deployment runbooks, your house
conventions, your review rules in a plugin, publish it from a private repo, and
installing it becomes one command for everyone who needs it.

The reason I prefer that to the obvious alternative — one long shared
`CLAUDE.md` — is everything this post has been about. A shared instructions file
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
