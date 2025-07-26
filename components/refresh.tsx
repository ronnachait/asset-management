"use client";

import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

export function RefreshButton() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);

    // สำหรับกรณีที่อยู่ใน PWA และใช้ service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update(); // อัปเดต service worker
        });
      });
    }

    // โหลดใหม่ทั้งหน้า
    window.location.reload();
  };

  useEffect(() => {
    if (refreshing) {
      const timeout = setTimeout(() => setRefreshing(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [refreshing]);

  return (
    <button
      onClick={handleRefresh}
      title="Refresh"
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    >
      <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
    </button>
  );
}
