/**
 * Parses every mermaid fence in the content with the same mermaid version the
 * site ships, because a diagram that fails to parse renders as a grey box of
 * raw source in production and no other check catches it: content-rules.test.ts
 * only proves the fence is closed and starts with a known diagram type.
 *
 * mermaid needs a browser, so this is the one place the repo pulls in jsdom.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

const CONTENT = fileURLToPath(new URL('.', import.meta.url));

function fences(): { path: string; source: string }[] {
  const out: { path: string; source: string }[] = [];
  for (const section of readdirSync(CONTENT, { withFileTypes: true })) {
    if (!section.isDirectory()) continue;
    for (const file of readdirSync(join(CONTENT, section.name))) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const path = join(section.name, file);
      const body = readFileSync(join(CONTENT, path), 'utf8');
      for (const [, source] of body.matchAll(/```mermaid\n([\s\S]*?)\n```/g)) {
        out.push({ path, source });
      }
    }
  }
  return out;
}

async function loadMermaid() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = dom.window as never;
  globalThis.document = dom.window.document as never;
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
  });
  globalThis.HTMLElement = dom.window.HTMLElement as never;
  const { default: mermaid } = await import('mermaid');
  // Mirror src/layouts/Base.astro. In particular: do NOT set securityLevel.
  // The site uses mermaid's default ('strict'), which sanitises HTML in labels
  // -- validating under 'loose' passes markup that renders wrongly in a browser.
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    flowchart: { curve: 'basis', htmlLabels: true, padding: 14 },
  });
  return mermaid;
}

test('every mermaid diagram parses', async () => {
  const mermaid = await loadMermaid();
  const found = fences();
  const broken: string[] = [];
  for (const { path, source } of found) {
    try {
      await mermaid.parse(source);
    } catch (e) {
      broken.push(`${path}: ${String((e as Error).message).split('\n')[0]}`);
    }
  }
  assert.deepEqual(broken, [], `diagrams that will render as raw text:\n${broken.join('\n')}`);
  // Without this the test degrades to a silent pass if the fence regex breaks.
  assert.ok(found.length > 20, `expected the scan to find diagrams, found ${found.length}`);
});

test('a diagram with a syntax error is reported as broken', async () => {
  const mermaid = await loadMermaid();
  await assert.rejects(
    () => mermaid.parse('flowchart LR\n  A["unclosed --> B'),
    'an unbalanced bracket must not parse',
  );
});

/**
 * Parsing is not rendering. Every diagram below parsed cleanly while two of them
 * were drawing on top of each other in the browser, because mermaid's default id
 * for a diagram is `mermaid-${Date.now()}` and the renderer finds its target by
 * id. Two diagrams that finish in the same millisecond get the same id, the
 * second draws into the first one's SVG, and the reader sees one diagram
 * overlaid on another plus an empty box. It is a race, so it moves between
 * builds and machines rather than failing consistently.
 */
test('the layout gives each diagram an id that cannot collide', () => {
  const layout = readFileSync(
    fileURLToPath(new URL('../layouts/Base.astro', import.meta.url)),
    'utf8',
  );
  assert.match(
    layout,
    /deterministicIds:\s*true/,
    'mermaid.initialize must set deterministicIds, or diagrams on the same page can share an SVG id',
  );

  // The guard only matters while some page carries more than one diagram.
  const perPost = new Map<string, number>();
  for (const { path } of fences()) perPost.set(path, (perPost.get(path) ?? 0) + 1);
  const crowded = [...perPost.values()].filter((n) => n > 1).length;
  assert.ok(crowded > 0, 'expected at least one post with two or more diagrams');
});
