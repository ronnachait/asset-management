// ✅ ตัวอย่าง route.ts ที่ถูกต้อง
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

  return NextResponse.json({ message: "Login success" }, { status: 200 });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ message: "unauthenticated" }, { status: 401 });

  const { data: role } = await supabase
    .from("accounts")
    .select("access_level , name , action")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    name: role?.name ?? "",
    role: role?.access_level ?? 1,
    action: role?.action,
  });
}
