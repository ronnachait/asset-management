// ✅ ตัวอย่าง route.ts ที่ถูกต้อง
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  if (!supabase) {
    console.log("Connect Supabase field !");
    return NextResponse.json(
      { message: "Connect Supabase field !" },
      { status: 500 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: role, error } = await supabase
    .from("accounts")
    .select("access_level")
    .eq("id", user?.id)
    .single();
  // ถ้าไม่มี user หรือ role ไม่ใช่ admin → redirect ไป /login
  if (error || !user) {
    console.log("User not found or not logged in:", error);
    return;
  }
  console.log("role:", role);

  return NextResponse.json(
    { message: "GET Successfully !", role },
    { status: 200 }
  );
}
