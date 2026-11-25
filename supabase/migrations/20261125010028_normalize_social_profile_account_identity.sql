create or replace function private.visiora_account_key(p_platform text, p_url text)
returns text
language plpgsql
immutable
strict
set search_path = ''
as $$
declare
  v text;
  v_host text;
  v_path text;
  v_first text;
  v_second text;
  v_third text;
begin
  v := lower(btrim(p_url));
  v := replace(replace(v, 'https://', ''), 'http://', '');
  if left(v, 4) = 'www.' then v := substr(v, 5); end if;
  if left(v, 2) = 'm.' then v := substr(v, 3); end if;

  v_host := split_part(split_part(v, '/', 1), '?', 1);
  v_path := split_part(v, '?', 1);
  v_first := split_part(v_path, '/', 2);
  v_second := split_part(v_path, '/', 3);
  v_third := split_part(v_path, '/', 4);

  if p_platform = 'tiktok' and v_host = 'tiktok.com' and left(v_first, 1) = '@' and length(v_first) > 1 then
    return 'tiktok:' || v_first;

  elsif p_platform = 'youtube' and v_host = 'youtube.com' then
    if left(v_first, 1) = '@' and length(v_first) > 1 then return 'youtube:' || v_first; end if;
    if v_first in ('channel','c','user') and v_second <> '' then return 'youtube:' || v_first || '/' || v_second; end if;

  elsif p_platform = 'facebook' and v_host = 'facebook.com' then
    if v_first = 'profile.php' then
      v_second := split_part(split_part(v, '?id=', 2), '&', 1);
      if v_second <> '' then return 'facebook:id:' || v_second; end if;
    end if;
    if v_first = 'pages' and v_second <> '' and v_third <> '' then
      return 'facebook:pages/' || v_second || '/' || v_third;
    end if;
    if v_first not in ('','watch','reel','reels','groups','marketplace','events','login','share','profile.php') then
      return 'facebook:' || v_first;
    end if;
  elsif p_platform = 'facebook' and v_host = 'fb.com' and v_first <> '' then
    return 'facebook:' || v_first;
  end if;

  return null;
end;
$$;

reindex index public.campaigns_unique_account_once;
