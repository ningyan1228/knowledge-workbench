-- Product intelligence evidence chain.
-- Keep the following concepts separate: TDS application -> sourced market extension -> target company type -> company evidence -> lead.

create table public.market_intel_product_tds_applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  source_document_name text not null,
  source_document_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, product_id, slug)
);

-- This table intentionally requires a public, attributable source. Do not insert AI-derived hypotheses here.
create table public.market_intel_market_extended_applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  based_on_tds_application_id uuid not null references public.market_intel_product_tds_applications(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  source_name text not null,
  source_url text not null check (source_url ~ '^https://'),
  verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, product_id, slug)
);

create table public.market_intel_target_company_types (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  slug text not null,
  kind text not null default 'target' check (kind in ('target','alternative_research')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, product_id, slug)
);

create table public.market_intel_target_company_type_applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  target_company_type_id uuid not null references public.market_intel_target_company_types(id) on delete cascade,
  tds_application_id uuid references public.market_intel_product_tds_applications(id) on delete cascade,
  market_extended_application_id uuid references public.market_intel_market_extended_applications(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(tds_application_id, market_extended_application_id) = 1)
);

-- A company becomes a lead candidate only through a sourced statement tied to exactly one application layer.
create table public.market_intel_company_application_evidence (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.market_intel_companies(id) on delete cascade,
  target_company_type_id uuid not null references public.market_intel_target_company_types(id) on delete cascade,
  tds_application_id uuid references public.market_intel_product_tds_applications(id) on delete restrict,
  market_extended_application_id uuid references public.market_intel_market_extended_applications(id) on delete restrict,
  statement text not null,
  source_name text not null,
  source_url text not null check (source_url ~ '^https://'),
  verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(tds_application_id, market_extended_application_id) = 1)
);

alter table public.market_intel_leads
  add column if not exists company_application_evidence_id uuid references public.market_intel_company_application_evidence(id) on delete set null;

-- Existing general company/contact fields are kept; these add the explicit public channels used by Company Detail.
alter table public.market_intel_companies
  add column if not exists contact_page_url text,
  add column if not exists whatsapp text,
  add column if not exists address text;

alter table public.market_intel_contacts
  add column if not exists whatsapp text;

-- Owner checks prevent cross-workspace records; this check prevents cross-product chains.
create or replace function public.validate_market_intel_application_chain() returns trigger language plpgsql security invoker set search_path = public, pg_temp as $$
declare target_product uuid; application_product uuid;
begin
  if tg_table_name = 'market_intel_market_extended_applications' then
    select product_id into application_product from public.market_intel_product_tds_applications where id = new.based_on_tds_application_id;
    if application_product is distinct from new.product_id then
      raise exception 'Market extension and its TDS application must use the same product';
    end if;
    return new;
  end if;

  select product_id into target_product from public.market_intel_target_company_types where id = new.target_company_type_id;

  if new.tds_application_id is not null then
    select product_id into application_product from public.market_intel_product_tds_applications where id = new.tds_application_id;
  else
    select product_id into application_product from public.market_intel_market_extended_applications where id = new.market_extended_application_id;
  end if;
  if application_product is distinct from target_product then
    raise exception 'Target company type and application evidence must use the same product';
  end if;
  return new;
end; $$;

create trigger validate_market_intel_market_extension_product
  before insert or update on public.market_intel_market_extended_applications for each row
  execute function public.validate_market_intel_application_chain();
create trigger validate_market_intel_target_type_application_product
  before insert or update on public.market_intel_target_company_type_applications for each row
  execute function public.validate_market_intel_application_chain();
create trigger validate_market_intel_company_evidence_product
  before insert or update on public.market_intel_company_application_evidence for each row
  execute function public.validate_market_intel_application_chain();

do $$ begin
  create trigger require_market_intel_product_tds_applications_product_id
    before insert or update on public.market_intel_product_tds_applications for each row
    execute function public.require_parent_owner('products','product_id');
  create trigger require_market_intel_market_extended_applications_product_id
    before insert or update on public.market_intel_market_extended_applications for each row
    execute function public.require_parent_owner('products','product_id');
  create trigger require_market_intel_market_extended_applications_based_tds
    before insert or update on public.market_intel_market_extended_applications for each row
    execute function public.require_parent_owner('market_intel_product_tds_applications','based_on_tds_application_id');
  create trigger require_market_intel_target_company_types_product_id
    before insert or update on public.market_intel_target_company_types for each row
    execute function public.require_parent_owner('products','product_id');
  create trigger require_market_intel_target_company_type_applications_type_id
    before insert or update on public.market_intel_target_company_type_applications for each row
    execute function public.require_parent_owner('market_intel_target_company_types','target_company_type_id');
  create trigger require_market_intel_target_company_type_applications_tds_id
    before insert or update on public.market_intel_target_company_type_applications for each row
    execute function public.require_parent_owner('market_intel_product_tds_applications','tds_application_id');
  create trigger require_market_intel_target_company_type_applications_extension_id
    before insert or update on public.market_intel_target_company_type_applications for each row
    execute function public.require_parent_owner('market_intel_market_extended_applications','market_extended_application_id');
  create trigger require_market_intel_company_application_evidence_company_id
    before insert or update on public.market_intel_company_application_evidence for each row
    execute function public.require_parent_owner('market_intel_companies','company_id');
  create trigger require_market_intel_company_application_evidence_type_id
    before insert or update on public.market_intel_company_application_evidence for each row
    execute function public.require_parent_owner('market_intel_target_company_types','target_company_type_id');
  create trigger require_market_intel_company_application_evidence_tds_id
    before insert or update on public.market_intel_company_application_evidence for each row
    execute function public.require_parent_owner('market_intel_product_tds_applications','tds_application_id');
  create trigger require_market_intel_company_application_evidence_extension_id
    before insert or update on public.market_intel_company_application_evidence for each row
    execute function public.require_parent_owner('market_intel_market_extended_applications','market_extended_application_id');
  create trigger require_market_intel_leads_company_evidence_id
    before insert or update on public.market_intel_leads for each row
    execute function public.require_parent_owner('market_intel_company_application_evidence','company_application_evidence_id');
exception when duplicate_object then null;
end $$;

do $$ declare t text; begin
  foreach t in array array[
    'market_intel_product_tds_applications',
    'market_intel_market_extended_applications',
    'market_intel_target_company_types',
    'market_intel_target_company_type_applications',
    'market_intel_company_application_evidence'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = owner_id)', 'select_own_' || t, t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = owner_id)', 'insert_own_' || t, t);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id)', 'update_own_' || t, t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = owner_id)', 'delete_own_' || t, t);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', 'set_' || t || '_updated_at', t);
  end loop;
end $$;

create index market_intel_tds_applications_product_idx on public.market_intel_product_tds_applications(owner_id, product_id);
create index market_intel_extensions_product_verified_idx on public.market_intel_market_extended_applications(owner_id, product_id, verified_at desc);
create index market_intel_company_evidence_company_idx on public.market_intel_company_application_evidence(owner_id, company_id, verified_at desc);
create unique index market_intel_target_type_application_unique_idx on public.market_intel_target_company_type_applications (
  owner_id,
  target_company_type_id,
  coalesce(tds_application_id::text, ''),
  coalesce(market_extended_application_id::text, '')
);
