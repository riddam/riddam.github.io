import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { SITE_TITLE, SITE_DESCRIPTION, SECTIONS } from '../../consts';

// Build one entry per published post, keyed by "<section>/<id>".
const pages: Record<string, { title: string; description: string }> = {
  site: { title: SITE_TITLE, description: SITE_DESCRIPTION },
};

for (const section of SECTIONS) {
  const entries = await getCollection(section.id, ({ data }) => !data.draft);
  for (const entry of entries) {
    pages[`${section.id}/${entry.id}`] = {
      title: entry.data.title,
      description: entry.data.description,
    };
  }
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    logo: undefined,
    // Lavender ink, matching the site theme's dark palette: --bg (#161221)
    // into --border-strong (#2a2340), edged with the dark-mode accent.
    bgGradient: [
      [22, 18, 33],
      [42, 35, 64],
    ],
    border: { color: [181, 152, 242], width: 24, side: 'inline-start' },
    padding: 70,
    font: {
      title: {
        // --text (dark)
        color: [233, 227, 245],
        size: 62,
        weight: 'Bold',
        lineHeight: 1.15,
      },
      description: {
        // A muted lavender a clear step below the title, as --text-muted is.
        color: [155, 145, 179],
        size: 30,
        lineHeight: 1.4,
      },
    },
  }),
});
