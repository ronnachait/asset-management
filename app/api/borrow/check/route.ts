"use server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// /api/borrow/check.ts
export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const asset_id =
    url.searchParams.get("asset_number") || url.searchParams.get("asset_id");

  if (!asset_id)
    return NextResponse.json({ message: "Missing asset_id" }, { status: 400 });

  // ดึงข้อมูล item ด้วย
  const { data: item, error: itemError } = await supabase
    .from("assets")
    .select("*")
    .eq("asset_number", asset_id)
    .single();

  if (itemError || !item) {
    return NextResponse.json(
      { message: "ไม่พบอุปกรณ์", status: "not_found" },
      { status: 404 }
    );
  }
  const assetLevelStatus = item.destroyed; // จากตาราง assets
  // เช็คว่ายืมอยู่ไหม
  const { data: borrowItem, error: borrowError } = await supabase
    .from("borrow_items")
    .select("*, orders(borrow_date, return_due_date)")
    .eq("asset_id", item.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle(); // ✅ ปลอดภัยกว่า .single()

  if (borrowError) {
    console.error("BorrowItem Error:", borrowError.message);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลการยืม" },
      { status: 500 }
    );
  }
  const statusMap: Record<string, string> = {
    borrowed: "borrowed",
    pending: "pending",
    repair: "repair",
    return: "available",
  };

  const borrowStatus = borrowItem
    ? statusMap[borrowItem.status] || "available"
    : "available";
  console.log("assetLevelStatus:", assetLevelStatus);
  const currentStatus =
    assetLevelStatus === true ? "destroyed" : borrowStatus;

  return NextResponse.json({
    ...item,
    status: currentStatus, // แสดงเป็น 'destroyed' ถ้าทำลายแล้ว
    borrow_date: borrowItem?.orders?.borrow_date ?? null,
    return_due_date: borrowItem?.orders?.return_due_date ?? null,
  });
}
