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
