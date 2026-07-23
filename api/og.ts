import { SITE, metaFor } from '../src/seo/routeMeta';

// Minimal, self-contained request/response shapes for the Vercel Node runtime.
// Structural typing covers the real objects Vercel passes to the handler, so we
// avoid pulling in the heavy `@vercel/node` package just for two type aliases.
interface OgRequest {
  query?: Partial<Record<string, string | string[]>>;
}
interface OgResponse {
  setHeader(name: string, value: string): void;
  status(code: number): OgResponse;
  send(body: string): OgResponse;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic rendering for social crawlers.
//
// This Vercel Serverless Function is reached ONLY by requests whose User-Agent
// matches a known social/link-preview crawler — vercel.json rewrites those to
// `/api/og?p=<original-path>` BEFORE the SPA catch-all. Human visitors never
// touch this function; they are served the static index.html straight from the
// CDN, unchanged.
//
// It returns a minimal HTML document containing route-specific Open Graph /
// Twitter Card tags so Facebook, LinkedIn, X, iMessage, Slack, Discord, Pinterest,
// WhatsApp, etc. render a correct 1200×630 preview per route — something a
// client-only SPA cannot do, because crawlers don't execute JavaScript.
// ─────────────────────────────────────────────────────────────────────────────

/** Escape a string for safe interpolation into HTML attribute/text contexts. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '/';
  return value ?? '/';
}

export default function handler(req: OgRequest, res: OgResponse): void {
  // `p` carries the original request path (see vercel.json rewrite). metaFor()
  // normalizes/sanitizes it and returns known-safe copy from the static route map.
  const meta = metaFor(firstParam(req.query?.p));

  const title = esc(meta.title);
  const description = esc(meta.description);
  const image = esc(meta.image);
  const url = esc(meta.url);
  const siteName = esc(SITE.name);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${siteName}" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:secure_url" content="${image}" />
<meta property="og:image:type" content="${esc(SITE.defaultImageType)}" />
<meta property="og:image:width" content="${SITE.defaultImageWidth}" />
<meta property="og:image:height" content="${SITE.defaultImageHeight}" />
<meta property="og:image:alt" content="${title}" />
<meta property="og:locale" content="${esc(SITE.locale)}" />

<!-- Twitter Card -->
<meta name="twitter:card" content="${esc(SITE.twitterCard)}" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
<meta name="twitter:image:alt" content="${title}" />
</head>
<body>
<h1>${title}</h1>
<p>${description}</p>
<p><a href="${url}">Continue to ${siteName}</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Let scrapers re-fetch fresh on demand while the CDN serves a warm copy.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(html);
}
