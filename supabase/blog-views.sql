-- Blog read counter.
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
-- It stores only a TOTAL per post (no IP address, no user id). The website can read a total and add
-- one read through the two functions below; nobody can read or edit the table directly.

create table if not exists public.post_views (
  slug       text primary key,
  views      bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint post_views_slug check (slug ~ '^[a-z0-9-]{1,120}$')
);

alter table public.post_views enable row level security;   -- no policies: closed to the API

-- Add one read and return the new total. The page calls this once per browser per post.
create or replace function public.record_view(p_slug text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  s text := lower(btrim(coalesce(p_slug, '')));
  n bigint;
begin
  if s !~ '^[a-z0-9-]{1,120}$' then
    return 0;
  end if;
  insert into public.post_views (slug, views) values (s, 1)
  on conflict (slug) do update set views = public.post_views.views + 1, updated_at = now()
  returning views into n;
  return n;
end;
$$;

-- Just read the total (does not add a read).
create or replace function public.get_views(p_slug text)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select views from public.post_views where slug = lower(btrim(coalesce(p_slug, '')))), 0);
$$;

revoke all on function public.record_view(text) from public;
revoke all on function public.get_views(text) from public;
grant execute on function public.record_view(text) to anon, authenticated;
grant execute on function public.get_views(text) to anon, authenticated;
