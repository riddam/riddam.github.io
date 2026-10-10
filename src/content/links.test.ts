import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const CONTENT = fileURLToPath(new URL('.', import.meta.url));

/**
 * An internal post link. The trailing group is an optional anchor fragment —
 * without it, the 31 links in this repo that deep-link into a heading slip the
 * check entirely.
 */
const INTERNAL = /\]\((\/[a-z0-9-]+\/[a-z0-9-]+\/)(#[^)\s]*)?(?:\s+"[^"]*")?\)/g;

/** Every `section/slug` pair that has a published (non-draft) file behind it. */
function slugs(): Set<string> {
  const found = new Set<string>();
  for (const { path, body } of posts()) {
    if (/^draft:\s*true$/m.test(body)) continue;
    found.add(`/${path.replace(/\.md$/, '')}/`);
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

/** Every `section/slug` pair with a file behind it, draft included. */
function allSlugs(): Set<string> {
  const found = new Set<string>();
  for (const { path } of posts()) found.add(`/${path.replace(/\.md$/, '')}/`);
  return found;
}

test('every internal post link resolves to a published content file', () => {
  // A published post may only link published posts -- a link out of the live
  // site to a draft is a 404. A draft may also link a draft: neither is on the
  // live site, so nothing is broken for a reader, and a track written as a
  // whole before it ships has to be able to cross-reference itself.
  const known = slugs();
  const drafted = allSlugs();
  const broken: string[] = [];
  let seen = 0;
  for (const { path, body } of posts()) {
    const isDraft = /^draft:\s*true$/m.test(body);
    const resolves = isDraft ? drafted : known;
    for (const [, href] of body.matchAll(INTERNAL)) {
      seen += 1;
      if (!resolves.has(href)) broken.push(`${path} -> ${href}`);
    }
  }
  assert.deepEqual(broken, [], `broken internal links:\n${broken.join('\n')}`);
  // Without this the test degrades to a silent pass if the regex ever breaks.
  assert.ok(seen > 100, `expected the scan to find links, found ${seen}`);
});

test('a link to a draft or missing post is reported as broken', () => {
  const known = slugs();
  const fixture = '[x](/engineering/not-a-real-post/) [y](/engineering/uv-one-tool-to-rule-your-python/#quick-start)';
  const hrefs = [...fixture.matchAll(INTERNAL)].map(([, href]) => href);
  assert.deepEqual(hrefs, ['/engineering/not-a-real-post/', '/engineering/uv-one-tool-to-rule-your-python/']);
  assert.equal(known.has(hrefs[0]), false, 'a missing post must not resolve');
  assert.equal(known.has(hrefs[1]), true, 'an anchored link must resolve to its post');
});

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
