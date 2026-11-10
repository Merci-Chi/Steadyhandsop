-- Steady Hands private consultation bookings (project glonbvrcudwuzjundrii)
-- Run only in the intended project's SQL Editor. Not deployed by this GitHub commit.
create extension if not exists pgcrypto;
create table if not exists public.sh_consultation_bookings (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 start_at timestamptz not null,
 end_at timestamptz not null,
 timezone text not null default 'America/Los_Angeles',
 services jsonb not null default '[]'::jsonb,
 business_name text not null,
 customer_name text not null,
 customer_email text not null,
 customer_phone text not null,
 customer_notes text not null default '',
 status text not null default 'submitted',
 confirmation_email_sent_at timestamptz,
 constraint sh_booking_status_check check (status in ('submitted','confirmed','cancelled','declined')),
 constraint sh_booking_duration_check check (end_at = start_at + interval '30 minutes'),
 constraint sh_booking_services_array_check check (jsonb_typeof(services) = 'array'),
 constraint sh_booking_customer_name_check check (char_length(btrim(customer_name)) between 1 and 120),
 constraint sh_booking_email_length_check check (char_length(customer_email) between 3 and 200),
 constraint sh_booking_business_name_check check (char_length(btrim(business_name)) between 1 and 140),
 constraint sh_booking_phone_length_check check (char_length(customer_phone) between 10 and 35),
 constraint sh_booking_timezone_length_check check (char_length(timezone) between 1 and 100),
 constraint sh_booking_notes_length_check check (char_length(customer_notes) <= 1000)
);
create unique index if not exists sh_consultation_active_slot_unique
 on public.sh_consultation_bookings(start_at)
 where status in ('submitted','confirmed');
create index if not exists sh_consultation_created_at_idx
 on public.sh_consultation_bookings(created_at desc);
alter table public.sh_consultation_bookings enable row level security;
revoke all on public.sh_consultation_bookings from anon,authenticated;
grant all on public.sh_consultation_bookings to service_role;
comment on table public.sh_consultation_bookings is
 'Private Steady Hands customer consultation bookings. Access via validated Edge Functions only.';
-- After applying, verify:
-- select to_regclass('public.sh_consultation_bookings');
-- select relrowsecurity from pg_class where oid='public.sh_consultation_bookings'::regclass;
