import sanitizeHtml from 'sanitize-html';
import { sanitizeBody } from './sanitize';

const namedEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

const blockBoundaryPattern =
  /<\/?(?:h[1-6]|p|li|div|section|article|header|footer|nav|main|blockquote|pre|tr|th|td|br|hr)\b[^>]*>/gi;

function decodeEntity(entity: string): string {
  if (entity.startsWith('#x') || entity.startsWith('#X')) {
    const codePoint = Number.parseInt(entity.slice(2), 16);
    return Number.isInteger(codePoint) && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : '';
  }
  if (entity.startsWith('#')) {
    const codePoint = Number.parseInt(entity.slice(1), 10);
    return Number.isInteger(codePoint) && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : '';
  }
  return namedEntities[entity.toLowerCase()] ?? `&${entity};`;
}

export function extractSiteText(sanitizedHtml: string): string {
  const separatedHtml = sanitizedHtml.replace(blockBoundaryPattern, ' ');
  const plainText = sanitizeHtml(separatedHtml, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return plainText
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity: string) =>
      decodeEntity(entity),
    )
    .replace(/\s+/g, ' ')
    .trim();
}

export function prepareSiteContent(html: string): {
  body: string;
  text: string;
} {
  const body = sanitizeBody(html);
  return { body, text: extractSiteText(body) };
}
