// app/layout.tsx (server component)
import "./globals.css";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import LayoutClient from "@/components/layout-client"; // 👈 ใหม่
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
export const metadata: Metadata = {
  title: "Asset Management and Inventory System(AMIS)",
  description: "จัดการอุปกรณ์พร้อมระบบ QR Code ใช้งานง่าย สะดวก ครบถ้วน",
  icons: {
    icon: "/store_1175276.png",
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
              <Analytics />
            </LayoutClient>
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
