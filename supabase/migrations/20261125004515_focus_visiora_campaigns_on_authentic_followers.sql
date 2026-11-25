ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS target_subscribers integer NOT NULL DEFAULT 0
  CHECK (target_subscribers >= 0);

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_objective_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_objective_check
  CHECK (objective = 'followers');

ALTER TABLE public.campaigns
  ALTER COLUMN objective SET DEFAULT 'followers';

DROP POLICY IF EXISTS campaigns_owner_insert ON public.campaigns;
CREATE POLICY campaigns_owner_insert ON public.campaigns
FOR INSERT TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND status IN ('draft', 'pending_payment')
  AND objective = 'followers'
);

DROP POLICY IF EXISTS campaigns_owner_update_draft ON public.campaigns;
CREATE POLICY campaigns_owner_update_draft ON public.campaigns
FOR UPDATE TO authenticated
USING (
  user_id = (SELECT auth.uid())
  AND status IN ('draft', 'pending_payment', 'pending_review')
)
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND status IN ('draft', 'pending_payment', 'pending_review')
  AND objective = 'followers'
);
