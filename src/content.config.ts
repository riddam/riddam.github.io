import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { COVER_MOTIFS } from './motifs';

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  /** Abstract cover-art motif (see src/components/Cover.astro). Optional. */
  cover: z.enum(COVER_MOTIFS).optional(),
  /**
   * Which rendering of that motif to use. The 22 motifs ran out, so a motif can
   * now carry four posts: 1 as drawn, 2 mirrored horizontally, 3 rotated 180,
   * 4 flipped vertically — each with its own hue shift, so no two read as the
   * same picture in a listing. Defaults to 1.
   */
  coverVariant: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
    .optional(),
});

const makeCollection = (name: string) =>
  defineCollection({
    loader: glob({ base: `./src/content/${name}`, pattern: '**/*.md' }),
    schema: postSchema,
  });

export const collections = {
  engineering: makeCollection('engineering'),
  'book-notes': makeCollection('book-notes'),
  leadership: makeCollection('leadership'),
  guides: makeCollection('guides'),
};
