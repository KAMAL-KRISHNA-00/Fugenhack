import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { device_id, user_id } = await req.json()

    console.log("[PAIR] Request received:", { device_id, user_id })

    if (!device_id || !user_id) {
      console.log("[PAIR] Missing device_id or user_id")
      return NextResponse.json(
        { error: "device_id and user_id required" },
        { status: 400 }
      )
    }

    // check device exists
    console.log("[PAIR] Fetching device from Supabase...")
    const { data: device, error: fetchError } = await supabase
      .from("devices")
      .select("*")
      .eq("device_id", device_id)
      .single()

    console.log("[PAIR] Fetch result:", { device, fetchError })

    if (fetchError || !device) {
      console.log("[PAIR] Device not found:", fetchError?.message)
      return NextResponse.json(
        { error: `Device not found: ${fetchError?.message || "unknown"}` },
        { status: 404 }
      )
    }

    // update device record
    console.log("[PAIR] Updating device record...")
    const { data, error } = await supabase
      .from("devices")
      .update({
        user_id: user_id,
        paired: true
      })
      .eq("device_id", device_id)
      .select()

    console.log("[PAIR] Update result:", { data, error })

    if (error) {
      console.log("[PAIR] Update failed:", error.message)
      return NextResponse.json(
        { error: `Update failed: ${error.message}` },
        { status: 500 }
      )
    }

    console.log("[PAIR] Success!")
    return NextResponse.json({
      message: "Device paired successfully",
      device: data
    })

  } catch (err: any) {
    console.error("[PAIR] Exception:", err)
    return NextResponse.json(
      { error: `Exception: ${err.message}` },
      { status: 500 }
    )
  }
}
