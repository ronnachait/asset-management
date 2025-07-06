// app/layout.tsx (server component)
import "./globals.css";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import LayoutClient from "@/components/layout-client"; // 👈 ใหม่
import { Toaster } from "sonner";
export const metadata: Metadata = {
  title: "Asset Management and Inventory System(AMIS)",
  description: "จัดการอุปกรณ์พร้อมระบบ QR Code ใช้งานง่าย สะดวก ครบถ้วน",
  icons: {
    icon: "/qrcode-icon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const activeThemeValue = (await cookieStore).get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : ""
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <ActiveThemeProvider initialTheme={activeThemeValue}>
            <LayoutClient>
              <Toaster richColors position="top-right" />
              {children}
            </LayoutClient>
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
