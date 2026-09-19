-- Stable, user-scoped keys make the three initial catalog entries idempotent without inventing product grades.
alter table public.products add column import_key text;
create unique index products_owner_import_key_idx on public.products(owner_id, import_key) where import_key is not null;

-- A profile is created with the Auth user, so the first-login setup does not require manual SQL inserts.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, owner_id, display_name)
  values (new.id, new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do nothing;
  insert into public.settings (owner_id) values (new.id) on conflict (owner_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Existing first user(s) can call this safely after signing in.
create or replace function public.ensure_my_profile() returns void language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'UNAUTHORIZED' using errcode = '28000'; end if;
  insert into public.profiles (id, owner_id) values (auth.uid(), auth.uid()) on conflict (id) do nothing;
  insert into public.settings (owner_id) values (auth.uid()) on conflict (owner_id) do nothing;
end; $$;
grant execute on function public.ensure_my_profile() to authenticated;
