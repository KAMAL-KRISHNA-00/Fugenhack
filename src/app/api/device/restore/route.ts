import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { device_ids } = await req.json()

    console.log("[RESTORE] Request received with device_ids:", device_ids)
    console.log("[RESTORE] SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("[RESTORE] Using service role key:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (!device_ids || !Array.isArray(device_ids) || device_ids.length === 0) {
      console.log("[RESTORE] Invalid device_ids")
      return NextResponse.json(
        { error: "device_ids array required" },
        { status: 400 }
      )
    }

    console.log("[RESTORE] Restoring devices:", device_ids)

    // Update all devices to enable both camera and mic
    const updateQuery = supabase
      .from("devices")
      .update({
        camera_enabled: true,
        mic_enabled: true
      })
      .in("device_id", device_ids)

    console.log("[RESTORE] Executing update query...")
    const { data, error } = await updateQuery.select()

    console.log("[RESTORE] Update response - data:", data, "error:", error)

    if (error) {
      console.error("[RESTORE] Update failed with error:", {
        message: error.message,
        details: error,
      })
      return NextResponse.json(
        { error: `Update failed: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      console.warn("[RESTORE] Update returned no rows. Devices might not exist or RLS blocked them.")
    }

    console.log("[RESTORE] Success! Updated rows count:", data?.length, "data:", data)
    return NextResponse.json({
      message: "Devices restored successfully - camera and mic enabled",
      count: data?.length || 0,
      devices: data
    })

  } catch (err: any) {
    console.error("[RESTORE] Exception:", err)
    return NextResponse.json(
      { error: `Exception: ${err.message}` },
      { status: 500 }
    )
  }
}
