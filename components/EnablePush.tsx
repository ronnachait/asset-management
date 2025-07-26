"use client";

import { useEffect, useState } from "react";
import {
  BellIcon,
  BellSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

type StatusKey = "success" | "denied" | "unsupported" | "error" | "loading";

type StatusInfo = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  retryable?: boolean;
};

const statusMap: Record<StatusKey, StatusInfo> = {
  success: { icon: CheckCircleIcon, color: "text-green-600" },
  denied: { icon: BellSlashIcon, color: "text-yellow-600", retryable: true },
  unsupported: { icon: ExclamationCircleIcon, color: "text-gray-500" },
  error: {
    icon: ExclamationCircleIcon,
    color: "text-red-500",
    retryable: true,
  },
  loading: { icon: BellIcon, color: "text-blue-500 animate-pulse" },
};

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64Safe);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function EnablePush() {
  const [status, setStatus] = useState<keyof typeof statusMap>("loading");

  const registerPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return setStatus("unsupported");
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setStatus("denied");

      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // 1. ตรวจสอบว่าเคยสมัครไว้หรือยัง
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const key = urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        );
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
      }

      // 2. ส่งข้อมูล subscription ไป backend เพื่อบันทึกหรือตรวจสอบว่า valid
      const res = await fetch("/api/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      if (!res.ok) throw new Error("Failed to save subscription");

      setStatus("success");
    } catch (err) {
      console.error("❌ Push registration failed:", err);
      setStatus("error");
    }
  };

  useEffect(() => {
    registerPush();
  }, []);

  const { icon: Icon, color, retryable } = statusMap[status];

  return (
    <div className={`flex items-center px-2 py-1 ${color}`}>
      <Icon
        className={`w-6 h-6 ${retryable ? "cursor-pointer hover:opacity-75" : ""}`}
        onClick={retryable ? registerPush : undefined}
      >
        {retryable && <title>ขอสิทธิแจ้งเตือนอีกครั้ง</title>}
      </Icon>
    </div>
  );
}
