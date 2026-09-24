-- Learning route v1. Course text is versioned in src/lib/learningContent.ts;
-- this migration stores only each user's private plan, progress and answers.

create table if not exists public.learning_enrollments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  path_id text not null default 'chemical-trade-growth-v1',
  start_mode text not null check (start_mode in ('beginner', 'foundation', 'direct_answer')),
  daily_minutes integer not null default 30 check (daily_minutes in (15, 30, 60)),
  timezone text not null default 'Asia/Shanghai',
  selected_product_id uuid references public.products(id) on delete set null,
  selected_product_version_id uuid references public.product_versions(id) on delete set null,
  paused_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, path_id)
);

alter table public.learning_progress add column if not exists lesson_id text;
alter table public.learning_progress add column if not exists lesson_revision integer;
alter table public.learning_progress add column if not exists mastery text not null default 'unassessed';
alter table public.learning_progress add column if not exists read_confirmed_at timestamptz;
alter table public.learning_progress add column if not exists completed_at timestamptz;
alter table public.learning_progress add column if not exists product_id uuid references public.products(id) on delete set null;
alter table public.learning_progress add column if not exists product_version_id uuid references public.product_versions(id) on delete set null;
alter table public.learning_progress alter column lesson_revision set default 1;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'learning_progress_status_check') then
    alter table public.learning_progress add constraint learning_progress_status_check check (status in ('not_started', 'in_progress', 'completed'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'learning_progress_mastery_check') then
    alter table public.learning_progress add constraint learning_progress_mastery_check check (mastery in ('unassessed', 'needs_review', 'confident'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'learning_progress_owner_lesson_key') then
    alter table public.learning_progress add constraint learning_progress_owner_lesson_key unique(owner_id, lesson_id);
  end if;
end $$;

-- Existing records keep their entry/glossary relation. Lessons must have a lesson_id.
alter table public.learning_progress drop constraint if exists learning_progress_check;
alter table public.learning_progress add constraint learning_progress_target_check check (entry_id is not null or glossary_id is not null or lesson_id is not null);

create table if not exists public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  lesson_id text not null,
  lesson_revision integer not null default 1,
  state text not null default 'draft' check (state in ('draft', 'submitted')),
  answers jsonb not null default '{}'::jsonb,
  self_check jsonb not null default '{}'::jsonb,
  product_id uuid references public.products(id) on delete set null,
  product_version_id uuid references public.product_versions(id) on delete set null,
  submission_key text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, exercise_id, lesson_revision),
  unique(owner_id, submission_key)
);

create table if not exists public.learning_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, lesson_id)
);

create table if not exists public.review_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('lesson', 'term')),
  target_id text not null,
  interval_stage integer not null default 0 check (interval_stage between 0 and 4),
  due_on date not null default (current_date + 1),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, target_type, target_id)
);

create table if not exists public.review_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  review_item_id uuid not null references public.review_items(id) on delete cascade,
  rating text not null check (rating in ('not_known', 'vague', 'known')),
  previous_due_on date not null,
  next_due_on date not null,
  previous_interval_stage integer not null,
  next_interval_stage integer not null,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique(owner_id, idempotency_key)
);

create table if not exists public.learning_questions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  related_lesson_ids text[] not null default '{}',
  status text not null default 'open' check (status in ('open', 'answered', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_progress_owner_status_idx on public.learning_progress(owner_id, status, updated_at desc);
create index if not exists review_items_owner_due_idx on public.review_items(owner_id, active, due_on);
create index if not exists exercise_attempts_owner_lesson_idx on public.exercise_attempts(owner_id, lesson_id, submitted_at desc);

drop trigger if exists learning_enrollments_product_owner on public.learning_enrollments;
create trigger learning_enrollments_product_owner before insert or update on public.learning_enrollments for each row execute function public.require_parent_owner('products','selected_product_id');
drop trigger if exists learning_enrollments_version_owner on public.learning_enrollments;
create trigger learning_enrollments_version_owner before insert or update on public.learning_enrollments for each row execute function public.require_parent_owner('product_versions','selected_product_version_id');
drop trigger if exists learning_progress_product_owner on public.learning_progress;
create trigger learning_progress_product_owner before insert or update on public.learning_progress for each row execute function public.require_parent_owner('products','product_id');
drop trigger if exists learning_progress_version_owner on public.learning_progress;
create trigger learning_progress_version_owner before insert or update on public.learning_progress for each row execute function public.require_parent_owner('product_versions','product_version_id');
drop trigger if exists exercise_attempts_product_owner on public.exercise_attempts;
create trigger exercise_attempts_product_owner before insert or update on public.exercise_attempts for each row execute function public.require_parent_owner('products','product_id');
drop trigger if exists exercise_attempts_version_owner on public.exercise_attempts;
create trigger exercise_attempts_version_owner before insert or update on public.exercise_attempts for each row execute function public.require_parent_owner('product_versions','product_version_id');

do $$ declare t text; begin
  foreach t in array array['learning_enrollments','exercise_attempts','learning_notes','review_items','review_events','learning_questions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = owner_id)', 'select_own_' || t, t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = owner_id)', 'insert_own_' || t, t);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id)', 'update_own_' || t, t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = owner_id)', 'delete_own_' || t, t);
    execute format('drop trigger if exists %I on public.%I', 'set_' || t || '_updated_at', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', 'set_' || t || '_updated_at', t);
  end loop;
end $$;

-- Atomic submit: an attempt and its lesson progress move together. Reading alone never completes a lesson.
create or replace function public.submit_learning_attempt(
  p_exercise_id text, p_lesson_id text, p_lesson_revision integer, p_answers jsonb,
  p_self_check jsonb default '{}'::jsonb, p_product_id uuid default null,
  p_product_version_id uuid default null, p_idempotency_key text default null
) returns uuid language plpgsql security invoker set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); attempt_id uuid;
begin
  if uid is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if p_product_id is not null and p_product_version_id is null then
    select current_version_id into p_product_version_id from public.products where id = p_product_id and owner_id = uid;
  end if;
  if p_idempotency_key is not null then
    select id into attempt_id from public.exercise_attempts where owner_id = uid and submission_key = p_idempotency_key;
    if attempt_id is not null then return attempt_id; end if;
  end if;
  insert into public.exercise_attempts (owner_id, exercise_id, lesson_id, lesson_revision, state, answers, self_check, product_id, product_version_id, submission_key, submitted_at)
  values (uid, p_exercise_id, p_lesson_id, coalesce(p_lesson_revision, 1), 'submitted', coalesce(p_answers, '{}'::jsonb), coalesce(p_self_check, '{}'::jsonb), p_product_id, p_product_version_id, p_idempotency_key, now())
  on conflict (owner_id, exercise_id, lesson_revision) do update set
    state = 'submitted', answers = excluded.answers, self_check = excluded.self_check,
    product_id = excluded.product_id, product_version_id = excluded.product_version_id,
    submitted_at = now(), submission_key = coalesce(exercise_attempts.submission_key, excluded.submission_key)
  returning id into attempt_id;
  insert into public.learning_progress (owner_id, lesson_id, lesson_revision, status, mastery, product_id, product_version_id)
  values (uid, p_lesson_id, coalesce(p_lesson_revision, 1), 'in_progress', 'unassessed', p_product_id, p_product_version_id)
  on conflict (owner_id, lesson_id) do update set
    status = case when learning_progress.read_confirmed_at is not null then 'completed' else 'in_progress' end,
    lesson_revision = excluded.lesson_revision,
    completed_at = case when learning_progress.read_confirmed_at is not null then now() else learning_progress.completed_at end,
    product_id = excluded.product_id, product_version_id = excluded.product_version_id;
  insert into public.review_items (owner_id, target_type, target_id, interval_stage, due_on)
  values (uid, 'lesson', p_lesson_id, 0, current_date + 1)
  on conflict (owner_id, target_type, target_id) do nothing;
  return attempt_id;
end; $$;

create or replace function public.confirm_learning_lesson_read(p_lesson_id text, p_product_id uuid default null)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); has_attempt boolean;
begin
  if uid is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  select exists(select 1 from public.exercise_attempts where owner_id = uid and lesson_id = p_lesson_id and state = 'submitted') into has_attempt;
  insert into public.learning_progress(owner_id, lesson_id, lesson_revision, status, mastery, read_confirmed_at, completed_at, product_id)
  values(uid, p_lesson_id, 1, case when has_attempt then 'completed' else 'in_progress' end, 'unassessed', now(), case when has_attempt then now() else null end, p_product_id)
  on conflict (owner_id, lesson_id) do update set read_confirmed_at = now(),
    status = case when has_attempt then 'completed' else learning_progress.status end,
    completed_at = case when has_attempt then now() else learning_progress.completed_at end,
    product_id = coalesce(excluded.product_id, learning_progress.product_id);
end; $$;

create or replace function public.rate_learning_review(p_item_id uuid, p_rating text, p_idempotency_key text)
returns table(next_due_on date, next_interval_stage integer) language plpgsql security invoker set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); item public.review_items%rowtype; prior public.review_events%rowtype; nstage integer; ndue date;
begin
  if uid is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  select * into prior from public.review_events where owner_id = uid and idempotency_key = p_idempotency_key;
  if prior.id is not null then return query select prior.next_due_on, prior.next_interval_stage; return; end if;
  select * into item from public.review_items where id = p_item_id and owner_id = uid for update;
  if item.id is null then raise exception 'REVIEW_NOT_FOUND' using errcode = '42501'; end if;
  if p_rating = 'not_known' then nstage := 0; ndue := current_date + 1;
  elsif p_rating = 'vague' then nstage := 0; ndue := current_date + 3;
  elsif p_rating = 'known' then nstage := least(item.interval_stage + 1, 4); ndue := current_date + (array[3,7,14,30])[nstage];
  else raise exception 'INVALID_RATING'; end if;
  update public.review_items set interval_stage = nstage, due_on = ndue, active = true where id = item.id;
  insert into public.review_events(owner_id, review_item_id, rating, previous_due_on, next_due_on, previous_interval_stage, next_interval_stage, idempotency_key)
  values(uid, item.id, p_rating, item.due_on, ndue, item.interval_stage, nstage, p_idempotency_key);
  return query select ndue, nstage;
end; $$;

grant execute on function public.submit_learning_attempt(text, text, integer, jsonb, jsonb, uuid, uuid, text) to authenticated;
grant execute on function public.confirm_learning_lesson_read(text, uuid) to authenticated;
grant execute on function public.rate_learning_review(uuid, text, text) to authenticated;
