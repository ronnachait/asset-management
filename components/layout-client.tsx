"use client";

import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "./site-footer";
import BrowserWarning from "./platform";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noLayout = ["/login", "/print"];
  const shouldHideLayout = noLayout.includes(pathname);

  if (shouldHideLayout) return <>{children}</>;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <SiteHeader />
          <BrowserWarning />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
