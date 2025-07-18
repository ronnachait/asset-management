// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Asset Notify <notify@satt-krda.online>",
      to: ["ronnachai.t@kubota.com"],
      subject: "แจ้งเตือนการยืมอุปกรณ์",
      react: EmailTemplate({
        firstName: "Ronnachai",
        borrowerName: "สมชาย ใจดี",
        borrowDate: "2025-07-18",
        dueDate: "2025-07-25",
        items: [
          { assetName: "Notebook Lenovo ThinkPad", assetCode: "AST-00123" },
          { assetName: "Projector Epson XGA", assetCode: "AST-00456" },
          { assetName: "Mouse Logitech", assetCode: "AST-00789" },
        ],
      }),
    });
    if (error) {
      console.log(error);
      return NextResponse.json(error, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { message: "Internal Server Error", e },
      { status: 500 }
    );
  }
}
