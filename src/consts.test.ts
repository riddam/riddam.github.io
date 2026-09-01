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
