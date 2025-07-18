import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(req: Request) {
  const supabase = await createClient();
  // 👇 อ่าน body จาก request
  const body = await req.json();

  console.log("Calibration:", body);

  const { error } = await supabase
    .from("calibrations")
    .update({
      next_calibration_date: body.next_calibration_date,
      lead_time: body.lead_time,
      date_update: new Date(),
    })
    .eq("id", body.id);

  if (error) {
    console.error("Failed to Confirm calibration:", error);
    return NextResponse.json({ message: "Add failed", error }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Confirm successfully" },
    { status: 200 }
  );
}
