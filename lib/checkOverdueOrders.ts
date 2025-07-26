"use server";
import { createClient } from "@/utils/supabase/server";
import { sendGmail } from "@/lib/gmail";
import { format, differenceInCalendarDays } from "date-fns";
import { th } from "date-fns/locale";

export async function checkAndNotifyOverdueOrders() {
  const supabase = await createClient();

  // ดึง orders ที่สถานะยังเป็น borrowed
  const { data: allBorrowedOrders, error } = await supabase
    .from("orders")
    .select("*, accounts (email, name, team, phone_number)")
    .eq("status", "borrowed");

  if (error) {
    console.error("Fetch Error:", error);
    return;
  }

  if (!allBorrowedOrders || allBorrowedOrders.length === 0) {
    console.log("✅ No borrowed orders found.");
    return;
  }

  const today = new Date();

  // เลือกเฉพาะ order ที่เกินกำหนดมากกว่า 1 วัน
  const overdueOrders = allBorrowedOrders.filter((order) => {
    const returnDate = new Date(order.return_due_date);
    const daysOverdue = differenceInCalendarDays(today, returnDate);
    return daysOverdue > 0;
  });

  if (overdueOrders.length === 0) {
    console.log("✅ ไม่มีรายการที่เกินกำหนดมากกว่า 1 วัน");
    return;
  }

  for (const order of overdueOrders) {
    const { data: borrowItems, error: errorBorrow } = await supabase
      .from("borrow_items")
      .select(
        "* , assets!borrow_items_asset_id_fkey (asset_number , asset_name)"
      )
      .eq("order_id", order.id);

    if (errorBorrow) {
      console.error("Fetch errorBorrow:", errorBorrow);
      continue;
    }

    const itemList = borrowItems
      ?.map(
        (item) =>
          `<li>${item.assets?.asset_number || "-"} - ${item.assets?.asset_name || "-"}</li>`
      )
      .join("");

    const returnDateFormatted = format(
      new Date(order.return_due_date),
      "dd MMMM yyyy",
      { locale: th }
    );

    const subject = `แจ้งเตือน: กรุณาคืนอุปกรณ์ที่เลยกำหนด`;

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; padding: 30px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <h2 style="color: #d32f2f; text-align: center; margin-bottom: 20px;">⚠️ แจ้งเตือนการคืนอุปกรณ์ล่าช้า</h2>
        
        <p style="font-size: 16px;">เรียนคุณ <strong>${order.accounts.name}</strong>,</p>

        <p style="font-size: 16px; margin-bottom: 15px;">
          ระบบตรวจพบว่าคุณมียอดการยืมอุปกรณ์ที่เลยกำหนดคืนมาแล้ว <strong style="color: #c62828;">${differenceInCalendarDays(today, new Date(order.return_due_date))}</strong> วัน
        </p>

        <table style="width: 100%; font-size: 15px; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">ทีม:</td>
            <td style="padding: 8px 0;">${order.accounts.team || "-"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">วันที่ครบกำหนดคืน:</td>
            <td style="padding: 8px 0;">${returnDateFormatted}</td>
          </tr>
        </table>

        <p style="font-size: 16px;"><strong>รายการอุปกรณ์ที่ยืม:</strong></p>
        <ul style="padding-left: 20px; font-size: 15px; margin-bottom: 20px;">
          ${itemList || "<li>-</li>"}
        </ul>

        <div style="background-color: #fff3e0; border-left: 4px solid #ffa726; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 0; font-size: 15px;">
            กรุณาดำเนินการคืนอุปกรณ์โดยเร็วที่สุด หรือแจ้งเจ้าหน้าที่หากมีเหตุขัดข้อง
          </p>
        </div>

        <p style="font-size: 14px; color: #d32f2f; margin-top: 30px;"><em>** หมายเหตุ: อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับ **</em></p>

        <p style="font-size: 15px; margin-top: 30px;">ขอบคุณครับ/ค่ะ,<br><strong style="color: #1976d2;">@SATT TEAM</strong></p>
      </div>
    </div>
    `;

    await sendGmail(order.accounts.email, subject, html);
    console.log(`📧 ส่งเมลถึง ${order.accounts.email}`);

    // ✅ เก็บ Log การส่งเมล
    await supabase.from("email_logs").insert({
      email: order.accounts.email,
      subject,
      body: html,
      sent_at: new Date().toISOString(),
      order_id: order.id,
    });
  }

  console.log("✅ แจ้งเตือนครบแล้ว");
}
