/** Collapse weird whitespace that PDFs love to produce. */
export function cleanText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function wordCount(text: string): number {
  return (text.match(/\b\w+\b/g) ?? []).length;
}
