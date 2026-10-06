# Harness Engineering Post — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one `engineering` post that names every part of the layer around the model, organised by who pulls the trigger, and maps that vocabulary across Claude Code and GitHub Copilot.

**Architecture:** The post is a single Markdown file in an existing Astro content collection. Nothing structural changes: `engineering` already exists in `SECTIONS`, the `mirror` motif already exists in `src/motifs.ts`, and tags are free-form (no registry). So the only new *code* in this plan is a test — `src/content/links.test.ts` — that pins every internal link in every post to a real content file. The post carries four internal links and the repo currently has no guard against a typo in one, so Task 1 adds that guard first and every later task runs it.

**Tech Stack:** Astro 5 content collections, TypeScript, `node --test` with native type stripping, Pagefind. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-06-harness-engineering-design.md`

**Scope note:** This plan delivers the harness-engineering post only. The plugins post (`docs/superpowers/specs/2026-10-06-claude-code-plugins-design.md`) publishes after it and gets its own plan. Do not write the plugins post here, and do not add a link *to* the plugins post from this one — it does not exist yet, and Task 1's link test will fail if you do.

---

## Global Constraints

Every task's requirements implicitly include this section.

- **No emoji anywhere.** Site policy is none; decorative emoji were deliberately stripped in an earlier pass, so adding one is a regression.
- **No new npm dependencies.** Standing repo rule. This is also why `npx astro check` cannot be run — it wants `@astrojs/check` and `typescript`.
- **Build with `npm run build`, never bare `astro build`.** The bare command skips Pagefind and breaks `/search` in production. The package script is `astro build && pagefind --site dist`.
- **No new cover SVGs and no raster images.** The post uses the existing `mirror` motif.
- **Post body starts at `##`.** No H1 — the title renders from frontmatter.
- **Plain sentence-case H2s**, matching `uv-one-tool-to-rule-your-python` and `ai-assisted-coding-playbook`. Do **not** use the `## 01 — Topic` numbering; that form belongs to `guides`, not `engineering`. The spec's section numbers are structural only.
- **Internal links use the trailing-slash form** `](/engineering/slug/)`. All 107 existing internal links use it and Task 1's test enforces it.
- **No employer named, no internal tooling, no internal plugin names.** Site-wide anonymisation rule.
- **No push to `origin`.** Riddam pushes. Commit locally only.
- **Length gate: 20 minutes.** Reading time is computed at 220 wpm (`src/utils/reading-time.ts`), so the hard ceiling is ~4,400 words of body prose. Target **3,200–3,900 words**. Check with the command in Task 5, not by eye.
- **Even-handed on Copilot.** A Copilot user must read the comparison as a guide, not an advert for Claude Code. Describe, do not rank.
- **Every external claim carries a link.** Inline, to the primary source — the vendor's own documentation, not a blog summary of it. A reader who wants the detail should never have to search for it. The closing `## References and further reading` section is required, matching the convention in `spec-driven-development-tdd-bdd-ai-agents`.
- **Only URLs from the verified list below.** Every one returned HTTP 200 on 2026-10-06. Do not invent a documentation URL and do not guess a path from a pattern — a 404 in a reference list is worse than no link.
- **Paste the verified facts below exactly.** Do not re-derive them from memory and do not paraphrase the paths.

### Verified facts (2026-10-06)

All Copilot facts below were read from `code.visualstudio.com/docs/agent-customization/*` and `github.blog` on 2026-10-06. The post must state that date in prose. If you are executing this plan more than ~4 weeks later, re-verify before writing Task 4 and update this block.

**Copilot — custom instructions**
- Always loaded, repository root: `.github/copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`.
- Conditionally applied: `*.instructions.md`, attached automatically when their `applyTo` glob matches the files being modified, or loaded on demand when their `description` matches the task. `applyTo` example: `applyTo: '**/*.py'`.
- Locations: workspace `.github/instructions`, user `~/.copilot/instructions`.

**Copilot — agent skills**
- A directory containing `SKILL.md`; the directory name must match the `name` field in the frontmatter.
- Project: `.github/skills/`, `.claude/skills/`, `.agents/skills/`.
- Personal: `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/`.
- Frontmatter: `name` (lowercase letters, numbers, hyphens only), `description` ("what the skill does **and when to use it**"), plus optional `argument-hint`, `user-invocable`, `disable-model-invocation`, `context`.
- Discovery is by `name` and `description` in the frontmatter.

**Copilot — custom agents**
- `.agent.md` files. Workspace: `.github/agents`, `.claude/agents`. User: `~/.copilot/agents`, `~/.claude/agents`.
- Frontmatter: `description`, `name`, `argument-hint`, `tools`, `agents` (subagent availability), `model`, `user-invocable`, `disable-model-invocation`, `target`, `mcp-servers`, `handoffs`, `hooks` (Preview).
- Subagents exist: an agent lists the agent names available to it as subagents.

**Copilot — hooks**
- Copilot sessions discover hooks from `.github/hooks/*.json`.
- Copilot uses lower camel case event names; the local harness uses PascalCase.
- The docs explicitly warn that "supported events, event names, matchers, command properties, tool names, payloads, and output decisions can differ" across harnesses. **Say this in the post** — it is the honest limit of the mapping, and it is the one claim that keeps the comparison fair.

**Copilot — MCP**
- Workspace: `.vscode/mcp.json` (top-level `servers` object) and the portable `.mcp.json` at project root (top-level `mcpServers` object).
- User: `mcp.json` in the user profile folder, and the portable `$COPILOT_HOME/mcp-config.json`, defaulting to `~/.copilot/mcp-config.json`.

**Copilot — prompt files and packaging**
- `*.prompt.md` prompt files exist and are documented as being migrated to agent skills for Agent Host. State this as "migrating", sourced, and do not predict a completion date.
- Agent plugins are managed through a marketplace.

**Copilot — availability**
- Custom agents, sub-agents, plan mode and MCP support reached general availability on **2026-03-11** (GitHub changelog).

**Claude Code — local, verified from this machine**
- User-level directories under `~/.claude/`: `skills/`, `plugins/`, `projects/`, `sessions/`, plus `settings.json` and `CLAUDE.md`.
- A plugin is a directory. Observed contents across installed plugins: `skills/`, `agents/`, `commands/`, `hooks/`, and a `.claude-plugin/plugin.json` manifest carrying `name`, `description`, `author`.
- Concrete, citable shapes: `superpowers` ships `skills/` and `hooks/`; `code-simplifier` ships `agents/` and nothing else; `code-review` ships `commands/` only; `deploy-on-aws` ships `skills/`, `hooks/` and three MCP servers.
- A marketplace is a git repo with a `.claude-plugin/marketplace.json` manifest. The official one is `anthropics/claude-plugins-official` and lists **315** plugins, **40** of them Anthropic-authored (counted 2026-10-06).

**The convergence claim — the post's strongest evidence**

Copilot reads `CLAUDE.md`, `.claude/skills/`, `~/.claude/skills/`, `.claude/agents` and `~/.claude/agents`, and both harnesses use `SKILL.md`. That is documented behaviour, not inference. Lead the comparison section with it.

### Verified reference URLs (all returned HTTP 200 on 2026-10-06)

**Claude Code documentation**
- Overview — `https://code.claude.com/docs/en/overview`
- Memory and `CLAUDE.md` — `https://code.claude.com/docs/en/memory`
- Skills — `https://code.claude.com/docs/en/skills`
- Subagents — `https://code.claude.com/docs/en/sub-agents`
- Slash commands — `https://code.claude.com/docs/en/slash-commands`
- Hooks — `https://code.claude.com/docs/en/hooks`
- MCP — `https://code.claude.com/docs/en/mcp`
- Settings — `https://code.claude.com/docs/en/settings`
- Permissions / IAM — `https://code.claude.com/docs/en/iam`
- Plugins — `https://code.claude.com/docs/en/plugins`
- Plugin marketplaces — `https://code.claude.com/docs/en/plugin-marketplaces`
- Common workflows (plan mode, background tasks) — `https://code.claude.com/docs/en/common-workflows`
- Output styles — `https://code.claude.com/docs/en/output-styles`

**GitHub Copilot documentation**
- Customization overview — `https://code.visualstudio.com/docs/copilot/customization/overview`
- Custom instructions — `https://code.visualstudio.com/docs/agent-customization/custom-instructions`
- Agent skills — `https://code.visualstudio.com/docs/agent-customization/agent-skills`
- Custom agents — `https://code.visualstudio.com/docs/agent-customization/custom-agents`
- Hooks — `https://code.visualstudio.com/docs/agent-customization/hooks`
- MCP servers — `https://code.visualstudio.com/docs/agent-customization/mcp-servers`
- Custom agents for the cloud agent — `https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents`
- Custom agents changelog (GA date) — `https://github.blog/changelog/2025-10-28-custom-agents-for-github-copilot/`

**Background and standards**
- Model Context Protocol — `https://modelcontextprotocol.io/`
- `AGENTS.md` — `https://agents.md/`
- Anthropic, effective context engineering for AI agents — `https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents`
- Anthropic, equipping agents for the real world with agent skills — `https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills`
- Anthropic, Claude Code best practices — `https://www.anthropic.com/engineering/claude-code-best-practices`

**Do not claim** that Claude Code supports `.claude/rules` — VS Code's docs mention it, but it was not verified against Claude Code's own documentation for this plan. Either verify it first or leave it out.

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `src/content/links.test.ts` | **Create.** Asserts every internal `](/section/slug/)` link across all collections resolves to a real, non-draft content file. The only automated guard that a cross-reference is not a typo. | 1 |
| `src/content/engineering/harness-engineering-vocabulary.md` | **Create.** The post. Frontmatter plus skeleton in Task 1; prose filled in Tasks 2–4; audited in Task 5. | 1–5 |

No other file changes. No edits to existing posts — this post links out to them, they do not link back yet.

---

## Review Focus

Failure modes the spec implies that no task's prose exercises by itself. Each is pinned to a task below.

1. **A broken internal link ships.** The post carries four of them and nothing currently checks link targets. Pinned to Task 1's test.
2. **A link to the not-yet-written plugins post.** The spec says the plugins post links back here, not the reverse, but the drafter will be tempted. Task 1's test fails on it; Task 5 re-checks.
3. **The post runs past the 20-minute gate.** Nine sections is a lot. Pinned to Task 5's word count, with the spec's named fallback (merge section 7 into 4, shorten section 2).
4. **It restates the playbook or the SDD post.** The no-duplication rule. Pinned to Task 5's audit step, which greps both posts for the overlapping topics rather than trusting memory.
5. **An invented documentation URL.** A reference list with a 404 in it costs more trust than it buys. Pinned to Task 5, which resolves every external link in the post rather than eyeballing it.
6. **A stale or invented Copilot path.** Every one of them moves monthly. Pinned to Task 4, which diffs the drafted table against the verified-facts block above, character by character.

---

## Task 1: Link guard and post skeleton

**Files:**
- Create: `src/content/links.test.ts`
- Create: `src/content/engineering/harness-engineering-vocabulary.md`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: the post file at a fixed path with the exact frontmatter below, and `npm test` as the guard every later task re-runs.

- [ ] **Step 1: Write the failing test**

Create `src/content/links.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT = new URL('.', import.meta.url).pathname;
const INTERNAL = /\]\((\/[a-z0-9-]+\/[a-z0-9-]+\/)\)/g;

/** Every `section/slug` pair that has a Markdown file behind it. */
function slugs(): Set<string> {
  const found = new Set<string>();
  for (const section of readdirSync(CONTENT, { withFileTypes: true })) {
    if (!section.isDirectory()) continue;
    for (const file of readdirSync(join(CONTENT, section.name))) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      found.add(`/${section.name}/${file.replace(/\.md$/, '')}/`);
    }
  }
  return found;
}

function posts(): { path: string; body: string }[] {
  const out: { path: string; body: string }[] = [];
  for (const section of readdirSync(CONTENT, { withFileTypes: true })) {
    if (!section.isDirectory()) continue;
    for (const file of readdirSync(join(CONTENT, section.name))) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const path = join(section.name, file);
      out.push({ path, body: readFileSync(join(CONTENT, path), 'utf8') });
    }
  }
  return out;
}

test('every internal post link resolves to a content file', () => {
  const known = slugs();
  const broken: string[] = [];
  for (const { path, body } of posts()) {
    for (const [, href] of body.matchAll(INTERNAL)) {
      if (!known.has(href)) broken.push(`${path} -> ${href}`);
    }
  }
  assert.deepEqual(broken, [], `broken internal links:\n${broken.join('\n')}`);
});

test('the harness-engineering post exists and is not a draft', () => {
  const known = slugs();
  assert.ok(
    known.has('/engineering/harness-engineering-vocabulary/'),
    'expected src/content/engineering/harness-engineering-vocabulary.md',
  );
  const post = posts().find((p) => p.path.endsWith('harness-engineering-vocabulary.md'));
  assert.ok(post, 'post not readable');
  assert.doesNotMatch(post.body, /^draft:\s*true$/m, 'post is still a draft');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: the second test FAILS with "expected src/content/engineering/harness-engineering-vocabulary.md". The first test should PASS — all 107 existing links already resolve. **If the first test fails, stop:** you have found a pre-existing broken link. Report it to Riddam rather than fixing it inside this task; it is not in scope and it changes a published post.

- [ ] **Step 3: Create the post with frontmatter and skeleton**

Create `src/content/engineering/harness-engineering-vocabulary.md` with exactly this frontmatter:

```yaml
---
title: "Harness Engineering: The Words for the Layer Around the Model"
description: "Skills, subagents, hooks, MCP, slash commands, plugins, scopes — what each part of an AI coding harness is actually for, organised by who pulls the trigger, and mapped across Claude Code and GitHub Copilot."
pubDate: 2026-10-06
tags: ["harness-engineering", "claude-code", "github-copilot", "ai-assisted-coding"]
cover: mirror
draft: false
---
```

Then the body skeleton — these ten H2s and nothing else yet:

```markdown
## When the words are wrong, the tool looks broken

## What a harness is, and what it is not

## What the model sees, and when

## Who decides

## What it can reach

## How it is packaged

## How you work it

## The same map in Copilot

## Picking the right part

## What this does not fix

## References and further reading
```

- [ ] **Step 4: Run the test and the build to verify both pass**

Run: `npm test`
Expected: PASS, 17 tests.

Run: `npm run build`
Expected: build succeeds and Pagefind indexes. Confirm the page exists:

```bash
test -f dist/engineering/harness-engineering-vocabulary/index.html && echo OK
```
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add src/content/links.test.ts src/content/engineering/harness-engineering-vocabulary.md
git commit -m "Add an internal-link guard and the harness-engineering skeleton"
```

---

## Task 2: The frame and the context layer

Sections 1–3 of the spec. This is where the reader is given a reason to care and the first of the three questions.

**Files:**
- Modify: `src/content/engineering/harness-engineering-vocabulary.md` (H2s 1–3)

**Interfaces:**
- Consumes: the skeleton and frontmatter from Task 1.
- Produces: the intro the later sections assume — specifically, the three questions must be named in section 3's lead-in, because section 4 is "the second question".

- [ ] **Step 1: Write "When the words are wrong, the tool looks broken"**

Open on the concrete failure from the spec: someone writes *always run the tests before committing* into an instructions file, watches it get skipped on a long session, and concludes the tool is unreliable. The model behaved as designed — the instruction was filed in the advisory layer. Make the point that term confusion is indistinguishable from tool unreliability from the outside, which is why the vocabulary is worth an hour.

State the two claims the post rests on, plainly: the layer has a real structure, and that structure is now close to identical in Claude Code and GitHub Copilot, so learning it once transfers. State the date the Copilot facts were checked: **2026-10-06**.

Name the three questions that organise the post: *what does the model see and when*, *who decides*, *what can it reach*.

Target 350–450 words.

- [ ] **Step 2: Write "What a harness is, and what it is not"**

Define harness: everything between the prompt and the weights — context assembly, tool definitions, the agent loop, permission checks, file and process access. Distinguish it from the model (the weights; what it knows and how well it reasons) and from your own code.

One paragraph on why "prompt engineering" stopped describing the job: the lever that moves outcomes is what is in context and what the loop may do, not the wording of a request. Link once to the playbook for the prompting side:

```markdown
[AI coding playbook](/engineering/ai-assisted-coding-playbook/)
```

Do not explain prompting here. One sentence and the link.

Target 250–350 words.

- [ ] **Step 3: Write "What the model sees, and when"**

The first question. Context window as a budget, not a container. Four ways something enters it, as a short list with one line each:

- always-loaded — system prompt, instruction files
- retrieved on demand — a skill loading its body when triggered, a file read
- returned by tools — MCP results, command output
- carried forward — the conversation, and what compaction loses

Then the consequence that readers can act on: everything always-loaded taxes every turn. That is the real argument against a 400-line `CLAUDE.md` and against nine MCP servers, and it is worth stating as a cost, not a style preference.

Put subagents here, not only under delegation. The defining property is the *separate* context: it buys isolation and parallel fan-out, and it costs you everything the subagent learned on the way, because only its final report comes back.

Target 500–650 words.

- [ ] **Step 4: Verify**

Run: `npm test`
Expected: PASS, 17 tests. (The playbook link must resolve; if the link test fails, you typed the slug wrong.)

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/content/engineering/harness-engineering-vocabulary.md
git commit -m "Harness post: the frame and the context layer"
```

---

## Task 3: Who decides, what it can reach, packaging, working it

Sections 4–7 of the spec. Section 4 is the post's spine and gets the most care; 6 and 7 are deliberately short.

**Files:**
- Modify: `src/content/engineering/harness-engineering-vocabulary.md` (H2s 4–7)

**Interfaces:**
- Consumes: the three questions named in Task 2, Step 1.
- Produces: the trigger vocabulary (*you*, *the model*, *the harness*) that Task 4's decision list reuses verbatim. Use those three words consistently from here on.

- [ ] **Step 1: Write "Who decides" — the spine**

Lead with the table, then defend each row in a paragraph:

```markdown
| Trigger | Parts | Guarantee | Right for |
| --- | --- | --- | --- |
| You, explicitly | Slash commands, prompt files | Runs when invoked, never otherwise | Deliberate, occasional work |
| The model, on judgement | Skills, subagents, tool calls | Usually fires, sometimes not | Expertise that applies *sometimes*, where the model can tell when |
| The harness, deterministically | Hooks, permissions, settings | Always, by construction | Anything with "always" or "never" in it |
```

Then the rule, stated once and set apart: **if your instruction contains "always" or "never", the advisory layer is the wrong home for it.**

Then the counter-caveat, which the spec requires and which keeps the post honest: deterministic rules that fire too broadly get switched off by the person they annoy. Scope narrowly; prefer a warning to a block.

Close the section by tying it back to the opening failure — the tests instruction belonged in row three.

Target 600–750 words. This is the one section a reader should remember.

- [ ] **Step 2: Write "What it can reach"**

Tools as the model's hands; MCP as the protocol for lending it someone else's. The cost of an MCP server before you use it: every tool definition sits in the prompt. The mitigations: toolsets, and deferred or searchable tools that load a schema only when needed.

Permissions and allow/deny lists as the layer that makes autonomy survivable, with the honest note that a long allowlist is itself a decision about what you have stopped looking at.

One paragraph on read-only by default for anything touching production.

Target 400–500 words.

- [ ] **Step 3: Write "How it is packaged"**

Scope first — user, project, organisation — because scope decides who else gets your work. Then plugins as a bundle of the parts above, and a marketplace as a git repo with a manifest.

Use the verified Claude Code shapes to make "bundle" concrete, exactly as recorded in the verified-facts block: `superpowers` ships skills and hooks; `code-simplifier` ships one agent and nothing else; `code-review` ships one command; `deploy-on-aws` ships skills, hooks and three MCP servers. One sentence that the official marketplace carried 315 plugins when this was written, 40 of them Anthropic-authored.

Keep it to 250–350 words and say outright that the next post is about choosing between them. **Do not link to the plugins post** — it does not exist yet and the link test will fail.

- [ ] **Step 4: Write "How you work it"**

Plan mode, background tasks, parallel subagents, and the checkpoints a human keeps. Brief and operational. Link once to the SDD post for the loop itself:

```markdown
[spec-driven development](/engineering/spec-driven-development-tdd-bdd-ai-agents/)
```

Do not re-teach the loop. Target 200–300 words. If the post is running long, this is the section the spec nominates for merging into "Who decides".

- [ ] **Step 5: Verify**

Run: `npm test`
Expected: PASS, 17 tests.

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/content/engineering/harness-engineering-vocabulary.md
git commit -m "Harness post: triggers, reach, packaging and operation"
```

---

## Task 4: The Copilot map, the decision list, and the close

Sections 8–10. Every path in this task comes from the verified-facts block — paste, do not recall.

**Files:**
- Modify: `src/content/engineering/harness-engineering-vocabulary.md` (H2s 8–10)

**Interfaces:**
- Consumes: the trigger vocabulary from Task 3 (*you*, *the model*, *the harness*).
- Produces: the finished body that Task 5 audits.

- [ ] **Step 1: Write "The same map in Copilot"**

Open with the convergence evidence, because it is the section's whole justification: Copilot reads `CLAUDE.md`, `.claude/skills/`, `~/.claude/skills/`, `.claude/agents` and `~/.claude/agents`, and both harnesses use `SKILL.md`. Documented behaviour, not inference. Say when it was checked: 2026-10-06.

Then the table. Paths copied verbatim from the verified-facts block:

```markdown
| Concept | Claude Code | GitHub Copilot |
| --- | --- | --- |
| Always-loaded project instructions | `CLAUDE.md` | `.github/copilot-instructions.md`, `AGENTS.md` — and it reads `CLAUDE.md` too |
| Scoped instructions | — | `*.instructions.md`, attached by an `applyTo` glob |
| Skills | `SKILL.md` under `skills/` | `SKILL.md` under `.github/skills/`, `.claude/skills/` or `.agents/skills/` |
| Subagents / custom agents | `.claude/agents/*.md` | `*.agent.md` under `.github/agents` or `.claude/agents` |
| User-invoked | Slash commands | `*.prompt.md` prompt files, migrating to agent skills |
| Deterministic | Hooks in settings | Hooks from `.github/hooks/*.json` |
| External systems | MCP, `.mcp.json` | MCP, `.mcp.json` or `~/.copilot/mcp-config.json` |
| Packaging | Plugins and marketplaces | Agent plugins and a marketplace |
| Scopes | User, project | User, workspace, organisation |
```

Then the honesty paragraph, which is required and which is what makes the table trustworthy: VS Code's own docs warn that supported events, event names, matchers, command properties, tool names, payloads and output decisions differ between harnesses. The *concepts* map; the details do not. Quote or paraphrase that warning and say that a hook config is not portable even though the idea is.

One sentence on availability: custom agents, sub-agents, plan mode and MCP reached general availability in Copilot on 2026-03-11.

One closing sentence may note that the same shapes are appearing in other tools. Do not name Cursor, Windsurf, Codex or Gemini CLI individually — the spec rules them out.

Target 500–600 words.

- [ ] **Step 2: Write "Picking the right part"**

The screenshot list. Keep it to these seven lines, phrased as *condition → part*:

```markdown
- Must happen every time → a hook or a setting.
- Should happen when relevant, and the model can tell → a skill.
- Needs its own context, or can run in parallel → a subagent.
- You will decide when → a slash command or a prompt file.
- Needs data or actions from outside the repo → an MCP server.
- True for everyone on the repo → project scope; true only for you → user scope.
- You want other teams to have it → package it.
```

Two or three sentences around it, no more. The list is the deliverable.

- [ ] **Step 3: Write "What this does not fix"**

The honest close. A harness makes a capable model reliable; it does not make a weak one capable, and it does not make a wrong design right. The failure that survives all of it is building the wrong thing well — which is the SDD post's territory. The SDD link is already used in Task 3, Step 4; a second reference here should be plain text, not a repeat link.

Target 150–250 words.

- [ ] **Step 4: Write "References and further reading"**

Grouped, in this order, using only URLs from the verified-reference list in this plan. Match the house style in `spec-driven-development-tdd-bdd-ai-agents`: a bullet per source, the link label carrying the title, a short parenthetical where the reader needs to know what it is.

Three groups, with a one-line lead-in each rather than a bare dump:

- **Claude Code** — overview, memory, skills, subagents, slash commands, hooks, MCP, settings, permissions, plugins, plugin marketplaces. Pair related ones on a single bullet where it reads better (skills and subagents together; plugins and marketplaces together).
- **GitHub Copilot** — the customization overview first as the entry point, then custom instructions, agent skills, custom agents, hooks, MCP servers, and the GitHub changelog for the GA date.
- **Background** — the Model Context Protocol site, `AGENTS.md`, and the three Anthropic engineering posts on context engineering, agent skills and Claude Code practice.

Beyond this section, the body must already carry inline links at the points where a reader would want the detail: the first mention of skills, subagents, hooks, MCP, plugins and permissions in sections 3–7, and every Copilot row concept in section 8. If a section you wrote in Tasks 2–4 makes a claim about a documented behaviour and has no link, add one now from the verified list.

Do not link the same URL more than twice in the body. The references section is where repetition belongs.

- [ ] **Step 5: Verify the table against the verified-facts block**

This is the step Review Focus item 5 exists for. Do it literally, not by reading:

```bash
grep -nE '\.github/|\.claude/|~/\.copilot|\.mcp\.json|mcp-config\.json|SKILL\.md|\.agent\.md|\.prompt\.md|copilot-instructions' \
  src/content/engineering/harness-engineering-vocabulary.md
```

Compare every path printed against the verified-facts block in this plan, character by character. Any path in the post that is not in that block is either unverified or invented — remove it or verify it against primary docs and add it to the block.

- [ ] **Step 6: Verify**

Run: `npm test`
Expected: PASS, 17 tests.

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/content/engineering/harness-engineering-vocabulary.md
git commit -m "Harness post: the Copilot map, the decision list and the references"
```

---

## Task 5: Audit — length, duplication, policy, build

The post is written. This task is the gate, and it is allowed to send prose back.

**Files:**
- Modify: `src/content/engineering/harness-engineering-vocabulary.md` (edits only if a check fails)

**Interfaces:**
- Consumes: the finished body from Task 4.
- Produces: a post that passes every site policy.

- [ ] **Step 1: Check the length gate**

```bash
node --input-type=module -e "
import { readFileSync } from 'node:fs';
const src = readFileSync('src/content/engineering/harness-engineering-vocabulary.md','utf8');
const body = src.replace(/^---[\s\S]*?\n---\n/, '');
const words = body.split(/\s+/).filter(Boolean).length;
console.log(words, 'words,', Math.max(1, Math.round(words/220)), 'min');
"
```

Expected: between 3,200 and 3,900 words. Over 4,400 breaks the 20-minute gate.

If it is over: apply the spec's named fallback in order — merge "How you work it" into "Who decides", then shorten "What a harness is". Do **not** shorten "Who decides" or the Copilot table; the spec protects both.

- [ ] **Step 2: Check for duplication against the two overlapping posts**

The no-duplication rule, checked rather than remembered. For each topic the posts share, read the existing treatment before deciding the new one is additive:

```bash
grep -nE 'context window|CLAUDE\.md|instruction file|MCP' \
  src/content/engineering/ai-assisted-coding-playbook.md | head -20
grep -nE 'Claude Code|skill|plan mode|spec' \
  src/content/engineering/spec-driven-development-tdd-bdd-ai-agents.md | head -20
```

The rule: this post may *name* a thing the other posts cover and link to them; it may not re-teach it. The playbook owns prompting, model choice and context hygiene as a practice. The SDD post owns the spec loop. If a paragraph here could be moved into either post without anyone noticing, cut it to a sentence and link.

- [ ] **Step 3: Check site policy**

No emoji:

```bash
grep -nP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' \
  src/content/engineering/harness-engineering-vocabulary.md
```
Expected: no output.

No H1 in the body, and heading style is sentence case, not `## 01 — `:

```bash
grep -nE '^# |^## [0-9]{2} —' src/content/engineering/harness-engineering-vocabulary.md
```
Expected: no output.

No employer, no internal tooling, no reference to the unwritten plugins post:

```bash
grep -niE 'coolblue|/engineering/claude-code-plugins' \
  src/content/engineering/harness-engineering-vocabulary.md
```
Expected: no output.

- [ ] **Step 4: Resolve every external link**

Review Focus item 5. Check them, do not trust them:

```bash
grep -ohE 'https?://[^) ]+' src/content/engineering/harness-engineering-vocabulary.md \
  | sed 's/[.,]$//' | sort -u \
  | while read -r u; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -L "$u")" "$u"; done
```

Expected: every line starts with `200`. Anything else — remove the link or replace it with one from the verified-reference list. Do not leave a redirect chain unexamined: if a URL only resolves after a redirect to a different page, link the destination.

- [ ] **Step 5: Full verification**

Run: `npm test`
Expected: PASS, 17 tests.

Run: `npm run build`
Expected: succeeds, Pagefind indexes.

```bash
test -f dist/engineering/harness-engineering-vocabulary/index.html && echo OK
grep -c 'harness-engineering-vocabulary' dist/engineering/index.html
```
Expected: `OK`, and a count of at least 1 — the post appears in its section listing.

- [ ] **Step 6: Commit**

```bash
git add src/content/engineering/harness-engineering-vocabulary.md
git commit -m "Harness post: audit pass for length, duplication and policy"
```

- [ ] **Step 7: Hand back to Riddam**

Do not push. Report four things: the final word count and reading time, any first-person or opinion claims in the post that are Riddam's to confirm, anything cut for length, and any Copilot fact that could not be verified and was therefore left out.

---

## Self-Review

**Spec coverage.** Spec sections 1–10 map to Tasks 2 (1–3), 3 (4–7), 4 (8–10). Frontmatter, cover motif and tags are Task 1. The length risk, the glossary risk and the advocacy risk are Task 5 steps 1–3. The verification-before-drafting requirement is the verified-facts block plus Task 4, Step 4. The "publishes before the plugins post" constraint is the scope note plus the Task 5 grep.

**Placeholders.** None. Every prose section carries its argument, its word target and the exact links or tables it must contain; every code and command step is runnable as written.

**Type consistency.** `slugs()` and `posts()` are defined once in Task 1 and used only there. The trigger words *you* / *the model* / *the harness* are introduced in Task 3, Step 1 and reused in Task 4, Step 2. The slug `harness-engineering-vocabulary` is identical in the test, the filename, the build check and the greps.

**Review Focus coverage.** Item 1 and 2 → Task 1's link test, re-run in Tasks 2–5 and grepped in Task 5, Step 3. Item 3 → Task 5, Step 1, with the fallback order named. Item 4 → Task 5, Step 2. Item 5 → Task 4, Step 4.

One deliberate deviation from the spec worth flagging at review: the spec's section 1 title was descriptive; the plan fixes the ten H2s as written headings so the drafter does not invent a numbering scheme. The wording of any heading is still Riddam's to change.
