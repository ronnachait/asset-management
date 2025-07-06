"use server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type AssetInput = {
  id: string;
};

type ResultItem = {
  asset_id: string;
  status: "returned" | "not_found" | "update_failed";
};

function isAssetInputArray(data: unknown): data is AssetInput[] {
  return (
    Array.isArray(data) && data.every((item) => typeof item.id === "string")
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { message: "เชื่อมต่อ Supabase ไม่สำเร็จ" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const rawAssets = formData.get("assets");

    if (typeof rawAssets !== "string") {
      return NextResponse.json(
        { message: "assets ต้องเป็น string" },
        { status: 400 }
      );
    }

    const parsedAssets: unknown = JSON.parse(rawAssets);

    if (!isAssetInputArray(parsedAssets) || parsedAssets.length === 0) {
      return NextResponse.json(
        { message: "assets ไม่ถูกต้องหรือว่างเปล่า" },
        { status: 400 }
      );
    }

    const results: ResultItem[] = await Promise.all(
      parsedAssets.map(async (asset): Promise<ResultItem> => {
        const { id: assetId } = asset;

        const { data: borrowItem, error: itemError } = await supabase
          .from("borrow_items")
          .select("id, order_id")
          .eq("asset_id", assetId)
          .eq("status", "borrowed")
          .limit(1)
          .single();
        console.log("borrowItem", borrowItem, itemError);
        if (!borrowItem || itemError) {
          return { asset_id: assetId, status: "not_found" };
        }

        const { id: borrowItemId, order_id: orderId } = borrowItem;

        const { error: updateError } = await supabase
          .from("borrow_items")
          .update({
            status: "pending",
            return_date: new Date().toISOString(),
          })
          .eq("id", borrowItemId);

        if (updateError) {
          return { asset_id: assetId, status: "update_failed" };
        }

        // เช็คว่าคืนครบหรือยัง
        const { data: remainingItems } = await supabase
          .from("borrow_items")
          .select("id")
          .eq("order_id", orderId)
          .eq("status", "borrowed");

        console.log("👉 UPDATE ORDER ID:", orderId);

        if (!remainingItems || remainingItems.length === 0) {
          console.log("All items returned, updating order status");
          const { data: updated, error: updateOrderError } = await supabase
            .from("orders")
            .update({
              status: "pending",
              type: "returned",
              return_completed_at: new Date().toISOString(),
            })
            .eq("id", orderId)
            .select()
            .single();

          console.log("✅ Updated order:", updated);

          if (updateOrderError) {
            console.error(
              "❌ อัปเดต order ไม่สำเร็จ:",
              updateOrderError.message
            );
          }
        } else {
          await supabase
            .from("orders")
            .update({
              status: "partially_returned",
              type: "returned",
            })
            .eq("id", orderId)
            .select()
            .single();
        }

        return { asset_id: assetId, status: "returned" };
      })
    );

    return NextResponse.json({
      message: "คืนอุปกรณ์เรียบร้อย",
      results,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
