"use client";

import * as React from "react";
import {
  Package,
  Users,
  ClipboardList,
  QrCode,
  UserCheck,
  UserCog,
  UserPen,
  BellRing,
  LayoutDashboard,
  FileCheck2,
  Repeat2,
  ActivitySquare,
  PackageCheck,
  Settings2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "หน้าหลัก",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "ใบยืมอุปกรณ์",
    url: "/borrow-items",
    icon: ClipboardList,
  },
  {
    title: "สแกน QR Code",
    url: "/qrcode",
    icon: QrCode,
  },
  {
    title: "รายการอุปกรณ์",
    url: "/asset-list",
    icon: PackageCheck,
  },
];

const staffItems = [
  {
    title: "คำขอยืมอุปกรณ์",
    url: "/borrow-orders",
    icon: FileCheck2,
  },
  {
    title: "รายการยืม-คืน",
    url: "/transactions",
    icon: Repeat2,
  },
  {
    title: "จัดการอุปกรณ์",
    url: "/equipment",
    icon: PackageCheck,
  },
  {
    title: "การสอบเทียบอุปกรณ์",
    url: "/calibration",
    icon: ActivitySquare,
  },
];

const systemItems = [
  {
    title: "จัดการผู้ใช้",
    url: "/users",
    icon: Users,
  },
  {
    title: "การตั้งค่าระบบ",
    url: "/admin-setting",
    icon: Settings2,
  },
];

type Account = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  team: string;
};
type Asset = {
  id: string;
  asset_number: string;
  asset_name: string;
};
type BorrowItem = {
  id: string;
  status: string;
  asset: Asset;
};
type Order = {
  id: string;
  borrow_date: string;
  status: string;
  return_due_date: string;
  return_completed_at: string;
  notes: string | null;
  borrow_images: string | null;
  accounts: Account | null;
  borrow_items: BorrowItem[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [borrowCount, setBorrowCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [role, setRole] = useState<number | null>(null);
  const [loadingRole, setLoadingRole] = useState(false);
  const getUser = async () => {
    setLoadingRole(true);
    const res = await fetch("/api/login", {
      method: "GET",
    });

    const result = await res.json();

    if (!res.ok) {
      console.log(result.message);
      return;
    }

    // สมมติว่ามี `setUser` และ `setAccessLevel` จาก context หรือ state
    setUser({
      name: result?.name || "",
      email: result.user?.email || "",
    });
    setRole(result?.role || 1); // 👈 เพิ่มตรงนี้
    setLoadingRole(false);
  };

  const fetchUserOrders = async () => {
    const res = await fetch("/api/borrow-orders-user");
    const result = await res.json();

    if (res.ok) {
      const orders: Order[] = result.data;
      const filtered = orders.filter(
        (order) => order.status !== "done" && order.status !== "rejected"
      );
      setBorrowCount(filtered.length);
    }
  };

  const fetchPendingOrders = async () => {
    const res = await fetch("/api/borrow/pending-orders");
    const result = await res.json();

    console.log("setRequestCount", result);
    console.log("setRequestCount", result.length);
    if (res.ok) {
      setRequestCount(result.length);
    }
  };

  useEffect(() => {
    getUser();
    fetchUserOrders();
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel("order_updates");

    channel.onmessage = (event) => {
      if (event.data === "update") {
        fetchUserOrders();
        fetchPendingOrders();
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-14 data-[slot=sidebar-menu-button]:!p-3transition rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="rounded-lg flex items-center justify-center shadow-md dark:shadow-none">
                  <Package className="w-6 h-6 dark:text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-slate-800 leading-tight dark:text-white">
                    ระบบยืมคืน (AMIS)
                  </h2>
                  <p className="text-md text-slate-500 leading-none dark:text-slate-400">
                    บริหารสินทรัพย์และสินค้าคงคลัง
                  </p>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 font-prompt text-xs uppercase tracking-wider mb-3 font-semibold flex items-center gap-2 dark:text-slate-400">
            <UserCheck /> user zone
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="flex items-center justify-between group"
                >
                  <SidebarMenuButton
                    asChild
                    className="w-full flex items-center justify-start hover:bg-blue-100 hover:text-blue-800 transition-all duration-150 rounded-lg px-3 py-2 space-x-3"
                  >
                    <a href={item.url}>
                      <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>

                  {item.title === "ใบยืมอุปกรณ์" && borrowCount > 0 && (
                    <SidebarMenuAction className="ml-2">
                      <span
                        className={
                          "text-xs font-bold px-2 py-0.5 rounded-full mr-10 border inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 border-yellow-300 "
                        }
                      >
                        <BellRing className="w-4 h-4" />
                        {borrowCount}
                      </span>
                    </SidebarMenuAction>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {loadingRole ? (
          <div className="animate-pulse text-xs text-gray-400 px-4">
            Loading staff menu...
          </div>
        ) : role !== null && role >= 50 ? (
          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="text-blue-500 font-prompt text-xs uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
              <UserPen /> staff zone
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {staffItems.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="flex items-center justify-between group"
                  >
                    <SidebarMenuButton
                      asChild
                      className="w-full flex items-center justify-start hover:bg-blue-100 hover:text-blue-800 transition-all duration-150 rounded-lg px-3 py-2 space-x-3"
                    >
                      <a
                        href={item.url}
                        className="flex items-center space-x-3 py-3 px-3"
                      >
                        <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-sm">
                          {item.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                    {item.title === "คำขอยืมอุปกรณ์" && requestCount > 0 && (
                      <SidebarMenuAction className="ml-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full mr-10 border inline-flex items-center gap-1 ${
                            role >= 70
                              ? "bg-rose-100 text-rose-700 border-rose-300"
                              : "bg-yellow-100 text-yellow-700 border-yellow-300"
                          }`}
                        >
                          <BellRing className="w-4 h-4" />
                          {requestCount}
                        </span>
                      </SidebarMenuAction>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        {loadingRole ? (
          <div className="animate-pulse text-xs text-gray-400 px-4">
            Loading admin menu...
          </div>
        ) : role !== null && role >= 70 ? (
          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="text-rose-500 font-prompt text-xs uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
              <UserCog /> addmin zone
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemItems.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="flex items-center justify-between group"
                  >
                    <SidebarMenuButton
                      asChild
                      className="w-full flex items-center justify-start hover:bg-blue-100 hover:text-blue-800 transition-all duration-150 rounded-lg px-3 py-2 space-x-3"
                    >
                      <a
                        href={item.url}
                        className="flex items-center space-x-3 py-3 px-3"
                      >
                        <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-sm">
                          {item.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} level={role ?? 1} />
      </SidebarFooter>
    </Sidebar>
  );
}
