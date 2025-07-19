import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { groupId, orderId, status, updatedAt } = body;

  const message = {
    to: groupId, // กลุ่มต้องเคย chat กับ Bot แล้ว
    messages: [
      {
        type: "text",
        text: `📦 อัปเดตคำสั่งซื้อ #${orderId}\nสถานะล่าสุด: ${status}\nเวลา: ${updatedAt}`,
      },
    ],
  };

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const result = await res.json();
  return NextResponse.json(result);
}
