-- Explicit staging fixture provisioning, never a product migration.
-- Verified against the fresh Supabase PG17 Auth schema. This creates login-capable
-- synthetic fixtures; it does not test signup/email verification or replace Auth.
-- Executor must verify the staging project independently before supplying settings.
begin;
do $fixture$
declare fixture jsonb; uid uuid; email text;
begin
 if current_setting('el8.bootstrap_disposable',true) is distinct from 'yes' then raise exception 'disposable fixture authorization required'; end if;
 for fixture in select value from jsonb_array_elements(current_setting('el8.synthetic_accounts')::jsonb) loop
  uid:=(fixture->>'id')::uuid; email:=fixture->>'email';
  if email not like '%@example.invalid' or length(fixture->>'password')<24 then raise exception 'invalid synthetic fixture'; end if;
  -- No upsert: an existing identity is an unexpected baseline, not permission to reset it.
  insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change_token_new,email_change)
  values('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',email,extensions.crypt(fixture->>'password',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}',jsonb_build_object('fixture','el8-staging-member-state'),now(),now(),'','','','');
  insert into auth.identities(provider_id,user_id,identity_data,provider,created_at,updated_at)
  values(uid::text,uid,jsonb_build_object('sub',uid::text,'email',email,'email_verified',true,'phone_verified',false),'email',now(),now());
 end loop;
end $fixture$;
commit;
