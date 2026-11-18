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

-- ===== ניהול עובדים מתוך האפליקציה (להרצה פעם אחת ב-SQL Editor) =====
create extension if not exists pgcrypto with schema extensions;
alter table public.members add column if not exists pw text;
create or replace function public.team_list() returns table(user_id uuid,email text,role text,pw text) language plpgsql security definer set search_path=public,auth,extensions as $$
begin
 if not public.is_editor() then raise exception 'not allowed'; end if;
 return query select m.user_id,u.email::text,m.role,m.pw from public.members m join auth.users u on u.id=m.user_id order by u.email;
end $$;
create or replace function public.team_save(p_user uuid,p_email text,p_password text,p_role text) returns void language plpgsql security definer set search_path=public,auth,extensions as $$
declare uid uuid; em text:=lower(trim(p_email));
begin
 if not public.is_editor() then raise exception 'not allowed'; end if;
 if p_role not in ('editor','viewer') then raise exception 'bad role'; end if;
 if p_user is null then select id into uid from auth.users where lower(email)=em; else uid:=p_user; end if;
 if uid=auth.uid() and p_role<>'editor' then raise exception 'cannot demote yourself'; end if;
 if uid is null then
  if coalesce(length(p_password),0)<6 then raise exception 'password too short'; end if;
  uid:=gen_random_uuid();
  insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change,email_change_token_new,email_change_token_current,phone_change,phone_change_token,reauthentication_token)
  values('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',em,crypt(p_password,gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','','','','');
  insert into auth.identities(id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
  values(gen_random_uuid(),uid,uid::text,jsonb_build_object('sub',uid::text,'email',em),'email',now(),now(),now());
 else
  update auth.users set email=em,updated_at=now() where id=uid;
  update auth.identities set identity_data=jsonb_build_object('sub',uid::text,'email',em),updated_at=now() where user_id=uid and provider='email';
  if p_password is not null and p_password<>'' then
   if length(p_password)<6 then raise exception 'password too short'; end if;
   update auth.users set encrypted_password=crypt(p_password,gen_salt('bf')),updated_at=now() where id=uid;
  end if;
 end if;
 insert into public.members(user_id,role,pw) values(uid,p_role,nullif(p_password,'')) on conflict (user_id) do update set role=excluded.role,pw=coalesce(excluded.pw,public.members.pw);
end $$;
create or replace function public.team_remove(p_user uuid) returns void language plpgsql security definer set search_path=public,auth,extensions as $$
begin
 if not public.is_editor() then raise exception 'not allowed'; end if;
 if p_user=auth.uid() then raise exception 'cannot delete yourself'; end if;
 delete from auth.users where id=p_user;
end $$;
revoke all on function public.team_list(),public.team_save(uuid,text,text,text),public.team_remove(uuid) from public,anon;
grant execute on function public.team_list(),public.team_save(uuid,text,text,text),public.team_remove(uuid) to authenticated;
