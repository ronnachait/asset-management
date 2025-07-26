import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

// ตั้งค่า VAPID
webpush.setVapidDetails(
  "mailto:noreply@asset-satt.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

type Status = "borrow" | "return";

interface Order {
  status: Status;
  borrowed_at?: string;
  returned_at?: string;
  borrower?: string;
  email?: string;
  phone?: string;
  team?: string;
  items_count?: number;
  note?: string;
  updated_at?: string;
}

function isStatus(value: unknown): value is Status {
  return value === "borrow" || value === "return";
}

function isOrder(obj: unknown): obj is Order {
  if (typeof obj !== "object" || obj === null) return false;

  const o = obj as Record<string, unknown>;

  return typeof o.status === "string" && isStatus(o.status);
}

async function processOrder(data: unknown) {
  if (!isOrder(data)) {
    throw new Error("Invalid order data");
  }

  const order = data;

  const statusTextMap: Record<Status, string> = {
    borrow: "กำลังยืม",
    return: "คืนแล้ว",
  };

  const statusText = statusTextMap[order.status];

  const statusDetails =
    order.status === "borrow"
      ? `📅 ยืมวันที่: ${order.borrowed_at ?? "ไม่ระบุ"}`
      : `📅 คืนวันที่: ${order.returned_at ?? "ไม่ระบุ"}`;

  const body = [
    "📦 รายละเอียดรายการยืม:",
    `👤 ผู้ยืม: ${order.borrower ?? "ไม่ระบุ"}`,
    `📧 อีเมล: ${order.email ?? "ไม่ระบุ"}`,
    `📱 โทร: ${order.phone ?? "ไม่ระบุ"}`,
    `👥 ทีม: ${order.team ?? "ไม่ระบุ"}`,
    statusDetails,
    `📦 จำนวนที่ยืม: ${order.items_count ?? 1} รายการ`,
    `📌 สถานะ: ${statusText}`,
    `📝 หมายเหตุ: ${order.note ?? "-"}`,
    `🕒 อัปเดตล่าสุด: ${order.updated_at ?? "-"}`,
  ].join("\n");

  return body;
}

export async function POST(req: NextRequest) {
  try {
    const { order } = await req.json();

    if (!order) {
      return NextResponse.json(
        { error: "ข้อมูล order หายไป" },
        { status: 400 }
      );
    }

    if (!isOrder(order)) {
      return NextResponse.json(
        { error: "รูปแบบข้อมูล order ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const title = "🔔 แจ้งเตือนการยืมอุปกรณ์";
    const body = await processOrder(order);

    const supabase = await createClient();

    // ดึง subscription ทั้งหมดที่ accessLevel >= 70
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .gte("accessLevel", 70);

    console.log(subscriptions);
    if (error) {
      console.error("❌ ดึงข้อมูล subscription ไม่สำเร็จ:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ส่ง push notification และลบ subscription ที่หมดอายุ (status 410)
    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: sub.keys,
      };

      const payload = JSON.stringify({
        title,
        body,
        icon: "/store_1175276.png",
        badge: "/bell.png",
        data: {
          url: "https://asset-management-satt.vercel.app/borrow-orders",
        },
      });

      try {
        await webpush.sendNotification(pushSubscription, payload);
      } catch (err: unknown) {
        console.warn(`❌ ส่งแจ้งเตือนไปยัง ${sub.endpoint} ไม่สำเร็จ:`, err);

        // เช็คว่ามี statusCode และเป็น number
        if (
          typeof err === "object" &&
          err !== null &&
          "statusCode" in err &&
          typeof (err as { statusCode: number }).statusCode === "number"
        ) {
          const statusCode = (err as { statusCode: number }).statusCode;

          if (statusCode === 410) {
            console.log(`🔄 Subscription หมดอายุ ลบ endpoint: ${sub.endpoint}`);
            const { error: delError } = await supabase
              .from("subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);

            if (delError) {
              console.error(
                "❌ ลบ subscription หมดอายุไม่สำเร็จ:",
                delError.message
              );
            }
          }
        } else {
          console.error("❌ Error ไม่สามารถแยกวิเคราะห์ได้:", err);
        }
      }
    });

    await Promise.allSettled(sendPromises).then((results) => {
      results.forEach((res, index) => {
        const sub = subscriptions[index];
        if (res.status === "fulfilled") {
          console.log("✅ ส่งสำเร็จถึง:", sub.endpoint);
        } else {
          console.warn("❌ ส่งไม่สำเร็จถึง:", sub.endpoint, res.reason);
        }
      });
    });

    return NextResponse.json({ success: true, sentTo: subscriptions.length });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการส่งแจ้งเตือน:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
