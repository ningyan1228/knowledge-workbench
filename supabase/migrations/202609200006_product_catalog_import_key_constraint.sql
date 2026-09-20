-- Fix the catalog initializer's ON CONFLICT (owner_id, import_key) target.
-- NULL import_key values remain allowed, while each non-NULL catalog key is unique per owner.
do $$
begin
  if exists (
    select 1
    from public.products
    where import_key is not null
    group by owner_id, import_key
    having count(*) > 1
  ) then
    raise exception 'DUPLICATE_PRODUCT_IMPORT_KEYS: resolve duplicate non-null import_key rows before applying this migration';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_owner_import_key_key'
  ) then
    alter table public.products
      add constraint products_owner_import_key_key unique (owner_id, import_key);
  end if;
end $$;
