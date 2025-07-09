import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  if (!supabase) {
    console.log("Connect Supabase failed!");
    return NextResponse.json(
      { message: "Connect Supabase failed!" },
      { status: 500 }
    );
  }
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
    id,
    borrow_date,
    status,
    return_due_date,
    return_completed_at,
    created_at,
    accounts (
      id,
      name,
      email,
      phone_number,
      team 
    ),
    notes,
    borrow_images,
    return_images,
    borrow_items (
      id,
      status,
      asset: assets!fk_borrowitems_assets (
        id,
        asset_number,
        asset_name
      )
    )
  `
    )
    .order("borrow_date", { ascending: false });

  if (error) {
    console.log("GET Data borrow-orders Error!", error);
    return NextResponse.json(
      { message: "GET Data borrow-orders Error!", error },
      { status: 500 }
    );
  }

  console.log(data);
  return NextResponse.json(
    { message: "GET borrow-orders Success", data },
    { status: 200 }
  );
}
