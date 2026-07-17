import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

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
  integrations: [sitemap()],
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
