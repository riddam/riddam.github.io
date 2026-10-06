# Harness engineering — the vocabulary, in Claude Code and GitHub Copilot

**Date:** 2026-10-06
**Status:** design for review
**Section:** `engineering`
**Slug:** `harness-engineering-vocabulary`
**Publishes before:** `2026-10-06-claude-code-plugins-design.md`, which assumes it

## Problem

The layer around the model has grown a vocabulary faster than it has grown
explanations. In a single week an engineer meets system prompt, context window,
`CLAUDE.md`, `AGENTS.md`, instructions files, skills, subagents, slash commands,
prompt files, chat modes, hooks, MCP servers, tools, toolsets, permissions, plan
mode, background tasks, plugins and marketplaces — and nowhere are those terms
defined *against each other*. Each vendor documents its own list. The result is
engineers who can use one of these tools and cannot say which of its parts does
what, which means they reach for the wrong one: a skill for something that must
happen every time, a `CLAUDE.md` entry for something that should be a tool, a
subagent for work whose output they needed in the main thread.

The second problem is portability. People assume this knowledge is
Claude-Code-specific and therefore not worth learning properly. As of 2026 that
is wrong, and provably so: GitHub Copilot now ships agent skills as `SKILL.md`,
custom agents as `*.agent.md`, lifecycle hooks, MCP config, and agent plugins
from a marketplace — and it reads `AGENTS.md` and `CLAUDE.md`, and looks in
`~/.claude`. The two harnesses have converged on the same surface with different
file names. That makes the surface worth learning once.

## Goal

A reader finishes able to name every part of the layer around the model, say what
each one is *for*, and — given a behaviour they want — pick the right part the
first time. Secondary: they can carry that judgement between Claude Code and
Copilot, because they have seen the mapping.

## Non-goals

- **Not a tutorial.** No "how to write your first skill" walkthrough.
  `plugin-dev` and `skill-creator` exist. This post is the map, not the
  expedition.
- **Not a product comparison.** The post is not "which is better". Copilot
  appears because the mapping proves the terms are portable, and the post must
  stay even-handed enough that a Copilot user reads it as a guide rather than an
  advert for the other tool.
- **No prompting advice.** That is the
  [AI coding playbook](/engineering/ai-assisted-coding-playbook/).
- **No plugin recommendations.** That is the plugins post, which follows this one.
- **No Cursor, Windsurf, Codex, Gemini CLI.** Two harnesses, done properly, beats
  six name-checked. One closing sentence may note that the same shapes are
  appearing elsewhere.
- **No employer named**, no internal tooling, no emoji.

## Audience

An engineer who uses one of these tools daily and has never been given the map.
They are not a beginner — they have shipped code with an agent — they just have
never been told why there are nine places to put an instruction.

## The organising idea

Not a glossary. A glossary is what the vendor docs already are, and it is why
nobody learns this. The post is organised around **three questions you can ask
about any part of a harness**, and every term is introduced as an answer to one
of them:

1. **What does the model see, and when?** — context window, system prompt,
   always-loaded instruction files, on-demand loading, what a subagent's separate
   context means, compaction.
2. **Who decides?** — you (slash commands), the model (skills, subagents, tool
   calls), or the harness deterministically (hooks, permissions). This is the
   axis that resolves most of the confusion, and it is the spine of the post.
3. **What can it reach?** — tools, MCP servers, permissions, sandboxing, what
   "read-only" actually buys you.

Then two shorter structural questions: **how is it packaged** (plugins,
marketplaces, scopes: user / project / organisation) and **how do you work it**
(plan mode, background tasks, subagent fan-out).

The "who decides" axis is the post's one memorable idea. If a reader keeps
nothing else, they should keep: *advice the model may ignore, a command you must
remember, or a rule the harness enforces — pick deliberately.*

## Structure

### 1. Why the words matter

Open on the concrete failure: writing "always run the tests before committing"
into an instructions file, watching it get ignored on a long session, and
concluding the model is unreliable. The model is behaving exactly as designed;
the instruction was filed in the advisory layer. Term confusion looks like tool
unreliability, which is why it is worth fixing.

### 2. Harness, and what it is not

Define *harness*: everything between your prompt and the model's weights —
context assembly, tool definitions, the agent loop, permission checks, the file
and process access. Distinguish from *model* (the weights, what it knows and how
well it reasons) and from *your code*. One line on why "prompt engineering" stops
describing this job: the lever that moves outcomes is now what is in context and
what the loop is allowed to do, not the wording of a request. The term for that
work is harness engineering.

### 3. What the model sees, and when

Context window as a budget, not a container. Four ways something enters it:
always-loaded (system prompt, instruction files), retrieved-on-demand (skills
loading their body when triggered, file reads), returned-by-tools (MCP results,
command output), and carried-forward (conversation, compaction, what a summary
loses). The practical consequence — every always-loaded thing taxes every turn —
and why that is the real argument against a 400-line `CLAUDE.md` and against
installing nine MCP servers.

Subagents belong here, not only under delegation: the defining property is the
*separate* context. Say plainly what that buys (isolation, parallel fan-out) and
what it costs (only the final report comes back, so anything the subagent learned
along the way is gone).

### 4. Who decides — the three triggers

The spine. A table, then a paragraph defending each row.

| Trigger | Parts | Guarantee | Right for |
| --- | --- | --- | --- |
| You, explicitly | Slash commands, prompt files | Runs when invoked, never otherwise | Deliberate, occasional work |
| The model, on judgement | Skills, subagents, tool calls | Probabilistic — usually fires, sometimes not | Expertise that applies *sometimes*, where the model can tell when |
| The harness, deterministically | Hooks, permissions, settings | Always, by construction | Anything with "always" or "never" in it |

Then the rule: **if your instruction contains "always" or "never", the advisory
layer is the wrong home for it.** And the counter-caveat, because the post must
be honest — deterministic rules that fire too broadly get disabled by the person
they annoy, so scope narrowly and prefer a warning to a block.

### 5. What it can reach

Tools as the model's hands; MCP as the protocol for lending it someone else's.
What an MCP server costs before you use it (every tool definition is in the
prompt) and the mitigation (toolsets, deferred/searchable tools). Permissions and
allow/deny lists as the layer that makes autonomy survivable, with the honest
note that a long allowlist is itself a decision about what you are willing to not
look at. One paragraph on read-only-by-default for anything touching production.

### 6. How it is packaged

Scope first — user, project, organisation — because that is what decides who else
gets your work. Then plugins as a bundle of the parts above, and marketplaces as
a git repo with a manifest. Short: the next post is entirely about this, so this
section's job is to leave the reader able to read that one.

### 7. How you work it

Plan mode, background tasks, parallel subagents, and the checkpoints a human
keeps. Brief — this is the operational layer and the playbook already covers the
discipline. Link out, do not restate.

### 8. The same map in Copilot

The payoff table. Verify every cell against primary docs at draft time; these
move monthly.

| Concept | Claude Code | GitHub Copilot |
| --- | --- | --- |
| Always-loaded project instructions | `CLAUDE.md` | `.github/copilot-instructions.md`, `AGENTS.md` — and it also reads `CLAUDE.md` |
| Scoped instructions | — | `*.instructions.md` |
| Skills | `SKILL.md` in `skills/` | `SKILL.md` agent skills |
| Subagents / custom agents | `.claude/agents/*.md` | `*.agent.md` in `.github/agents`, `~/.copilot/agents` |
| User-invoked | Slash commands | `*.prompt.md` prompt files (migrating to skills) |
| Deterministic | Hooks in settings | Lifecycle hooks |
| External systems | MCP, `.mcp.json` | MCP, `.mcp.json` / `mcp-config.json` |
| Packaging | Plugins + marketplaces | Agent plugins + marketplace |
| Scopes | User, project | User, workspace, organisation |

The observation that earns the post: this is convergence, not coincidence —
Copilot reads `CLAUDE.md` and looks in `~/.claude`, and both have landed on
`SKILL.md`. Note what is *not* symmetric rather than pretending it is, and say
which direction each is still moving.

### 9. Picking the right part

A short decision list, the thing a reader screenshots:

- Must happen every time → hook or setting.
- Should happen when relevant, and the model can tell → skill.
- Needs its own context, or can run in parallel → subagent.
- You will decide when → slash command or prompt file.
- Needs data or actions from outside the repo → MCP server.
- True for everyone on the repo → project scope; true for you → user scope.
- You want other teams to have it → package it.

### 10. What this does not fix

Honest close. The harness makes a capable model reliable; it does not make a
weak one capable, and it does not make a wrong design right. The failure mode
that survives all of this is building the wrong thing well — which is the
[SDD post](/engineering/spec-driven-development-tdd-bdd-ai-agents/)'s territory.

## Frontmatter

```yaml
title: "Harness Engineering: The Words for the Layer Around the Model"
description: "Skills, subagents, hooks, MCP, slash commands, plugins, scopes — what each part of an AI coding harness is actually for, organised by who pulls the trigger, and mapped across Claude Code and GitHub Copilot."
pubDate: 2026-10-06
tags: ["harness-engineering", "claude-code", "github-copilot", "ai-assisted-coding"]
cover: mirror
draft: false
```

`mirror` is unused in `engineering` (one use in `book-notes`) and fits a
side-by-side post. `harness-engineering` is a new tag; the other three exist.

## Cross-references

Out: the playbook (prompting and model choice), the SDD post (the spec loop),
and forward to the plugins post once it is live.

In: the plugins post links back here for the vocabulary. No edits to existing
posts in this change — the plugins post adds its own link when it ships.

## Verification required before drafting

Every Copilot claim and every file path in section 8 gets re-checked against
primary documentation at draft time, with the check date stated in the prose.
Current basis: VS Code's Copilot customization docs and GitHub's custom-agents
changelog, read 2026-10-06; custom agents, sub-agents, plan mode and MCP reached
general availability on 2026-03-11. Claude Code paths get verified against the
local install rather than memory.

Treat any claim about what a feature is "moving towards" as the weakest kind and
either source it or cut it.

## Risks

- **Ages fast.** Both products ship monthly. Mitigation: date the comparison in
  the prose, keep version numbers out of the body, and prefer concepts to
  feature names wherever a concept will do.
- **Reads as a glossary.** Mitigation: the three-questions spine. If a draft can
  be reordered alphabetically without loss, the spine failed.
- **Reads as advocacy.** Mitigation: a Copilot user must be able to read section
  8 and find it fair. Describe, do not rank.
- **Overlaps the plugins post.** Mitigation: section 6 stays short and defers.

## Open questions

- Length. Nine sections risks going past the ~20-minute gate. If it does, section
  7 merges into section 4 and section 2 shortens; the three-questions spine and
  the Copilot table are the parts that must not shrink.
