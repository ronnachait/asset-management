"use server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id)
    return NextResponse.json({ message: "Missing type" }, { status: 400 });

  const supabase = await createClient();

  if (!supabase) {
    console.log("Connect Supabase failed!");
    return NextResponse.json(
      { message: "Connect Supabase failed!" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("borrow_items")
    .select("order_id")
    .eq("asset_id", id);

  if (error) {
    console.log("GET Data Order ID Error!", error);
    return NextResponse.json({ message: "GET Data Order ID Error!", error });
  }
  console.log("Order ID : ", data);
  return NextResponse.json(data[0].order_id);
}
