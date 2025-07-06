import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { order_id, action, type } = await req.json();
  const supabase = await createClient();

  // ตรวจสอบว่า type รองรับ
  const validTypes = ["borrowed", "returned"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  }

  // ตรวจสอบว่า action ถูกต้อง
  const validActions = ["approve", "reject"];
  if (!validActions.includes(action)) {
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }

  // ใช้ const และ ternary แทน let
  const newStatus =
    action === "approve"
      ? type === "returned"
        ? "done"
        : type
      : "rejected";

  // อัปเดต orders
  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", order_id);

  // อัปเดต borrow_items
  const { error: itemError } = await supabase
    .from("borrow_items")
    .update({ status: newStatus })
    .eq("order_id", order_id);

  if (orderError || itemError) {
    return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }

  return NextResponse.json({ message: "success" });
}
