-- Demand-side qualification gate.
-- This is additive: existing companies become unknown / not lead-eligible; no rows are removed or rewritten.

alter table public.market_intel_companies
  add column if not exists commercial_role text not null default 'unknown'
    check (commercial_role in ('demand_side', 'peer_supplier', 'competitor', 'distributor', 'unknown')),
  add column if not exists lead_eligible boolean not null default false;

-- A distributor can be enabled only after a case-by-case evidence review.
-- Peer suppliers, competitors and unknown companies can never become CRM leads.
alter table public.market_intel_companies
  add constraint market_intel_companies_commercial_role_eligibility_check
  check (
    (commercial_role = 'demand_side' and lead_eligible = true)
    or (commercial_role in ('peer_supplier', 'competitor', 'unknown') and lead_eligible = false)
    or commercial_role = 'distributor'
  );

create index if not exists market_intel_companies_owner_role_eligible_idx
  on public.market_intel_companies(owner_id, commercial_role, lead_eligible);

-- Prevent ineligible companies from being created as Leads. Existing Lead rows are untouched.
create or replace function public.require_market_intel_lead_eligible_company() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
declare company_is_eligible boolean;
begin
  select lead_eligible into company_is_eligible
  from public.market_intel_companies
  where id = new.company_id and owner_id = new.owner_id;

  if company_is_eligible is distinct from true then
    raise exception 'Only lead-eligible demand-side companies or individually approved distributors can enter market_intel_leads';
  end if;
  return new;
end;
$$;

drop trigger if exists require_market_intel_lead_eligible_company on public.market_intel_leads;
create trigger require_market_intel_lead_eligible_company
  before insert or update of company_id, owner_id on public.market_intel_leads
  for each row execute function public.require_market_intel_lead_eligible_company();
