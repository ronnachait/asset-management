import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(request: Request) {
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
    console.log(data);
    const { asset_number, asset_name, asset_location, id } = data as Record<
      string,
      string
    >;

    const file = formData.get("asset_image") as File | null;

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

    const updateData: Record<string, string> = {
      asset_number,
      asset_name,
      asset_location,
    };

    if (uploadedImageUrl !== null) {
      updateData.asset_image = uploadedImageUrl;
    }

    // ➕ Insert ข้อมูลใหม่
    const { error: assetError } = await supabase
      .from("assets")
      .update(updateData)
      .eq("id", id);

    if (assetError) {
      console.log("Error : ", assetError);
      return NextResponse.json(
        { message: "Create New Asset failed", error: assetError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "แก้ไขสำเร็จ" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in New Asset create API:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด", error: errorMessage },
      { status: 500 }
    );
  }
}
