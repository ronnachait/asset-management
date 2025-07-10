"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeSwitcher } from "./mode-switcher";
import { usePathname } from "next/navigation";

// นำเข้า icons จาก lucide
import {
  LayoutDashboard,
  PackageCheck,
  QrCode,
  ClipboardList,
  FileCheck2,
  Repeat2,
  ActivitySquare,
  Users,
  FileText,
} from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();

  const getPageInfo = () => {
    if (pathname === "/") {
      return { title: "Dashboard", icon: <LayoutDashboard size={20} /> };
    }
    if (pathname === "/equipment") {
      return { title: "จัดการอุปกรณ์", icon: <PackageCheck size={20} /> };
    }
    if (pathname === "/qrcode") {
      return { title: "QR Code Scanner", icon: <QrCode size={20} /> };
    }
    if (pathname === "/borrow-items") {
      return { title: "ใบยืมอุปกรณ์", icon: <ClipboardList size={20} /> };
    }
    // เช็คว่าขึ้นต้นด้วย /borrow-orders
    if (pathname === "/borrow-items" || pathname.startsWith("/borrow-items/")) {
      return { title: "คำขอยืมอุปกรณ์", icon: <FileCheck2 size={20} /> };
    }
    if (pathname === "/transactions" || pathname.startsWith("/transactions")) {
      return { title: "รายการยืมอุปกรณ์", icon: <Repeat2 size={20} /> };
    }
    if (pathname === "/calibration") {
      return {
        title: "การสอบเทียบอุปกรณ์",
        icon: <ActivitySquare size={20} />,
      };
    }
    if (pathname === "/users") {
      return { title: "จัดการผู้ใช้งาน", icon: <Users size={20} /> };
    }
    return { title: "Documents", icon: <FileText size={20} /> };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 bg-gray-300 dark:bg-gray-600"
        />
        <h1 className="flex items-center gap-2 text-md md:text-xl font-prompt font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          {pageInfo.icon}
          {pageInfo.title}
        </h1>

        <div className="ml-auto flex items-center gap-2">
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}
