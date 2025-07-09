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

  // 🔐 ดึงข้อมูล user ที่ login อยู่
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { message: "ไม่พบผู้ใช้งาน หรือยังไม่ได้เข้าสู่ระบบ" },
      { status: 401 }
    );
  }

  // 🔎 ดึงเฉพาะ orders ของ user นี้เท่านั้น

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
    id,
    borrow_date,
    status,
    return_due_date,
    return_completed_at,
    notes,
    borrow_images,
    return_images,
    borrower,
    created_at,
    accounts (
      id,
      name,
      email,
      phone_number,
      team 
    ),
    borrow_items (
      id,
      status,
      asset: assets!fk_borrowitems_assets (
        id,
        asset_number,
        asset_name
      )
    )
  `
    )
    .eq("borrower", user.id) // ✅ เงื่อนไขใหม่
    //.in("status", ["borrowed", "pending" , "partially_returned"]) // ✅ เงื่อนไขใหม่
    //.is("return_completed_at", null) // ✅ เงื่อนไขใหม่
    .order("borrow_date", { ascending: false });
  if (error) {
    console.log("GET Data borrow-orders Error!", error);
    return NextResponse.json(
      { message: "GET Data borrow-orders Error!", error },
      { status: 500 }
    );
  }
  console.log(data);
  return NextResponse.json(
    { message: "GET borrow-orders Success", data },
    { status: 200 }
  );
}
