import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { SITE_TITLE, SITE_DESCRIPTION, AUTHOR_ROLE, SECTIONS } from '../../consts';

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
    bgGradient: [
      [17, 21, 26],
      [26, 33, 41],
    ],
    border: { color: [15, 98, 196], width: 24, side: 'inline-start' },
    padding: 70,
    font: {
      title: {
        color: [235, 238, 242],
        size: 62,
        weight: 'Bold',
        lineHeight: 1.15,
      },
      description: {
        color: [154, 164, 174],
        size: 30,
        lineHeight: 1.4,
      },
    },
  }),
});
