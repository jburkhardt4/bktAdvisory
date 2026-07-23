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

-- ---------------------------------------------------------------------------
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
