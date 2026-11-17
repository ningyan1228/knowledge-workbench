-- Private inbound inquiries. No business content belongs in this migration.
begin;
create table if not exists public.inquiry_imports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  source_name text not null,
  source_sha256 text not null check (source_sha256 ~ '^[a-f0-9]{64}$'),
  source_text text not null,
  created_at timestamptz not null default now(),
  unique(owner_id, source_sha256), unique(id,owner_id)
);
create table if not exists public.customer_inquiries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  import_id uuid not null,
  position integer not null check(position>0),
  customer_name text not null,
  company text,
  country text,
  product text not null,
  inquiry_time text,
  subject text,
  extra_request text,
  source_metadata text not null,
  language text not null check(language in ('en','vi')),
  inquiry_original text not null,
  inquiry_zh text not null,
  reply_original text not null,
  reply_zh text not null,
  source_section text not null,
  status text not null default 'pending' check(status in ('pending','sent')),
  version integer not null default 0,
  status_updated_at timestamptz,
  status_updated_by uuid references auth.users(id),
  foreign key(import_id,owner_id) references public.inquiry_imports(id,owner_id),
  unique(import_id,position), unique(id,owner_id)
);
create table if not exists public.inquiry_status_events (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null,
  owner_id uuid not null,
  previous_status text not null,
  status text not null,
  actor_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key(inquiry_id,owner_id) references public.customer_inquiries(id,owner_id)
);
alter table public.inquiry_imports enable row level security;
alter table public.customer_inquiries enable row level security;
alter table public.inquiry_status_events enable row level security;
revoke all on public.inquiry_imports, public.customer_inquiries, public.inquiry_status_events from anon, authenticated;
grant select on public.inquiry_imports, public.customer_inquiries, public.inquiry_status_events to authenticated;
drop policy if exists inquiry_import_owner on public.inquiry_imports;
create policy inquiry_import_owner on public.inquiry_imports for select to authenticated using(owner_id=(select auth.uid()));
drop policy if exists inquiry_owner on public.customer_inquiries;
create policy inquiry_owner on public.customer_inquiries for select to authenticated using(owner_id=(select auth.uid()));
drop policy if exists inquiry_event_owner on public.inquiry_status_events;
create policy inquiry_event_owner on public.inquiry_status_events for select to authenticated using(owner_id=(select auth.uid()));
create or replace function public.set_inquiry_status(p_id uuid,p_status text,p_expected_version integer)
returns public.customer_inquiries language plpgsql security definer set search_path='' as $$
declare current_row public.customer_inquiries;
begin
  if auth.uid() is null then raise exception '需要登录' using errcode='42501'; end if;
  if p_status is null or p_status not in ('pending','sent') then raise exception '状态无效' using errcode='22023'; end if;
  select * into current_row from public.customer_inquiries where id=p_id and owner_id=auth.uid() for update;
  if not found then raise exception '无权访问该询盘' using errcode='42501'; end if;
  if p_expected_version is distinct from current_row.version then raise exception '记录已更新，请刷新后重试' using errcode='40001'; end if;
  if current_row.status=p_status then return current_row; end if;
  insert into public.inquiry_status_events(inquiry_id,owner_id,previous_status,status,actor_id)
    values(current_row.id,current_row.owner_id,current_row.status,p_status,auth.uid());
  update public.customer_inquiries set status=p_status,version=version+1,status_updated_at=now(),status_updated_by=auth.uid()
    where id=p_id returning * into current_row;
  return current_row;
end;
$$;
revoke all on function public.set_inquiry_status(uuid,text,integer) from public,anon;
grant execute on function public.set_inquiry_status(uuid,text,integer) to authenticated;
commit;
notify pgrst, 'reload schema';
