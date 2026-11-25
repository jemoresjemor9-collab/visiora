create or replace function public.prevent_duplicate_campaign_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
begin
  if tg_op = 'UPDATE' and old.status = 'completed' and new.status <> 'completed' then
    raise exception using
      errcode = 'P0001',
      message = 'Une campagne terminée ne peut pas être réinitialisée : le compte reste bloqué contre une nouvelle campagne.';
  end if;

  if new.status in ('cancelled', 'rejected') then
    return new;
  end if;

  v_key := private.visiora_account_key(new.platform, new.platform_url);
  if v_key is null then
    raise exception using
      errcode = 'P0001',
      message = 'Le lien fourni doit être un lien direct vers le profil du compte TikTok, YouTube ou Facebook.';
  end if;

  if exists (
    select 1
    from public.campaigns c
    where c.id is distinct from new.id
      and c.platform = new.platform
      and private.visiora_account_key(c.platform, c.platform_url) = v_key
      and c.status not in ('cancelled', 'rejected')
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'Ce compte a déjà une campagne Visiora en cours ou terminée. Un même compte ne peut pas être boosté deux fois.';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_duplicate_campaign_account() from public, anon, authenticated;
