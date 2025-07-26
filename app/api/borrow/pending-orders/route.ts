import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
    id,
    created_at,
    borrow_date,
    return_due_date,
    status,
    type,
    notes,
    borrow_images,
    return_images,
    borrow_items(
      id,
      status,
      asset:assets!borrow_items_asset_id_fkey(asset_number, asset_name)
    ),
    borrower:accounts!orders_borrower_fkey(
      id,
      name,
      email,
      phone_number,
      team
    )
  `
    )
    .in("status", ["pending", "partially_returned"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending orders:", error);
    return NextResponse.json([], { status: 500 });
  }

  console.log("Fetched pending orders:", data);
  return NextResponse.json(data);
}
