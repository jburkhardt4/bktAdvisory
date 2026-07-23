-- ============================================================================
-- Migration: CRM object model — consultant-practice fields
-- Additive, nullable-or-defaulted columns only; client portal RLS untouched.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Accounts
-- ---------------------------------------------------------------------------
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'prospect'
    CONSTRAINT accounts_type_check CHECK (
      type IN ('prospect', 'client', 'partner', 'past_client')
    ),
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS billing_email text,
  ADD COLUMN IF NOT EXISTS billing_address text;

-- ---------------------------------------------------------------------------
-- 2. Contacts
-- ---------------------------------------------------------------------------
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS title text;

-- ---------------------------------------------------------------------------
-- 3. Projects (account_id added in the relationships migration)
-- ---------------------------------------------------------------------------
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS target_end_date date,
  ADD COLUMN IF NOT EXISTS budget numeric
    CONSTRAINT projects_budget_non_negative CHECK (budget >= 0),
  ADD COLUMN IF NOT EXISTS billing_type text
    CONSTRAINT projects_billing_type_check CHECK (
      billing_type IN ('fixed_fee', 'time_and_materials', 'retainer')
    );

-- ---------------------------------------------------------------------------<context>
Project/Repository: [Insert Repository Name / Path, e.g., current repository]
Branch: [Insert Target Branch, e.g., main / feature/workstream-b]
Related Issue/Ticket: [Insert Link/ID to Workstream B specification or ticket]
Environment: [Insert Development Environment, e.g., Local Node.js / Docker / Cloud Codespace]
Context: Executing the scope defined under "WORKSTREAM B".
</context>

<goal>
Complete all technical requirements and deliverables associated with Workstream B while maintaining codebase integrity, following existing architectural patterns, and ensuring full test coverage.
</goal>

<available_inputs>
- [List or path to Workstream B technical specification, PRD, or issue description]
- [List any logs, mockups, schema definitions, or API specs relevant to Workstream B]
</available_inputs>

<operating_mode>
[Select one: plan_then_implement | direct_implementation | ultraplan | investigation_only]
(Default to plan_then_implement for multi-file/complex tasks, or ultraplan if using /ultraplan for extensive multi-step execution.)
</operating_mode>

<task>
Inspect the codebase and technical specifications for Workstream B, formulate an execution plan, implement the required code and configuration changes, and verify the implementation through automated testing and validation checks.
</task>

<repo_instructions>
1. Read relevant project guidelines, including CLAUDE.md, README.md, package.json scripts, and architectural documentation before editing files.
2. Search the repository for existing implementations, utilities, and helper patterns related to Workstream B to ensure consistency and avoid duplication.
</repo_instructions>

<requirements>
- Implement all functional features and technical requirements specified for Workstream B.
- Ensure full compatibility with existing services, database schemas, and API endpoints.
- Maintain existing codebase conventions, design systems, type safety, and code formatting standards.
- Add or update relevant unit, integration, or end-to-end tests covering Workstream B functionality.
</requirements>

<constraints>
- Do not modify files or components outside the explicit scope of Workstream B without approval.
- Avoid destructive git commands (e.g., rebase, hard reset, force push). Preserve existing uncommitted user changes.
- Do not perform speculative or broad refactoring beyond what is strictly necessary for Workstream B.
- Do not introduce new external dependencies or libraries unless explicitly required by the specification.
</constraints>

<implementation_guidance>
1. Explore First: Inspect target files, directories, and existing implementations.
2. Batch File Reads: Request multiple related files in single steps to maintain an efficient context.
3. Plan First: If the scope touches multiple modules or contains architectural ambiguity, outline the plan (files to create/modify, approach, test strategy) before editing.
4. Minimal Edits: Make surgical, focused edits. Do not rewrite working modules unnecessarily.
5. Reason Privately: Keep internal chain-of-thought concise and present only clear conclusions, action plans, diff summaries, and verification results.
</implementation_guidance>

<verification>
Execute and confirm pass state for:
- Typecheck: [e.g., npm run typecheck / tsc --noEmit]
- Linting: [e.g., npm run lint]
- Tests: Run targeted tests for Workstream B modules [e.g., npm test -- path/to/workstream-b.test.js]
- Build: [e.g., npm run build]
- Manual/Visual QA: [Describe any required manual steps, API checks, or UI screenshot verifications]
</verification>

<deliverables>
Provide a final summary containing:
1. Executive Summary: Overview of changes completed for Workstream B.
2. Files Changed: List of modified, created, or deleted files with brief notes.
3. Tests Executed: Commands run and passing test output highlights.
4. Risks & Considerations: Potential side effects or dependencies to monitor.
5. Recommended Next Steps: Follow-up tasks, PR recommendations, or deployment considerations.
</deliverables>

<approval_rules>
- Proceed autonomously with file inspection, planning, code modifications within Workstream B scope, and running read-only test/build scripts.
- Require explicit user approval before executing database schema migrations, modifying environment variables/secrets, performing commits/pushes/PR creation, or running destructive file/git operations.
</approval_rules>
-- 4. Milestones
-- ---------------------------------------------------------------------------
ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount numeric
    CONSTRAINT milestones_amount_non_negative CHECK (amount >= 0),
  ADD COLUMN IF NOT EXISTS completed_at date;

-- ---------------------------------------------------------------------------
-- 5. Quotes (account_id added in the relationships migration)
-- ---------------------------------------------------------------------------
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS amount numeric
    CONSTRAINT quotes_amount_non_negative CHECK (amount >= 0),
  ADD COLUMN IF NOT EXISTS valid_until date;
