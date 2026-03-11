-- ============================================================
-- Fix RLS policies for device updates
-- Run this in your Supabase SQL editor.
-- ============================================================

-- Drop old restrictive update policy
DROP POLICY IF EXISTS "device_update_rpc" ON public.devices;

-- Allow updates from service role / authenticated requests
CREATE POLICY "device_update_service" ON public.devices
  FOR UPDATE
  USING (true);  -- Service role bypasses this, but needed for anon/auth

-- Allow authenticated users to see their own devices
DROP POLICY IF EXISTS "device_select_own" ON public.devices;

CREATE POLICY "device_select_auth" ON public.devices
  FOR SELECT
  USING (
    auth.uid() IS NULL  -- Allow anon
    OR user_id = auth.uid()  -- Allow seeing own devices
    OR user_id IS NULL  -- Allow seeing unpaired devices
  );

-- Allow inserts from anon (device registration)
DROP POLICY IF EXISTS "device_insert_own" ON public.devices;

CREATE POLICY "device_insert_anon" ON public.devices
  FOR INSERT
  WITH CHECK (true);
