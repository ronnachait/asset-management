import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    groupId,
    user_name,
    user_email,
    user_phone,
    user_team,
    borrowDate,
    returnDate,
    asset_quantity,
    status,
    message,
    updatedAt,
  } = await req.json();

  const payload = {
    to: groupId,
    messages: [
      {
        type: "flex",
        altText: `🔔 แจ้งเตือนรายการยืมอุปกรณ์จาก ${user_name}`,
        contents: {
          type: "bubble",
          size: "mega",
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "📦 แจ้งเตือนการยืมอุปกรณ์",
                weight: "bold",
                size: "lg",
                color: "#ffffff",
              },
            ],
            backgroundColor: "#4F46E5", // Indigo-600
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "👤 ผู้ยืม",
                    flex: 2,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: user_name,
                    flex: 4,
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "📧 อีเมล",
                    flex: 2,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: user_email,
                    flex: 4,
                    wrap: true,
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "📞 โทร",
                    flex: 2,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: user_phone,
                    flex: 4,
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "👥 ทีม",
                    flex: 2,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: user_team,
                    flex: 4,
                  },
                ],
              },
              {
                type: "separator",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "📅 ยืมวันที่",
                    flex: 2,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: borrowDate,
                    flex: 4,
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "📆 คืนวันที่",
                    flex: 2,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: returnDate,
                    flex: 4,
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "🔢 จำนวน",
                    flex: 2,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: `${asset_quantity} รายการ`,
                    flex: 4,
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "📌 สถานะ",
                    flex: 2,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: status === "borrow" ? "ยืม" : "คืน",
                    flex: 4,
                    color: status === "borrow" ? "#2563eb" : "#16a34a", // น้ำเงินหรือเขียว
                  },
                ],
              },

              message && {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "📝 หมายเหตุ",
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: message,
                    wrap: true,
                  },
                ],
              },
              {
                type: "separator",
              },
              {
                type: "text",
                text: `🕒 อัปเดตล่าสุด: ${updatedAt}`,
                size: "xs",
                color: "#999999",
                align: "end",
              },
            ].filter(Boolean), // remove nulls
          },
        },
      },
    ],
  };

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return NextResponse.json(result);
}
