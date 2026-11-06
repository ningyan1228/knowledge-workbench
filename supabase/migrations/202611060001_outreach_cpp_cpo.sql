-- Extend the existing ledger without changing rows, access policies or history.
begin;
alter table public.market_intel_outreach_sends
  drop constraint market_intel_outreach_sends_product_id_check;
alter table public.market_intel_outreach_sends
  add constraint market_intel_outreach_sends_product_id_check
  check (product_id in ('fertilizer-coating', 'nl-w1201', 'elo', 'cpp-cpo'));
commit;
