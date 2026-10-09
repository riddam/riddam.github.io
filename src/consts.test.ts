import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { SECTIONS, SERIES } from './consts.ts';

const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

const publishedSlugs = (sectionId: string): Set<string> => {
  const dir = new URL(`./content/${sectionId}/`, import.meta.url);
  const out = new Set<string>();
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md') || f.startsWith('_')) continue;
    if (/^draft:\s*true/m.test(readFileSync(new URL(f, dir), 'utf8'))) continue;
    out.add(f.replace(/\.md$/, ''));
  }
  return out;
};

test('every series points at a real section', () => {
  const ids = new Set(SECTIONS.map((s) => s.id));
  for (const series of SERIES) {
    assert.ok(ids.has(series.sectionId), `series "${series.title}" has unknown section`);
  }
});

test('series slugs are unique within a series', () => {
  for (const series of SERIES) {
    assert.equal(
      new Set(series.slugs).size,
      series.slugs.length,
      `series "${series.title}" repeats a slug`
    );
  }
});

test('every series has at least one published post', () => {
  for (const series of SERIES) {
    const published = publishedSlugs(series.sectionId);
    const live = series.slugs.filter((s) => published.has(s));
    assert.ok(live.length > 0, `series "${series.title}" has no published posts`);
  }
});

test('series nav filters slugs that have no published post', () => {
  // A SERIES entry may list slugs ahead of their posts, so the nav builder must
  // filter rather than map -- otherwise it renders links to 404s. See
  // [section]/[...slug].astro.
  const page = read('./pages/[section]/[...slug].astro');
  assert.match(
    page,
    /slugs\s*\n?\s*\.filter\(/,
    'series nav must .filter() slugs before building items'
  );
});

test('the portable AI platform series is registered', () => {
  const series = SERIES.find((s) => s.title === 'Running AI beyond one cloud');
  assert.ok(series, 'portable AI platform series missing');
  assert.equal(series.sectionId, 'guides');
  assert.equal(series.slugs.length, 4, 'the series is four posts');
  assert.equal(series.slugs[1], 'connecting-cloud-and-on-premises', 'post 2 is second');
});

test('the AI Foundations model-internals series is registered', () => {
  const series = SERIES.find((s) => s.title === 'AI from the inside out');
  assert.ok(series, 'track 1 series missing');
  assert.equal(series.sectionId, 'engineering');
  assert.deepEqual(series.slugs, [
    'what-a-model-actually-is',
    'why-it-sounds-certain-when-its-wrong',
    'the-context-window-is-the-entire-memory',
    'how-it-learned-to-follow-instructions',
    'embeddings-and-why-retrieval-beats-memorising',
    'reading-a-model-card-without-guessing',
  ], 'track 1 is six posts in ladder order');
});

test('the AI Foundations harness series is registered', () => {
  const series = SERIES.find((s) => s.title === 'How your AI coding tool works');
  assert.ok(series, 'track 2 series missing');
  assert.equal(series.sectionId, 'engineering');
  assert.deepEqual(series.slugs, [
    'what-happens-when-you-press-enter',
    'a-tool-call-is-a-request-not-an-action',
    'mcp-explained-without-the-spec',
    'build-a-small-mcp-server',
    'what-can-go-wrong-with-an-mcp-server',
    'where-the-context-comes-from',
    'who-is-allowed-to-do-what',
    'how-a-skill-gets-found-and-loaded',
    'subagents-why-isolation-is-the-point',
    'the-whole-thing-annotated',
  ], 'track 2 is ten posts in ladder order');
});
