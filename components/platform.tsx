"use client";

import { useEffect, useState } from "react";
import platform from "platform";

export default function BrowserWarning() {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const name = platform.name || "";
    const version = platform.version || "0";
    const versionNum = parseFloat(version);

    const isChromeOnIOS =
      ua.includes("CriOS") || (ua.includes("Chrome") && ua.includes("Mobile"));

    const isWebView = (() => {
      if (/iPhone|iPod|iPad/.test(ua) && !ua.includes("Safari")) return true;
      if (/Android/.test(ua) && /Version\/\d+\.\d+/.test(ua)) return true;
      return false;
    })();

    const supportedBrowsers = ["Chrome", "Edge", "Firefox", "Safari"];

    const hasCameraSupport = !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    );

    if (!hasCameraSupport) {
      setWarningMessage(
        "เบราว์เซอร์ของคุณไม่รองรับการใช้งานกล้อง กรุณาอัปเดตหรือลองใช้เบราว์เซอร์อื่น เช่น Chrome หรือ Firefox"
      );
      return;
    }

    if (isWebView) {
      setWarningMessage(
        "คุณกำลังใช้แอปหรือเบราว์เซอร์ในโหมด WebView ซึ่งอาจมีข้อจำกัดบางอย่าง กรุณาเปิดผ่านเบราว์เซอร์โดยตรง เช่น Chrome หรือ Safari"
      );
      return;
    }

    if (name === "Safari" && versionNum < 11) {
      setWarningMessage(
        `Safari เวอร์ชัน ${version} เก่าเกินไป ระบบนี้รองรับ Safari 11 ขึ้นไป กรุณาอัปเดตเบราว์เซอร์`
      );
      return;
    }

    if (name === "Safari" && isChromeOnIOS) {
      setWarningMessage(null);
      return;
    }

    if (!supportedBrowsers.includes(name)) {
      setWarningMessage(
        `เบราว์เซอร์ของคุณ (${name}) อาจไม่รองรับระบบนี้ กรุณาใช้ Chrome, Edge, Firefox หรือ Safari`
      );
      return;
    }

    setWarningMessage(null);
  }, []);

  if (!warningMessage || !isVisible) return null;

  return (
    <div className="relative p-4 mb-4 bg-yellow-100 text-yellow-900 rounded-lg border border-yellow-300 shadow">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-xl font-bold text-yellow-900 hover:text-red-600"
        aria-label="ปิดข้อความเตือน"
      >
        ×
      </button>
      ⚠️ {warningMessage}
    </div>
  );
}
