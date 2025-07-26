"use server";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { name, team, phone, email, password } = body;

  // 🔸 ตรวจสอบฟิลด์ที่จำเป็น
  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
      { status: 400 }
    );
  }

  // ✅ ตรวจสอบว่า email ซ้ำหรือไม่ใน accounts
  const { data: existing, error: checkError } = await supabase
    .from("accounts")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (checkError) {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดขณะตรวจสอบอีเมล" },
      { status: 500 }
    );
  }

  if (existing.length > 0) {
    return NextResponse.json(
      { message: "อีเมลนี้ถูกใช้ไปแล้ว" },
      { status: 409 }
    );
  }

  // ✅ สมัครสมาชิกผ่าน Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError || !signUpData.user) {
    return NextResponse.json(
      { message: signUpError?.message || "สมัครสมาชิกไม่สำเร็จ" },
      { status: 500 }
    );
  }

  // ✅ บันทึกข้อมูลผู้ใช้ในตาราง accounts
  const { error: insertError } = await supabase.from("accounts").insert([
    {
      id: signUpData.user.id,
      name,
      team,
      phone_number: phone,
      email,
      access_level: 1,
    },
  ]);

  if (insertError) {
    return NextResponse.json(
      { message: `บันทึกข้อมูลไม่สำเร็จ : ${insertError.message}` },
      { status: 500 }
    );
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
