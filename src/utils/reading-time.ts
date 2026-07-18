// Word count and estimated reading time for a post body.
// 220 wpm is a common average for technical prose.
export function readingStats(body = '') {
  const words = body.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return { words, minutes };
}
