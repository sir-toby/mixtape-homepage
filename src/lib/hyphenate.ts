// Soft hyphens for long compound words, so they break as "Datenschutz-/erklärung"
// instead of at an arbitrary letter. Add more words here when needed.
const BREAKS: [RegExp, string][] = [[/Datenschutzerkl/g, 'Datenschutz\u00ADerkl']];

export function hyphenate(text: string): string {
  return BREAKS.reduce((t, [pattern, replacement]) => t.replace(pattern, replacement), text);
}
