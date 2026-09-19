-- APIs often provide only a year or month. Preserve the exact source-supplied precision instead of inventing a day.
alter table public.articles add column source_published_text text;
