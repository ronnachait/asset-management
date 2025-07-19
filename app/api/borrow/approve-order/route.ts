import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type CheckStatus = {
  [itemId: string]: {
    status: string;
    note?: string;
  };
};

export async function POST(req: Request) {
  const { order_id, action, type, note, checkStatus } = (await req.json()) as {
    order_id: string;
    action: string;
    type: string;
    note?: string;
    checkStatus?: CheckStatus;
  };
  const supabase = await createClient();

  const validTypes = ["borrowed", "returned"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  }

  const validActions = ["approve", "reject"];
  if (!validActions.includes(action)) {
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }

  const newStatus =
    action === "approve"
      ? type === "returned"
        ? "returned"
        : type
      : "rejected";

  // ✅ อัปเดต status และ admin_note ใน orders
  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: newStatus, admin_note: note })
    .eq("id", order_id);

  if (orderError) {
    console.error(orderError.message);
    return NextResponse.json(
      { message: `Error : ${orderError.message}` },
      { status: 400 }
    );
  }

  const damagedItemIds: string[] = [];
  if (action === "approve" && type === "returned" && checkStatus) {
    for (const [itemId, val] of Object.entries(checkStatus)) {
      if (val.status === "damaged") {
        damagedItemIds.push(itemId);
        const { error: updateItemError } = await supabase
          .from("borrow_items")
          .update({
            status: "repair",
          })
          .eq("id", itemId); // ✅ ใช้ id ของ borrow_items

        if (updateItemError) {
          console.error(
            `❌ อัปเดต borrow_items ล้มเหลว (item_id: ${itemId}):`,
            updateItemError.message
          );
        }
      }
    }
  }

  // ✅ อัปเดต borrow_items ที่เหลือ (ไม่รวม damaged) เป็น newStatus
  if (damagedItemIds.length > 0) {
    await supabase
      .from("borrow_items")
      .update({ status: newStatus })
      .eq("order_id", order_id)
      .not("id", "in", damagedItemIds);
  } else {
    await supabase
      .from("borrow_items")
      .update({ status: newStatus })
      .eq("order_id", order_id);
  }

  return NextResponse.json({ message: "success" }, { status: 200 });
}
