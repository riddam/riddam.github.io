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
I use with the numbers behind them, and the eleven I don't — grouped by *why*,
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

## The eleven I don't

## Count your own

## What a plugin costs you

## Where to start, if you are starting now

## Marketplaces your team controls

## References and further reading
