"use server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type OrderUpdateData = {
  status: "pending" | "partially_returned";
  type: "returned";
  return_completed_at?: string;
  return_images?: string;
  return_note?: string;
};

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
    const notesRaw = formData.get("notes");
    const notes = typeof notesRaw === "string" ? notesRaw.trim() : "";

    if (typeof rawAssets !== "string") {
      return NextResponse.json(
        { message: "assets ต้องเป็น string" },
        { status: 400 }
      );
    }
    console.log("Raw assets:", rawAssets);

    const parsedAssets: unknown = JSON.parse(rawAssets);

    if (!isAssetInputArray(parsedAssets) || parsedAssets.length === 0) {
      return NextResponse.json(
        { message: "assets ไม่ถูกต้องหรือว่างเปล่า" },
        { status: 400 }
      );
    }
    console.log("Parsed assets:", parsedAssets);

    const file = formData.get("summary_image") as File | null;

    // รออัปโหลดไฟล์และรับ URL
    const uploadedImageUrl = await (async () => {
      if (file && file.size > 0 && file.type.startsWith("image/")) {
        const filePath = `return/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("borrow-images")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("borrow-images")
          .getPublicUrl(filePath);

        return publicUrlData?.publicUrl || null;
      }
      return null;
    })();
    console.log("Uploaded image URL:", uploadedImageUrl);

    const results: ResultItem[] = await Promise.all(
      parsedAssets.map(async (asset): Promise<ResultItem> => {
        try {
          const { id: assetId } = asset;

          const { data: borrowItem, error: itemError } = await supabase
            .from("borrow_items")
            .select("id, order_id")
            .eq("asset_id", assetId)
            .eq("status", "borrowed")
            .limit(1)
            .single();

          if (!borrowItem || itemError) {
            console.error("❌ borrow item not found:", assetId, itemError);
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
            console.error(updateError.message);
            console.error("❌ Failed to update borrow_item:", assetId);
            return { asset_id: assetId, status: "update_failed" };
          }

          console.log("👉 UPDATE BORROW ITEM ID:", borrowItemId);

          // เช็คของคงเหลือ
          const { data: remainingItems } = await supabase
            .from("borrow_items")
            .select("id")
            .eq("order_id", orderId)
            .eq("status", "borrowed");

          console.log("👉 UPDATE ORDER ID:", orderId);

          const isFullyReturned =
            !remainingItems || remainingItems.length === 0;

          const updateData: OrderUpdateData = {
            status: isFullyReturned ? "pending" : "partially_returned",
            type: "returned",
          };

          if (isFullyReturned) {
            updateData.return_completed_at = new Date().toISOString();
            updateData.return_images = uploadedImageUrl ?? undefined;
          }

          if (notes) {
            updateData.return_note = notes;
          }

          const { data: updated, error: updateOrderError } = await supabase
            .from("orders")
            .update(updateData)
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

          return { asset_id: assetId, status: "returned" };
        } catch (err) {
          console.error("❌ Unexpected error in asset loop:", asset.id, err);
          return { asset_id: asset.id, status: "update_failed" };
        }
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
