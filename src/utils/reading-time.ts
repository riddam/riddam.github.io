// Word count and estimated reading time for a post body.
// 220 wpm is a common average for technical prose.
//
// The count is *prose plus tables, excluding fenced code* — the same basis
// Pagefind indexes on. Counting raw markdown inflated the estimate by 10-17%
// on code- and table-heavy posts (fence markers, table pipes, link URLs and
// mermaid diagram source all read as "words").
function toProse(body: string): string {
  return (
    body
      // Fenced code and mermaid diagrams: skimmed, not read at 220 wpm.
      .replace(/^```[\s\S]*?^```/gm, ' ')
      // Images: alt text is not body prose.
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      // Links: keep the visible label, drop the URL.
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // Inline code: keep the token, drop the backticks.
      .replace(/`([^`]*)`/g, '$1')
      // Leading block markers.
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s{0,3}>\s?/gm, '')
      .replace(/^\s{0,3}[-*+]\s+/gm, '')
      // Table separator rows (|---|:--:|) carry no text.
      .replace(/^\s{0,3}\|[-:\s|]*\|\s*$/gm, ' ')
      // Remaining table delimiters: drop the pipes, keep the cell text.
      .replace(/\|/g, ' ')
      // Emphasis marks.
      .replace(/[*_~]/g, '')
  );
}

export function readingStats(body = '') {
  const words = toProse(body).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return { words, minutes };
}
