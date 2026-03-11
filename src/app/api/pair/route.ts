import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { device_id, user_id } = await req.json()

    if (!device_id || !user_id) {
      return NextResponse.json(
        { error: "device_id and user_id required" },
        { status: 400 }
      )
    }

    // check device exists
    const { data: device, error: fetchError } = await supabase
      .from("devices")
      .select("*")
      .eq("device_id", device_id)
      .single()

    if (fetchError || !device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      )
    }

    // update device record
    const { data, error } = await supabase
      .from("devices")
      .update({
        user_id: user_id,
        paired: true
      })
      .eq("device_id", device_id)
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Device paired successfully",
      device: data
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}