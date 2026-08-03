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
