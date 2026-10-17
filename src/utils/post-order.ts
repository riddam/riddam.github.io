// One ordering rule for every list of posts on the site.
//
// Sorting on pubDate alone is fine until a whole series ships on a single day.
// Then the date decides nothing, the sort falls back to whatever order the
// content loader returned -- alphabetical by filename -- and a six-post track
// lists with post five above post one. So a tie breaks on the post's position
// in its curated series, which is the order the series box already shows and
// the order a reader of that track wants.

import { SERIES } from '../consts';

/** `section/slug` -> position in its series. */
const RANK = new Map<string, number>();
for (const series of SERIES) {
  series.slugs.forEach((slug, i) =>
    RANK.set(`${series.sectionId}/${slug}`, i)
  );
}

/**
 * Listings carry a post's identity in whichever shape they already had: an
 * `href`, a feed `link`, or a section plus an id. Accept all three rather than
 * making five call sites grow a field.
 */
type Orderable = {
  pubDate: Date;
  href?: string;
  link?: string;
  sectionId?: string;
  id?: string;
};

const keyOf = (p: Orderable) => {
  const path = p.href ?? p.link;
  if (path) return path.replace(/^\/|\/$/g, '');
  return `${p.sectionId ?? ''}/${p.id ?? ''}`;
};

/** Where a post sits in its series, or last if it belongs to none. */
export const seriesRank = (p: Orderable) =>
  RANK.get(keyOf(p)) ?? Number.MAX_SAFE_INTEGER;

/** Newest first, and within one publication date, in series reading order. */
export const byNewest = (a: Orderable, b: Orderable) =>
  b.pubDate.valueOf() - a.pubDate.valueOf() ||
  seriesRank(a) - seriesRank(b) ||
  keyOf(a).localeCompare(keyOf(b));

/** Oldest first, same tie-break. Used for previous/next within a section. */
export const byOldest = (a: Orderable, b: Orderable) =>
  a.pubDate.valueOf() - b.pubDate.valueOf() ||
  seriesRank(a) - seriesRank(b) ||
  keyOf(a).localeCompare(keyOf(b));
