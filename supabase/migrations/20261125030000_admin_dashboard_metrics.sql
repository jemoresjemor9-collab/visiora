create or replace function public.admin_dashboard_metrics()
returns table (
  total_users bigint,
  total_campaigns bigint,
  completed_campaigns bigint,
  in_progress_campaigns bigint,
  new_campaigns bigint,
  total_payments bigint,
  pending_payments bigint,
  paid_amount_xof numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (select count(*) from public.profiles),
    (select count(*) from public.campaigns),
    (select count(*) from public.campaigns where status = 'completed'),
    (select count(*) from public.campaigns where status in ('pending_payment','pending_review','active','paused')),
    (select count(*) from public.campaigns where created_at >= now() - interval '7 days'),
    (select count(*) from public.payments),
    (select count(*) from public.payments where status = 'pending'),
    (select coalesce(sum(amount), 0) from public.payments where status = 'succeeded' and currency = 'XOF');
$$;

revoke all on function public.admin_dashboard_metrics() from public;
grant execute on function public.admin_dashboard_metrics() to authenticated;
