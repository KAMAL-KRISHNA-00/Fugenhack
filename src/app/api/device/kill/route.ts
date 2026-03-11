import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { device_ids, action } = await req.json()

    if (!device_ids || !Array.isArray(device_ids) || device_ids.length === 0) {
      return NextResponse.json(
        { error: "device_ids array required" },
        { status: 400 }
      )
    }

    if (!action || !['kill_camera', 'kill_mic', 'kill_both'].includes(action)) {
      return NextResponse.json(
        { error: "action must be kill_camera, kill_mic, or kill_both" },
        { status: 400 }
      )
    }

    console.log("[KILL] Killing devices with action:", action, "devices:", device_ids)

    // Build update object based on action
    const updateData: any = {}
    if (action === 'kill_camera' || action === 'kill_both') {
      updateData.camera_enabled = false
    }
    if (action === 'kill_mic' || action === 'kill_both') {
      updateData.mic_enabled = false
    }

    // Update all devices
    const { data, error } = await supabase
      .from("devices")
      .update(updateData)
      .in("device_id", device_ids)
      .select()

    if (error) {
      console.error("[KILL] Update failed:", error.message)
      return NextResponse.json(
        { error: `Update failed: ${error.message}` },
        { status: 500 }
      )
    }

    console.log("[KILL] Success! Updated devices:", data)
    return NextResponse.json({
      message: `Devices killed successfully (${action})`,
      devices: data
    })

  } catch (err: any) {
    console.error("[KILL] Exception:", err)
    return NextResponse.json(
      { error: `Exception: ${err.message}` },
      { status: 500 }
    )
  }
}
