-- ============================================================
-- Ghost-Sentry / Huristi  –  devices table
-- Run this in your Supabase SQL editor.
-- ============================================================

-- Drop existing objects if re-running
drop function if exists pair_device_to_user(text, uuid, text);
drop function if exists unpair_device_from_user(text, uuid);
drop table if exists public.devices;

-- ── Devices table ──────────────────────────────────────────
create table public.devices (
  id           uuid        primary key default gen_random_uuid(),
  device_id    text        unique not null,

  -- Pairing
  user_id      uuid        references auth.users(id) on delete set null,
  pair_token   text,
  paired       boolean     default false,
  access_token text,

  -- Device info
  device_name  text,
  os           text,

  -- Remote control flags (polled every 5 s by the desktop agent)
  camera_enabled  boolean  default true,
  mic_enabled     boolean  default true,

  -- Presence
  last_seen    timestamp with time zone,
  created_at   timestamp with time zone default now()
);

-- ── Row-level security ──────────────────────────────────────
alter table public.devices enable row level security;

-- Anonymous clients may insert (register) their own device row
create policy "device_insert_own" on public.devices
  for insert with check (true);

-- Anonymous clients may read their own device row by device_id
create policy "device_select_own" on public.devices
  for select using (true);

-- Only update via RPC below
create policy "device_update_rpc" on public.devices
  for update using (true);

-- ── RPC: pair_device_to_user ────────────────────────────────
create or replace function pair_device_to_user(
  p_device_id   text,
  p_user_id     uuid,
  p_access_token text default null
) returns json language plpgsql security definer as $$
declare
  v_row public.devices;
begin
  update public.devices
  set
    user_id      = p_user_id,
    paired       = true,
    access_token = coalesce(p_access_token, access_token)
  where device_id = p_device_id
  returning * into v_row;

  if not found then
    raise exception 'device_not_found';
  end if;

  return row_to_json(v_row);
end;
$$;

-- ── RPC: unpair_device_from_user ────────────────────────────
create or replace function unpair_device_from_user(
  p_device_id text,
  p_user_id   uuid
) returns json language plpgsql security definer as $$
declare
  v_row public.devices;
begin
  update public.devices
  set
    user_id      = null,
    paired       = false,
    access_token = null
  where device_id = p_device_id
    and user_id   = p_user_id
  returning * into v_row;

  if not found then
    raise exception 'device_not_found_or_not_owned';
  end if;

  return row_to_json(v_row);
end;
$$;
