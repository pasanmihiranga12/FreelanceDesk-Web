-- iPhone / App Store waitlist.
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
-- The website can only ADD an email, through join_waitlist(). Nobody can read the list from the
-- browser. You read it yourself in Table Editor -> waitlist (you can export it as CSV there).

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  platform   text not null default 'ios',
  created_at timestamptz not null default now(),
  constraint waitlist_email_len check (char_length(email) between 5 and 254),
  constraint waitlist_platform check (platform in ('ios'))
);

create unique index if not exists waitlist_email_platform_uq on public.waitlist (lower(email), platform);

-- Row level security on, with no policies: the table can't be read or written through the API.
alter table public.waitlist enable row level security;

create or replace function public.join_waitlist(p_email text, p_platform text default 'ios')
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  e text := lower(btrim(coalesce(p_email, '')));
begin
  if p_platform is distinct from 'ios' then
    return 'invalid';
  end if;
  if char_length(e) < 5 or char_length(e) > 254 or e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return 'invalid';
  end if;
  -- crude flood guard: refuse if the list grew by more than 200 in the last 10 minutes
  if (select count(*) from public.waitlist where created_at > now() - interval '10 minutes') > 200 then
    return 'busy';
  end if;
  insert into public.waitlist (email, platform) values (e, p_platform)
  on conflict (lower(email), platform) do nothing;
  return 'ok';   -- same answer whether or not the address was already on the list
end;
$$;

revoke all on function public.join_waitlist(text, text) from public;
grant execute on function public.join_waitlist(text, text) to anon, authenticated;
