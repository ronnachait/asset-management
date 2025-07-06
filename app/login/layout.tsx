import type { Metadata } from "next";
import { Toaster } from "sonner";
export const metadata: Metadata = {
  title: "Asset Management and Inventory System(AMIS)",
  description: "จัดการอุปกรณ์พร้อมระบบ QR Code ใช้งานง่าย สะดวก ครบถ้วน",
  icons: {
    icon: "/qrcode-icon.ico",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <Toaster richColors position="top-right" />
      {children}
    </section>
  );
}
