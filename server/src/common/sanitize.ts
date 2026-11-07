import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'a',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'em',
  'strong',
  'br',
  'hr',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'div',
  'span',
  'section',
  'article',
  'header',
  'footer',
  'nav',
  'main',
  'figure',
  'figcaption',
];

const safeStyleValue = /^(?!.*(?:url\s*\(|expression\s*\())[\w\s#.,%()/-]+$/i;
const allowedStyleProperties = [
  'color',
  'background-color',
  'font-size',
  'font-weight',
  'font-style',
  'text-align',
  'margin',
  'padding',
  'border',
  'border-radius',
  'line-height',
  'max-width',
];

const allowedStyles = Object.fromEntries(
  allowedStyleProperties.map((property) => [property, [safeStyleValue]]),
);

export function sanitizeBody(html: string): string {
  // Sanitizing on write stores one safe representation; the sandboxed iframe is layer two, so neither layer is trusted alone.
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      a: ['href'],
      '*': ['style'],
    },
    allowedStyles: {
      '*': allowedStyles,
    },
    allowedSchemes: [],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
  });
}
