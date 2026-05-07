import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cal, { getCalApi } from '@calcom/embed-react';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  calLink: string; // e.g. "jb-burkhardt/intro-call"
  title: string;
  duration: string;
  badge: string;
  description: string;
}

/**
 * BKT-branded booking modal wrapping the Cal.com embed.
 *
 * Theming strategy:
 *  - `getCalApi().then(cal => cal('ui', { cssVarsPerTheme: {...} }))` remaps the
 *    Cal.com design tokens to our BKT slate/blue palette so the iframe visually
 *    blends with the rest of the site.
 *  - Shell (header, backdrop, close) is entirely native — only the time picker
 *    itself is Cal.com.
 */
export function BookingModal({ open, onClose, calLink, title, badge, description }: BookingModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Apply BKT brand tokens to the Cal embed iframe
  useEffect(() => {
    if (!open) return;
    (async () => {
      const cal = await getCalApi();
      (cal as (cmd: string, opts: Record<string, unknown>) => void)('ui', {
        hideEventTypeDetails: true,
        layout: 'month_view',
        // customCss is honoured on Cal.com paid plans — normalises form field heights
        // and fixes the phone field border-corner bleed
        customCss: `
          input:not([type="checkbox"]):not([type="radio"]):not([type="search"]) {
            height: 38px !important;
            min-height: 38px !important;
            box-sizing: border-box !important;
          }
          /* Phone wrapper — ensure border-radius is clipped consistently */
          [class*="PhoneInput"],
          [data-testid="phone-input"],
          .react-phone-number-input {
            border-radius: 6px !important;
            overflow: hidden !important;
          }
          /* Remove any white background bleed on flag/prefix child */
          [class*="PhoneInput"] > *,
          .react-phone-number-input > * {
            background: transparent !important;
          }
        `,
        cssVarsPerTheme: {
          light: {
            'cal-brand': '#2563eb',
            'cal-text': '#0f172a',
            'cal-text-emphasis': '#020617',
            'cal-text-muted': '#64748b',
            'cal-text-subtle': '#94a3b8',
            'cal-bg': '#ffffff',
            'cal-bg-emphasis': '#f1f5f9',
            'cal-bg-muted': '#e2e8f0',
            'cal-bg-subtle': '#e2e8f0',
            'cal-border': '#1e3a8a',
            'cal-border-subtle': '#1e3a8a',
            'cal-border-emphasis': '#1d4ed8',
            'cal-border-booker': '#0d1a35',
          },
          dark: {
            'cal-brand': '#3b82f6', // blue-500 — slightly brighter for dark contrast
            'cal-text': '#f8fafc', // slate-50
            'cal-text-emphasis': '#ffffff',
            'cal-text-muted': '#94a3b8', // slate-400
            'cal-text-subtle': '#64748b', // slate-500
            'cal-bg': '#0f172a', // slate-900 — matches modal surface
            'cal-bg-emphasis': '#1e293b', // slate-800
            'cal-bg-muted': '#1e293b', // slate-800
            'cal-bg-subtle': '#334155', // slate-700
            'cal-border': '#1e293b', // slate-800
            'cal-border-subtle': '#0f172a',
            'cal-border-emphasis': '#334155', // slate-700
            'cal-border-booker': '#1e293b',
          },
        },
      });
    })();
  }, [open]);

  if (!open) return null;

  // Detect current theme so the embed mounts in the correct mode
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-white/10 backdrop-blur-[0.4px] md:items-center md:p-4 lg:p-6"
      onClick={onClose}
      aria-modal="true"
      aria-label={`Book ${title}`}
    >
      <div
        className="relative flex w-full flex-col max-h-[90vh] overflow-y-auto rounded-t-2xl border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.65)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.85)] md:max-h-none md:overflow-hidden md:h-[64vh] md:w-[96vw] md:max-w-[1280px] md:rounded-2xl md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── LEFT: Info panel ──────────────────────────────────────────
             Mobile  → full-width top header (flex-col, all text visible)
             Desktop → 300px fixed-width dark column, centred vertically */}
        <div className="flex shrink-0 flex-col items-start gap-4 border-b border-white/10 bg-gradient-to-b from-[#0d1a35] via-[#0f172a] to-[#0d1a35] px-5 py-6 md:w-[320px] md:justify-center md:gap-6 md:border-b-0 md:border-r md:py-12 md:px-8 md:pr-8 lg:w-[340px] lg:px-10 lg:py-14 lg:pr-10">
          <img
            src="https://lh3.googleusercontent.com/a-/ALV-UjUKsVkb4rL7QwPkEtDwipBhlu3deHrsCazzdAfDDA_HQI9kdPI=s112-c-mo"
            alt="John Burkhardt"
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-blue-500/50 md:h-16 md:w-16 lg:h-20 lg:w-20"
          />
          <div className="min-w-0 pb-[15px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-400">
              {badge}
            </p>
            <h2 className="mt-1 text-lg font-semibold leading-snug text-white lg:mt-2 lg:text-2xl">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {/* ── RIGHT: Cal.com embed ──────────────────────────────────────
             Pure white bg — Cal renders its calendar-grid + time-slots
             split automatically when the iframe width ≥ ~600 px. */}
          <div className="relative h-[600px] flex-1 overflow-hidden rounded-none border-0 bg-white ring-4 ring-[#0d1a35] md:h-full md:rounded-br-2xl dark:bg-[#0f172a]">
          {/* Close button lives here so contrast is correct on both themes */}
          <button
            onClick={onClose}
            aria-label="Close booking dialog"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <CloseIcon />
          </button>

          <Cal
            calLink={calLink}
            style={{ width: '100%', height: '100%', minHeight: '100%', overflow: 'scroll' }}
            config={{
              layout: 'month_view',
              theme: isDark ? 'dark' : 'light',
              'branding[hideBranding]': '1',
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
