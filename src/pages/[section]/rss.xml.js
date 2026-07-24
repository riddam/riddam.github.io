import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { SITE_TITLE, SECTIONS } from '../../consts';

const parser = new MarkdownIt({ html: true, linkify: true });
const SITE = 'https://riddam.github.io';

// Render a post body to feed-safe HTML: markdown → HTML, root-relative URLs
// made absolute (feed readers have no site context), then sanitized.
function toFeedHtml(body = '') {
  const html = parser.render(body).replace(/(href|src)="\//g, `$1="${SITE}/`);
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title'],
    },
  });
}

// One feed per section (/engineering/rss.xml, /guides/rss.xml, …).
export function getStaticPaths() {
  return SECTIONS.map((section) => ({
    params: { section: section.id },
    props: { section },
  }));
}

export async function GET(context) {
  const { section } = context.props;
  const entries = await getCollection(section.id, ({ data }) => !data.draft);
  const items = entries
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      link: `/${section.id}/${entry.id}/`,
      categories: entry.data.tags ?? [],
      content: toFeedHtml(entry.body),
    }))
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: `${SITE_TITLE} — ${section.label}`,
    description: section.description,
    site: context.site,
    items,
    customData: '<language>en-us</language>',
  });
}
