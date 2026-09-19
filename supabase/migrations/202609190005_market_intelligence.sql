-- Phase 2: Global Market Intelligence. All records remain private to their owner.
-- This only adds new tables and relationships; it does not modify Phase 1 data.
create table public.countries (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  iso2 text not null check (char_length(iso2) = 2), iso3 text check (iso3 is null or char_length(iso3) = 3),
  name_en text not null, name_zh text, latitude numeric(9,6), longitude numeric(9,6),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, iso2)
);
create table public.industries (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, slug text not null, parent_id uuid references public.industries(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, slug)
);
create table public.regions (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade, name text not null, name_local text,
  region_type text not null default 'state', latitude numeric(9,6), longitude numeric(9,6), geojson jsonb,
  description text, source_url text, last_verified_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, country_id, name)
);
create table public.applications (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, slug text not null, type text not null default 'application' check (type in ('crop','substrate','application','process','product')),
  industry_id uuid references public.industries(id) on delete set null, parent_id uuid references public.applications(id) on delete set null,
  description text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, slug)
);
create table public.markets (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, slug text not null, country_id uuid references public.countries(id) on delete set null,
  industry_id uuid references public.industries(id) on delete set null, title text not null, summary text,
  description text, status text not null default 'researching' check (status in ('researching','active','paused','archived')),
  record_origin text not null default 'manual' check (record_origin in ('demo','manual','crawler','import','ai')),
  cover_image text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, slug)
);
create table public.market_regions (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade, region_id uuid not null references public.regions(id) on delete cascade,
  relevance numeric(4,3) check (relevance between 0 and 1), note text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, market_id, region_id)
);
create table public.market_applications (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade, application_id uuid not null references public.applications(id) on delete cascade,
  note text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, market_id, application_id)
);
create table public.market_products (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null, opportunity_note text, target_customer_type text,
  keywords text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, market_id, product_id, application_id)
);
create table public.market_opportunities (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade, application_id uuid references public.applications(id) on delete set null,
  product_id uuid references public.products(id) on delete set null, title text not null, demand_summary text not null,
  target_customer_type text, opportunity_note text, evidence_kind text not null default 'user_note' check (evidence_kind in ('source_fact','ai_inference','user_note','demo')),
  source_id uuid references public.sources(id) on delete set null, source_url text, last_verified_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, market_id, title)
);
create table public.companies (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, country_id uuid references public.countries(id) on delete set null, region_id uuid references public.regions(id) on delete set null,
  city text, company_type text, website text, linkedin text, email text, phone text, description text,
  latitude numeric(9,6), longitude numeric(9,6), source_id uuid references public.sources(id) on delete set null,
  source_url text, verification_status text not null default 'unverified' check (verification_status in ('unverified','verified','needs_review','rejected')),
  record_origin text not null default 'manual' check (record_origin in ('demo','manual','crawler','import','ai')),
  last_verified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.company_markets (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade, market_id uuid not null references public.markets(id) on delete cascade,
  note text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, company_id, market_id)
);
create table public.company_applications (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade, application_id uuid not null references public.applications(id) on delete cascade,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, company_id, application_id)
);
create table public.contacts (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade, name text not null, title text, department text,
  email text, phone text, linkedin text, source_id uuid references public.sources(id) on delete set null, source_url text,
  last_verified_at timestamptz, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.leads (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade, contact_id uuid references public.contacts(id) on delete set null,
  market_id uuid references public.markets(id) on delete set null, product_id uuid references public.products(id) on delete set null,
  application_id uuid references public.applications(id) on delete set null,
  status text not null default 'discovered' check (status in ('discovered','researching','qualified','contact_ready','contacted','replied','sample','negotiation','customer','not_suitable')),
  source text, reason text, next_action text, follow_up_at date, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.article_market_relations (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade, market_id uuid references public.markets(id) on delete cascade,
  region_id uuid references public.regions(id) on delete cascade, company_id uuid references public.companies(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  relation_kind text not null default 'mentioned' check (relation_kind in ('mentioned','primary','opportunity_signal')),
  classifier text, confidence numeric(4,3) check (confidence between 0 and 1), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (market_id is not null or region_id is not null or company_id is not null or application_id is not null)
);

-- Parent records must belong to the same private workspace.
create trigger regions_country_owner before insert or update on public.regions for each row execute function public.require_parent_owner('countries','country_id');
create trigger applications_industry_owner before insert or update on public.applications for each row execute function public.require_parent_owner('industries','industry_id');
create trigger applications_parent_owner before insert or update on public.applications for each row execute function public.require_parent_owner('applications','parent_id');
create trigger markets_country_owner before insert or update on public.markets for each row execute function public.require_parent_owner('countries','country_id');
create trigger markets_industry_owner before insert or update on public.markets for each row execute function public.require_parent_owner('industries','industry_id');
do $$ declare r record; begin
  for r in select * from (values
    ('market_regions','markets','market_id'),('market_regions','regions','region_id'),('market_applications','markets','market_id'),('market_applications','applications','application_id'),
    ('market_products','markets','market_id'),('market_products','products','product_id'),('market_products','applications','application_id'),
    ('market_opportunities','markets','market_id'),('market_opportunities','applications','application_id'),('market_opportunities','products','product_id'),('market_opportunities','sources','source_id'),
    ('companies','countries','country_id'),('companies','regions','region_id'),('companies','sources','source_id'),('company_markets','companies','company_id'),('company_markets','markets','market_id'),
    ('company_applications','companies','company_id'),('company_applications','applications','application_id'),('contacts','companies','company_id'),('contacts','sources','source_id'),
    ('leads','companies','company_id'),('leads','contacts','contact_id'),('leads','markets','market_id'),('leads','products','product_id'),('leads','applications','application_id'),
    ('article_market_relations','articles','article_id'),('article_market_relations','markets','market_id'),('article_market_relations','regions','region_id'),('article_market_relations','companies','company_id'),('article_market_relations','applications','application_id')
  ) as x(child_table,parent_table,foreign_column) loop
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.require_parent_owner(%L,%L)',
      'require_' || r.child_table || '_' || r.foreign_column, r.child_table, r.parent_table, r.foreign_column);
  end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['countries','industries','regions','applications','markets','market_regions','market_applications','market_products','market_opportunities','companies','company_markets','company_applications','contacts','leads','article_market_relations'] loop
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

create index markets_owner_updated_idx on public.markets(owner_id, updated_at desc);
create index regions_country_idx on public.regions(owner_id, country_id);
create index companies_market_lookup_idx on public.company_markets(owner_id, market_id, company_id);
create index leads_owner_status_idx on public.leads(owner_id, status, follow_up_at);
create index article_market_relations_market_idx on public.article_market_relations(owner_id, market_id, article_id);

-- Explicitly writes clearly marked seed records only when the authenticated owner requests it.
create or replace function public.seed_market_intelligence_demo() returns uuid language plpgsql security invoker set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); brazil uuid; agriculture uuid; market uuid; app_id uuid; product uuid; region_name text; lat numeric; lng numeric;
begin
  if uid is null then raise exception 'UNAUTHORIZED' using errcode = '28000'; end if;
  insert into public.countries(owner_id, iso2, iso3, name_en, name_zh, latitude, longitude) values (uid,'BR','BRA','Brazil','巴西',-14.2350,-51.9253)
    on conflict (owner_id, iso2) do update set name_en = excluded.name_en returning id into brazil;
  insert into public.industries(owner_id, name, slug) values (uid,'Agriculture','agriculture') on conflict (owner_id, slug) do update set name = excluded.name returning id into agriculture;
  insert into public.markets(owner_id,name,slug,country_id,industry_id,title,summary,status,record_origin) values
    (uid,'Brazil Agriculture','brazil-agriculture',brazil,agriculture,'Brazil Agriculture Intelligence','Demo：用于验证市场情报信息架构；并非实时市场研究。','researching','demo')
    on conflict (owner_id, slug) do update set updated_at = now() returning id into market;
  for region_name, lat, lng in values
    ('Mato Grosso',-15.6014::numeric,-56.0979::numeric),('Goiás',-16.6869::numeric,-49.2648::numeric),('Paraná',-25.4296::numeric,-49.2713::numeric),
    ('São Paulo',-23.5505::numeric,-46.6333::numeric),('Minas Gerais',-19.9167::numeric,-43.9345::numeric),('Bahia',-12.9714::numeric,-38.5014::numeric)
  loop
    insert into public.regions(owner_id,country_id,name,region_type,latitude,longitude,description) values (uid,brazil,region_name,'state',lat,lng,'Demo region; verify with a source before use.')
      on conflict (owner_id,country_id,name) do update set latitude=excluded.latitude,longitude=excluded.longitude returning id into app_id;
    insert into public.market_regions(owner_id,market_id,region_id,relevance,note) values (uid,market,app_id,0.5,'Demo relationship') on conflict do nothing;
  end loop;
  foreach region_name in array array['Soybean','Corn','Sugarcane','Coffee','Cotton'] loop
    insert into public.applications(owner_id,name,slug,type,industry_id,description) values (uid,region_name,lower(replace(region_name,' ','-')),'crop',agriculture,'Demo application; source verification required.')
      on conflict (owner_id,slug) do update set name=excluded.name returning id into app_id;
    insert into public.market_applications(owner_id,market_id,application_id,note) values (uid,market,app_id,'Demo relationship') on conflict do nothing;
  end loop;
  select id into product from public.products where owner_id=uid and import_key='nl-fc-pu' limit 1;
  select id into app_id from public.applications where owner_id=uid and slug='corn' limit 1;
  if product is not null then insert into public.market_products(owner_id,market_id,product_id,application_id,opportunity_note,target_customer_type,keywords) values
    (uid,market,product,app_id,'Demo only; requires validated demand and approved product evidence.','Fertilizer manufacturer',array['controlled release fertilizer','coated urea']) on conflict do nothing; end if;
  insert into public.market_opportunities(owner_id,market_id,application_id,product_id,title,demand_summary,target_customer_type,opportunity_note,evidence_kind) values
    (uid,market,app_id,product,'Controlled Release Urea','Demo hypothesis: nitrogen-use efficiency may be a research direction.','Fertilizer manufacturer','Not a verified market fact or sales claim.','demo')
    on conflict (owner_id,market_id,title) do update set updated_at = now();
  return market;
end; $$;
grant execute on function public.seed_market_intelligence_demo() to authenticated;
