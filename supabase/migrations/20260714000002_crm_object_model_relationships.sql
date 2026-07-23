-- ============================================================================
-- Migration: CRM object model — relationships
-- Accounts⟵Contacts (master-detail), Accounts⟵Projects (lookup),
-- Accounts⟵Quotes (lookup), Quotes⟷Contacts junction (quote_contact_roles).
-- Milestones⟵Projects is already NOT NULL + ON DELETE CASCADE.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Contacts → Accounts becomes master-detail (required, cascade delete)
--    Backfill guard: park any orphan contacts in a "Website Leads" account.
-- ---------------------------------------------------------------------------
DO $$
DECLARE holding uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.contacts WHERE account_id IS NULL) THEN
    SELECT id INTO holding
    FROM public.accounts
    WHERE lower(name) = 'website leads'
    LIMIT 1;

    IF holding IS NULL THEN
      INSERT INTO public.accounts (name)
      VALUES ('Website Leads')
      RETURNING id INTO holding;
    END IF;

    UPDATE public.contacts SET account_id = holding WHERE account_id IS NULL;
  END IF;
END
$$;

ALTER TABLE public.contacts ALTER COLUMN account_id SET NOT NULL;

ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_account_id_fkey;
ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_account_id_fkey
  FOREIGN KEY (account_id) REFERENCES public.accounts (id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- 2. Projects → Accounts (many-to-one lookup)
-- ---------------------------------------------------------------------------
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS account_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_account_id_fkey'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_account_id_fkey
      FOREIGN KEY (account_id) REFERENCES public.accounts (id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS projects_account_id_idx ON public.projects (account_id);

-- ---------------------------------------------------------------------------
-- 3. Quotes → Accounts (many-to-one lookup)
-- ---------------------------------------------------------------------------
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS account_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotes_account_id_fkey'
  ) THEN
    ALTER TABLE public.quotes
      ADD CONSTRAINT quotes_account_id_fkey
      FOREIGN KEY (account_id) REFERENCES public.accounts (id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS quotes_account_id_idx ON public.quotes (account_id);

-- ---------------------------------------------------------------------------
-- 4. Junction: quote_contact_roles (Quotes ⟷ Contacts, many-to-many)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_contact_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes (id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'stakeholder'
    CONSTRAINT quote_contact_roles_role_check CHECK (
      role IN (
        'decision_maker',
        'economic_buyer',
        'technical_evaluator',
        'champion',
        'billing_contact',
        'stakeholder'
      )
    ),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT quote_contact_roles_unique_pair UNIQUE (quote_id, contact_id)
);

CREATE INDEX IF NOT EXISTS quote_contact_roles_quote_id_idx
  ON public.quote_contact_roles (quote_id);
CREATE INDEX IF NOT EXISTS quote_contact_roles_contact_id_idx
  ON public.quote_contact_roles (contact_id);

-- Max one primary contact per quote
CREATE UNIQUE INDEX IF NOT EXISTS quote_contact_roles_primary_idx
  ON public.quote_contact_roles (quote_id) WHERE is_primary;

DROP TRIGGER IF EXISTS set_quote_contact_roles_updated_at ON public.quote_contact_roles;
CREATE TRIGGER set_quote_contact_roles_updated_at
BEFORE UPDATE ON public.quote_contact_roles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quote_contact_roles TO authenticated;

ALTER TABLE public.quote_contact_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all quote contact roles" ON public.quote_contact_roles;
CREATE POLICY "Admins can manage all quote contact roles"
ON public.quote_contact_roles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
