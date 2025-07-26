import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  // 👇 อ่าน body จาก request
  const body = await req.json();

  console.log("Calibration:", body);

  const { error } = await supabase.from("calibrations").insert(body);

  if (error) {
    console.error("Failed to add calibration:", error);
    return NextResponse.json({ message: "Add failed", error }, { status: 500 });
  }

  return NextResponse.json({ message: "Add successfully" }, { status: 200 });
}
