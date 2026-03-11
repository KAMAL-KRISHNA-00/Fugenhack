-- ============================================================
-- Add foreign key constraint between device_status and devices
-- Run this in your Supabase SQL editor.
-- ============================================================

-- Add foreign key from device_status.device_id to devices.device_id
ALTER TABLE public.device_status
ADD CONSTRAINT fk_device_status_devices
FOREIGN KEY (device_id) REFERENCES public.devices(device_id) ON DELETE CASCADE;

-- Enable RLS on device_status table
ALTER TABLE public.device_status ENABLE ROW LEVEL SECURITY;

-- Create policy: allow reading device_status for devices the user owns
CREATE POLICY "device_status_select_own" ON public.device_status
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE devices.device_id = device_status.device_id
      AND devices.user_id = auth.uid()
    )
  );

-- Policy for inserting/updating device_status (for service role / backend)
CREATE POLICY "device_status_write" ON public.device_status
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "device_status_update" ON public.device_status
  FOR UPDATE
  USING (true);
