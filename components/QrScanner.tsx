"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Image from "next/image";
import ModalFormOrder from "./ModalFormOrder";
import { List, X } from "lucide-react";

type items = {
  id: string;
  asset_number: string;
  asset_name: string;
  asset_location: string;
  scannedId: string;
  status: "available" | "borrowed" | "repair";
  image?: string;
};

type QrScannerProps = {
  data: "borrow" | "return" | null;
  onCancel: () => void;
};

type UserData = {
  id: string;
  email: string;
  name: string;
  team: string;
  phone_number: string;
  access_level: string;
  // เพิ่มฟิลด์อื่นๆ ตามที่ต้องการ
};

export default function QrScanner({ data, onCancel }: QrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("กด 'เริ่มสแกน' เพื่อเปิดกล้อง");
  const [success, setSuccess] = useState(false);

  // แก้จาก string[] เป็น items[] เพื่อเก็บข้อมูล asset แบบเต็ม
  const [scannedAssets, setScannedAssets] = useState<items[]>([]);

  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isScannerReady, setIsScannerReady] = useState(false);

  const scannedIdsRef = useRef<Set<string>>(new Set());
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const lastWarningRef = useRef(0);

  const requestCameraPermission = async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMessage("เบราว์เซอร์ของคุณไม่รองรับการเข้าถึงกล้อง");
      setScanning(false);
      return false;
    }
    console.log("Requesting camera permission...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err: unknown) {
      if (err instanceof DOMException) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setMessage(
            "⚠️ คุณได้ปฏิเสธการเข้าถึงกล้อง กรุณาอนุญาตในตั้งค่าเบราว์เซอร์"
          );
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          setMessage("ไม่พบกล้องในอุปกรณ์นี้");
        } else {
          setMessage("เกิดข้อผิดพลาดในการขออนุญาตใช้กล้อง");
          console.error("getUserMedia error:", err);
        }
      } else {
        setMessage("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
        console.error("Unknown error:", err);
      }

      setScanning(false);
      return false;
    }
  };

  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode("reader");

    return () => {
      const scanner = html5QrCodeRef.current;
      if (scanner && scanner.isScanning) {
        scanner
          .stop()
          .then(() => {
            scanner.clear();
          })
          .catch((err) => {
            console.error("Failed to stop the scanner on cleanup.", err);
          });
      }
    };
  }, []);

  const handleScanError = (errorMessage: string) => {
    const now = Date.now();

    if (
      !errorMessage.includes("No QR code found") &&
      now - lastWarningRef.current > 3000
    ) {
      console.warn("🚨 QR Scan Error:", errorMessage);
      lastWarningRef.current = now;
    }
  };

  const handleStartScan = async () => {
    if (isStarting || isScannerReady) return;

    setIsStarting(true);
    setMessage("กำลังขออนุญาตใช้กล้อง...");

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      setIsStarting(false);
      setMessage("❌ ไม่มีสิทธิ์เข้าถึงกล้อง");
      return;
    }

    if (!html5QrCodeRef.current) {
      setMessage("QR Scanner ยังไม่พร้อม");
      setIsStarting(false);
      return;
    }

    const devices = await Html5Qrcode.getCameras();
    const cameraId = devices[0]?.id;
    if (!cameraId) {
      setMessage("❌ ไม่พบกล้อง");
      setIsStarting(false);
      return;
    }

    try {
      await html5QrCodeRef.current.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          try {
            await html5QrCodeRef.current?.stop();
          } catch (e) {
            console.warn("❌ ไม่สามารถหยุดกล้องได้", e);
          }

          setIsScannerReady(false);
          setScanning(false);

          const match = decodedText.match(/\/borrow\/item\/(.+)/);
          const id = match?.[1];

          if (!id) {
            setMessage("QR Code ไม่ถูกต้อง กรุณาลองใหม่");
            setSuccess(false);
            return;
          }

          if (scannedIdsRef.current.has(id)) {
            setMessage(`⚠️ อุปกรณ์ '${id}' ถูกเพิ่มไปแล้ว`);
            setSuccess(false);
            return;
          }

          const res = await fetch(`/api/borrow/check?asset_number=${id}`);
          const result = await res.json();
          console.log("Asset Check Result:", result);
          if (res.status === 404 || result.status === "not_found") {
            setMessage("❌ ไม่พบอุปกรณ์ในระบบ");
            setSuccess(false);
            return;
          }

          // ตรวจสอบสถานะ
          if (data === "borrow") {
            if (result.status === "borrowed") {
              setMessage(`⚠️ อุปกรณ์นี้ถูกยืมอยู่แล้ว`);
              setSuccess(false);
              return;
            }

            if (result.status === "pending") {
              setMessage(`⚠️ อุปกรณ์นี้กำลังรออนุมัติการยืม`);
              setSuccess(false);
              return;
            }

            if (result.status === "repair") {
              setMessage(`⚠️ อุปกรณ์นี้อยู่ระหว่างซ่อมแซม`);
              setSuccess(false);
              return;
            }
          }

          if (data === "return") {
            if (result.status === "available") {
              setMessage(`⚠️ อุปกรณ์นี้ยังไม่ได้ถูกยืม`);
              setSuccess(false);
              return;
            }

            if (result.status === "pending") {
              setMessage(`⚠️ อุปกรณ์นี้ยังไม่ได้รับอนุมัติให้ยืม`);
              setSuccess(false);
              return;
            }

            if (result.status === "repair") {
              setMessage(`⚠️ อุปกรณ์นี้อยู่ระหว่างซ่อมแซม ไม่สามารถคืนได้`);
              setSuccess(false);
              return;
            }
          }

          // เพิ่มรายการ
          scannedIdsRef.current.add(id);
          setScannedAssets((prev) => [
            ...prev,
            {
              id: result.id,
              asset_number: result.asset_number,
              asset_name: result.asset_name,
              asset_location: result.asset_location,
              status: data === "borrow" ? "borrowed" : "available",
              scannedId: id,
              image: result.image ?? undefined,
            },
          ]);

          setMessage(
            `✅ ${data === "borrow" ? "ยืม" : "คืน"}: ${result.asset_name}`
          );
          setSuccess(true);
        },
        handleScanError
      );

      setScanning(true);
      setIsScannerReady(true);
      setMessage("✅ กล้องพร้อมแล้ว กรุณาสแกน QR");
    } catch (err) {
      console.error("❌ เริ่มกล้องไม่สำเร็จ", err);
      setMessage("ไม่สามารถเริ่มการสแกนได้");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopScan = async () => {
    if (isStopping || !isScannerReady) return;

    setIsStopping(true);
    try {
      await html5QrCodeRef.current?.stop();
      setMessage("หยุดการสแกนแล้ว");
      setScanning(false);
      setIsScannerReady(false);
    } catch (err) {
      console.error("ปิดกล้องไม่สำเร็จ:", err);
      setMessage("เกิดข้อผิดพลาดในการปิดกล้อง");
    } finally {
      setIsStopping(false);
    }
  };

  // Modal state + handlers
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (scannedAssets.length === 0) {
      alert("ยังไม่มีอุปกรณ์ให้ยืนยัน");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const [user, setUser] = useState<UserData>();
  const getUser = async () => {
    try {
      const res = await fetch("/api/access_check", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        console.log("User data fetched successfully:", data.user);
      } else {
        console.error("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-start justify-center px-4 py-8">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-md ring-1 ring-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white text-lg font-semibold ${
                data === "borrow" ? "bg-green-600" : "bg-yellow-500"
              }`}
              aria-label={data === "borrow" ? "โหมดยืม" : "โหมดคืน"}
            >
              {data === "borrow" ? "ยืม" : "คืน"}
            </div>
            <div>
              <div className="text-xs text-gray-500">โหมดการทำงาน</div>
              <div className="text-sm font-semibold text-gray-900">
                {data === "borrow" ? "ยืมอุปกรณ์" : "คืนอุปกรณ์"}
              </div>
            </div>
          </div>
          <button
            onClick={() => onCancel()}
            className="text-sm text-gray-600 hover:text-red-600 font-semibold transition-colors"
            title="เปลี่ยนโหมด"
            type="button"
          >
            เปลี่ยน
          </button>
        </div>

        {/* กล้องและสถานะสแกน */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-[280px] aspect-square rounded-xl overflow-hidden border-4 border-blue-400 shadow-sm">
            <div
              id="reader"
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            />

            {scanning && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 animate-scan-line shadow-cyan-400" />
                {/* มุมสี่เหลี่ยม */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            )}

            {!scanning && (
              <div className="absolute inset-0 bg-gray-900/60 flex flex-col items-center justify-center text-white text-center p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 mb-3"
                  aria-hidden="true"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <path d="m12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
                  <path d="m2 2 20 20" />
                </svg>
                <h3 className="font-semibold text-lg text-white/90">
                  กล้องปิดอยู่
                </h3>
                <p className="text-sm text-white/70">
                  กดปุ่ม เริ่มสแกน เพื่อเปิดกล้อง
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ข้อความสถานะ */}
        <p
          className={`text-center text-base sm:text-md font-medium transition-colors h-12 flex items-center justify-center ${
            success
              ? "text-green-600"
              : message.startsWith("⚠️") ||
                message.startsWith("QR Code ไม่ถูกต้อง")
              ? "text-yellow-600"
              : scanning || message.startsWith("กด 'เริ่มสแกน'")
              ? "text-gray-600"
              : "text-red-600"
          }`}
          aria-live="polite"
        >
          {message}
        </p>

        {scanning && (
          <p className="text-yellow-600 text-sm text-center mt-2 select-none">
            🔍 กำลังสแกน QR Code...
          </p>
        )}

        {/* ปุ่มเริ่ม / หยุดสแกน */}
        {!scanning ? (
          <div className="flex justify-center">
            <button
              onClick={handleStartScan}
              disabled={isStarting || isScannerReady}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-full shadow transition duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="button"
              aria-label="เริ่มสแกน QR Code"
            >
              {scannedAssets.length > 0 ? "🔄 สแกนชิ้นต่อไป" : "📷 เริ่มสแกน"}
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleStopScan}
              disabled={isStopping || !isScannerReady}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 px-8 rounded-full shadow transition duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500"
              type="button"
              aria-label="ปิดกล้องสแกน QR Code"
            >
              ❌ ปิดกล้อง
            </button>
          </div>
        )}

        {/* รายการอุปกรณ์ที่สแกนแล้ว */}
        <ul className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-100 bg-white rounded-lg p-2 border border-gray-200">
          {scannedAssets.length > 0 && (
            <p className="text-lg font-semibold flex justify-center items-center gap-2 mb-2 text-gray-800 select-none">
              <List className="w-5 h-5 text-blue-500" />
              <span>
                รายการ{" "}
                <span className="underline decoration-dotted">
                  {data === "borrow" ? "ยืมอุปกรณ์" : "คืนอุปกรณ์"}
                </span>
              </span>
            </p>
          )}

          {scannedAssets.map((asset, index) => (
            <li
              key={asset.asset_number + "-" + index}
              className="flex items-center justify-between gap-3 p-2 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
            >
              {/* Left content */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-md overflow-hidden border flex-shrink-0">
                  <Image
                    src={asset.image ?? "/part1.jpg"}
                    alt="asset image"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs text-gray-500 font-medium">
                    #{index + 1}
                  </div>
                  <div className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                    <span className="text-blue-500">•</span>{" "}
                    {asset.asset_number}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    📦 {asset.asset_name}
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => {
                  setScannedAssets((prev) => {
                    const updated = prev.filter(
                      (item) => item.asset_number !== asset.asset_number
                    );
                    // ถ้าไม่มีอันที่เหลือใน list แล้ว ค่อยลบจาก scannedIdsRef
                    const stillExists = updated.some(
                      (item) => item.asset_number === asset.asset_number
                    );
                    if (!stillExists) {
                      scannedIdsRef.current.delete(asset.asset_number);
                    }

                    setMessage(`รายการ ${asset.asset_number} ถูกยกเลิก`);
                    setSuccess(false);
                    if (updated.length === 0) {
                      setMessage("ยังไม่มีรายการอุปกรณ์ที่สแกน");
                    }
                    return updated;
                  });
                }}
                className="text-red-500 hover:text-red-700 text-lg font-bold p-1.5 rounded-full transition hover:bg-red-100 cursor-pointer"
                title="ยกเลิกรายการนี้"
                aria-label={`ยกเลิกอุปกรณ์ ${asset.asset_number}`}
                type="button"
              >
                <X />
              </button>
            </li>
          ))}
        </ul>

        {scannedAssets.length > 0 && (
          <button
            onClick={() => {
              handleOpenModal();
              setMessage(
                data === "borrow"
                  ? "กำลังยืนยันการยืมอุปกรณ์..."
                  : "กำลังยืนยันการคืนอุปกรณ์..."
              );
              setSuccess(false);
            }}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-green-500"
            type="button"
            aria-label="ยืนยันการยืม/คืนอุปกรณ์"
          >
            ✅ ยืนยันการ{data === "borrow" ? "ยืม" : "คืน"} (
            {scannedAssets.length} รายการ)
          </button>
        )}

        <ModalFormOrder
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          scannedAssets={scannedAssets}
          user={user ?? null}
          status={data === "borrow" ? "borrow" : "return"}
          refreshAssets={() => {
            setScannedAssets([]);
            scannedIdsRef.current.clear();
            setMessage("รายการอุปกรณ์ถูกรีเซ็ต");
            setSuccess(false);
          }}
        />
      </div>
    </div>
  );
}
