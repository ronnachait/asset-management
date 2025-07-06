import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { addMonths } from "date-fns";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();

  // ดึง id จาก URL
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  }

  const today = new Date().toISOString();
  const next = addMonths(new Date(), 6).toISOString();

  const { error } = await supabase
    .from("calibrations")
    .update({
      last_calibration_date: today,
      next_calibration_date: next,
      status: "done",
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to confirm calibration:", error);
    return NextResponse.json(
      { message: "Update failed", error },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Calibration updated" });
}
