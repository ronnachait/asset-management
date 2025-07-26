import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    console.log("Connect Supabase failed!");
    return NextResponse.json(
      { message: "Connect Supabase failed!" },
      { status: 500 }
    );
  }

  try {
    const { id } = await request.json(); // ✅ แกะค่า id จาก body
    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }
    console.log(id);
    // ✅ อัปเดตสถานะเป็น 'destroyed'
    const { error: updateError } = await supabase
      .from("assets")
      .update({ destroyed: true })
      .eq("id", id);

    if (updateError) {
      console.error("Supabase Update Error:", updateError.message);
      return NextResponse.json(
        { message: "อัปเดตไม่สำเร็จ", error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "ทำลายอุปกรณ์เรียบร้อยแล้ว" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in item-destroy PUT API:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด", error: errorMessage },
      { status: 500 }
    );
  }
}
