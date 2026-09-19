-- Neon Lion Knowledge Workbench: initial, owner-isolated schema.
-- Apply with Supabase CLI or SQL editor. Do not run this against an unrelated project.
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.review_status as enum ('extracted', 'needs_review', 'approved', 'rejected', 'superseded');
create type public.knowledge_scope as enum ('own_product', 'industry_general', 'external_product', 'operational_guidance');
create type public.evidence_level as enum ('supplier_tds', 'test_report', 'certificate', 'public_research', 'editorial', 'user_note');
create type public.job_status as enum ('queued', 'running', 'succeeded', 'failed', 'retry_wait');
create type public.draft_status as enum ('draft', 'needs_review', 'published', 'archived');

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'Asia/Shanghai',
  language text not null default 'zh-CN',
  theme text not null default 'system' check (theme in ('system','light','dark')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (id = owner_id)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, parent_id uuid references public.topics(id) on delete set null, kind text not null default 'topic',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, name, parent_id)
);
create table public.products (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name_zh text not null, name_en text, grade text, category text, cas_number text, overview_zh text,
  current_version_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(owner_id, grade)
);
create table public.documents (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null, file_name text not null, mime_type text not null, sha256 text not null, byte_size bigint not null check (byte_size >= 0),
  parser_status text not null default 'pending' check (parser_status in ('pending','queued','parsing','parsed','needs_ocr','failed')),
  page_count integer, parser_error_code text, parsed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, sha256), unique(owner_id, storage_path)
);
create table public.product_versions (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade, document_id uuid references public.documents(id) on delete set null,
  version_label text not null, change_summary text, review_status public.review_status not null default 'extracted', confirmed_by text, confirmed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, product_id, version_label)
);
alter table public.products add constraint products_current_version_fk foreign key (current_version_id) references public.product_versions(id) on delete set null;
create table public.document_chunks (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade, chunk_version integer not null default 1,
  page_number integer, section_path text, row_locator text, content text not null, search_text text generated always as (lower(content)) stored,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_specs (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  version_id uuid not null references public.product_versions(id) on delete cascade, name text not null, original_label text, original_value text not null,
  normalized_value text, comparison_operator text, unit text, test_method text, conditions text, source_locator text not null,
  source_excerpt text, review_status public.review_status not null default 'extracted', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.claims (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade, claim_text text not null, knowledge_scope public.knowledge_scope not null,
  review_status public.review_status not null default 'extracted', evidence_level public.evidence_level not null, citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.review_tasks (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade, version_id uuid references public.product_versions(id) on delete cascade,
  related_type text, related_id uuid, question text not null, status text not null default 'open' check (status in ('open','in_progress','resolved','rejected')),
  factory_confirmation text, evidence_document_id uuid references public.documents(id) on delete set null, resolved_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_keywords (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade, keyword text not null, language text not null default 'en', search_intent text, enabled boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, product_id, keyword)
);
create table public.sources (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, homepage_url text, endpoint_url text not null, adapter text not null default 'rss', access_method text not null default 'public',
  verification_status text not null default 'unverified' check (verification_status in ('unverified','verified','blocked','failed','paused')),
  enabled boolean not null default false, last_verified_at timestamptz, last_success_at timestamptz, consecutive_failures integer not null default 0,
  failure_reason text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, endpoint_url)
);
create table public.source_topics (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade, topic_id uuid references public.topics(id) on delete cascade, product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check (topic_id is not null or product_id is not null)
);
create table public.articles (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null, canonical_url text not null, title text not null, source_published_at timestamptz,
  fetched_at timestamptz not null default now(), content_hash text not null, content_access text not null check (content_access in ('public_page','summary_only','user_provided')),
  content_text text, kind text not null default 'industry_news', country text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, canonical_url)
);
create table public.article_products (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade,
  relevance numeric(4,3) check (relevance between 0 and 1), relevance_reason text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, article_id, product_id)
);
create table public.article_summaries (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade, content_hash text not null, processing_version text not null,
  model_name text, summary_zh text not null, business_meaning text, citations jsonb not null default '[]'::jsonb, review_status public.review_status not null default 'extracted',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, content_hash, processing_version)
);
create table public.knowledge_entries (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null, body text not null, knowledge_scope public.knowledge_scope not null, evidence_level public.evidence_level not null,
  citations jsonb not null default '[]'::jsonb, applicable_region text, last_verified_at date, review_status public.review_status not null default 'extracted',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.glossary (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  term_en text not null, term_zh text not null, example_sentence text, product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, term_en)
);
create table public.bookmarks_notes (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  object_type text not null, object_id uuid not null, bookmarked boolean not null default false, note text, reading_status text not null default 'unread',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, object_type, object_id)
);
create table public.learning_progress (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid references public.knowledge_entries(id) on delete cascade, glossary_id uuid references public.glossary(id) on delete cascade,
  status text not null default 'not_started', review_on date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check (entry_id is not null or glossary_id is not null)
);
create table public.content_templates (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  platform text not null, content_type text not null, name text not null, rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, name)
);
create table public.drafts (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, template_id uuid references public.content_templates(id) on delete set null,
  title text, body text not null, translation_zh text, citations jsonb not null default '[]'::jsonb, version integer not null default 1,
  status public.draft_status not null default 'draft', published_url text, published_at timestamptz, topic_signature text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.conversations (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  title text, retain_messages boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.messages (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade, role text not null check (role in ('user','assistant','system')),
  content text not null, evidence_ids uuid[] not null default '{}', model_name text, prompt_version text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  scheduled_for date not null, started_at timestamptz, finished_at timestamptz, success_count integer not null default 0, failure_count integer not null default 0,
  status public.job_status not null default 'queued', summary_status text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, scheduled_for)
);
create table public.jobs (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null, idempotency_key text not null, status public.job_status not null default 'queued', payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0, next_retry_at timestamptz, lease_until timestamptz, error_code text, error_detail_safe text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, idempotency_key)
);
create table public.usage_events (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, model_name text, operation text not null, input_tokens integer, output_tokens integer, estimated_cost numeric(12,6), actual_cost numeric(12,6), currency text not null default 'USD', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.settings (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null unique references auth.users(id) on delete cascade,
  daily_limit numeric(12,2), monthly_budget numeric(12,2), budget_currency text not null default 'USD', values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Prevent a user from wiring one of their records to a parent owned by another user.
create or replace function public.require_parent_owner() returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare parent_id uuid; allowed boolean; parent_table text := tg_argv[0]; foreign_column text := tg_argv[1];
begin
  parent_id := nullif(to_jsonb(new)->>foreign_column, '')::uuid;
  if parent_id is null then return new; end if;
  execute format('select exists (select 1 from public.%I where id = $1 and owner_id = $2)', parent_table) into allowed using parent_id, new.owner_id;
  if not allowed then raise exception 'FOREIGN_OWNER_REFERENCE' using errcode = '42501'; end if;
  return new;
end; $$;
create trigger product_versions_product_owner before insert or update on public.product_versions for each row execute function public.require_parent_owner('products','product_id');
create trigger product_versions_document_owner before insert or update on public.product_versions for each row execute function public.require_parent_owner('documents','document_id');
create trigger products_current_version_owner before insert or update on public.products for each row execute function public.require_parent_owner('product_versions','current_version_id');
create trigger chunks_document_owner before insert or update on public.document_chunks for each row execute function public.require_parent_owner('documents','document_id');
create trigger specs_version_owner before insert or update on public.product_specs for each row execute function public.require_parent_owner('product_versions','version_id');
create trigger claims_product_owner before insert or update on public.claims for each row execute function public.require_parent_owner('products','product_id');
create trigger keywords_product_owner before insert or update on public.product_keywords for each row execute function public.require_parent_owner('products','product_id');
create trigger source_topics_source_owner before insert or update on public.source_topics for each row execute function public.require_parent_owner('sources','source_id');
create trigger source_topics_topic_owner before insert or update on public.source_topics for each row execute function public.require_parent_owner('topics','topic_id');
create trigger source_topics_product_owner before insert or update on public.source_topics for each row execute function public.require_parent_owner('products','product_id');
create trigger articles_source_owner before insert or update on public.articles for each row execute function public.require_parent_owner('sources','source_id');
create trigger article_products_article_owner before insert or update on public.article_products for each row execute function public.require_parent_owner('articles','article_id');
create trigger article_products_product_owner before insert or update on public.article_products for each row execute function public.require_parent_owner('products','product_id');
create trigger article_summaries_article_owner before insert or update on public.article_summaries for each row execute function public.require_parent_owner('articles','article_id');
create trigger drafts_product_owner before insert or update on public.drafts for each row execute function public.require_parent_owner('products','product_id');
create trigger drafts_template_owner before insert or update on public.drafts for each row execute function public.require_parent_owner('content_templates','template_id');
create trigger glossary_product_owner before insert or update on public.glossary for each row execute function public.require_parent_owner('products','product_id');
create trigger learning_entry_owner before insert or update on public.learning_progress for each row execute function public.require_parent_owner('knowledge_entries','entry_id');
create trigger learning_glossary_owner before insert or update on public.learning_progress for each row execute function public.require_parent_owner('glossary','glossary_id');
create trigger messages_conversation_owner before insert or update on public.messages for each row execute function public.require_parent_owner('conversations','conversation_id');

-- Search supports Chinese substring matching, English aliases and exact CAS values without an embedding dependency.
create index documents_owner_created_idx on public.documents(owner_id, created_at desc);
create index products_owner_category_idx on public.products(owner_id, category);
create index products_name_zh_trgm_idx on public.products using gin (name_zh gin_trgm_ops);
create index chunks_content_trgm_idx on public.document_chunks using gin (content gin_trgm_ops);
create index chunks_document_idx on public.document_chunks(owner_id, document_id, page_number);
create index product_specs_version_idx on public.product_specs(owner_id, version_id);
create index articles_owner_date_idx on public.articles(owner_id, source_published_at desc);
create index articles_title_trgm_idx on public.articles using gin (title gin_trgm_ops);
create index jobs_lease_idx on public.jobs(status, next_retry_at, lease_until);
create index review_tasks_owner_status_idx on public.review_tasks(owner_id, status);

-- Updated timestamps on every mutable user table.
do $$ declare t text; begin
  foreach t in array array['profiles','topics','products','documents','product_versions','document_chunks','product_specs','claims','review_tasks','product_keywords','sources','source_topics','articles','article_products','article_summaries','knowledge_entries','glossary','bookmarks_notes','learning_progress','content_templates','drafts','conversations','messages','ingestion_runs','jobs','usage_events','settings'] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', 'set_' || t || '_updated_at', t);
  end loop;
end $$;

-- Every browser-visible table is deny-by-default and scoped to auth.uid().
do $$ declare t text; begin
  foreach t in array array['profiles','topics','products','documents','product_versions','document_chunks','product_specs','claims','review_tasks','product_keywords','sources','source_topics','articles','article_products','article_summaries','knowledge_entries','glossary','bookmarks_notes','learning_progress','content_templates','drafts','conversations','messages','ingestion_runs','jobs','usage_events','settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = owner_id)', 'select_own_' || t, t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = owner_id)', 'insert_own_' || t, t);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id)', 'update_own_' || t, t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = owner_id)', 'delete_own_' || t, t);
  end loop;
end $$;

-- Private Storage. Upload paths must begin with the authenticated owner's UUID.
insert into storage.buckets (id, name, public) values ('private-documents', 'private-documents', false) on conflict (id) do nothing;
create policy "documents_select_own" on storage.objects for select to authenticated using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "documents_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'private-documents' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "documents_update_own" on storage.objects for update to authenticated using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = (select auth.uid()::text)) with check (bucket_id = 'private-documents' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "documents_delete_own" on storage.objects for delete to authenticated using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = (select auth.uid()::text));
