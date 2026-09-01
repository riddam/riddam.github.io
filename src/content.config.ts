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
   * Which rendering of that motif to use. Every motif is now used by more than
   * one post; set this to 2 on the second so the pair does not render as the
   * same picture. Defaults to 1.
   */
  coverVariant: z.union([z.literal(1), z.literal(2)]).optional(),
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
