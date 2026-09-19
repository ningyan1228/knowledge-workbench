-- Idempotent enqueueing and atomic worker leases. The service-role worker is the only caller of lease_jobs.
create or replace function public.enqueue_user_job(
  p_type text, p_idempotency_key text, p_payload jsonb default '{}'::jsonb
) returns uuid language plpgsql security invoker set search_path = public, pg_temp as $$
declare result_id uuid;
begin
  if auth.uid() is null then raise exception 'UNAUTHORIZED' using errcode = '28000'; end if;
  insert into public.jobs (owner_id, type, idempotency_key, payload)
  values (auth.uid(), p_type, p_idempotency_key, coalesce(p_payload, '{}'::jsonb))
  on conflict (owner_id, idempotency_key) do nothing
  returning id into result_id;
  if result_id is null then
    select id into result_id from public.jobs where owner_id = auth.uid() and idempotency_key = p_idempotency_key;
  end if;
  return result_id;
end; $$;
grant execute on function public.enqueue_user_job(text, text, jsonb) to authenticated;

create or replace function public.lease_jobs(p_limit integer default 3, p_lease_seconds integer default 300)
returns setof public.jobs language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_limit < 1 or p_limit > 20 or p_lease_seconds < 30 or p_lease_seconds > 1800 then
    raise exception 'INVALID_LEASE_ARGUMENT';
  end if;
  return query
  with candidates as (
    select id from public.jobs
    where (status in ('queued','retry_wait') and (next_retry_at is null or next_retry_at <= now()))
       or (status = 'running' and lease_until < now())
    order by created_at asc
    for update skip locked limit p_limit
  )
  update public.jobs j set status = 'running', attempts = j.attempts + 1,
    lease_until = now() + make_interval(secs => p_lease_seconds), next_retry_at = null, error_code = null, error_detail_safe = null
  from candidates c where j.id = c.id returning j.*;
end; $$;
revoke all on function public.lease_jobs(integer, integer) from public, anon, authenticated;
grant execute on function public.lease_jobs(integer, integer) to service_role;
