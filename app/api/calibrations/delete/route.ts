import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  }

  const { error } = await supabase.from("calibrations").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: "Delete failed", error },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Delete successful" });
}
