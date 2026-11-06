import { renderSiteBody } from '../seed/data/sites';
import type { SiteSeed } from '../seed/seed.types';
import { prepareSiteContent } from './site-content';

function makeSite(paragraph: string): SiteSeed {
  return {
    address: 'test.zz',
    title: 'Test',
    authorSlug: 'ada',
    paragraphs: [paragraph],
    links: [],
  };
}

describe('prepareSiteContent', () => {
  it('does not glue words across wrapped lines when the seed builder makes HTML', () => {
    const body = renderSiteBody(
      makeSite('The tide is still\nmoving toward the black ledge.'),
    );

    expect(body).toContain(
      '<p>The tide is still moving toward the black ledge.</p>',
    );
  });

  it.each(['a\nb', 'line one\n   line two'])(
    'normalizes wrapped paragraph whitespace in body and text',
    (paragraph) => {
      const { body, text } = prepareSiteContent(
        renderSiteBody(makeSite(paragraph)),
      );
      const expected = paragraph.replace(/\s+/g, ' ').trim();

      expect(body).toContain(`<p>${expected}</p>`);
      expect(body).not.toContain('\n');
      expect(text).toContain(expected);
    },
  );

  it('separates adjacent block elements in extracted text', () => {
    const { text } = prepareSiteContent('<h1>Title</h1><p>Text</p>');
    expect(text).toBe('Title Text');
  });

  it('separates list items in extracted text', () => {
    const { text } = prepareSiteContent('<ul><li>First</li><li>Second</li></ul>');
    expect(text).toBe('First Second');
  });

  it('derives text from the same sanitized body it stores', () => {
    const result = prepareSiteContent(
      '<main><h1>Title</h1><p onclick="bad()">Safe<br>words</p><script>hidden</script></main>',
    );
    expect(result.text).toBe('Title Safe words');
  });
});
