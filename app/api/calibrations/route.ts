import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("calibrations")
    .select(`
      id,
      asset_id,
      next_calibration_date,
      last_calibration_date,
      status,
      assets ( asset_name , asset_number )
    `)
    .order("next_calibration_date", { ascending: true });

  if (error) {
    console.error("Error fetching calibrations:", error);
    return NextResponse.json(
      { message: "Failed to fetch calibrations", error },
      { status: 500 }
    );
  }

  // รวมชื่ออุปกรณ์เข้าไปให้ง่ายต่อการใช้ใน frontend
  type Calibration = {
    id: number;
    asset_id: number;
    next_calibration_date: string | null;
    last_calibration_date: string | null;
    status: string;
    assets?: {
      asset_name?: string | null;
      asset_number?: string | null;
    } | null;
  };

  const formatted = (data as Calibration[]).map((item) => ({
    ...item,
    asset_name: item.assets?.asset_name || "-",
    asset_number: item.assets?.asset_number || "-",
  }));

  return NextResponse.json({ data: formatted });
}
