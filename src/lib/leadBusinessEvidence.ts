// Keep the original wording, including attribution, negation and qualifiers.
// A semicolon is not a sentence boundary: its second clause may limit the first.
// Do not split on periods, which may belong to product names, URLs or decimals.
export function leadBusinessEvidenceSummary(statement: string): string {
  const original = statement.trim()
  return original.match(/^[\s\S]*?[。！？][”’」』]?/u)?.[0] ?? original
}
