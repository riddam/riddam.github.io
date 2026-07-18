import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { readdirSync, readFileSync } from 'node:fs';

// Map each post URL → its last-modified date (updatedDate, falling back to
// pubDate) by reading frontmatter directly. @astrojs/sitemap can't see content
// collections, so we build the lookup here and inject it via `serialize`.
function buildLastmodMap() {
  const contentDir = new URL('./src/content/', import.meta.url);
  const field = (re, text) => text.match(re)?.[1]?.trim().replace(/^["']|["']$/g, '');
  const map = new Map();
  for (const section of readdirSync(contentDir)) {
    let files;
    try {
      files = readdirSync(new URL(`${section}/`, contentDir));
    } catch {
      continue; // not a directory
    }
    for (const file of files) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const raw = readFileSync(new URL(`${section}/${file}`, contentDir), 'utf8');
      const fm = raw.split(/^---\s*$/m)[1] ?? '';
      if (/^\s*draft:\s*true/m.test(fm)) continue;
      const date =
        field(/^\s*updatedDate:\s*(.+)$/m, fm) || field(/^\s*pubDate:\s*(.+)$/m, fm);
      if (!date) continue;
      const slug = file.replace(/\.md$/, '');
      map.set(`/${section}/${slug}/`, new Date(date).toISOString());
    }
  }
  return map;
}

const lastmodByPath = buildLastmodMap();

// Harden outbound links in post content: open in a new tab, drop referrer/
// window-opener access, and tag them so CSS can add an "external" affordance.
function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string') return;
      if (!/^https?:\/\//i.test(href) || href.includes('riddam.github.io')) return;
      node.properties.target = '_blank';
      node.properties.rel = ['noopener', 'noreferrer'];
      const cls = node.properties.className;
      node.properties.className = [...(Array.isArray(cls) ? cls : cls ? [cls] : []), 'external-link'];
    });
  };
}

// Turns ```mermaid code fences into <pre class="mermaid"> blocks that the
// client-side mermaid script (see Base.astro) renders into SVG diagrams.
function remarkMermaid() {
  const escapeHtml = (s) =>
    s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang === 'mermaid') {
        node.type = 'html';
        node.value = `<pre class="mermaid">${escapeHtml(node.value)}</pre>`;
      }
    });
  };
}

export default defineConfig({
  site: 'https://riddam.github.io',
  integrations: [
    sitemap({
      serialize(item) {
        const { pathname } = new URL(item.url);
        const lastmod = lastmodByPath.get(pathname);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMermaid],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['heading-anchor'], ariaHidden: true, tabIndex: -1 },
          // An SVG icon (no text node) so heading text / TOC entries stay clean.
          content: {
            type: 'element',
            tagName: 'svg',
            properties: {
              viewBox: '0 0 24 24',
              width: 16,
              height: 16,
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': 2,
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'aria-hidden': 'true',
            },
            children: [
              {
                type: 'element',
                tagName: 'path',
                properties: {
                  d: 'M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
                },
                children: [],
              },
              {
                type: 'element',
                tagName: 'path',
                properties: {
                  d: 'M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
                },
                children: [],
              },
            ],
          },
        },
      ],
      rehypeExternalLinks,
    ],
    shikiConfig: {
      themes: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
      defaultColor: false,
      transformers: [
        {
          name: 'language-label',
          pre(node) {
            const lang = this.options.lang;
            if (lang && !['text', 'plaintext', 'ansi', 'plain'].includes(lang)) {
              node.properties['data-language'] = lang;
            }
          },
        },
      ],
    },
  },
});
