import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
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
