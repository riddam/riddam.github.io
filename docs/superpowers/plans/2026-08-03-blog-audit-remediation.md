# Blog Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the remaining findings from the 2026-08-03 UI/content audit of the myp-guide Astro blog — 9 mechanical tasks, 3 blocked on your input.

**Architecture:** Astro 5 static site, no framework components, no runtime. Content lives in four `src/content/*` collections validated by a Zod schema. All styling is hand-written CSS driven by custom properties in `src/styles/global.css`, with a `data-theme` attribute overriding a `prefers-color-scheme` default. Changes here are surgical edits to existing files plus three new files; nothing is restructured.

**Tech Stack:** Astro 5, TypeScript, Pagefind 1.5 (search), astro-og-canvas (social cards), mermaid 11 (diagrams), Shiki (syntax highlighting), `node:test` (new — built in, no dependency).

## Global Constraints

- **Zero new npm dependencies.** Node is v26, which imports `.ts` natively and ships `node --test`. Do not add vitest, jest, or a test runner.
- **Deploys must use `npm run build`** (`astro build && pagefind --site dist`). A bare `astro build` silently omits the Pagefind index and breaks `/search`.
- **`npm run dev` does not generate the Pagefind index.** Test search with `npm run build && npm run preview` only.
- **Emoji policy:** no decorative emoji anywhere. The only permitted emoji are the four DISC colour swatches (🔴🟡🟢🔵) in `book-notes/surrounded-by-idiots-erikson.md`, which are meaningful content. Do not remove those.
- **Anonymization (hard constraint):** engineering posts must contain no account IDs, CIDRs, OCIDs, ARNs, repo/bucket names, DNS zones, "Coolblue", or the product names Oracle Database@AWS / ODB / OCI / Exadata; and no employer-stack fingerprints. Achieve this by writing generically — **never add a disclaimer or a "Writing About This Safely" section.** Explicit meta-commentary about sanitization is itself the tell and has been deliberately removed. Note: "OCI registries" in the Terraform/Pulumi post means Open Container Initiative, not Oracle — leave it.
- **Palette is lavender.** Light accent `#6d45c7`, dark accent `#b598f2`, light bg `#f7f5fc`, dark bg `#161221`. Every colour added must be defined for **both** themes, using the `@media (prefers-color-scheme: dark) + :root:not([data-theme='light'])` **and** `:root[data-theme='dark']` pair — the toggle sets `data-theme` and must win in both directions.
- **New text colours must clear WCAG AA (4.5:1)** against `--bg` (#f7f5fc), `--surface` (#f0ebfa), and `--code-bg` (#f2edfb). Muted text runs as small as 0.72rem, so there is no large-text exemption.
- **Before editing any LLM/Claude content, load the `claude-api` skill first.** It is the authority on model IDs and API currency. This applies to Tasks 9 and 10.
- **Cover-art convention: section = colour, motif = the post.** Covers auto-tint by section via `--cover-accent`. Do not introduce per-post colours.
- **Astro 5 scopes component styles with zero-specificity `:where()`,** which is why `.post-list .post-thumb` in `global.css` can override `Cover.astro`'s own sizing. Do not "fix" this by adding `!important`.
- **Commit after every task.** Do not batch tasks into one commit.

## Verification model

This project has no browser or component test harness, and adding one is out of scope. Two verification mechanisms are used, both real:

1. **`node --test` for pure functions** (Task 1 only — `readingStats` is the sole pure function).
2. **Assertions against `dist/`** for everything that renders. `npm run build` then grep/parse the built HTML and CSS. This is exactly how the first three fixes were verified.

Where a task's outcome is visual (Task 5), the step says so explicitly and asks for a `npm run preview` eyeball. Do not claim a visual task passed without looking at it.

> **Counting things in `dist/`:** Astro ships with `compressHTML: true`, so a built page is ~25 very long lines. `grep -c` counts **matching lines**, not matches, and will report `1` where there are 18. Always count occurrences with `grep -o '…' file | wc -l`. Every check below is written that way; keep it that way if you add more.
>
> Also note that Astro appends a scoped `data-astro-cid-…` attribute to elements from a component's `<style>`, so `<a href="#foo">` is emitted as `<a href="#foo" data-astro-cid-gvpn4u4b>`. Patterns that assume `>` follows the closing quote will match nothing. Match on the class or the opening substring instead.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `src/utils/reading-time.ts` | modify | Word count + reading estimate. Gains prose extraction. |
| `src/utils/reading-time.test.ts` | **create** | Unit tests for the above. Only test file in the repo. |
| `src/motifs.ts` | **create** | Single source of truth for the 18 cover-motif names. |
| `src/content.config.ts` | modify | Import motif list instead of inlining the enum. |
| `src/components/Cover.astro` | modify | Import `Motif` type. |
| `src/components/PostList.astro` | modify | Import `Motif` type (drop local union). |
| `src/layouts/Post.astro` | modify | Import `Motif` type (drop two local unions); TOC depth. |
| `src/styles/global.css` | modify | TOC h3 indent rule. |
| `src/pages/index.astro` | modify | Cap the post list. |
| `src/pages/archive.astro` | **create** | Full post index grouped by year. |
| `src/components/Footer.astro` | modify | Link to the archive. |
| `src/pages/search.astro` | modify | Pagefind Component UI + theming. |
| `src/content/*/_template.md` | modify | Document `updatedDate`. |
| `README.md` | modify | Document the `updatedDate` convention and `npm test`. |

---

## Task 1: Reading-time accuracy (+ the repo's first test)

Reading times are inflated 10–17% on code- and table-heavy posts because `readingStats` counts raw markdown: fence markers, table pipes, link URLs, and mermaid diagram source all count as words. The AI architecture guide shows "35 min" for ~30 minutes of prose.

The correct basis is **prose + tables, excluding fenced code** — which is exactly what Pagefind indexes, so Pagefind's per-page `word_count` is the reference. The algorithm below was measured against all 19 posts: mean absolute error 6.5%, and every post's displayed minute count lands within 1 minute of the reference. The residual undershoot is because Pagefind also indexes each page's title, description, and section label, which a body-only count correctly excludes.

**Files:**
- Modify: `src/utils/reading-time.ts`
- Create: `src/utils/reading-time.test.ts`
- Modify: `package.json` (add `test` script)

**Interfaces:**
- Consumes: nothing.
- Produces: `readingStats(body?: string): { words: number; minutes: number }` — unchanged signature, so all four call sites (`index.astro`, `[section]/index.astro`, `[section]/[...slug].astro`, `tags/[tag].astro`) keep working untouched. `words` now means *prose words* and continues to feed the `wordCount` field in the BlogPosting JSON-LD.

- [ ] **Step 1: Add the test script to `package.json`**

In the `"scripts"` block, after `"preview"`, add:

```json
"test": "node --test \"src/**/*.test.ts\""
```

- [ ] **Step 2: Write the failing test**

Create `src/utils/reading-time.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readingStats } from './reading-time.ts';

test('counts plain prose', () => {
  assert.equal(readingStats('one two three four five').words, 5);
});

test('excludes fenced code blocks', () => {
  const body = [
    'Real prose here.',
    '',
    '```python',
    'def a_function_with_many_tokens(x, y, z):',
    '    return x + y + z',
    '```',
    '',
    'More prose.',
  ].join('\n');
  // "Real prose here. More prose." = 5 words
  assert.equal(readingStats(body).words, 5);
});

test('excludes mermaid diagram source', () => {
  const body = ['Intro.', '', '```mermaid', 'flowchart TD', 'A --> B', '```'].join('\n');
  assert.equal(readingStats(body).words, 1);
});

test('keeps table cell text but not pipe delimiters', () => {
  const body = ['| Tool | Verdict |', '| --- | --- |', '| Pulumi | Good |'].join('\n');
  // Tool Verdict Pulumi Good = 4 words, no pipes counted
  assert.equal(readingStats(body).words, 4);
});

test('keeps link labels and drops URLs', () => {
  assert.equal(
    readingStats('See [the uv docs](https://github.com/astral-sh/uv) now.').words,
    5 // See the uv docs now.
  );
});

test('drops image markup entirely', () => {
  assert.equal(readingStats('Before ![a long alt text](/img/x.png) after').words, 2);
});

test('strips heading, bullet, quote and emphasis markers', () => {
  const body = ['## A Heading', '', '- **bold** item', '', '> quoted text'].join('\n');
  // A Heading bold item quoted text = 6
  assert.equal(readingStats(body).words, 6);
});

test('keeps inline code as one token', () => {
  assert.equal(readingStats('Run `uv sync` first').words, 4);
});

test('rounds minutes at 220 wpm with a floor of 1', () => {
  assert.equal(readingStats('word').minutes, 1);
  assert.equal(readingStats(Array(220).fill('word').join(' ')).minutes, 1);
  assert.equal(readingStats(Array(660).fill('word').join(' ')).minutes, 3);
});

test('handles an empty body', () => {
  assert.deepEqual(readingStats(), { words: 0, minutes: 1 });
  assert.deepEqual(readingStats(''), { words: 0, minutes: 1 });
});
```

- [ ] **Step 3: Run the tests and confirm they fail**

Run: `npm test`

Expected: the "excludes fenced code blocks", "excludes mermaid", "keeps table cell text", "keeps link labels", "drops image markup", and "strips heading…" tests FAIL, because the current implementation counts all of that. The plain-prose, minutes, and empty-body tests should already pass.

- [ ] **Step 4: Implement prose extraction**

Replace the whole body of `src/utils/reading-time.ts` with:

````ts
// Word count and estimated reading time for a post body.
// 220 wpm is a common average for technical prose.
//
// The count is *prose plus tables, excluding fenced code* — the same basis
// Pagefind indexes on. Counting raw markdown inflated the estimate by 10-17%
// on code- and table-heavy posts (fence markers, table pipes, link URLs and
// mermaid diagram source all read as "words").
function toProse(body: string): string {
  return (
    body
      // Fenced code and mermaid diagrams: skimmed, not read at 220 wpm.
      .replace(/^```[\s\S]*?^```/gm, ' ')
      // Images: alt text is not body prose.
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      // Links: keep the visible label, drop the URL.
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // Inline code: keep the token, drop the backticks.
      .replace(/`([^`]*)`/g, '$1')
      // Leading block markers.
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s{0,3}>\s?/gm, '')
      .replace(/^\s{0,3}[-*+]\s+/gm, '')
      // Table separator rows (|---|:--:|) carry no text.
      .replace(/^\s{0,3}\|[-:\s|]*\|\s*$/gm, ' ')
      // Remaining table delimiters: drop the pipes, keep the cell text.
      .replace(/\|/g, ' ')
      // Emphasis marks.
      .replace(/[*_~]/g, '')
  );
}

export function readingStats(body = '') {
  const words = toProse(body).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return { words, minutes };
}
````

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `npm test`
Expected: all 10 tests PASS.

- [ ] **Step 6: Confirm the real posts moved to the expected numbers**

Run: `npm run build`

Then check the built pages against these measured values — these are the numbers the corrected algorithm produced when it was validated, so treat any deviation as a regression:

```bash
for p in guides/ai-architecture-master-guide guides/gcp-pca-study-guide \
         guides/mlops-production-guide engineering/ai-assisted-coding-playbook; do
  printf "%-46s %s\n" "$p" "$(grep -o '[0-9]* min read' dist/$p/index.html | head -1)"
done
```

Expected exactly:

| Post | Before | After |
|---|---|---|
| `guides/ai-architecture-master-guide` | 35 min | **28 min** |
| `guides/gcp-pca-study-guide` | 33 min | **29 min** |
| `guides/mlops-production-guide` | 17 min | **13 min** |
| `engineering/ai-assisted-coding-playbook` | 18 min | **16 min** |

- [ ] **Step 7: Commit**

```bash
git add package.json src/utils/reading-time.ts src/utils/reading-time.test.ts
git commit -m "Reading time: count prose, not markdown syntax"
```

---

## Task 2: Single source of truth for cover motifs

The 18-motif union is written out in **five** places: the Zod enum in `content.config.ts`, and hand-maintained TypeScript unions in `Cover.astro`, `PostList.astro`, and twice in `Post.astro` (`RelatedPost.cover` and `Props.cover`). Adding a motif means editing five lists, and nothing catches it if one drifts.

**Files:**
- Create: `src/motifs.ts`
- Modify: `src/content.config.ts:12-31`
- Modify: `src/components/Cover.astro`
- Modify: `src/components/PostList.astro:4-22`
- Modify: `src/layouts/Post.astro:23-41` and `:66-84`

**Interfaces:**
- Consumes: nothing.
- Produces: `COVER_MOTIFS: readonly string[]` (a `as const` tuple of the 18 names) and `type Motif = (typeof COVER_MOTIFS)[number]`, both from `src/motifs.ts`. Later tasks do not depend on this.

Put the list in its own module rather than in `consts.ts` or `content.config.ts`: importing `content.config.ts` into a component would pull `defineCollection`/`astro:content` into component scope for no reason.

- [ ] **Step 1: Create `src/motifs.ts`**

```ts
/**
 * Abstract cover-art motifs, rendered by src/components/Cover.astro.
 *
 * Section = colour, motif = the post: a cover is tinted by its section via
 * --cover-accent, so a motif carries no colour of its own. Adding one means
 * adding an SVG case to Cover.astro and a name here — nowhere else.
 */
export const COVER_MOTIFS = [
  'config',
  'network',
  'pipeline',
  'rollout',
  'cloud',
  'ai',
  'code',
  'book',
  'leadership',
  'personas',
  'pyramid',
  'steps',
  'assist',
  'training',
  'speed',
  'agent',
  'scales',
  'cycle',
] as const;

export type Motif = (typeof COVER_MOTIFS)[number];

export type SectionId = 'engineering' | 'book-notes' | 'leadership' | 'guides';
```

- [ ] **Step 2: Point the schema at it**

In `src/content.config.ts`, add to the imports at the top:

```ts
import { COVER_MOTIFS } from './motifs';
```

Then replace the entire inline `cover: z.enum([...]).optional()` block (the 20 lines from `cover: z` through `.optional(),`) with:

```ts
  /** Abstract cover-art motif (see src/components/Cover.astro). Optional. */
  cover: z.enum(COVER_MOTIFS).optional(),
```

- [ ] **Step 3: Replace the local unions in the three components**

In `src/components/PostList.astro`, delete the local `type Motif = ...` union (18 lines) and the local `type SectionId = ...`, and add to the frontmatter imports:

```ts
import type { Motif, SectionId } from '../motifs';
```

In `src/layouts/Post.astro`, add to the frontmatter imports:

```ts
import type { Motif, SectionId } from '../motifs';
```

Then in `interface RelatedPost`, replace the inline 18-member union with `cover?: Motif;` and replace `sectionId?: 'engineering' | 'book-notes' | 'leadership' | 'guides';` with `sectionId?: SectionId;`. In `interface Props`, replace the second inline 18-member union with `cover?: Motif;`.

In `src/components/Cover.astro`, the unions are written **inline inside `interface Props`** (there is no named local type). Add the import and collapse both fields:

```ts
import type { Motif, SectionId } from '../motifs';

interface Props {
  motif: Motif;
  /** Section id — tints the art with that section's accent hue. Optional. */
  tint?: SectionId;
  class?: string;
}
```

Keep the explanatory comment above `interface Props` and leave the SVG rendering logic completely alone.

- [ ] **Step 4: Verify the type is actually enforced and nothing regressed**

Run: `npx astro check`
Expected: no new errors. (Pre-existing errors unrelated to motifs may exist; compare against `git stash` output if unsure.)

Run: `npm run build`
Expected: build succeeds, 81 pages.

This is a **type-only refactor**, so the rendered output must not change at all. Note that `Cover.astro` does *not* emit the motif name as a class — it switches on the prop to pick an SVG — so there is nothing like `.motif-network` to count. Assert these measured invariants instead:

```bash
# one hero cover per post page
grep -rlo 'post-cover' dist --include=index.html | wc -l              # expect 19
# all four section tints still applied
grep -rho 'class="cover tint-[a-z-]*' dist --include=index.html | sort -u | wc -l   # expect 4
# covers still appear across post pages, section indexes, tag pages and home
grep -rlo 'class="cover' dist --include=index.html | wc -l            # expect 77
# and the source still uses 18 distinct motifs (19 after Task 2b)
grep -h '^cover:' src/content/*/*.md | sort -u | wc -l                # expect 18
```

- [ ] **Step 5: Prove the enum is load-bearing (negative check)**

Temporarily add `cover: notamotif` to the frontmatter of `src/content/engineering/uv-one-tool-to-rule-your-python.md` and run `npm run build`.
Expected: build FAILS with a Zod validation error naming the `cover` field.
Then revert that line back to `cover: speed` and re-run `npm run build` to confirm it succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/motifs.ts src/content.config.ts src/components/Cover.astro \
        src/components/PostList.astro src/layouts/Post.astro
git commit -m "Covers: single source of truth for motif names"
```

---

## Task 2b: Resolve the duplicate cover motif

**New finding, discovered while writing this plan.** The cover system's stated convention is *section = colour, motif = the post* — every post gets unique art. That held at 18 posts and 18 motifs, but the site now has **19 posts and 18 distinct motifs**: `cover: scales` is used by both

- `book-notes/never-split-the-difference-voss.md` (Voss, negotiation), and
- `engineering/multi-cloud-terraform-vs-pulumi.md` (Terraform vs Pulumi trade-off).

They are in different sections, so section tinting gives them different hues (orchid vs violet) and the collision is partly masked — which is why it went unnoticed. The line work is still identical.

`scales` (balance, weighing two options) belongs to the multi-cloud comparison. The Voss note needs new art. Its central tactic is *mirroring*, which is what the new motif depicts.

**Files:**
- Modify: `src/motifs.ts` (add `'mirror'`)
- Modify: `src/components/Cover.astro` (add the SVG case)
- Modify: `src/content/book-notes/never-split-the-difference-voss.md` (frontmatter)

**Interfaces:**
- Consumes: `COVER_MOTIFS` / `Motif` from Task 2. **This task depends on Task 2 being done first** — otherwise the new name has to be added in five places.
- Produces: a 19th motif name, `'mirror'`.

- [ ] **Step 1: Register the motif**

In `src/motifs.ts`, add `'mirror',` to the end of the `COVER_MOTIFS` array (after `'cycle',`). The `Motif` type widens automatically.

- [ ] **Step 2: Draw it**

In `src/components/Cover.astro`, add this case alongside the others (after the `scales` case). It follows the house idiom: `1200 × 380` viewBox, art kept within roughly x 150–1050 / y 100–300, `stroke="var(--cover-accent)"` at `stroke-width="2.5"` with `stroke-opacity` between 0.25 and 0.7, rounded caps, and no hardcoded colours.

```astro
      motif === 'mirror' && (
        <g>
          {/* Two sides of a negotiation, each echoing the other. */}
          <g fill="var(--cover-accent)" stroke="none">
            <rect x="196" y="132" width="268" height="104" rx="20" fill-opacity="0.45" />
            <rect x="736" y="132" width="268" height="104" rx="20" fill-opacity="0.28" />
            <path d="M330 236 L318 274 L366 236" fill-opacity="0.45" />
            <path d="M870 236 L882 274 L834 236" fill-opacity="0.28" />
          </g>
          <g fill="none" stroke="var(--cover-accent)" stroke-width="2.5" stroke-linecap="round">
            {/* the line they talk across */}
            <path d="M600 104 V276" stroke-opacity="0.25" stroke-dasharray="7 13" />
            {/* mirrored echo arcs, symmetric about x=600 */}
            <g stroke-opacity="0.5">
              <path d="M528 150 A 58 58 0 0 1 528 230" />
              <path d="M672 150 A 58 58 0 0 0 672 230" />
            </g>
            <g stroke-opacity="0.28">
              <path d="M500 130 A 82 82 0 0 1 500 250" />
              <path d="M700 130 A 82 82 0 0 0 700 250" />
            </g>
          </g>
        </g>
      )
```

- [ ] **Step 3: Reassign the Voss note**

In `src/content/book-notes/never-split-the-difference-voss.md`, change the frontmatter line `cover: scales` to:

```markdown
cover: mirror
```

Leave `multi-cloud-terraform-vs-pulumi.md` on `scales`.

- [ ] **Step 4: Verify uniqueness is restored**

Run: `npm run build`

```bash
# 19 posts, 19 distinct motifs, no duplicates
grep -h '^cover:' src/content/*/*.md | sort -u | wc -l          # expect 19
grep -h '^cover:' src/content/*/*.md | sort | uniq -d           # expect NO output
# the new motif actually rendered (hero + list thumbnails)
grep -rlo 'class="cover' dist/book-notes/never-split-the-difference-voss/index.html | wc -l  # expect 1
```

- [ ] **Step 5: Look at it (visual gate — do not skip)**

Run `npm run preview` and open `/book-notes/never-split-the-difference-voss/`. Confirm:
- the art is centred and nothing is clipped at the 16/10 list-thumbnail crop (check `/book-notes/` too, and the homepage if the post appears there),
- it is legible in **both** themes via the header toggle, and picks up the orchid book-notes tint rather than the base violet,
- it reads as distinct from the `scales` art on `/engineering/multi-cloud-terraform-vs-pulumi/`.

If the arcs look wrong or crowded, adjust the geometry — the SVG above is a starting point, not a specification. Keep the opacity range and stroke width.

- [ ] **Step 6: Commit**

```bash
git add src/motifs.ts src/components/Cover.astro \
        src/content/book-notes/never-split-the-difference-voss.md
git commit -m "Covers: add a mirror motif so all 19 posts have unique art"
```

---

## Task 3: Table of contents includes h3

`tocItems` filters to `h.depth === 2` only, so the two 6.5k-word guides get a coarse TOC while their h3s carry the actual detail (`ai-architecture-master-guide` has 17 h2 and **39** h3; `gcp-pca-study-guide` has 21 and 34).

56 flat entries in a 15rem sticky column would be unusable, so h3s are indented and the existing scroll-spy is extended to keep the active entry scrolled into view.

**Files:**
- Modify: `src/layouts/Post.astro:105-106` (filter), `:288-294` (render), `:594-619` (scroll-spy)
- Modify: `src/styles/global.css:474-478` (indent rule)

**Interfaces:**
- Consumes: `headings: MarkdownHeading[]` from `render(entry)`, already passed in.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Widen the filter, but keep the show/hide threshold on h2**

In `src/layouts/Post.astro`, replace:

```ts
const tocItems = headings.filter((h) => h.depth === 2);
const showToc = tocItems.length >= 3;
```

with:

```ts
// h2 + h3: the long guides carry their real structure at depth 3.
const tocItems = headings.filter((h) => h.depth === 2 || h.depth === 3);
// Still gate on top-level sections, so a post with one h2 and four h3s
// doesn't sprout a sidebar.
const showToc = tocItems.filter((h) => h.depth === 2).length >= 3;
```

- [ ] **Step 2: Tag the depth when rendering**

Replace the TOC `<li>` render block with:

```astro
              {tocItems.map((h) => (
                <li class:list={[`toc-d${h.depth}`]}>
                  <a href={`#${h.slug}`}>{h.text}</a>
                </li>
              ))}
```

- [ ] **Step 3: Indent depth-3 entries**

In `src/styles/global.css`, inside the existing `@media (min-width: 1100px)` block, after the `.toc li { margin: 0.45rem 0; }` rule, add:

```css
  .toc li.toc-d3 {
    margin: 0.3rem 0 0.3rem 0.85rem;
    font-size: 0.96em;
  }
  .toc li.toc-d3 a { color: color-mix(in srgb, var(--text-muted) 88%, transparent); }
  .toc li.toc-d3 a:hover,
  .toc li.toc-d3 a.active { color: var(--accent); }
```

- [ ] **Step 4: Keep the active entry visible**

`article h4` already has `scroll-margin-top`, and h3 anchors already resolve because `rehype-slug` slugs every heading. Only the spy needs to scroll the sidebar. In the third `<script>` block of `Post.astro`, replace the `setActive` function with:

```ts
    const setActive = () => {
      let currentId = headings[0]?.id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top - OFFSET <= 0) currentId = h.id;
        else break;
      }
      links.forEach((a, id) => {
        const on = id === currentId;
        a.classList.toggle('active', on);
        if (on && a.scrollIntoView) {
          a.scrollIntoView({ block: 'nearest' });
        }
      });
    };
```

Note: `scrollIntoView({ block: 'nearest' })` scrolls only the nearest scrollable ancestor (the sticky `.toc nav`, which has `overflow-y: auto`) and is a no-op when the entry is already visible, so it will not fight the page scroll. Do not pass `behavior: 'smooth'` here — it fires on every scroll event.

- [ ] **Step 5: Verify**

Run: `npm run build`

```bash
# ai-architecture has 17 h2 + 39 h3 = 56 headings (cross-checked against the
# 56 heading-anchor links the article itself renders).
grep -o 'class="toc-d[23]"' dist/guides/ai-architecture-master-guide/index.html | wc -l   # expect 56
grep -o 'class="toc-d3"'    dist/guides/ai-architecture-master-guide/index.html | wc -l   # expect 39
# gcp-pca: 21 + 34 = 55
grep -o 'class="toc-d[23]"' dist/guides/gcp-pca-study-guide/index.html | wc -l            # expect 55
# a short post must still have no TOC at all
grep -o 'class="toc' dist/leadership/core-principles-every-corporate-leader-should-know/index.html | wc -l  # expect 0
```

Then run `npm run preview` and open `/guides/ai-architecture-master-guide/` at a viewport ≥1100px wide. Confirm the h3 entries are visibly indented, the column scrolls internally rather than growing the page, and scrolling the article moves the highlight down the sidebar without yanking the main scroll position.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Post.astro src/styles/global.css
git commit -m "Post TOC: include h3 entries, indented, with scroll-spy follow"
```

---

## Task 4: Cap the homepage and add an archive

`src/pages/index.astro` renders the featured post plus **all 18** others, each with a cover thumbnail. Fine at 19 posts, bad at 40. Section indexes are left unpaginated deliberately — the largest section has 8 posts, so paginating them now would be premature, and `[section]/[...page].astro` would collide with the existing `[section]/[...slug].astro` route.

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/archive.astro`
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: `SECTIONS` from `consts`, `readingStats` from `utils/reading-time`, the `PostList` component (`posts: PostItem[]`).
- Produces: a `/archive/` route. Task 8 may link to it; nothing else depends on it.

- [ ] **Step 1: Cap the homepage list**

In `src/pages/index.astro`, after the `const [featured, ...rest] = posts;` line, add:

```ts
const HOME_LIMIT = 8;
const recent = rest.slice(0, HOME_LIMIT);
const hasMore = rest.length > HOME_LIMIT;
```

Then replace the `rest.length > 0 && (...)` block with:

```astro
  {
    recent.length > 0 && (
      <>
        <p class="home-heading">More writing</p>
        <PostList posts={recent} />
        {hasMore && (
          <p class="home-more">
            <a href="/archive/">Browse all {posts.length} posts →</a>
          </p>
        )}
      </>
    )
  }
```

And add to the `<style>` block at the bottom of the file:

```css
  .home-more {
    margin: 1.5rem 0 0;
    font-size: 0.95rem;
    font-weight: 600;
  }
```

- [ ] **Step 2: Create the archive page**

Create `src/pages/archive.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import { SECTIONS } from '../consts';

const posts = (
  await Promise.all(
    SECTIONS.map(async (section) => {
      const entries = await getCollection(section.id, ({ data }) => !data.draft);
      return entries.map((entry) => ({
        href: `/${section.id}/${entry.id}/`,
        title: entry.data.title,
        pubDate: entry.data.pubDate,
        sectionLabel: section.label,
        sectionId: section.id,
      }));
    })
  )
)
  .flat()
  .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

// Group by year, newest first. Object key order is insertion order for
// string keys, and posts are already sorted, so years come out descending.
const byYear = new Map<number, typeof posts>();
for (const p of posts) {
  const y = p.pubDate.getFullYear();
  if (!byYear.has(y)) byYear.set(y, []);
  byYear.get(y)!.push(p);
}

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
---

<Base
  title="Archive"
  description="Every post on the site, newest first."
>
  <h1>Archive</h1>
  <p class="muted">All {posts.length} posts, newest first.</p>

  {
    [...byYear.entries()].map(([year, items]) => (
      <section class="year">
        <h2>{year}</h2>
        <ul class="archive-list">
          {items.map((p) => (
            <li>
              <time datetime={p.pubDate.toISOString()}>{formatDate(p.pubDate)}</time>
              <a href={p.href}>{p.title}</a>
              <span class="section-badge">{p.sectionLabel}</span>
            </li>
          ))}
        </ul>
      </section>
    ))
  }
</Base>

<style>
  .year h2 {
    font-size: 1.3rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.35rem;
    margin-top: 2.75rem;
  }
  .archive-list {
    list-style: none;
    padding: 0;
    margin: 0.75rem 0 0;
  }
  .archive-list li {
    display: grid;
    grid-template-columns: 4.25rem 1fr auto;
    gap: 0.5rem 0.9rem;
    align-items: baseline;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border);
  }
  .archive-list li:last-child {
    border-bottom: none;
  }
  .archive-list time {
    color: var(--text-muted);
    font-size: 0.82rem;
    font-variant-numeric: tabular-nums;
  }
  .archive-list a {
    color: var(--text);
    font-family: var(--font-serif);
    font-size: 1.02rem;
    font-weight: 600;
    line-height: 1.3;
  }
  .archive-list a:hover {
    color: var(--accent);
  }
  @media (max-width: 34rem) {
    .archive-list li {
      grid-template-columns: 4.25rem 1fr;
    }
    .archive-list .section-badge {
      grid-column: 2;
    }
  }
</style>
```

- [ ] **Step 3: Link it from the footer**

In `src/components/Footer.astro`, inside `.footer-links`, add an Archive link before the Tags link:

```astro
      <a href="/archive/">Archive</a>
      <span class="dot">·</span>
```

- [ ] **Step 4: Verify**

Run: `npm run build`

```bash
# homepage: featured post uses an <h3>, list rows use .post-title, so 8.
# (Before this task the same command reports 18 — that's the bug being fixed.)
grep -o 'class="post-title"' dist/index.html | wc -l                 # expect 8
grep -o 'Browse all 19 posts' dist/index.html | wc -l                # expect 1
# archive: one list per year (2025 and 2026), and every published post
grep -o 'class="archive-list"' dist/archive/index.html | wc -l       # expect 2
grep -oE 'href="/(engineering|guides|book-notes|leadership)/[a-z0-9-]+/"' dist/archive/index.html | sort -u | wc -l   # expect 19
```

Then re-run the link checker to confirm the new route resolves and nothing broke:

```bash
python3 - <<'EOF'
import re,glob,os
routes={'/'}
for p in glob.glob('dist/**/index.html',recursive=True):
    routes.add('/'+os.path.relpath(os.path.dirname(p),'dist').replace('\\','/')+'/')
bad=set()
for p in glob.glob('dist/**/*.html',recursive=True):
    for href in re.findall(r'href="(/[^"#?]*)"',open(p).read()):
        if href.startswith('/pagefind') or href.endswith(('.xml','.svg','.png','.css','.js','.txt')): continue
        if (href if href.endswith('/') else href+'/') not in routes: bad.add(href)
print('broken:', sorted(bad) or 'none', '| routes:', len(routes))
EOF
```

Expected: `broken: none | routes: 82`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/pages/archive.astro src/components/Footer.astro
git commit -m "Home: cap the post list, add a full archive page"
```

---

## Task 5: Migrate search to the Pagefind Component UI

`npm run build` prints a deprecation notice: the Default UI (`pagefind-ui.js` / `PagefindUI`) is superseded as of Pagefind 1.5.0 by the Component UI, which is a set of WAI-ARIA web components. `dist/pagefind/pagefind-component-ui.{js,css}` are **already emitted** by the current build — no dependency change needed.

Verified against the shipped bundle, the registered custom elements are: `pagefind-config`, `pagefind-input`, `pagefind-results`, `pagefind-summary`, `pagefind-searchbox`, `pagefind-modal`, `pagefind-modal-trigger`, `pagefind-modal-header`, `pagefind-modal-body`, `pagefind-modal-footer`, `pagefind-filter-dropdown`, `pagefind-filter-pane`, `pagefind-keyboard-hints`.

Theming is via `--pf-*` custom properties (verified present in the shipped CSS): `--pf-background`, `--pf-border`, `--pf-border-focus`, `--pf-border-radius`, `--pf-font`, `--pf-hover`, `--pf-mark`, `--pf-text`, `--pf-text-secondary`, `--pf-text-muted`, `--pf-modal-backdrop`, `--pf-outline-focus`, `--pf-shadow-sm/md/lg`, `--pf-result-title-font-size`, `--pf-result-excerpt-font-size`.

**Scope decision:** this task migrates the `/search/` page only. A site-wide `<pagefind-modal-trigger>` in the header would be the nicer end state, but it loads the Pagefind JS on every page — a real perf cost on a site whose pages currently ship almost no JS. That is recorded as an optional follow-up below, not done here.

**Files:**
- Modify: `src/pages/search.astro`

**Interfaces:**
- Consumes: the Pagefind index at `/pagefind/`, produced by `npm run build`.
- Produces: nothing.

- [ ] **Step 1: Replace the page body and script**

Replace the entire contents of `src/pages/search.astro` with:

```astro
---
import Base from '../layouts/Base.astro';
---

<Base title="Search" description="Search the writing on this site.">
  <h1>Search</h1>
  <p class="muted">
    Find posts across engineering, playbooks, book notes, and leadership.
  </p>

  <link rel="stylesheet" href="/pagefind/pagefind-component-ui.css" />
  <script is:inline type="module" src="/pagefind/pagefind-component-ui.js"></script>

  <div class="pf">
    <pagefind-searchbox></pagefind-searchbox>
  </div>

  <noscript><p class="muted">Search requires JavaScript.</p></noscript>
  <p class="muted pf-hint" hidden id="pf-hint">
    The search index is generated at build time. Run <code>npm run build</code> then
    <code>npm run preview</code> to try it locally.
  </p>
</Base>

<script is:inline>
  // In `astro dev` there is no /pagefind/ index, so the component never
  // upgrades. Surface why instead of showing an inert box.
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (!window.customElements.get('pagefind-searchbox')) {
        document.querySelector('.pf')?.setAttribute('hidden', '');
        document.getElementById('pf-hint')?.removeAttribute('hidden');
      }
    }, 600);
  });
</script>

<style is:global>
  /* Map the Component UI onto the site's lavender tokens. Both themes are
     covered automatically because these all resolve to theme-aware vars. */
  .pf {
    --pf-font: var(--font-sans);
    --pf-background: var(--bg-elev);
    --pf-text: var(--text);
    --pf-text-secondary: var(--text-secondary);
    --pf-text-muted: var(--text-muted);
    --pf-border: var(--border);
    --pf-border-focus: var(--accent);
    --pf-border-radius: var(--radius);
    --pf-hover: var(--surface);
    --pf-mark: var(--accent-soft);
    --pf-outline-focus: var(--accent);
    --pf-shadow-sm: var(--shadow);
    --pf-shadow-md: var(--shadow);
    --pf-shadow-lg: var(--shadow-lift);
    --pf-searchbox-max-width: 100%;
    margin-top: 1.5rem;
  }
</style>
```

- [ ] **Step 2: Build and confirm the deprecation notice is gone**

Run: `npm run build 2>&1 | tail -25`

Expected: the boxed "Pagefind found references to the Default UI (pagefind-ui.js)" notice **no longer appears**. The index summary should still report `Indexed 19 pages`.

- [ ] **Step 3: Confirm the page references the new assets only**

```bash
grep -o 'pagefind-component-ui' dist/search/index.html | wc -l   # expect 2 (css + js)
grep -o 'pagefind-searchbox'    dist/search/index.html | wc -l   # expect 2 (open + close tag)
# the old Default UI must be gone. Note "pagefind-component-ui.js" does NOT
# contain the substring "pagefind-ui.js", so this is a clean check.
grep -o 'pagefind-ui\.js' dist/search/index.html | wc -l         # expect 0
grep -o 'PagefindUI'      dist/search/index.html | wc -l         # expect 0
```

- [ ] **Step 4: Verify it actually searches (visual — do not skip)**

Run `npm run preview`, open `/search/`, and type `pulumi`. Confirm:
- results appear and are clickable through to the right posts,
- highlighted terms use the lavender `--pf-mark`, not a default yellow,
- the box and results read correctly in **both** themes (use the header toggle),
- keyboard: Tab reaches the input, arrow keys move through results, Enter follows one.

If any of those fail, fix before committing — this replaces a working search.

- [ ] **Step 5: Commit**

```bash
git add src/pages/search.astro
git commit -m "Search: migrate to the Pagefind Component UI"
```

**Optional follow-up (not part of this task):** add `<pagefind-modal-trigger>` + `<pagefind-modal>` to `Header.astro` for site-wide ⌘K search, replacing the icon link to `/search/`. Decide only after measuring the JS added to every page.

---

## Task 6: Small polish batch

Three unrelated one-liners, grouped because each is too small to gate a review on its own.

**Files:**
- Modify: `src/layouts/Post.astro:112-114`
- Modify: `src/pages/about.astro:28` and `:122-124`

**Interfaces:** none.

- [ ] **Step 1: Point the share link at x.com**

In `src/layouts/Post.astro`, change the `xShareUrl` host:

```ts
const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
  title
)}&url=${encodeURIComponent(shareUrl)}`;
```

- [ ] **Step 2: Remove the decorative emoji from the About heading**

In `src/pages/about.astro`, change:

```astro
      <h1>Hi, I'm Riddam <span class="wave">👋</span></h1>
```

to:

```astro
      <h1>Hi, I'm Riddam.</h1>
```

Then delete the now-unused `.wave` style rule:

```css
  .wave {
    display: inline-block;
  }
```

This matches the homepage h1 ("Hi, I'm Riddam.") and the site-wide emoji policy. The DISC colour swatches in the Erikson book note are meaningful content — **do not touch them.**

- [ ] **Step 3: Verify**

Run: `npm run build`

```bash
P=dist/guides/ai-architecture-master-guide/index.html
grep -o 'twitter\.com'        "$P" | wc -l    # expect 0
grep -o 'x\.com/intent/tweet' "$P" | wc -l    # expect 2 (share rail + inline row)
grep -o '👋'          dist/about/index.html | wc -l   # expect 0
grep -o 'class="wave"' dist/about/index.html | wc -l  # expect 0
# the meaningful DISC swatches must survive untouched
grep -o '🔴' dist/book-notes/surrounded-by-idiots-erikson/index.html | wc -l  # expect 5
# and no decorative emoji should have crept in anywhere else
grep -rloP '[\x{1F300}-\x{1FAFF}]' dist --include=index.html
# expect exactly one file: dist/book-notes/surrounded-by-idiots-erikson/index.html
```

Note the share URL appears **twice** per post — once in the sticky `.share-rail` and once in the inline `.share-row`. Both must be updated; they are built from the same `xShareUrl` const, so one edit covers both.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Post.astro src/pages/about.astro
git commit -m "Polish: x.com share host, drop decorative emoji from About"
```

---

## Task 7: Document the `updatedDate` convention

No post uses `updatedDate`, though the schema accepts it, `Post.astro` renders "Updated <date>", `Base.astro` emits it as `dateModified` in the BlogPosting JSON-LD and `article:modified_time`, and `astro.config.mjs` feeds it to the sitemap as `lastmod`. Four guides carry "2026" in the title and will visibly age; a shown "Updated" date is the cheap credibility signal. This task makes the field discoverable — actual dates get added as content is revised (Tasks 9 and 10 should add them).

**Files:**
- Modify: `src/content/engineering/_template.md`, `src/content/book-notes/_template.md`, `src/content/leadership/_template.md`
- Modify: `README.md`

**Interfaces:** none.

- [ ] **Step 1: Add the field to all three templates**

In each `_template.md`, directly beneath the `pubDate:` line in the frontmatter, add:

```markdown
# updatedDate: 2026-01-01   # uncomment when materially revising a published post
```

There is no `guides/_template.md`; do not create one — guides are written from an existing guide as the starting point.

- [ ] **Step 2: Document it in the README**

Add a section to `README.md`:

```markdown
## Revising a published post

Set `updatedDate` in the frontmatter when you materially change a post that is
already live (new content, corrected facts, refreshed API details) — not for
typos. It drives four things at once: the "Updated <date>" line in the post
header, `dateModified` in the BlogPosting JSON-LD, `article:modified_time`, and
`lastmod` in the sitemap. Leave it off and search engines assume the post has
not moved since `pubDate`.

## Tests

`npm test` runs the unit tests via Node's built-in test runner (no dependency).
Currently covers `src/utils/reading-time.ts`. Everything else is verified by
building and asserting against `dist/` — see
`docs/superpowers/plans/2026-08-03-blog-audit-remediation.md`.
```

- [ ] **Step 3: Verify the field still works end to end**

Temporarily add `updatedDate: 2026-08-01` to `src/content/engineering/uv-one-tool-to-rule-your-python.md`, then `npm run build` and check all four consumers:

```bash
P=dist/engineering/uv-one-tool-to-rule-your-python/index.html
grep -o 'Updated August 1, 2026'                    "$P" | wc -l   # expect 1
grep -o 'article:modified_time" content="2026-08-01' "$P" | wc -l   # expect 1
grep -o '"dateModified":"2026-08-01'                 "$P" | wc -l   # expect 1
# the sitemap is a single line, so count occurrences here too
grep -o '2026-08-01' dist/sitemap-0.xml | wc -l                     # expect 1
```

Then **remove** that line again and rebuild. (It was a probe, not a real revision date.)

- [ ] **Step 4: Commit**

```bash
git add src/content/*/_template.md README.md
git commit -m "Docs: document the updatedDate convention and npm test"
```

---

## Task 8: In-prose interlinking

Structural interlinking landed on 2026-08-03 (the "Building and running AI systems" series). What is still missing is **in-prose** links. Measured cross-link counts per post: the four infra posts link to each other 3–6 times each; **all five guides and all five book notes link to each other zero times.** The guides are the largest pages (3k–6.6k words) and the ones that earn search traffic.

**Files:**
- Modify: `src/content/guides/ai-architecture-master-guide.md`
- Modify: `src/content/guides/model-training-finetuning-eval.md`
- Modify: `src/content/guides/mlops-production-guide.md`
- Modify: `src/content/guides/cca-f-study-guide.md`
- Modify: `src/content/guides/gcp-pca-study-guide.md`
- Modify: `src/content/book-notes/the-leadership-journey-gary-burnison.md`
- Modify: `src/content/book-notes/five-dysfunctions-of-a-team-lencioni.md`
- Modify: `src/content/leadership/core-principles-every-corporate-leader-should-know.md`

**Interfaces:** none — content only.

**Rules for every link added:**
- Use root-relative URLs with a trailing slash: `/guides/mlops-production-guide/`. The `rehypeExternalLinks` plugin only rewrites `http(s)://` hrefs, so internal links stay in-tab automatically.
- One or two links per post, placed **inside a sentence that was already going to be written** — where the current text already gestures at the other topic. Never append a "Related reading" list; the layout already renders "Keep reading" and the series box.
- Match the existing voice: `uv-one-tool-to-rule-your-python.md` does this well — *"(It pairs well with my tour of [what's new in Python 3.13 and 3.14](/engineering/python-313-314-whats-new/).)"*
- Do not add a link where the two posts do not genuinely relate. Fewer, better links.

- [ ] **Step 1: Link the three series guides to each other in prose**

Read each of the three guides and find the place where it already refers to the neighbouring concern, then link it:

- In `ai-architecture-master-guide.md`, where the text discusses fine-tuning as an option, link to `/guides/model-training-finetuning-eval/`. Where it discusses LLMOps/production operations, link to `/guides/mlops-production-guide/`.
- In `model-training-finetuning-eval.md`, where it discusses where a trained model then gets deployed or monitored, link to `/guides/mlops-production-guide/`. In its framing of the overall system, link back to `/guides/ai-architecture-master-guide/`.
- In `mlops-production-guide.md`, where it refers to the architecture decisions upstream of operations, link back to `/guides/ai-architecture-master-guide/`; where it mentions the training/eval loop, link to `/guides/model-training-finetuning-eval/`.

- [ ] **Step 2: Link the two exam guides into the cluster**

The exam guides deliberately sit outside the series (they are reference prep, not steps). Give them one prose link each:

- In `cca-f-study-guide.md`, where a domain covers architecture patterns, link to `/guides/ai-architecture-master-guide/` as the deeper treatment.
- In `gcp-pca-study-guide.md`, where the 2026 AI focus is introduced, link to `/guides/ai-architecture-master-guide/`.

- [ ] **Step 3: Connect the book notes to the Leadership post**

- In `core-principles-every-corporate-leader-should-know.md`, where trust or team dysfunction comes up, link to `/book-notes/five-dysfunctions-of-a-team-lencioni/`.
- In `the-leadership-journey-gary-burnison.md`, which already ends with a further-reading list, link that list's relevant entries to `/book-notes/five-dysfunctions-of-a-team-lencioni/` and `/leadership/core-principles-every-corporate-leader-should-know/` where the titles already match.

- [ ] **Step 4: Verify the links resolve and the counts moved**

Run: `npm run build`

```bash
# every guide and the two connected book notes should now have >=1 internal link
for f in src/content/guides/*.md \
         src/content/book-notes/the-leadership-journey-gary-burnison.md \
         src/content/leadership/core-principles-every-corporate-leader-should-know.md; do
  printf "%-62s %s\n" "${f#src/content/}" \
    "$(grep -oE '\]\(/(engineering|guides|book-notes|leadership)/' "$f" | wc -l | tr -d ' ')"
done
```

Expected: every listed file reports `1` or more.

Then re-run the broken-link checker from Task 4 Step 4. Expected: `broken: none`. A trailing-slash typo is the likely failure mode and this is what catches it.

- [ ] **Step 5: Commit**

```bash
git add src/content
git commit -m "Content: interlink the AI guides cluster and the leadership notes"
```

---

# Needs your input before implementation

These three findings are not mechanical. An agent should **not** guess at them.

## Task 9: Settle the CCA-F / CCAR-F naming

The URL is `/guides/cca-f-study-guide/`, the title says "CCAR-F", and the body hedges: *"the CCAR-F (sometimes informally written CCA-F)"*. Line 380 also asserts a launch date of March 12, 2026 and points readers at `anthropic.skilljar.com`.

**Blocked on:** confirming Anthropic's actual current name and acronym for the certification, and whether that launch date and URL are still right.

**When unblocked:** load the `claude-api` skill first, per the global constraints. Decide whether to keep the existing slug (URL stability, and it is already indexed) or redirect. If the slug changes, add a redirect — GitHub Pages serves no server-side redirects, so it needs a stub page with `<meta http-equiv="refresh">` plus a canonical link at the old path. Set `updatedDate` when you touch it.

## Task 10: API-currency review of the three unreviewed guides

On 2026-07-24 only the two Claude-specific guides (`ai-architecture-master-guide`, `cca-f-study-guide`) got an API-currency review. Never reviewed: `gcp-pca-study-guide`, `mlops-production-guide`, `model-training-finetuning-eval`. All three are dated June–July 2026 and make dated claims about tooling and model lineups.

**Blocked on:** your call on scope — all three, or just the two AI ones.

**When unblocked:** load the `claude-api` skill for `mlops-production-guide` and `model-training-finetuning-eval` (both make LLM/model claims). For `gcp-pca-study-guide` the skill's own SKIP rule applies — it is Google-specific — so verify against current GCP docs instead. Set `updatedDate` on every guide you revise, which is what makes Task 7 worth having done.

## Task 11: Leadership section depth

Leadership has exactly **one** post but gets equal billing in the nav and an equal quarter of the homepage "Explore" grid. It is by far the thinnest section, and the 2×2 grid makes the imbalance obvious.

**Blocked on:** this is a writing decision, not a code one. Options, roughly in order of effort:

1. **Write two or three more leadership posts.** Best outcome; only you can do it. The five book notes are heavily leadership-adjacent and suggest themes you already have opinions about.
2. **Merge Leadership into Book Notes** under a broader label. Cheap, but loses a section you presumably want to grow, and breaks `/leadership/` URLs.
3. **Leave it.** Defensible — a thin section that is honestly labelled is not a bug, and it signals intent to write more.

No code change is warranted until you pick. If you pick (1), nothing here changes at all; the section fills up on its own.

---

# Recommended execution order

1, 2, 6 first — self-contained, low risk, and Task 1 establishes `npm test`.
Then **2b** (depends on Task 2), then 3, 4, 5 — user-visible UI, each needing its own verification pass. 2b and 5 both have visual gates.
Then 7, then 8 — 8 is content-editing and benefits from 7's `updatedDate` convention already being documented.
Then 9, 10, 11 once unblocked.

Tasks 1, 2, 3, 6 and 7 are safe to run unattended. Tasks 2b and 5 need someone to look at the result. Task 8 needs editorial judgment about voice.

# Already done (2026-08-03, commit pending)

For context — do not redo these:

- **Social cards rethemed to lavender.** `src/pages/og/[...route].ts` was still on the pre-rebrand blue (`bgGradient` `#111519`→`#1a2129`, border `#0F62C4`). Now `#161221`→`#2a2340` with the `#b598f2` accent edge and lavender-ink type. Visually confirmed.
- **`--text-muted` contrast fixed.** Light-mode `#857d97` was **3.61:1** on `--bg` and 3.34:1 on `--surface` — failing WCAG AA for text as small as 0.72rem. Now `#6f6683`: 4.97 / 4.60 / 4.68 / 5.26 against bg / surface / code-bg / bg-elev. Dark mode was already 5.36:1 and is unchanged.
- **Second series added.** "Building and running AI systems" = `ai-architecture-master-guide` → `model-training-finetuning-eval` → `mlops-production-guide`, giving each the series box and ordered nav. The two exam guides are deliberately excluded (reference prep, not steps) and already surface via tag-ranked "Keep reading".
- **Unused `AUTHOR_ROLE` import** removed from the OG route.

# Verified clean — do not "fix" these

- **0 broken internal links** across all 81 routes.
- **Pagefind indexes all 19 posts, 41,060 words.** The build line "Indexed 5725 words" is the *unique vocabulary* size, not a truncation. It is not a bug.
- Light/dark parity, print styles, `prefers-reduced-motion`, `:focus-visible`, skip link, `theme-color` sync, and pre-paint theme application are all correct.
- The CSS diagnostics your IDE reports (`text-size-adjust`, `text-wrap: pretty`, `color-mix` in old Chrome) are intentional progressive enhancement.
