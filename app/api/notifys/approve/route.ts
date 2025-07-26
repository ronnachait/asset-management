import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  "mailto:noreply@asset-satt.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

type Status = "approve" | "reject";
export type NotifyPayload = {
  status: "approve" | "reject";
  reason: string;
  borrower: string;
  updated_at: string;
};

function isApprovalStatus(value: unknown): value is Status {
  return value === "approve" || value === "reject";
}

function isApprovalPayload(obj: unknown): obj is NotifyPayload {
  if (typeof obj !== "object" || obj === null) return false;

  const o = obj as Record<string, unknown>;

  return (
    typeof o.status === "string" &&
    isApprovalStatus(o.status) &&
    typeof o.reason === "string" &&
    typeof o.updated_at === "string"
  );
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!isApprovalPayload(payload)) {
      return NextResponse.json(
        { error: "รูปแบบข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    console.log("📥 Payload ที่ได้รับ:", payload);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: UserName, error: UserError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (UserError) {
      console.error("❌ ไม่พบข้อมูลบัญชี:", UserError.message);
      return NextResponse.json({ error: "ไม่พบข้อมูลบัญชี" }, { status: 404 });
    }

    const { status, reason, updated_at, borrower } = payload;

    const statusText =
      status === "approve" ? "✅ อนุมัติแล้ว" : "❌ ปฏิเสธคำขอ";
    const title = "🔔 สถานะการอนุมัติคำขอ";

    const body = `
    🧑‍⚖️ โดย: ${UserName.name}
    📌 สถานะ: ${statusText}
    📝 เหตุผล: ${reason ?? "-"}
    🕒 อัปเดตล่าสุด: ${updated_at ?? "-"}
    `.trim();

    // ดึง subscription ทั้งหมดของ borrower
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", borrower);

    if (error) {
      console.error("❌ ดึงข้อมูล subscription ไม่สำเร็จ:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ส่ง notification และจัดการลบ subscription ที่หมดอายุ (status 410)
    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: sub.keys,
      };

      const notification = {
        title,
        body,
        icon: "/store_1175276.png",
        badge: "/bell.png",
        data: {
          url: "https://asset-management-satt.vercel.app/borrow-items",
        },
      };

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notification)
        );
        console.log(`✅ ส่งแจ้งเตือนสำเร็จถึง endpoint: ${sub.endpoint}`);
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "statusCode" in err &&
          typeof (err as { statusCode: number }).statusCode === "number"
        ) {
          const statusCode = (err as { statusCode: number }).statusCode;

          console.warn(`❌ ส่งแจ้งเตือนไปยัง ${sub.endpoint} ไม่สำเร็จ:`, err);

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
          console.error("❌ Error ไม่รู้จักรูปแบบ:", err);
        }
      }
    });

    await Promise.allSettled(sendPromises);

    return NextResponse.json({ success: true, sentTo: subscriptions.length });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการส่งแจ้งเตือน:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
