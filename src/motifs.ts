/**
 * Abstract cover-art motifs, rendered by src/components/Cover.astro.
 *
 * Section = colour, motif = the post: a cover is tinted by its section via
 * --cover-accent, so a motif carries no colour of its own. Adding one means
 * adding an SVG case to Cover.astro and a name here — nowhere else.
 */
export const COVER_MOTIFS = [
  'config',
  'network',
  'pipeline',
  'rollout',
  'cloud',
  'ai',
  'code',
  'book',
  'leadership',
  'personas',
  'pyramid',
  'steps',
  'assist',
  'training',
  'speed',
  'agent',
  'scales',
  'cycle',
  'mirror',
  'lever',
  'bootstrap',
] as const;

export type Motif = (typeof COVER_MOTIFS)[number];

export type SectionId = 'engineering' | 'book-notes' | 'leadership' | 'guides';
