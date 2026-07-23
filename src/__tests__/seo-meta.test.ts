import { describe, it, expect } from 'vitest';
import { metaFor, normalizePath, routeMeta, SITE } from '../seo/routeMeta';
import ogHandler from '../../api/og';

describe('normalizePath', () => {
  it('defaults empty/nullish input to root', () => {
    expect(normalizePath('')).toBe('/');
    expect(normalizePath(null)).toBe('/');
    expect(normalizePath(undefined)).toBe('/');
  });

  it('adds a leading slash and strips a trailing slash', () => {
    expect(normalizePath('services')).toBe('/services');
    expect(normalizePath('/services/')).toBe('/services');
    expect(normalizePath('/')).toBe('/');
  });

  it('strips query strings and fragments', () => {
    expect(normalizePath('/services?utm=x')).toBe('/services');
    expect(normalizePath('/services#top')).toBe('/services');
  });

  it('collapses duplicate slashes', () => {
    expect(normalizePath('//services///team')).toBe('/services/team');
  });

  it('strips characters that could break out of an HTML attribute', () => {
    // All of < > " ( ) are stripped; the slash inside "</script>" is a valid path char.
    expect(normalizePath('/x"><script>alert(1)</script>')).toBe('/xscriptalert1/script');
    expect(normalizePath('/x"><script>alert(1)</script>')).not.toMatch(/[<>"]/);
    expect(normalizePath('/a b<c>d')).toBe('/abcd');
  });

  it('caps pathological length', () => {
    expect(normalizePath('/' + 'a'.repeat(500)).length).toBeLessThanOrEqual(128);
  });
});

describe('metaFor', () => {
  it('resolves known routes with their own copy', () => {
    const m = metaFor('/services');
    expect(m.matched).toBe(true);
    expect(m.title).toBe(routeMeta['/services'].title);
    expect(m.url).toBe('https://bktadvisory.com/services');
    expect(m.image).toBe('https://bktadvisory.com/og-image.png');
  });

  it('resolves the homepage', () => {
    const m = metaFor('/');
    expect(m.matched).toBe(true);
    expect(m.url).toBe('https://bktadvisory.com/');
  });

  it('falls back to defaults for unknown routes but keeps the canonical path', () => {
    const m = metaFor('/nope');
    expect(m.matched).toBe(false);
    expect(m.title).toBe(SITE.defaultTitle);
    expect(m.url).toBe('https://bktadvisory.com/nope');
  });

  it('always yields an absolute https image URL', () => {
    for (const path of Object.keys(routeMeta)) {
      expect(metaFor(path).image).toMatch(/^https:\/\//);
    }
  });
});

// Minimal mock of the Vercel Node response surface the handler uses.
function invokeHandler(p: string | string[] | undefined) {
  let statusCode = 0;
  let body = '';
  const headers: Record<string, string> = {};
  const res = {
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    send(payload: string) {
      body = payload;
      return res;
    },
  };
  ogHandler({ query: { p } }, res);
  return { statusCode, body, headers };
}

describe('api/og handler', () => {
  it('returns 200 HTML with route-specific Open Graph tags', () => {
    const { statusCode, body, headers } = invokeHandler('/calendar');
    expect(statusCode).toBe(200);
    expect(headers['content-type']).toContain('text/html');
    expect(body).toContain('<meta property="og:title" content="Book an Interview — BKT Advisory"');
    expect(body).toContain('<meta property="og:url" content="https://bktadvisory.com/calendar"');
    expect(body).toContain('<meta property="og:image" content="https://bktadvisory.com/og-image.png"');
    expect(body).toContain('<meta property="og:image:width" content="1200"');
    expect(body).toContain('<meta property="og:image:height" content="630"');
    expect(body).toContain('<meta name="twitter:card" content="summary_large_image"');
    expect(body).toContain('<link rel="canonical" href="https://bktadvisory.com/calendar"');
  });

  it('sets a scraper-friendly Cache-Control header', () => {
    const { headers } = invokeHandler('/');
    expect(headers['cache-control']).toContain('s-maxage');
  });

  it('handles an array query param by taking the first entry', () => {
    const { body } = invokeHandler(['/services', '/about']);
    expect(body).toContain('https://bktadvisory.com/services');
  });

  it('never emits an unescaped injection from a hostile path', () => {
    const { body } = invokeHandler('/"><script>alert(1)</script>');
    expect(body).not.toContain('<script>alert(1)</script>');
    expect(body).not.toContain('"><script>');
  });
});
