const HTML_TAG_REGEX = /<[^>]*>/g;
const CONTROL_CHARS_REGEX = /[\x00-\x1F\x7F]/g;

export function sanitizeText(input: string, maxLength = 2000): string {
  return input
    .replace(HTML_TAG_REGEX, '')
    .replace(CONTROL_CHARS_REGEX, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeAlias(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9_\s-]/g, '')
    .trim()
    .slice(0, 24);
}
