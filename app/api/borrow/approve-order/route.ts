import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type CheckStatus = {
  [itemId: string]: {
    status: "good" | "damaged" | string;
    note?: string;
  };
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const order_id: string = body.order_id;
  const action: "approve" | "reject" = body.action;
  const type: "borrowed" | "returned" = body.type;
  const note: string | undefined = body.note;
  const checkStatus: CheckStatus | undefined = body.checkStatus;

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }

  if (!["borrowed", "returned"].includes(type)) {
    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  }

  const newStatus =
    action === "approve"
      ? type === "returned"
        ? "returned"
        : "borrowed"
      : "rejected";

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: newStatus,
      admin_note: note ?? null,
    })
    .eq("id", order_id);

  if (orderError) {
    console.error("❌ update order error:", orderError.message);
    return NextResponse.json(
      { message: "Update order failed", error: orderError.message },
      { status: 500 }
    );
  }

  const damagedItemIds: string[] = [];

  if (action === "approve" && type === "returned" && checkStatus) {
    for (const [itemId, val] of Object.entries(checkStatus)) {
      if (val.status === "damaged") {
        damagedItemIds.push(itemId);

        const { error: updateItemError } = await supabase
          .from("borrow_items")
          .update({ status: "repair" })
          .eq("id", itemId);

        if (updateItemError) {
          console.error(
            `❌ อัปเดต damaged item ${itemId} ล้มเหลว:`,
            updateItemError.message
          );
        }
      }
    }
  }

  if (damagedItemIds.length > 0) {
    // ✅ ใช้ filter แบบ raw SQL string
    const idsList = "(" + damagedItemIds.map((id) => `'${id}'`).join(",") + ")";
    const { error: updateNonDamagedError } = await supabase
      .from("borrow_items")
      .update({ status: newStatus })
      .eq("order_id", order_id)
      .filter("id", "not.in", idsList); // ✅ สำคัญ

    if (updateNonDamagedError) {
      console.error(
        "❌ อัปเดต borrow_items ที่ไม่เสียหายล้มเหลว:",
        updateNonDamagedError.message
      );
    }
  } else {
    const { error: updateAllError } = await supabase
      .from("borrow_items")
      .update({ status: newStatus })
      .eq("order_id", order_id);

    if (updateAllError) {
      console.error(
        "❌ อัปเดต borrow_items ทั้งหมดล้มเหลว:",
        updateAllError.message
      );
    }
  }

  return NextResponse.json({ message: "success" }, { status: 200 });
}
