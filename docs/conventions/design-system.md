# BKT Advisory — Design System & Skill Contract

> Single source of truth for the visual language of the portfolio + estimator, **and** the
> anchor-vs-skill exception list that the ported design skills (`design-taste-frontend`,
> `emil-design-eng`, `high-end-visual-design`, `redesign-existing-projects`) must respect.
> The visual-validation gate (ADR-017) reads this file before flagging UI as defective.

## Locked tokens (from `src/styles/globals.css`)

- **Typography:** `--font-primary: 'Plus Jakarta Sans'` (whitelisted by `high-end-visual-design`). Base `16px`.
- **Backgrounds:** `--background-dark: #0F172B`; brand gradient `#0F172B → #1e293b → #1e3a8a`; light surface `#f8fafc` (slate-50).
- **Accent (intentional brand identity):** `--royal-blue: #1d4ed8` (blue-700); soft CTA glow `--glow-blue: #EFF6FF`.
- **Text:** primary `#f8fafc` (slate-50) on dark / `#0f172a` on light; secondary `#cbd5e1`; muted `#94a3b8`.
- **Brand system:** `--bkt-brand-gradient`, `--bkt-brand-border`, `--bkt-*-shadow`, and the
  `--bkt-on-brand-*` / `--bkt-on-light-*` outline+glow families. **Reuse these — do not invent new shadow/glow values.**
- **Anchors (per repo CLAUDE.md):** dark = slate-950 family; light = slate-50 family. **No arbitrary Tailwind values without justification.**

## Anchor-vs-skill exceptions (the skills are wrong *here* — keep the brand)

The design skills ban these by default; BKT uses them **intentionally**. Do **not** "fix" them:

| Skill default | BKT exception (keep) | Why |
| --- | --- | --- |
| Ban Lucide / use custom SVG only | **Lucide (`lucide-react`) + inline SVG are allowed** | Already the icon system; consistent, accessible, zero migration value |
| Ban 3-column card rows | **3-col grids stay** (Services, About, Process) | Deliberate information architecture |
| Ban blue / "AI-purple" glows | **Royal blue is the single brand accent** | Brand identity; glows are tasteful + token-based, not neon |
| Ban centered heroes | Hero composition is brand-set | Evaluate per-case, do not auto-restructure |

> This is a **polish pass, not a redesign.** Borrow the skills' depth/spacing/state/motion *techniques*;
> never override the brand anchors above.

## Motion contract (MOTION_INTENSITY 4–5, professional B2B)

- CSS transitions + `@starting-style` + `whileInView` reveals. **No magnetic buttons, no perpetual loops.**
- Per Emil's frequency rule: **no entrance animation on high-frequency surfaces** (admin dashboard).
- Centralized utilities (added to `globals.css`): `.bkt-pressable` (`:active { scale(0.97) }`, gated by
  `@media (hover:hover)` + `prefers-reduced-motion`) and `.bkt-reveal` (`@starting-style` entrance).
- **Never** animate `width/height/top/left` — use `transform`/`scaleX`. **Never** `transition: all` or `scale(0)`.
- Every pressable element has an `:active` state; honor `prefers-reduced-motion` everywhere.

## Dual-skill binding (ported from `bkt-ai-apply/.claude/agents/ui-ux.md`)

Every UI task applies **`design-taste-frontend` + `emil-design-eng`** plus exactly one direction skill
(`high-end-visual-design` for marketing surfaces; `redesign-existing-projects` for audits) and returns
`skills_applied: [design-taste-frontend, emil-design-eng, <direction>]`.

## Stack constraints

- React 18 + Vite + Tailwind v4 (`4.1.12`). `motion` (`framer-motion`) and `lucide-react` are already
  installed — **motion polish requires zero new dependencies.**
- Verify at 375 / 768 / 1280, dark + light, and `prefers-reduced-motion` (ADR-017).
