# Claude Code Plugins Post — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one `engineering` post that reports which Claude Code plugins the author actually uses, counted from his own session logs, and reframes the idle ones by role rather than by merit.

**Architecture:** One Markdown file in the existing `engineering` collection. The harness-engineering post shipped first and owns the vocabulary, so this post recaps in a table and links. No structural changes. The link guard from the previous plan (`src/content/links.test.ts`) already covers this post's internal links; this plan extends its content assertion to the new slug.

**Tech Stack:** Astro 5 content collections, TypeScript, `node --test`, Pagefind. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-06-claude-code-plugins-design.md`

**Dependency met:** `src/content/engineering/harness-engineering-vocabulary.md` is published, so section 2 links to it as the spec requires.

---

## Global Constraints

Every task's requirements implicitly include this section. These match the harness post's plan; re-read them rather than assuming.

- **No emoji anywhere.**
- **No new npm dependencies.**
- **Build with `npm run build`, never bare `astro build`.**
- **No new cover SVGs, no raster images.**
- **Post body starts at `##`.** No H1.
- **Plain sentence-case H2s.** Not the `## 01 — Topic` form, which belongs to `guides`.
- **Internal links use `](/section/slug/)`,** optionally with an anchor. The link test enforces it.
- **No employer named, no internal tooling, no internal plugin names.** The private-marketplace section describes the pattern only. The author's internal marketplace and the `matt-pocock@coolblue` plugin installed from it must not appear — note that `mattpocock-skills@claude-plugins-official` is a *different*, public plugin and is fine to name.
- **Only official-marketplace plugins in the recommendations.** The named ones are Anthropic-authored.
- **No push to `origin`.** Commit locally only.
- **Length gate: 20 minutes** at 220 wpm, so ~4,400 words is the ceiling. Target **2,800–3,500 words** — this post is narrower than the harness post and should read shorter.
- **Every external claim carries a link,** and a `## References and further reading` section closes the post.
- **Date the evidence in the prose.** Every count is "as of 6 October 2026".

### Verified evidence (counted 2026-10-06)

Counted from `~/.claude/projects/**/*.jsonl` by matching namespaced skill invocations (`"skill":"<plugin>:<skill>"`) and plugin MCP tool calls (`"name":"mcp__plugin_<plugin>_..."`). **Paste these numbers; do not re-derive or round them.**

**Plugin skill invocations — the complete list, nothing omitted:**

| Plugin | Skill | Count |
|---|---|---|
| superpowers | systematic-debugging | 25 |
| superpowers | brainstorming | 23 |
| superpowers | writing-plans | 12 |
| superpowers | test-driven-development | 10 |
| superpowers | executing-plans | 7 |
| superpowers | verification-before-completion | 6 |
| superpowers | subagent-driven-development | 6 |
| superpowers | requesting-code-review | 1 |
| superpowers | finishing-a-development-branch | 1 |
| frontend-design | frontend-design | 6 |
| mattpocock-skills | codebase-design | 1 |

superpowers totals **91**. Every other installed plugin: **zero skill invocations**.

**Plugin MCP tool calls:** `deploy-on-aws` 43, `context7` 2. No other plugin's MCP tools were called.

**The correction that matters, and the post's best section.** An earlier count summed the built-in `code-review` skill (8) and the built-in `review` skill (9) and attributed 13 of them to the `code-review` *plugin*. That was wrong. The plugin's namespaced skill, `code-review:code-review`, was invoked **zero** times. The review work happened — through Claude Code's built-in `/code-review`, which does the same job without a plugin. So the working set is **five plugins, not six**, and `code-review` moves to the idle list as the cleanest possible example of "a plugin doing a job something else already does." Say this in the post: the method found its own error, which is the argument for using a method.

**The working set (five):** `superpowers` (91), `deploy-on-aws` (43 MCP calls), `frontend-design` (6), `context7` (2 MCP calls), `mattpocock-skills` (1).

**Installed, zero recorded use (eleven):** `code-review`, `claude-security`, `hookify`, `skill-creator`, `code-simplifier`, `typescript-lsp`, `superdesign`, `datadog`, `claude-md-management`, `security-guidance`, plus the private-marketplace plugin, which is not named.

**The measurement caveat, stated before the numbers, not after.** This counts skill and tool invocations. Hook-only plugins (`security-guidance`) and language-server plugins (`typescript-lsp`) never appear as either, so they read as zero regardless of how much they did. The method under-reports exactly the deterministic layer the harness post argued is most valuable — say so plainly, because it is the honest limit of the whole exercise.

**Plugin shapes, verified locally:** `superpowers` ships skills and hooks; `code-simplifier` ships one agent; `code-review` ships one command; `deploy-on-aws` ships skills, hooks and three MCP servers (`awsiac`, `awsknowledge`, `awspricing`).

**Marketplace:** the official marketplace is `anthropics/claude-plugins-official`, carrying **315** plugins, **39** of them authored by Anthropic (counted from `marketplace.json`, 2026-10-06). Use 39 — an earlier draft said 40 and was wrong.

**Recommendation candidates, all Anthropic-authored and all confirmed present in the marketplace manifest on 2026-10-06:** `claude-code-setup`, `feature-dev`, `code-review`, `pr-review-toolkit`, `pyright-lsp`, `typescript-lsp`, `gopls-lsp`, `rust-analyzer-lsp`, `security-guidance`, `claude-security`, `commit-commands`, `claude-md-management`, `session-report`, `plugin-dev`, `skill-creator`.

### Verified reference URLs (HTTP 200 on 2026-10-06)

- Plugins — `https://code.claude.com/docs/en/plugins`
- Plugin marketplaces — `https://code.claude.com/docs/en/plugin-marketplaces`
- Skills — `https://code.claude.com/docs/en/skills`
- Slash commands — `https://code.claude.com/docs/en/slash-commands`
- Hooks — `https://code.claude.com/docs/en/hooks`
- MCP — `https://code.claude.com/docs/en/mcp`
- Settings — `https://code.claude.com/docs/en/settings`
- Memory — `https://code.claude.com/docs/en/memory`
- Official marketplace repo — `https://github.com/anthropics/claude-plugins-official`
- Superpowers — `https://github.com/obra/superpowers`
- Context7 — `https://github.com/upstash/context7`

Any URL not on this list gets a `curl -s -o /dev/null -w '%{http_code}' -L` check returning 200 before it goes in the post. Task 4 re-checks them all anyway.

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `src/content/engineering/claude-code-plugins-what-i-actually-use.md` | **Create.** The post. Frontmatter and skeleton in Task 1, prose in Tasks 2–3, audit in Task 4. | 1–4 |
| `src/content/links.test.ts` | **Modify.** Extend the existing content assertion to cover the new slug. | 1 |

---

## Review Focus

1. **The corrected count is buried or quietly dropped.** It is the most honest thing in the post and the drafter will be tempted to present a clean six-plugin list instead. Pinned to Task 2, Step 3.
2. **The measurement caveat lands after the table instead of before it.** Numbers read as authoritative the moment they appear. Pinned to Task 2, Step 2.
3. **An idle plugin is described as bad rather than as wrong-for-this-role.** The spec's whole reframe. Pinned to Task 3, Step 1.
4. **The post re-teaches the vocabulary** instead of linking to the harness post. Pinned to Task 2, Step 1, and re-checked by word count in Task 4.
5. **A recommendation names a plugin that is not in the official marketplace,** or not Anthropic-authored. Pinned to Task 3, Step 3, which greps the manifest.
6. **A broken or 404 reference link.** Pinned to Task 4, Step 3.

---

## Task 1: Skeleton and link guard

**Files:**
- Create: `src/content/engineering/claude-code-plugins-what-i-actually-use.md`
- Modify: `src/content/links.test.ts`

**Interfaces:**
- Consumes: the published harness post at `/engineering/harness-engineering-vocabulary/`.
- Produces: the post path and the extended guard that Tasks 2–4 re-run.

- [ ] **Step 1: Extend the failing test**

In `src/content/links.test.ts`, change the second test to cover both posts. Replace the single-slug assertion with a loop:

```ts
test('the harness and plugins posts exist and are not drafts', () => {
  const known = slugs();
  const expected = [
    'harness-engineering-vocabulary',
    'claude-code-plugins-what-i-actually-use',
  ];
  for (const slug of expected) {
    assert.ok(
      known.has(`/engineering/${slug}/`),
      `expected src/content/engineering/${slug}.md (published, not a draft)`,
    );
  }
});
```

Note that `slugs()` already excludes drafts, so a `draft: true` post fails this assertion — that is intentional and is why the message says "published".

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL with "expected src/content/engineering/claude-code-plugins-what-i-actually-use.md (published, not a draft)". The link test and all others pass.

- [ ] **Step 3: Create the post with frontmatter and skeleton**

Exactly this frontmatter. `agent` is already used once (`guides/cca-f-study-guide.md`), so `coverVariant: 2` is required by the repo convention documented in `src/content.config.ts`:

```yaml
---
title: "Claude Code Plugins: What I Actually Use, and What a Plugin Even Is"
description: "Seventeen plugins installed, five actually used — counted from my own session logs, including the one the count proved I was wrong about. What a plugin really is, why an idle plugin is usually a role mismatch rather than a bad plugin, and which official ones are worth starting with."
pubDate: 2026-10-06
tags: ["claude-code", "ai-assisted-coding", "developer-productivity", "plugins"]
cover: agent
coverVariant: 2
draft: false
---
```

Body skeleton — these nine H2s and nothing else yet:

```markdown
## Install rate is not usage rate

## What is in the box

## The one rule this post needs

## What I actually use

## The eleven I don't

## Count your own

## What a plugin costs you

## Where to start, if you are starting now

## Marketplaces your team controls

## References and further reading
```

- [ ] **Step 4: Verify**

Run: `npm test`
Expected: PASS, 18 tests.

Run: `npm run build`
Expected: succeeds.

```bash
test -f dist/engineering/claude-code-plugins-what-i-actually-use/index.html && echo OK
```
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add src/content/links.test.ts src/content/engineering/claude-code-plugins-what-i-actually-use.md
git commit -m "Add the plugins post skeleton and extend the link guard"
```

---

## Task 2: The frame, the recap, and the working set

Spec sections 1–4.

**Files:**
- Modify: `src/content/engineering/claude-code-plugins-what-i-actually-use.md` (H2s 1–4)

**Interfaces:**
- Consumes: the skeleton from Task 1.
- Produces: the five-plugin working set and the stated measurement caveat, both of which Task 3 refers back to.

- [ ] **Step 1: Write "Install rate is not usage rate" and "What is in the box"**

The opening makes one promise: every number here was counted, not remembered. Seventeen plugins installed, five actually used. Say that the count corrected the author's own belief, and promise the detail later rather than spending it here.

"What is in the box" is a **recap, not a lesson**: a plugin is a bundle of skills, subagents, commands, hooks and MCP servers. Use the verified shapes to make it concrete — `superpowers` ships skills and hooks, `code-simplifier` one agent, `code-review` one command, `deploy-on-aws` skills, hooks and three MCP servers. Then the compact table and the link out:

```markdown
| Layer | Answers | Triggered by |
| --- | --- | --- |
| Skill | "How do I do X well?" | The model, on judgement |
| Subagent | "Who should do X, in its own context?" | The model delegating |
| Slash command | "Run X now" | You, explicitly |
| Hook | "This must happen every time" | The harness, deterministically |
| MCP server | "Talk to a system outside the repo" | Tool call |
| Settings / CLAUDE.md | "What is always true here?" | Always loaded |
```

Link to [the harness-engineering post](/engineering/harness-engineering-vocabulary/) for the explanation. **Keep these two sections under 500 words combined.** If a sentence starts explaining how the model chooses a skill, delete it — that post owns it.

- [ ] **Step 2: Write "The one rule this post needs"**

Short. **Anything that must happen every time is a hook or a setting, never a skill.** One paragraph of defence, one sentence pointing at the harness post for why, and a forward promise that this rule explains most of the idle list. 150–200 words.

Then, immediately before any number appears, the measurement caveat. This is Review Focus item 2 and the order is not negotiable: the method counts skill and tool invocations, so hook-only plugins and language servers read as zero no matter how useful they were. Name `security-guidance` and `typescript-lsp` as the two this under-reports, and note the irony — the method is blindest to the layer the rule above says is most valuable.

- [ ] **Step 3: Write "What I actually use"**

Five plugins, each with what it is, when it fires, what it replaced, and one cost. Order by the counts. Use the verified numbers verbatim and date them.

- **superpowers** (91 invocations; [obra/superpowers](https://github.com/obra/superpowers)) — systematic-debugging 25 and brainstorming 23 are the two that changed the author's defaults, with writing-plans 12 and test-driven-development 10 behind them. What it replaced: starting to code before deciding what to build. Cost: it is opinionated and slows you down on purpose, which is the point and also the complaint.
- **deploy-on-aws** (43 MCP tool calls) — three MCP servers for AWS documentation, pricing and IaC validation. Replaced tab-switching and guessing at cost. Cost: three servers' worth of tool definitions in every session, which is the context tax made concrete.
- **frontend-design** (6) — fires when building UI; the output stops looking templated. Cost: narrow by design, does nothing for backend work.
- **context7** (2 MCP calls; [upstash/context7](https://github.com/upstash/context7)) — live library documentation by MCP. Low count, high value, because it fixes the specific failure of a model confidently inventing an API that was renamed two versions ago. Be honest that two calls is not a strong endorsement — it is a note that the failure it fixes is expensive when it happens.
- **mattpocock-skills** (1, `codebase-design`) — a vocabulary for module design. Used once, changed how a seam was named, kept for that. Do not inflate it.

Then the correction, in its own short passage and **not** buried — Review Focus item 1. An earlier pass at this counted 13 uses of a `code-review` *plugin* that was never once invoked; the 13 were Claude Code's built-in review skill. The point to draw: a plugin and a built-in with the same name are not the same thing, the author believed he used a plugin he had never used, and the only reason he knows otherwise is that he counted. Lead the next section with where that plugin actually belongs.

Target 900–1,100 words for this section.

- [ ] **Step 4: Verify**

Run: `npm test`
Expected: PASS, 18 tests.

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/content/engineering/claude-code-plugins-what-i-actually-use.md
git commit -m "Plugins post: the frame, the recap and the working set"
```

---

## Task 3: The idle eleven, the method, the costs, the recommendations

Spec sections 5–9.

**Files:**
- Modify: `src/content/engineering/claude-code-plugins-what-i-actually-use.md` (H2s 5–9)

**Interfaces:**
- Consumes: the working set and caveat from Task 2.
- Produces: the finished body that Task 4 audits.

- [ ] **Step 1: Write "The eleven I don't"**

Open with the framing that is the point of the whole post, stated before any name: **idle is not bad, and only one of the three reasons is a reason to uninstall.** Group them, and for each plugin say who it *would* be right for. This is Review Focus item 3 — a sentence that reads as a verdict on the plugin rather than on the fit is a defect.

- **Doing a job something else already does.** `code-review`, the one the count caught — Claude Code's built-in does it. `code-simplifier`, which overlaps the review pass already being run. `skill-creator`, which overlaps `superpowers`' own skill tooling. This is the only group where "uninstall it" is the advice, and even here it is "pick one", not "this one is bad".
- **Right job, wrong role.** The big group, and the reason a best-plugins list is useless without knowing whose desk it came from. `superdesign` is dead weight on infrastructure work and central for a designer. `claude-security` is a deliberate deep scan run rarely here and weekly by a security consultant. `datadog` belongs to whoever owns the dashboards. `typescript-lsp` earns its place in a TypeScript product codebase; CDK is a thinner case. Say outright: nothing is wrong with any of them, they are not wrong *for me*.
- **Right job, wrong trigger.** `claude-md-management` and `hookify` are both good and both wait to be remembered. The slash-command failure mode from the recap, in the author's own data.
- **Measured as zero, probably not zero.** `security-guidance` (hooks) and `typescript-lsp` (a language server). Restate the caveat here rather than relying on the reader remembering it.

Close on the two actions: for the role group, keep it if you expect to change hats and drop it if you do not — and if you are recommending a set to a team, split it by role rather than publishing one list. For the trigger group, the fix is not discipline, it is converting the trigger to a hook or a line in `CLAUDE.md`.

Target 700–900 words.

- [ ] **Step 2: Write "Count your own" and "What a plugin costs you"**

The method, as something a reader can run. Give the actual commands:

```bash
# Which plugin skills actually fired
grep -rhoE '"skill":"[a-z0-9_-]+:[a-z0-9_:-]+"' ~/.claude/projects --include='*.jsonl' \
  | sort | uniq -c | sort -rn

# Which plugin MCP tools were called
grep -rho '"name":"mcp__plugin_[a-z0-9_-]*' ~/.claude/projects --include='*.jsonl' \
  | sed 's/.*mcp__plugin_//' | cut -d_ -f1 | sort | uniq -c | sort -rn
```

Explain the one subtlety that caused the author's own error: match the *namespaced* form `plugin:skill`, because an unqualified name may be a built-in. Restate the hook and LSP blind spot. Mention `session-report` (official, Anthropic-authored) as the packaged alternative.

Then the costs, three of them, concretely:
- **Context.** Skill descriptions and MCP tool definitions sit in the prompt before you type. MCP-heavy plugins are the expensive ones; `deploy-on-aws`'s three servers are the author's own largest bill.
- **Trigger collisions.** Overlapping descriptions mean the model picks one and which one is not obvious. Use only public examples: the built-in `code-review` against the `code-review` plugin — the collision that caused the miscount — and two `skill-creator`s.
- **Drift.** Plugins update on a git SHA under you. State what the author does about it rather than prescribing.

Target 500–650 words combined.

- [ ] **Step 3: Write "Where to start, if you are starting now" and "Marketplaces your team controls"**

A ladder, not a catalogue. One sentence each, saying what problem it solves. All Anthropic-authored, all from the official marketplace:

- **First**: `claude-code-setup` — it reads your codebase and recommends hooks, skills and subagents for *it*. The honest first move is letting it tell you what you need rather than copying someone else's list.
- **One workflow plugin**: `superpowers` for the full process ladder, `feature-dev` for something lighter.
- **Review**: `code-review`, or `pr-review-toolkit` for reviewers separated by concern.
- **Language intelligence**: `pyright-lsp`, `typescript-lsp`, `gopls-lsp`, `rust-analyzer-lsp`. Cheap in prompt terms and they stop a class of wrong-symbol edits.
- **Safety nets**: `security-guidance`, which is hook-driven and so works without you remembering, and `claude-security` for a deliberate deep scan.
- **Housekeeping**: `commit-commands`, `claude-md-management`, `session-report`.
- **Building your own**: `plugin-dev`, and `skill-creator` for a single skill.

Then the clause the previous review required: three of these (`code-review`, `claude-security`, `claude-md-management`) are in the idle list above. Say so in one sentence — they are recommended on their merits and idle here for role and trigger reasons, and that is the thing to fix on installing them, not a reason to skip them.

Before writing, confirm every name is in the manifest (Review Focus item 5):

```bash
python3 -c "
import json
d=json.load(open('/Users/riddam.jain/.claude/plugins/marketplaces/claude-plugins-official/.claude-plugin/marketplace.json'))
names={p['name'] for p in d['plugins'] if (p.get('author') or {}).get('name')=='Anthropic'}
for n in ['claude-code-setup','feature-dev','code-review','pr-review-toolkit','pyright-lsp','typescript-lsp','gopls-lsp','rust-analyzer-lsp','security-guidance','claude-security','commit-commands','claude-md-management','session-report','plugin-dev','skill-creator']:
    print(('OK  ' if n in names else 'MISSING '), n)
"
```
Expected: every line `OK`. Anything `MISSING` comes out of the post.

**Marketplaces your team controls** closes the body: a marketplace is a git repo with a manifest, a team can publish its own — runbooks, house conventions, review rules — and install it alongside the official one. Why this beats one long shared `CLAUDE.md`: it versions, it scopes to the repos that need it, and skills load on demand instead of taxing every prompt. **No employer, no internal plugin names, no internal tooling.** 250–350 words for both sections.

- [ ] **Step 4: Write "References and further reading"**

Grouped, house style, only URLs from the verified list: the Claude Code docs pages (plugins and marketplaces first, then skills, slash commands, hooks, MCP, settings, memory), the official marketplace repo, and the two third-party plugins named in the working set. Add the harness post and the playbook as internal "keep reading" links in prose, not here.

- [ ] **Step 5: Verify**

Run: `npm test`
Expected: PASS, 18 tests.

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/content/engineering/claude-code-plugins-what-i-actually-use.md
git commit -m "Plugins post: the idle eleven, the method, the costs and the ladder"
```

---

## Task 4: Audit

**Files:**
- Modify: `src/content/engineering/claude-code-plugins-what-i-actually-use.md` (only if a check fails)

- [ ] **Step 1: Length**

```bash
node --input-type=module -e "
import { readFileSync } from 'node:fs';
const b = readFileSync('src/content/engineering/claude-code-plugins-what-i-actually-use.md','utf8').replace(/^---[\s\S]*?\n---\n/,'');
const w = b.split(/\s+/).filter(Boolean).length;
console.log(w,'words,',Math.max(1,Math.round(w/220)),'min');
"
```
Expected: 2,800–3,500 words. If over, cut from "Where to start" first — it is a pointer section — then from the recap. Do not cut the idle-eleven section or the correction.

- [ ] **Step 2: Duplication and policy**

The no-duplication rule against the post that now owns the vocabulary:

```bash
grep -nE 'Trigger|hook|skill|subagent|MCP server' \
  src/content/engineering/harness-engineering-vocabulary.md | head -20
```

This post may name a layer and link; it may not explain one. If a paragraph here could be moved into the harness post without anyone noticing, cut it to a sentence.

Policy:

```bash
grep -nP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' src/content/engineering/claude-code-plugins-what-i-actually-use.md
grep -nE '^# |^## [0-9]{2} —' src/content/engineering/claude-code-plugins-what-i-actually-use.md
grep -niE 'coolblue|matt-pocock@|internal marketplace' src/content/engineering/claude-code-plugins-what-i-actually-use.md
```
Expected: no output from any of the three. Note the third deliberately allows `mattpocock-skills`, the public plugin, while catching the private one.

- [ ] **Step 3: Resolve every external link**

```bash
grep -ohE 'https?://[^) ]+' src/content/engineering/claude-code-plugins-what-i-actually-use.md \
  | sed 's/[.,]$//' | sort -u \
  | while read -r u; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -L "$u")" "$u"; done
```
Expected: every line starts with `200`.

- [ ] **Step 4: Numbers match the evidence block**

Every count in the post against the verified-evidence table above, one by one: 91, 25, 23, 12, 10, 43, 6, 2, 1, 17 installed, 5 used, 11 idle, 315 plugins, 39 Anthropic-authored. A number in the post that is not in that block is invented.

- [ ] **Step 5: Full verification**

Run: `npm test` → PASS, 18 tests.
Run: `npm run build` → succeeds.

```bash
test -f dist/engineering/claude-code-plugins-what-i-actually-use/index.html && echo OK
grep -c 'claude-code-plugins-what-i-actually-use' dist/engineering/index.html
```
Expected: `OK` and at least 1.

- [ ] **Step 6: Commit**

```bash
git add src/content/engineering/claude-code-plugins-what-i-actually-use.md
git commit -m "Plugins post: audit pass"
```

- [ ] **Step 7: Hand back**

Do not push. Report the word count, the first-person claims Riddam must confirm, anything cut for length, and anything that could not be verified.

---

## Self-Review

**Spec coverage.** Spec sections 1–9 map to Tasks 2 (1–4) and 3 (5–9). Frontmatter, motif and the `coverVariant: 2` convention are Task 1. The publication-order dependency is satisfied and recorded in the header. The references requirement is Task 3, Step 4.

**Placeholders.** None. Every section carries its argument, word target and exact content; every command is runnable as written.

**Type consistency.** The slug `claude-code-plugins-what-i-actually-use` is identical in the test, the filename, the build check and all four greps. The test's `expected` array in Task 1 matches the two real slugs.

**Review Focus coverage.** Item 1 → Task 2, Step 3, and protected from cutting in Task 4, Step 1. Item 2 → Task 2, Step 2, with the ordering called non-negotiable. Item 3 → Task 3, Step 1. Item 4 → Task 2, Step 1, re-checked in Task 4, Step 2. Item 5 → Task 3, Step 3's manifest grep. Item 6 → Task 4, Step 3.

**One deviation from the spec, flagged for review:** the spec was written when the working set was believed to be six plugins including `code-review`. The recount shows five. The spec's structure is unchanged; its section 4 loses one entry and its section 5 gains one, with the correction itself becoming a named passage. This is the spec's own method working as intended, but Riddam should know the headline number moved from six to five.
