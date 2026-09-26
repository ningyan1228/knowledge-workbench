-- Demand-side audit fields.
-- Additive only: existing company rows, RLS policies, and Lead rows are unchanged.

alter table public.market_intel_companies
  add column if not exists demand_side_reason text,
  add column if not exists supplier_competitor_checked_at date,
  add column if not exists supplier_competitor_check_note text;

comment on column public.market_intel_companies.demand_side_reason is
  'Public-evidence explanation of why this company is a downstream user/formulator; not a purchase confirmation.';

comment on column public.market_intel_companies.supplier_competitor_checked_at is
  'Date on which public sources were checked for same-or-similar raw-material supplier/competitor exclusion.';

comment on column public.market_intel_companies.supplier_competitor_check_note is
  'Public-source conclusion from the supplier/competitor exclusion check.';
