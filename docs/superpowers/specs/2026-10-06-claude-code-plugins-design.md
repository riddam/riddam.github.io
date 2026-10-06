# Claude Code plugins — what I actually use, and what a plugin even is

**Date:** 2026-10-06
**Status:** approved design, blocked on a dependency — see "Publication order"

**Section:** `engineering`
**Slug:** `claude-code-plugins-what-i-actually-use`

## Problem

Two problems, and the post has to solve both or it is just a listicle.

**The vocabulary problem.** A plugin is not a skill, a subagent, a command, a
hook, an MCP server or a setting — it is a box that ships any combination of
them. You cannot reason about which plugins are worth installing without that
vocabulary, and nothing on this site teaches it.

That problem is big enough to be its own post, and it now is: see
`2026-10-06-harness-engineering-design.md`, which teaches the whole harness
surface across Claude Code and GitHub Copilot. **This post assumes it.** Its job
is narrower and more practical: which plugins actually make a working engineer
faster, and how to tell.

**The honesty problem.** Every "best plugins" post lists what the author
installed. Install rate is not usage rate. I have seventeen plugins installed and
I genuinely use six of them. The interesting half of that sentence is the other
eleven, and nobody writes that half.

## Publication order

The harness-engineering post publishes first. This post opens with a short recap
and links to it rather than re-teaching the layers. If that order changes,
section 2 has to grow enough to stand alone — flag it rather than quietly
expanding.

## Goal

A reader finishes able to (a) judge whether a given plugin earns its place for
*their* role, (b) audit their own plugin set against real usage instead of
vibes, and (c) pick a starting set from the official marketplace without
installing seventeen things first.

## Non-goals

- **No teaching the layers.** Section 2 is a recap with a link. The moment it
  starts explaining how the model chooses a skill, or what a hook intercepts,
  that text belongs in the harness-engineering post.
- **No prompting advice.** That is the
  [AI coding playbook](/engineering/ai-assisted-coding-playbook/). Link, never
  restate.
- **No spec/plan workflow explanation.** That is the
  [SDD post](/engineering/spec-driven-development-tdd-bdd-ai-agents/), which
  already has a "Running it in Claude Code" section. The plugins post may say
  *which plugin* runs that loop; it must not re-teach the loop.
- **No employer named.** The private-marketplace section describes the pattern —
  a team publishing its own plugins from a private git repo — with no company,
  no internal plugin names, no internal tool names. This is the site-wide
  anonymisation rule.
- **No non-official plugins.** Recommendations come only from the official
  marketplace (`anthropics/claude-plugins-official`). Third-party vendor plugins
  in that marketplace are fine to mention as a category; the named
  recommendations are Anthropic-authored.
- **No plugin-authoring tutorial.** `plugin-dev` gets a pointer, not a chapter.
- **No screenshots.** Terminal output as fenced code blocks only.
- **No emoji.**

## Audience

A working engineer who already uses Claude Code daily, has installed at least one
plugin, and is not sure whether their set is helping. Secondary audience: a team
lead deciding what to standardise on.

## Evidence base

Every usage claim in the post comes from counting real invocations in my own
session transcripts under `~/.claude/projects/**/*.jsonl`, not from the install
list. The counting technique is itself a section of the post, so the reader can
repeat it.

Counts as of 2026-10-06:

| Plugin | Evidence |
| --- | --- |
| `superpowers` | brainstorming 23, systematic-debugging 23, writing-plans 10, test-driven-development 8, subagent-driven-development 6, executing-plans 5, verification-before-completion 4, requesting-code-review 1, finishing-a-development-branch 1 |
| `deploy-on-aws` | 43 MCP tool calls |
| `code-review` | 13 invocations |
| `frontend-design` | 12 invocations |
| `context7` | 2 MCP tool calls |
| `mattpocock-skills` | 1 (`codebase-design`) |
| Installed, zero invocations | `claude-security`, `hookify`, `skill-creator`, `code-simplifier`, `typescript-lsp`, `superdesign`, `datadog`, `claude-md-management`, `security-guidance` |

Two honesty caveats that must appear in the post:

1. A zero count does not mean the plugin did nothing. Hook-only plugins
   (`security-guidance`) and LSP plugins (`typescript-lsp`) work without ever
   being invoked as a skill, so they will read as zero no matter how useful they
   are. The method measures *skill and tool invocations*, and the post must say
   so before the table, not after.
2. Counts are mine, on my work — infrastructure, Python, TypeScript, this blog.
   They are an argument for auditing, not a ranking anyone should copy.

Before publishing, re-run the counts and refresh the table. The numbers above
will be stale within weeks.

## Structure

Nine sections. Target 14–18 minutes.

### 1. The box, not the thing

A plugin is a distribution format. Open one and you find directories:
`skills/`, `agents/`, `commands/`, `hooks/`, and an MCP server declaration. Show
this concretely by listing what the installed plugins actually ship — `superpowers`
ships skills and hooks; `code-simplifier` ships one agent and nothing else;
`code-review` ships one command; `deploy-on-aws` ships skills, hooks and three MCP
servers. The point lands because the directory listing proves it.

### 2. What is in the box (recap, not a lesson)

A compact table, one line per layer, as a refresher — then a link to the
harness-engineering post, which teaches this properly. This post does not define
the terms; it assumes them.

| Layer | Answers | Triggered by |
| --- | --- | --- |
| Skill | "How do I do X well?" | The model, on judgement |
| Subagent | "Who should do X, in its own context?" | The model delegating |
| Slash command | "Run X now" | You, explicitly |
| Hook | "This must happen every time" | The harness, deterministically |
| MCP server | "Talk to a system outside the repo" | Tool call |
| Settings / CLAUDE.md | "What is always true here?" | Always loaded |

Keep this under 150 words of prose around the table. If it starts explaining,
it belongs in the other post.

### 3. The one rule this post needs

**Anything that must happen every time is a hook or a setting, never a skill.**
Stated once, defended in a paragraph, and used later: it is the reason half my
installed plugins sit idle, and it is the fix I recommend in section 5. The
*why* — how the model decides to invoke a skill, and why a hook is categorically
different — goes in the harness-engineering post.

### 4. My working set

Six plugins. Each gets: what it is, when it actually fires, what it replaced, and
one cost. Order by how much it changed my work.

- **superpowers** — the big one, and the reason the rest of this list is short.
  Brainstorm-before-build and systematic-debugging are the two that changed my
  defaults. Cost: it is opinionated and it will slow you down on purpose.
- **deploy-on-aws** — MCP servers for AWS docs, pricing and IaC validation.
  Replaced tab-switching to AWS docs and guessing at cost. Cost: three MCP
  servers' worth of tool definitions in every session.
- **code-review** — a slash command that fans out to specialised reviewers with
  confidence filtering. Replaced "review this diff" prompts that returned
  nitpicks. Cost: it is a command, so it only runs when I remember.
- **frontend-design** — fires when building UI, and the output stops looking
  templated. Cost: narrow — it does nothing for backend work.
- **context7** — live library docs by MCP. Low usage, high value when it fires,
  because it fixes exactly the API-hallucination failure. Cost: another server.
- **mattpocock-skills** — a vocabulary for module design. Honest framing: I used
  it once, it changed how I named a seam, and I kept it for that.

### 5. The half I don't use

The framing that matters: *idle is not bad*. A plugin sits idle for one of three
reasons, and only one of them is a reason to uninstall. Name each plugin, say
which group it is in, and say who it would be right for.

- **Doing a job something else already does.** `code-simplifier` overlaps the
  review pass I already run; `skill-creator` overlaps `superpowers`' own skill
  tooling. Duplication is the honest reason to remove one, and the only group
  where "uninstall it" is the advice.
- **Right job, wrong role.** This is the big one, and it is why a "best plugins"
  list is useless without knowing whose desk it came from. `superdesign` is
  dead weight on my infrastructure work and would be central for a designer.
  `claude-security` is a deliberate deep-scan tool I reach for rarely and a
  security consultant would run weekly. `datadog` belongs to whoever owns the
  dashboards. `typescript-lsp` earns its place in a TypeScript product codebase;
  mine is CDK, where the win is smaller. Nothing is wrong with any of them —
  they are not wrong *for me*.
- **Right job, wrong trigger.** `claude-md-management` and `hookify` are both
  good and both wait for me to remember a command. That is the slash-command
  failure mode, showing up in my own data.

Close on the two actions that follow. For group two, keep the plugin if you
expect to change hats, drop it if you don't — and if you are handing a set to a
team, split the recommendation by role rather than publishing one list. For group
three, the fix is not better discipline, it is converting the trigger to a hook
or a line in `CLAUDE.md`.

### 6. Count your own

The technique, as a runnable snippet against `~/.claude/projects/**/*.jsonl`:
count `"skill":"..."` occurrences, count `subagent_type`, count `mcp__` tool
names. State the limitation from the evidence section before the snippet — hooks
and LSPs do not appear. Mention `session-report` (official, Anthropic-authored)
as the packaged alternative for per-session token and skill accounting.

### 7. What it costs

Three costs, concretely:

- **Context.** Every plugin's skill descriptions and every MCP server's tool
  definitions are in the prompt before you type. MCP-heavy plugins are the
  expensive ones.
- **Trigger collisions.** My session lists three `code-review`-shaped entries —
  the built-in one, `code-review`'s command, and `mattpocock-skills`' two-axis
  review — and two `skill-creator`s. When descriptions overlap, the model picks
  one, and which one is not obvious. Use only public, official examples here.
- **Drift.** Plugins update under you on a git SHA. A workflow that worked last
  month can change. Pin or re-read release notes; say which I do.

### 8. Where to start, if you are starting now

Official-marketplace recommendations, as a short ladder rather than a catalogue.
All Anthropic-authored:

- **First**: `claude-code-setup` — it reads your codebase and recommends hooks,
  skills and subagents for it. The honest first move is to let it tell you what
  you need rather than installing what I use.
- **Then one workflow plugin**: `superpowers` if you want the full process ladder,
  `feature-dev` if you want something lighter and feature-shaped.
- **Review**: `code-review`, or `pr-review-toolkit` if you want the reviewers
  separated by concern (tests, error handling, type design).
- **Language intelligence**: the LSP plugins — `pyright-lsp`, `typescript-lsp`,
  `gopls-lsp`, `rust-analyzer-lsp` and the rest. Zero prompt cost in practice and
  they stop a whole class of wrong-symbol edits.
- **Safety nets**: `security-guidance` (hook-driven, so it works without you) and
  `claude-security` for a deliberate deep scan.
- **Housekeeping**: `commit-commands`, `claude-md-management`, `session-report`.
- **Building your own**: `plugin-dev`, and `skill-creator` for a single skill.

Each line says what problem it solves, not what it is. No more than one sentence
each — this is a pointer section, not a second working set.

Two of these (`claude-security`, `claude-md-management`) are in my idle list in
section 5. Say so in one clause rather than hoping nobody notices: they are
recommended on their merits and they sit idle because of the trigger problem, and
that is precisely the thing to fix when you install them.

### 9. Private marketplaces, for teams

A marketplace is a git repo with a manifest. A team can publish its own —
deployment runbooks, house conventions, internal review rules — and install it
alongside the official one. Why this beats a long shared `CLAUDE.md`: it versions,
it is scoped to the repos that need it, and skills load on demand instead of
sitting in every prompt. No employer, no internal names, no internal tooling.

## Frontmatter

```yaml
title: "Claude Code Plugins: What I Actually Use, and What a Plugin Even Is"
description: "Seventeen plugins installed, six actually used — counted from my own session logs. What a plugin really is, how it differs from a skill, a subagent, a hook and a setting, and which official ones are worth starting with."
pubDate: 2026-10-06
tags: ["claude-code", "ai-assisted-coding", "developer-productivity", "plugins"]
cover: agent
draft: false
```

`agent` is unused in `engineering` and is the right motif. No `coverVariant`.

## Cross-references out

- `ai-assisted-coding-playbook` — prompting, model choice, context hygiene.
- `spec-driven-development-tdd-bdd-ai-agents` — the spec loop itself.
- The harness-engineering post — the vocabulary this one assumes. Linked from
  section 2 and from the intro.
- `learning-to-build-software-when-ai-writes-the-code` — one pointer, for the
  "don't let the tool do the learning" angle when discussing `superpowers`'
  deliberate slowness.

No inbound edits to those three posts. This post links to them; they stay as they
are.

## Risks

- **Ages fast.** Plugin versions, counts and the marketplace catalogue all move.
  Mitigation: date the evidence explicitly in the prose ("counted on 2026-10-06"),
  and keep version numbers out of the body except where the point depends on one.
- **Reads as a list.** Mitigation: sections 2, 3, 5 and 7 are argument, not
  inventory. If a draft's inventory sections outweigh its argument sections,
  cut inventory.
- **First-person claims.** Every "I use", "I stopped using" and cost claim is
  mine to confirm before publish. Flag them for Riddam at review rather than
  asserting them.

## Open questions

None blocking. Counts get refreshed at draft time.
