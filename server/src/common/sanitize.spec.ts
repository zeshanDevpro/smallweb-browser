import { sanitizeBody } from './sanitize';

describe('sanitizeBody', () => {
  it.each([
    '<script>alert(1)</script><p>safe prose</p>',
    '<img src=x onerror="alert(1)">A quiet morning',
    '<p onclick="alert(1)">A patient afternoon</p>',
    '<a href="javascript:alert(1)">unsafe link</a>',
    '<a href="data:text/html,alert(1)">unsafe data link</a>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>After frame',
    '<svg onload="alert(1)"><circle></circle></svg>After drawing',
    '<style>@import url(https://example.invalid/x.css)</style>Plain words',
    '<p style="background:url(https://example.invalid/x)">Still here</p>',
    '<scr<script>ipt>alert(1)</scr</script>ipt>Visible words',
    '<base href="https://example.invalid/"><p>Base remains absent</p>',
    '<meta http-equiv="refresh" content="0;url=https://example.invalid">',
    '<form><input value="unsafe"><button>Submit</button></form>Text',
    '<object data="x"></object><embed src="x">After embeds',
  ])('removes unsafe payload: %s', (payload) => {
    const result = sanitizeBody(payload).toLowerCase();
    expect(result).not.toMatch(
      /<\s*(script|style|iframe|object|embed|form|input|link|meta|base|svg|math|img)\b/,
    );
    expect(result).not.toMatch(/\son[a-z]+\s*=/);
    expect(result).not.toMatch(/javascript:|data:|url\s*\(|expression\s*\(|@import/);
  });

  it('preserves prose, headings, and safe smallweb links', () => {
    const result = sanitizeBody(
      '<main><h1>A small field guide</h1><p>Keep this useful prose.</p><a href="tidepool.zz">Visit tidepool</a><a href="#notes">Notes</a></main>',
    );

    expect(result).toContain('<h1>A small field guide</h1>');
    expect(result).toContain('<p>Keep this useful prose.</p>');
    expect(result).toContain('<a href="tidepool.zz">Visit tidepool</a>');
    expect(result).toContain('<a href="#notes">Notes</a>');
  });

  it('keeps safe inline styles and removes disallowed declarations', () => {
    const result = sanitizeBody(
      '<p style="color:#334455;background-color:url(https://bad);position:fixed">Styled text</p>',
    );
    expect(result).toContain('color:#334455');
    expect(result).not.toContain('url(');
    expect(result).not.toContain('position:');
  });
});
