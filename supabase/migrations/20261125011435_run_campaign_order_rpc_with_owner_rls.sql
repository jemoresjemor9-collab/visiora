create or replace function public.create_campaign_order(
  p_platform text,
  p_platform_url text,
  p_target_subscribers integer
)
returns table(campaign_id uuid, amount numeric)
language plpgsql
security invoker
set search_path = ''
as $$
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

  if p_target_subscribers is null or p_target_subscribers < 1 then
    raise exception using errcode = '22023', message = 'Le nombre d’abonnés doit être supérieur à zéro.';
  end if;

  if private.visiora_account_key(p_platform, p_platform_url) is null then
    raise exception using errcode = '22023', message = 'Le lien doit pointer directement vers le profil du compte.';
  end if;

  v_title := 'Campagne abonnés ' ||
    case p_platform
      when 'tiktok' then 'TikTok'
      when 'youtube' then 'YouTube'
      else 'Facebook'
    end;

  insert into public.campaigns (
    user_id, platform, platform_url, objective, target_subscribers,
    title, budget_amount, currency, status
  )
  values (
    v_user_id, p_platform, btrim(p_platform_url), 'followers', p_target_subscribers,
    v_title, 0, 'XOF', 'pending_payment'
  )
  returning id, budget_amount into v_campaign_id, v_amount;

  insert into public.payments (
    user_id, campaign_id, amount, currency, status
  )
  values (
    v_user_id, v_campaign_id, v_amount, 'XOF', 'pending'
  );

  return query select v_campaign_id, v_amount;
end;
$$;

revoke all on function public.create_campaign_order(text, text, integer) from public, anon;
grant execute on function public.create_campaign_order(text, text, integer) to authenticated;
