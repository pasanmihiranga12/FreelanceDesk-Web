-- FreelanceDesk website: free-tool limits.
-- Run this ONCE in Supabase → SQL Editor → New query → paste → Run.
--
-- What it does
--  * Counts how many invoices / quotations each VERIFIED account has downloaded.
--  * The count lives in the database and can only change through consume_credit(),
--    so clearing the browser or editing the page cannot reset it.
--  * Lets a signed-in user delete their own account and every row tied to it.
--
-- The free allowance is MONTHLY: it counts documents downloaded since the start of the current
-- calendar month (UTC) and starts again on the 1st.
-- To change the free limit, edit the number 2 in the two functions below and run again.

create table if not exists public.doc_usage (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('invoice', 'quotation')),
  created_at timestamptz not null default now()
);

create index if not exists doc_usage_user_kind_idx on public.doc_usage (user_id, kind);

-- Row level security: users can only READ their own rows. Nobody can insert,
-- update or delete directly; that only happens inside the functions below.
alter table public.doc_usage enable row level security;

drop policy if exists "read own usage" on public.doc_usage;
create policy "read own usage" on public.doc_usage
  for select using (auth.uid() = user_id);

-- How many free documents has this user used?
create or replace function public.get_usage()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'limit', 2,
    'invoice',   (select count(*) from public.doc_usage where user_id = auth.uid() and kind = 'invoice'   and created_at >= date_trunc('month', now())),
    'quotation', (select count(*) from public.doc_usage where user_id = auth.uid() and kind = 'quotation' and created_at >= date_trunc('month', now())),
    'resets_at', date_trunc('month', now()) + interval '1 month',
    'verified',  coalesce((select email_confirmed_at is not null from auth.users where id = auth.uid()), false)
  );
$$;

-- Spend one free document. Returns { allowed, used, limit, reason }.
create or replace function public.consume_credit(p_kind text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid       uuid := auth.uid();
  lim       int  := 2;
  used      int;
  confirmed timestamptz;
begin
  if uid is null then
    return jsonb_build_object('allowed', false, 'reason', 'signed_out');
  end if;

  if p_kind not in ('invoice', 'quotation') then
    return jsonb_build_object('allowed', false, 'reason', 'bad_kind');
  end if;

  -- Only verified emails count, so throwaway sign-ups can't be used.
  select email_confirmed_at into confirmed from auth.users where id = uid;
  if confirmed is null then
    return jsonb_build_object('allowed', false, 'reason', 'unverified');
  end if;

  -- Serialise requests from the same user so two quick clicks can't both pass.
  perform pg_advisory_xact_lock(hashtext(uid::text));

  select count(*) into used from public.doc_usage
    where user_id = uid and kind = p_kind and created_at >= date_trunc('month', now());
  if used >= lim then
    return jsonb_build_object('allowed', false, 'reason', 'limit', 'used', used, 'limit', lim,
                              'resets_at', date_trunc('month', now()) + interval '1 month');
  end if;

  insert into public.doc_usage (user_id, kind) values (uid, p_kind);
  return jsonb_build_object('allowed', true, 'used', used + 1, 'limit', lim);
end;
$$;

-- Let a signed-in user erase their own account (removes their usage rows too).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- Only signed-in users may call these.
revoke all on function public.get_usage()          from public, anon;
revoke all on function public.consume_credit(text) from public, anon;
revoke all on function public.delete_my_account()  from public, anon;
grant execute on function public.get_usage()          to authenticated;
grant execute on function public.consume_credit(text) to authenticated;
grant execute on function public.delete_my_account()  to authenticated;
