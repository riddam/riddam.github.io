import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const CONTENT = fileURLToPath(new URL('.', import.meta.url));

type Post = { path: string; body: string };

function posts(): Post[] {
  const out: Post[] = [];
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

/** Posts in the AI Foundations series, identified by their shared tag. */
const foundations = (): Post[] =>
  posts().filter((p) => /^tags:.*\bai-foundations\b/m.test(p.body));

/**
 * Pictographic emoji only. Arrows, dashes and other typographic marks are used
 * deliberately across the site and are not emoji -- a repo-wide ban on U+2190
 * would fail on a dozen existing posts.
 */
const EMOJI =
  /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

test('no AI Foundations post contains an emoji', () => {
  const offenders: string[] = [];
  for (const { path, body } of foundations()) {
    body.split('\n').forEach((line, i) => {
      const hit = line.match(EMOJI);
      if (hit) offenders.push(`${path}:${i + 1} ${hit[0]}`);
    });
  }
  assert.deepEqual(offenders, [], `emoji found:\n${offenders.join('\n')}`);
});

test('no two published posts share a cover and variant', () => {
  const seen = new Map<string, string>();
  const clashes: string[] = [];
  for (const { path, body } of posts()) {
    if (/^draft:\s*true$/m.test(body)) continue;
    const cover = body.match(/^cover:\s*(\S+)/m)?.[1];
    if (!cover) continue;
    const variant = body.match(/^coverVariant:\s*(\d)/m)?.[1] ?? '1';
    const key = `${cover}/${variant}`;
    const prior = seen.get(key);
    if (prior) clashes.push(`${key}: ${prior} and ${path}`);
    else seen.set(key, path);
  }
  assert.deepEqual(clashes, [], `cover collisions:\n${clashes.join('\n')}`);
});

/** Diagram types the site's mermaid config is set up to render. */
const MERMAID_TYPES =
  /^(flowchart|graph|sequenceDiagram|erDiagram|classDiagram|stateDiagram(-v2)?|journey|block-beta)\b/;

test('every mermaid fence is closed, non-empty and a known diagram type', () => {
  const problems: string[] = [];
  for (const { path, body } of posts()) {
    const lines = body.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].trim() !== '```mermaid') continue;
      let end = i + 1;
      while (end < lines.length && lines[end].trim() !== '```') end += 1;
      if (end >= lines.length) {
        problems.push(`${path}:${i + 1} unclosed mermaid fence`);
        continue;
      }
      const inner = lines.slice(i + 1, end).filter((l) => l.trim().length > 0);
      if (inner.length === 0) {
        problems.push(`${path}:${i + 1} empty mermaid fence`);
      } else if (!MERMAID_TYPES.test(inner[0].trim())) {
        problems.push(`${path}:${i + 1} unknown diagram type: ${inner[0].trim()}`);
      }
      i = end;
    }
  }
  assert.deepEqual(problems, [], `mermaid problems:\n${problems.join('\n')}`);
});

test('every AI Foundations post links the vocabulary page and cites references', () => {
  const missing: string[] = [];
  for (const { path, body } of foundations()) {
    if (path.endsWith('the-ai-vocabulary.md')) continue;
    if (!body.includes('/engineering/the-ai-vocabulary/')) {
      missing.push(`${path}: no vocabulary link`);
    }
    if (!/^## References and further reading$/m.test(body)) {
      missing.push(`${path}: no references section`);
    }
  }
  assert.deepEqual(missing, [], `${missing.join('\n')}`);
});

test('cover variants 1 through 4 are all accepted and distinct', () => {
  const schema = readFileSync(join(CONTENT, '../content.config.ts'), 'utf8');
  for (const n of [1, 2, 3, 4]) {
    assert.match(schema, new RegExp(`z\\.literal\\(${n}\\)`), `variant ${n} not in schema`);
  }
  const cover = readFileSync(join(CONTENT, '../components/Cover.astro'), 'utf8');
  assert.match(cover, /translate\(1200,0\) scale\(-1,1\)/, 'variant 2 transform missing');
  assert.match(cover, /translate\(1200,380\) scale\(-1,-1\)/, 'variant 3 transform missing');
  assert.match(cover, /translate\(0,380\) scale\(1,-1\)/, 'variant 4 transform missing');
  for (const n of [2, 3, 4]) {
    assert.match(cover, new RegExp(`\\.cover\\.v${n} svg > g`), `variant ${n} hue rule missing`);
  }
});

test('the start-here page links every published AI Foundations post', () => {
  const page = foundations().find((p) => p.path.endsWith('ai-foundations-start-here.md'));
  assert.ok(page, 'start-here page missing');
  const missing: string[] = [];
  for (const { path } of foundations()) {
    const slug = path.replace(/^.*[/\\]/, '').replace(/\.md$/, '');
    if (slug === 'ai-foundations-start-here') continue;
    if (!page.body.includes(`/engineering/${slug}/`)) missing.push(slug);
  }
  assert.deepEqual(missing, [], `start-here is missing: ${missing.join(', ')}`);
});
