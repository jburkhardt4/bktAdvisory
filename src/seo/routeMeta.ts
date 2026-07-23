// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for social-share / SEO metadata, per route.
//
// This module is deliberately PLAIN DATA (no React, no alias imports, no browser
// globals) so it can be safely imported by BOTH:
//   • the client bundle  → src/seo/RouteMeta.tsx  (updates the browser tab title
//     + <meta name="description"> on navigation — a human-facing nicety), and
//   • the Vercel function → api/og.ts (renders route-specific Open Graph / Twitter
//     tags for social crawlers, which do NOT execute JS and never see the SPA).
//
// Because it has zero side-effects and no non-portable imports, it bundles cleanly
// on both sides. Keep it that way.
// ─────────────────────────────────────────────────────────────────────────────

export interface RouteMeta {
  title: string;
  description: string;
  /** Optional per-route share card. Root-relative or absolute. Defaults to SITE.defaultImage. */
  image?: string;
}

export const SITE = {
  /** Canonical origin — apex, non-www. No trailing slash. */
  origin: 'https://bktadvisory.com',
  name: 'BKT Advisory',
  twitterCard: 'summary_large_image',
  locale: 'en_US',
  /** 1200×630 (1.91:1) landscape share card, served same-origin from /public. */
  defaultImage: '/og-image.png',
  defaultImageWidth: 1200,
  defaultImageHeight: 630,
  defaultImageType: 'image/png',
  defaultTitle: 'BKT Advisory — Salesforce + Enterprise AI Architect',
  defaultDescription:
    'Where the Salesforce ecosystem meets enterprise AI. John Burkhardt helps revenue teams turn platform and AI complexity into a clear, staged plan.',
} as const;

/**
 * Per-route metadata. Keys are normalized pathnames (leading slash, no trailing
 * slash except root). Any route not listed here falls back to SITE defaults.
 */
export const routeMeta: Record<string, RouteMeta> = {
  '/': {
    title: SITE.defaultTitle,
    // Keep identical to the static index.html homepage head (single source of truth):
    // the same '/' must render the same preview whether a crawler hits the function
    // or the static fallback.
    description: SITE.defaultDescription,
  },
  '/work': {
    title: 'Work — BKT Advisory',
    description:
      'Selected engagements across the Salesforce ecosystem and enterprise AI — outcomes, systems, and shipped delivery.',
  },
  '/services': {
    title: 'Services — BKT Advisory',
    description:
      'Salesforce architecture, enterprise AI, and RevOps advisory that turns platform complexity into a clear, staged plan.',
  },
  '/process': {
    title: 'Process — BKT Advisory',
    description:
      'How BKT Advisory moves from executive goals to shipped systems — a staged path from boardroom outcome to delivery.',
  },
  '/about': {
    title: 'About — BKT Advisory',
    description:
      'John Burkhardt, Founder & Principal Consultant — the bridge between the Salesforce ecosystem and enterprise AI. 8x Salesforce Certified.',
  },
  '/environments': {
    title: 'Environments — BKT Advisory',
    description:
      'Explore the BKT Advisory delivery environments and client surfaces across marketing, estimator, and portal.',
  },
  '/calendar': {
    title: 'Book an Interview — BKT Advisory',
    description:
      'Schedule a personal interview with John Burkhardt of BKT Advisory.',
  },
  '/schedule': {
    title: 'Schedule a Consultation — BKT Advisory',
    description:
      'Book a consulting session with BKT Advisory — Salesforce + Enterprise AI architecture for revenue teams.',
  },
  '/estimator': {
    title: 'Project Estimator — BKT Advisory',
    description:
      'Estimate your Salesforce or enterprise AI project scope, timeline, and investment with the BKT Advisory estimator.',
  },
};

export interface ResolvedMeta {
  /** Normalized route path (leading slash, no trailing slash except root). */
  path: string;
  title: string;
  description: string;
  /** Absolute image URL. */
  image: string;
  /** Absolute canonical URL for this path. */
  url: string;
  /** True when the path matched an entry in {@link routeMeta}. */
  matched: boolean;
}

/**
 * Normalize an incoming pathname into a safe, canonical route key.
 * Strips query/hash, collapses duplicate slashes, removes a trailing slash
 * (except root), restricts to a conservative character set, and caps length —
 * so an attacker-controlled path can never break out of an HTML attribute or
 * inflate the response. Consumers that emit HTML must STILL escape values.
 */
export function normalizePath(raw: string | null | undefined): string {
  if (!raw) return '/';
  let p = String(raw);
  // Drop query string / fragment if present.
  const cut = p.search(/[?#]/);
  if (cut !== -1) p = p.slice(0, cut);
  // Restrict to a safe subset of URL path characters.
  p = p.replace(/[^a-zA-Z0-9/_\-.]/g, '');
  // Ensure a single leading slash.
  if (!p.startsWith('/')) p = '/' + p;
  // Collapse duplicate slashes.
  p = p.replace(/\/{2,}/g, '/');
  // Remove trailing slash (but keep root).
  if (p.length > 1) p = p.replace(/\/+$/, '');
  // Hard length cap.
  if (p.length > 128) p = p.slice(0, 128);
  return p || '/';
}

/** Resolve a possibly-relative image URL to an absolute one. */
function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return SITE.origin + (pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl);
}

/**
 * Resolve the full metadata for a pathname, applying per-route overrides on top
 * of SITE defaults. Never throws; unknown routes fall back to the home/default
 * copy but keep their own canonical URL.
 */
export function metaFor(pathnameRaw: string | null | undefined): ResolvedMeta {
  const path = normalizePath(pathnameRaw);
  const entry = routeMeta[path];
  const title = entry?.title ?? SITE.defaultTitle;
  const description = entry?.description ?? SITE.defaultDescription;
  const image = absoluteUrl(entry?.image ?? SITE.defaultImage);
  const url = path === '/' ? SITE.origin + '/' : SITE.origin + path;
  return { path, title, description, image, url, matched: Boolean(entry) };
}
