-- ============================================================================
-- Migration: Reconcile live schema drift (adopt live baseline)
-- The portal tables (profiles/quotes/projects/milestones/activity_events)
-- were created out-of-band from the repo migration lineage. This migration
-- (a) adopts the live-only projects.quote_id link into the lineage,
-- (b) drops dead live-only columns, and (c) tightens milestones to the
-- declared shape. Idempotent: safe on live (mostly no-op) and reproduces
-- the live shape on a fresh database.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Adopt projects.quote_id (the quote → project conversion link)
-- ---------------------------------------------------------------------------
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS quote_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_quote_id_fkey'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_quote_id_fkey
      FOREIGN KEY (quote_id) REFERENCES public.quotes (id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS projects_quote_id_idx ON public.projects (quote_id);

-- ---------------------------------------------------------------------------
-- 2. Drop dead live-only columns
--    quotes.user_id duplicates client_id; milestones.status is a free-text
--    parallel to the canonical `completed` boolean.
-- ---------------------------------------------------------------------------
ALTER TABLE public.quotes DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.milestones DROP COLUMN IF EXISTS status;

-- ---------------------------------------------------------------------------
-- 3. Tighten milestones to the declared shape (tables are empty; guard anyway)
-- ---------------------------------------------------------------------------
UPDATE public.milestones SET completed = false WHERE completed IS NULL;
DELETE FROM public.milestones WHERE project_id IS NULL OR target_date IS NULL;

ALTER TABLE public.milestones
  ALTER COLUMN project_id SET NOT NULL,
  ALTER COLUMN target_date SET NOT NULL,
  ALTER COLUMN completed SET NOT NULL,
  ALTER COLUMN completed SET DEFAULT false;
