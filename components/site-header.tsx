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
  Settings2,
} from "lucide-react";
import EnablePush from "./EnablePush";
import { RefreshButton } from "./refresh";

export function SiteHeader() {
  const pathname = usePathname();

  const getPageInfo = () => {
    if (pathname === "/") {
      return {
        title: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        subtitle: "ภาพรวมของระบบ",
      };
    }
    if (pathname === "/equipment") {
      return {
        title: "จัดการอุปกรณ์",
        icon: <PackageCheck size={20} />,
        subtitle: "เพิ่ม/แก้ไขรายการอุปกรณ์",
      };
    }
    if (pathname === "/asset-list") {
      return {
        title: "รายการอุปกรณ์",
        icon: <PackageCheck size={20} />,
        subtitle: "ดูข้อมูลอุปกรณ์ทั้งหมด",
      };
    }
    if (pathname === "/qrcode") {
      return {
        title: "QR Code Scanner",
        icon: <QrCode size={20} />,
        subtitle: "สแกนเพื่อยืมหรือคืนอุปกรณ์",
      };
    }
    if (pathname === "/borrow-items" || pathname.startsWith("/borrow-items/")) {
      return {
        title: "ใบยืมอุปกรณ์",
        icon: <ClipboardList size={20} />,
        subtitle: "สร้างและจัดการใบยืม",
      };
    }
    if (pathname === "/borrow-orders") {
      return {
        title: "คำขอยืมอุปกรณ์",
        icon: <FileCheck2 size={20} />,
        subtitle: "อนุมัติหรือปฏิเสธคำขอ",
      };
    }
    if (pathname === "/transactions" || pathname.startsWith("/transactions")) {
      return {
        title: "รายการยืมอุปกรณ์",
        icon: <Repeat2 size={20} />,
        subtitle: "ประวัติการยืม-คืนอุปกรณ์",
      };
    }
    if (pathname === "/calibration") {
      return {
        title: "การสอบเทียบอุปกรณ์",
        icon: <ActivitySquare size={20} />,
        subtitle: "บันทึกผลสอบเทียบ",
      };
    }
    if (pathname === "/users") {
      return {
        title: "จัดการผู้ใช้งาน",
        icon: <Users size={20} />,
        subtitle: "เพิ่ม/ลบ/เปลี่ยนสิทธิ์ผู้ใช้",
      };
    }
    if (pathname === "/admin-setting") {
      return {
        title: "การตั้งค่าระบบ",
        icon: <Settings2 size={20} />,
        subtitle: "เปิด/ปิดระบบแจ้งเตือนผ่านไลน์",
      };
    }

    return {
      title: "Documents",
      icon: <FileText size={20} />,
      subtitle: "จัดการเอกสารต่าง ๆ",
    };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 w-full">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 h-4 bg-gray-300 dark:bg-gray-600"
          />
          <div className="flex flex-col">
            <h1 className="flex items-center gap-2 text-sm sm:text-base md:text-xl font-prompt font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
              {pageInfo.icon}
              {pageInfo.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton />
          <EnablePush />
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}
