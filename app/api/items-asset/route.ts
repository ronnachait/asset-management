import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type BorrowItem = {
  id: string;
  status: string;
  order_id: string;
  return_date?: string | null;
};

type Item = {
  id: string;
  asset_number: string;
  asset_name: string;
  borrow_items?: BorrowItem[];
  current_status?: string;
};

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
    .from("assets")
    .select(
      `
      id,
      asset_number,
      asset_name,
      asset_nickname,
      asset_location,
      asset_image,
      destroyed,
      borrow_items!fk_borrowitems_assets (
        id,
        status,
        order_id,
        return_date
      )
    `
    )
    .order("asset_number", { ascending: true });

  if (error) {
    console.log("GET Data items-Asset Error!", error);
    return NextResponse.json(
      { message: "GET Data items-Asset Error!", error },
      { status: 500 }
    );
  }

  const processedData: Item[] = (data ?? []).map((item): Item => {
    const borrow_items: BorrowItem[] = item.borrow_items ?? [];

    const statuses = borrow_items.map((bi) => bi.status);

    const current_status = statuses.includes("borrowed")
      ? "borrowed"
      : statuses.includes("repair")
        ? "repair"
        : statuses.includes("waiting_calibase")
          ? "waiting_calibase"
          : "available";

    return {
      ...item,
      borrow_items,
      current_status,
    };
  });

  return NextResponse.json(
    { message: "GET items-asset Success", data: processedData },
    { status: 200 }
  );
}
