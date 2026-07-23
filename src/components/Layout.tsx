import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { AIChatbot } from './AIChatbot';
import { RouteMeta } from '../seo/RouteMeta';

export function Layout() {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="bkt-app-shell">
      <RouteMeta />
      <Navigation />
      <Outlet />
      <Footer />
      <AIChatbot />
    </div>
  );
}
