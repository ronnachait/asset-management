import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    console.log("Connect Supabase failed!");
    return NextResponse.json(
      { message: "Connect Supabase failed!" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    const { id, date } = data;

    const { error } = await supabase
      .from("orders")
      .update({ return_due_date: date })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ message: "อัปเดตวันคืนสำเร็จ" });
  } catch (error: unknown) {
    console.error("Error in New Asset create API:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด", error: errorMessage },
      { status: 500 }
    );
  }
}
