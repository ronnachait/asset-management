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

    const { asset_number, asset_name, asset_location } = data as Record<
      string,
      string
    >;

    const file = formData.get("asset_image") as File | null;

    // 🔍 ตรวจสอบ asset_number ซ้ำหรือไม่
    const { data: existingAsset, error: checkError } = await supabase
      .from("assets")
      .select("id")
      .eq("asset_number", asset_number)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { message: "เกิดข้อผิดพลาดขณะตรวจสอบ asset_number", error: checkError.message },
        { status: 500 }
      );
    }

    if (existingAsset) {
      return NextResponse.json(
        { message: "Asset Number ถูกใช้ไปแล้ว" },
        { status: 400 }
      );
    }

    // 📤 รออัปโหลดไฟล์และรับ URL
    const uploadedImageUrl = await (async () => {
      if (file && file.size > 0 && file.type.startsWith("image/")) {
        const filePath = `asset-item/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("asset-images")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("asset-images")
          .getPublicUrl(filePath);

        return publicUrlData?.publicUrl || null;
      }
      return null;
    })();
    console.log("Uploaded image URL:", uploadedImageUrl);

    // ➕ Insert ข้อมูลใหม่
    const { data: insertAsset, error: assetError } = await supabase
      .from("assets")
      .insert([
        {
          asset_number,
          asset_name,
          asset_location,
          asset_image: uploadedImageUrl,
        },
      ])
      .select()
      .single();

    if (assetError || !insertAsset) {
      console.log("Error : ", assetError);
      return NextResponse.json(
        { message: "Create New Asset failed", error: assetError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "บันทึกสำเร็จ", data: insertAsset },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in New Asset create API:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด", error: errorMessage },
      { status: 500 }
    );
  }
}
