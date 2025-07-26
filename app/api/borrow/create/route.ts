"use server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    console.log("Connect Supabase failed!");
    return NextResponse.json(
      { message: "Connect Supabase failed!" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    const { borrow_date, return_date, notes, assets } = data as Record<
      string,
      string
    >;

    const file = formData.get("summary_image") as File | null;

    // แปลง assets จาก string → array
    const assetList = (() => {
      try {
        const parsed = JSON.parse(assets || "[]");
        if (!Array.isArray(parsed)) throw new Error();
        return parsed;
      } catch (err) {
        console.error("Invalid assets format:", err);
        throw new Error("Invalid assets format");
      }
    })();

    // รออัปโหลดไฟล์และรับ URL
    const uploadedImageUrl = await (async () => {
      if (file && file.size > 0 && file.type.startsWith("image/")) {
        const filePath = `borrow/${Date.now()}_${file.name}`;
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
    // บันทึกคำสั่งยืม
    const { data: insertOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          borrow_date,
          return_due_date: return_date,
          notes: notes || "",
          status: "pending",
          type: "borrowed",
          borrow_images: uploadedImageUrl,
        },
      ])
      .select()
      .single();

    if (orderError || !insertOrder) {
      return NextResponse.json(
        { message: "Create order failed", error: orderError?.message },
        { status: 500 }
      );
    }

    const orderId = insertOrder.id;
    const nowISO = new Date().toISOString();

    type AssetItem = {
      id: string;
      asset_number: string;
      asset_name: string;
      asset_location: string | null;
      scannedId?: string;
      status: "available" | "borrowed" | "repair";
      image?: string;
    };

    // บันทึกรายการยืม
    const assetInsertData = assetList.map((item: AssetItem) => ({
      order_id: orderId,
      asset_id: item.id,
      status: "pending",
      borrow_date: borrow_date || nowISO,
      location_at_borrow: item.asset_location,
    }));

    const { error: assetError } = await supabase
      .from("borrow_items")
      .insert(assetInsertData);
    if (assetError) {
      return NextResponse.json(
        { message: "Insert borrow items failed", error: assetError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "บันทึกสำเร็จ", order_id: orderId },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in borrow create API:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด", error: errorMessage },
      { status: 500 }
    );
  }
}
