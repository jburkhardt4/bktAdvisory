import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { metaFor } from './routeMeta';

/**
 * RouteMeta — updates the browser tab <title> and <meta name="description"> on
 * client-side navigation, sourced from the shared {@link metaFor} map.
 *
 * This is a HUMAN-facing nicety only (tab titles, bookmarks, in-app history).
 * Social crawlers never see it — they do not run JS and are served route-specific
 * Open Graph tags by api/og.ts. Keep this lightweight; render <RouteMeta /> once
 * inside a page shell (Layout / standalone booking + estimator shells).
 */
export function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description } = metaFor(pathname);

    if (title) document.title = title;

    if (description) {
      let tag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [pathname]);

  return null;
}
