import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const pagesDir = new URL('../pages/', import.meta.url);

/** Every file under src/pages, at any depth. */
const pageFiles = (dir: URL): URL[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? pageFiles(new URL(`${e.name}/`, dir))
      : [new URL(e.name, dir)]
  );

test('every page filters drafts through the shared rule', () => {
  // A staged release depends on one definition of "not on the site yet". A page
  // that inlines `!data.draft` opts out of the dev-preview escape hatch and
  // starts 404ing drafts locally, which is how a drafted track stops being
  // reviewable before its release date.
  const offenders = pageFiles(pagesDir)
    .filter((f) => readFileSync(f, 'utf8').includes('!data.draft'))
    .map((f) => f.pathname.replace(/^.*\/src\//, 'src/'));
  assert.deepEqual(offenders, [], `inline draft filter in: ${offenders.join(', ')}`);
});

test('the shared rule hides drafts everywhere except the dev server', () => {
  const src = readFileSync(new URL('./visibility.ts', import.meta.url), 'utf8');
  assert.match(src, /!data\.draft \|\| import\.meta\.env\.DEV/);
});
