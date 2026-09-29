-- Shared manual sent-email ledger for the small trusted team.
-- Additive only: existing company/Lead/contact tables and their RLS remain unchanged.
-- All authenticated accounts in this Supabase project share these records;
-- anonymous visitors have no access. Copying a draft never creates a row.

create table if not exists public.market_intel_outreach_sends (
  id uuid primary key default gen_random_uuid(),
  company_key text not null check (length(company_key) between 3 and 240),
  company_name text not null check (length(trim(company_name)) between 1 and 240),
  lead_id text not null,
  product_id text not null check (product_id in ('fertilizer-coating', 'nl-w1201', 'elo')),
  recipient_email text not null check (recipient_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  sent_on date not null check (sent_on <= current_date),
  sent_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  voided_at timestamptz,
  voided_by uuid references auth.users(id) on delete set null,
  void_reason text,
  constraint outreach_void_fields_together check (
    (voided_at is null and voided_by is null and void_reason is null)
    or (voided_at is not null and length(trim(coalesce(void_reason, ''))) > 0)
  )
);

-- One active "sent" record per company; mistaken entries can be voided without erasing history.
create unique index if not exists market_intel_outreach_one_active_send_idx
  on public.market_intel_outreach_sends(company_key) where voided_at is null;
create index if not exists market_intel_outreach_recent_idx
  on public.market_intel_outreach_sends(created_at desc);

create or replace function public.outreach_void_send(p_send_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_voided_at timestamptz;
begin
  if v_uid is null then raise exception 'Sign in before correcting an outreach record'; end if;
  select voided_at into v_voided_at
    from public.market_intel_outreach_sends where id = p_send_id for update;
  if not found then raise exception 'Outreach record not found'; end if;
  if v_voided_at is not null then raise exception 'This record was already voided'; end if;
  if length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'Give a brief correction reason'; end if;
  update public.market_intel_outreach_sends
    set voided_at = now(), voided_by = v_uid, void_reason = trim(p_reason)
    where id = p_send_id;
end;
$$;

revoke all on public.market_intel_outreach_sends from anon;
grant select, insert on public.market_intel_outreach_sends to authenticated;
revoke all on function public.outreach_void_send(uuid, text) from public, anon;
grant execute on function public.outreach_void_send(uuid, text) to authenticated;

alter table public.market_intel_outreach_sends enable row level security;
drop policy if exists outreach_sends_select_authenticated on public.market_intel_outreach_sends;
create policy outreach_sends_select_authenticated on public.market_intel_outreach_sends
  for select to authenticated using (true);
drop policy if exists outreach_sends_insert_authenticated on public.market_intel_outreach_sends;
create policy outreach_sends_insert_authenticated on public.market_intel_outreach_sends
  for insert to authenticated with check (
    sent_by = (select auth.uid())
    and voided_at is null and voided_by is null and void_reason is null
  );

comment on table public.market_intel_outreach_sends is
  'Manually confirmed sent-email records shared by authenticated project users. Public lead IDs are reference keys, not CRM Leads.';
