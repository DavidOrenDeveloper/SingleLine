-- Run once in Supabase: SQL Editor
create table public.members(user_id uuid primary key references auth.users on delete cascade, role text not null check (role in ('editor','viewer')));
create table public.entities(id text primary key, data jsonb not null default '{}', updated_at bigint not null, deleted boolean not null default false);
create index on public.entities(updated_at);
alter table public.members enable row level security;
alter table public.entities enable row level security;
create or replace function public.is_member() returns boolean language sql security definer set search_path=public as $$ select exists(select 1 from public.members where user_id=auth.uid()) $$;
create or replace function public.is_editor() returns boolean language sql security definer set search_path=public as $$ select exists(select 1 from public.members where user_id=auth.uid() and role='editor') $$;
create policy members_self on public.members for select using (user_id=auth.uid());
create policy ent_read on public.entities for select using (public.is_member());
create policy ent_ins on public.entities for insert with check (public.is_editor());
create policy ent_upd on public.entities for update using (public.is_editor()) with check (public.is_editor());
insert into storage.buckets (id,name,public,file_size_limit) values ('plans','plans',false,52428800) on conflict (id) do nothing;
create policy plans_read on storage.objects for select using (bucket_id='plans' and public.is_member());
create policy plans_ins on storage.objects for insert with check (bucket_id='plans' and public.is_editor());
create policy plans_upd on storage.objects for update using (bucket_id='plans' and public.is_editor());
alter publication supabase_realtime add table public.entities;
-- After creating users in Authentication > Users, add them:
-- insert into public.members(user_id,role) select id,'editor' from auth.users where email='YOUR@EMAIL';
-- insert into public.members(user_id,role) select id,'viewer' from auth.users where email='WORKER@EMAIL';
