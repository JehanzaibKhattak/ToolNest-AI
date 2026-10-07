-- AI phone receptionist: receptionists, calls and captured leads.
-- Provider identifiers (Vapi assistant/phone ids) and status are written only by
-- trusted server code using the service role; column grants stop users from
-- setting them directly through the Data API.

create table public.receptionists(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check(char_length(name) between 2 and 40),
  business_name text not null,
  industry text not null,
  greeting text not null,
  services text not null,
  business_hours text not null,
  faqs text not null default '',
  booking_instructions text not null default '',
  transfer_number text not null default '',
  voice_id text not null,
  area_code text not null default '',
  recording_enabled boolean not null default true,
  status text not null default 'provisioning' check(status in('provisioning','active','paused','failed')),
  vapi_assistant_id text unique,
  vapi_phone_number_id text unique,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.receptionist_calls(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  receptionist_id uuid not null references public.receptionists(id) on delete cascade,
  vapi_call_id text not null unique,
  caller_number text,
  status text not null default 'in-progress',
  ended_reason text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer not null default 0 check(duration_seconds>=0),
  summary text,
  transcript text,
  recording_url text,
  credits_used integer not null default 0 check(credits_used>=0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.receptionist_leads(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  receptionist_id uuid not null references public.receptionists(id) on delete cascade,
  vapi_call_id text,
  kind text not null check(kind in('lead','appointment')),
  caller_name text not null,
  callback_number text not null,
  email text not null default '',
  reason text not null default '',
  service text not null default '',
  preferred_time text not null default '',
  urgency text not null default 'normal' check(urgency in('low','normal','high')),
  notes text not null default '',
  status text not null default 'new' check(status in('new','contacted','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index receptionists_user_created_idx on public.receptionists(user_id,created_at desc);
create index receptionist_calls_receptionist_created_idx on public.receptionist_calls(receptionist_id,created_at desc);
create index receptionist_calls_user_idx on public.receptionist_calls(user_id);
create index receptionist_leads_receptionist_created_idx on public.receptionist_leads(receptionist_id,created_at desc);
create index receptionist_leads_user_idx on public.receptionist_leads(user_id);

alter table public.receptionists enable row level security;
alter table public.receptionist_calls enable row level security;
alter table public.receptionist_leads enable row level security;

create policy "own receptionists select" on public.receptionists for select using(auth.uid()=user_id);
create policy "own receptionists insert" on public.receptionists for insert with check(auth.uid()=user_id);
create policy "own receptionists update" on public.receptionists for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own receptionists delete" on public.receptionists for delete using(auth.uid()=user_id);
create policy "own calls select" on public.receptionist_calls for select using(auth.uid()=user_id);
create policy "own calls delete" on public.receptionist_calls for delete using(auth.uid()=user_id);
create policy "own leads select" on public.receptionist_leads for select using(auth.uid()=user_id);
create policy "own leads update" on public.receptionist_leads for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own leads delete" on public.receptionist_leads for delete using(auth.uid()=user_id);

revoke insert, update on public.receptionists from anon, authenticated;
grant insert(user_id,name,business_name,industry,greeting,services,business_hours,faqs,booking_instructions,transfer_number,voice_id,area_code,recording_enabled) on public.receptionists to authenticated;
grant update(name,business_name,industry,greeting,services,business_hours,faqs,booking_instructions,transfer_number,voice_id,recording_enabled,updated_at) on public.receptionists to authenticated;
revoke insert, update on public.receptionist_calls from anon, authenticated;
revoke insert, update on public.receptionist_leads from anon, authenticated;
grant update(status,updated_at) on public.receptionist_leads to authenticated;

-- Charges a finished call exactly once. Calls cannot be stopped mid-way, so the
-- balance is floored at zero; callers pause receptionists when it reaches zero.
create or replace function public.charge_call_credits(p_call_id uuid,p_credits integer) returns integer language plpgsql security definer set search_path=public as $$
declare v_user uuid;v_remaining integer;
begin
  if p_credits<=0 then return null;end if;
  update receptionist_calls set credits_used=p_credits,updated_at=now() where id=p_call_id and credits_used=0 returning user_id into v_user;
  if v_user is null then return null;end if;
  update profiles set credits=greatest(credits-p_credits,0),updated_at=now() where id=v_user returning credits into v_remaining;
  insert into usage_events(user_id,tool_name,credits_used,status) values(v_user,'ai-receptionist-call',p_credits,'success');
  return v_remaining;
end;$$;
revoke all on function public.charge_call_credits(uuid,integer) from public, anon, authenticated;
grant execute on function public.charge_call_credits(uuid,integer) to service_role;
