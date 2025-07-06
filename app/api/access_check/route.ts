"use server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  if (!supabase) {
    console.log("Connect Supabase failed!");
    return NextResponse.json(
      { message: "Connect Supabase failed!" },
      { status: 500 }
    );
  }

  // ดึง user จาก auth session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("GET Data User Error!", userError);
    return NextResponse.json(
      { message: "GET Data User Error!", error: userError },
      { status: 401 }
    );
  }

  const uuid = user.id;

  // ดึงข้อมูล user จากตาราง accounts ตาม uuid
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", uuid) // สมมติว่า id ใน accounts ตรงกับ user.id
    .single(); // ดึงแค่แถวเดียว

  if (accountError) {
    console.log("Error fetching account:", accountError);
    return NextResponse.json(
      { message: "Error fetching account", error: accountError },
      { status: 500 }
    );
  }

  return NextResponse.json({ user: account });
}
