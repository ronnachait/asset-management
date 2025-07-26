"use server";

import { NextResponse } from "next/server";
import { checkAndNotifyOverdueOrders } from "@/lib/checkOverdueOrders";

export async function GET() {
  await checkAndNotifyOverdueOrders();
  return NextResponse.json({ status: "ok" });
}
