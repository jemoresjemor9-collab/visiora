create schema if not exists private;

create or replace function private.visiora_account_key(p_platform text, p_url text)
returns text
language plpgsql
immutable
strict
set search_path = ''
as $$
declare
  v text;
  m text[];
begin
  v := lower(btrim(p_url));
  v := regexp_replace(v, '^https?://', '');
  v := regexp_replace(v, '^www\\.', '');

  if p_platform = 'tiktok' then
    m := regexp_match(v, '^(m\\.)?tiktok\\.com/@([^/?#]+)');
    if m is not null then return 'tiktok:@' || m[2]; end if;

  elsif p_platform = 'youtube' then
    m := regexp_match(v, '^(m\\.)?youtube\\.com/(@[^/?#]+|channel/[^/?#]+|c/[^/?#]+|user/[^/?#]+)');
    if m is not null then return 'youtube:' || m[2]; end if;

  elsif p_platform = 'facebook' then
    if v ~ '^(m\\.)?facebook\\.com/profile\\.php\\?id=[^&#]+' then
      return 'facebook:id:' || substring(v from 'profile\\.php\\?id=([^&#]+)');
    end if;
    m := regexp_match(v, '^(m\\.)?facebook\\.com/(pages/[^/?#]+/[^/?#]+|[^/?#]+)');
    if m is not null and m[2] not in ('watch','reel','reels','groups','marketplace','events','login','share') then
      return 'facebook:' || m[2];
    end if;
    m := regexp_match(v, '^fb\\.com/([^/?#]+)');
    if m is not null then return 'facebook:' || m[1]; end if;
  end if;

  return null;
end;
$$;

revoke all on schema private from public, anon, authenticated;
revoke all on function private.visiora_account_key(text, text) from public, anon, authenticated;

create or replace function public.prevent_duplicate_campaign_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
begin
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

drop trigger if exists campaigns_prevent_duplicate_account on public.campaigns;
create trigger campaigns_prevent_duplicate_account
before insert or update of platform, platform_url, status
on public.campaigns
for each row
execute function public.prevent_duplicate_campaign_account();

create unique index if not exists campaigns_unique_account_once
on public.campaigns (platform, private.visiora_account_key(platform, platform_url))
where status not in ('cancelled', 'rejected');
