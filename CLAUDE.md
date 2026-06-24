# BKT Advisory — Claude Code Operating Rules

## Stack

- React (Vite)
- TypeScript
- Tailwind CSS v4
- Supabase
- GitHub Codespaces

## Release priorities

1. Authentication and protected routes
2. Estimator accuracy and UX
3. Quote-to-project automation
4. Client/Admin portal integr
ity
5. Mobile responsiveness
6. Automated testing stability

## Working style

- Start with a plan before edits.
- Prefer minimal diffs over large refactors.
- Preserve existing architecture unless a change is explicitly justified.
- Name affected files before editing them.
- Always state verification steps.

## UI rules

- Dark mode anchors: slate-950 family
- Light mode anchors: slate-50 family
- Maintain design consistency across marketing, estimator, client, and admin surfaces
- Validate phone-size layouts after UI changes

## Mandatory execution rule

- Before marking a task complete, you must autonomously run npm run typecheck && npm run lint using your bash tool. If errors exist, read the terminal output and fix them without human prompting.

## Required verification

- npm run typecheck
- npm run lint
- npm run build
- relevant Playwright or smoke tests
- visual verification in Codespaces preview

## Ported AI agent kit + institutional knowledge

This repo vendors a curated subset of the BKT AI-Apply agent/skill kit. The hub
(`bkt-ai-apply`) is canonical; `.claude/skills/`, `.claude/agents/`, and
`.knowledge-vendor/` are **flat, hash-locked copies** — do NOT hand-edit them
(they fail `--check`). To change one, edit it in the hub and re-run the hub's
`sync-claude-kit.mjs` / `kb:sync`.

@.knowledge-vendor/INDEX.md

- **Skills:** design-taste-frontend, emil-design-eng, high-end-visual-design, redesign-existing-projects, gpt-taste, minimalist-ui. **Agents:** orchestrator, ui-ux, feature-dev, qa-uat, release-gate, business-analyst, context-keeper, emil-design-eng, supabase-security, vercel. The `bkt-knowledge` skill explains the memory layers.
- **Toolchain mapping:** ported agents were authored for the hub (pnpm). In THIS repo, where an agent says `pnpm validate`, run the Required verification above (`npm run typecheck && npm run build`; add `npm run lint` once ESLint lands).
- **Knowledge paths:** ported agents reference hub paths (`docs/adr/`, `docs/domain/`, `docs/retro/lessons.md`). Here the **portable** subset lives in `.knowledge-vendor/` (see its INDEX) and brand truth is `.knowledge-vendor/positioning.md`; UI rules are in `docs/conventions/design-system.md`. Treat hub-only docs that don't exist here as not-applicable — do not HOLD on them.

## Never do

- Do not silently rewrite large sections of the app
- Do not change auth or database behavior without tracing the full flow
- Do not introduce new dependencies without justification
- Do not hand-edit vendored `.claude/` or `.knowledge-vendor/` files — re-sync from the hub
