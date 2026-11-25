alter table public.campaigns
  drop constraint if exists campaigns_target_subscribers_range_check;

alter table public.campaigns
  add constraint campaigns_target_subscribers_range_check
  check (target_subscribers between 10 and 1000);

create or replace function public.set_campaign_follower_price()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.target_subscribers is null or new.target_subscribers < 10 or new.target_subscribers > 1000 then
    raise exception using errcode = '22023', message = 'Le nombre d’abonnés doit être compris entre 10 et 1 000.';
  end if;
  new.budget_amount := ceil((new.target_subscribers::numeric * 2500) / 1000);
  new.currency := 'XOF';
  return new;
end;
$function$;

create or replace function public.create_campaign_order(
  p_platform text,
  p_platform_url text,
  p_target_subscribers integer
)
returns table(campaign_id uuid, amount numeric)
language plpgsql
set search_path to ''
as $function$
declare
  v_user_id uuid;
  v_campaign_id uuid;
  v_amount numeric;
  v_title text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Connectez-vous pour créer une campagne.';
  end if;
  if p_platform not in ('tiktok', 'youtube', 'facebook') then
    raise exception using errcode = '22023', message = 'Plateforme non prise en charge.';
  end if;
  if p_target_subscribers is null or p_target_subscribers < 10 or p_target_subscribers > 1000 then
    raise exception using errcode = '22023', message = 'Le nombre d’abonnés doit être compris entre 10 et 1 000.';
  end if;
  if private.visiora_account_key(p_platform, p_platform_url) is null then
    raise exception using errcode = '22023', message = 'Le lien doit pointer directement vers le profil du compte.';
  end if;
  v_title := 'Campagne abonnés ' ||
    case p_platform when 'tiktok' then 'TikTok' when 'youtube' then 'YouTube' else 'Facebook' end;
  insert into public.campaigns (user_id,platform,platform_url,objective,target_subscribers,title,budget_amount,currency,status)
  values (v_user_id,p_platform,btrim(p_platform_url),'followers',p_target_subscribers,v_title,0,'XOF','pending_payment')
  returning id,budget_amount into v_campaign_id,v_amount;
  insert into public.payments (user_id,campaign_id,amount,currency,status)
  values (v_user_id,v_campaign_id,v_amount,'XOF','pending');
  return query select v_campaign_id,v_amount;
end;
$function$;

revoke all on function public.create_campaign_order(text,text,integer) from public, anon;
grant execute on function public.create_campaign_order(text,text,integer) to authenticated;
