"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSelector } from "./theme-selector";
import { ModeSwitcher } from "./mode-switcher";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/dashboard") return "แดชบอร์ด";
    if (pathname === "/dashboard/equipment") return "จัดการอุปกรณ์";
    if (pathname === "/borrow") return "ระบบยืมคืน";
    if (pathname === "/return") return "ระบบคืนอุปกรณ์";
    if (pathname === "/settings") return "ตั้งค่า";
    return "Documents"; // default
  };

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-xl font-prompt font-semibold text-slate-800 tracking-tight">
          {getTitle()}
        </h1>

        <div className="ml-auto flex items-center gap-2">
          <ThemeSelector />
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}
