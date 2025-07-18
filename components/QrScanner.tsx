"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Image from "next/image";
import ModalFormOrder from "./ModalFormOrder";
import { ImageUp, List, X } from "lucide-react";
import Link from "next/link";

type items = {
  id: string;
  asset_number: string;
  asset_name: string;
  asset_location: string;
  scannedId: string;
  status: "available" | "borrowed" | "repair";
  image?: string;
};
type FacingMode = "user" | "environment";
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
  // --- State ---
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("กด 'เริ่มสแกน' เพื่อเปิดกล้อง");
  const [success, setSuccess] = useState(false);

  // เปลี่ยนจาก string[] เป็น Item[] เพื่อเก็บข้อมูล asset แบบเต็ม
  const [scannedAssets, setScannedAssets] = useState<items[]>([]);

  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const [facingMode, setFacingMode] = useState<FacingMode>("environment");

  const scannedIdsRef = useRef<Set<string>>(new Set());
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastWarningRef = useRef(0);

  const [user, setUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- ฟังก์ชันขออนุญาตกล้อง ---
  const requestCameraPermission = async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("เบราว์เซอร์ของคุณไม่รองรับการเข้าถึงกล้อง");
      setScanning(false);
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err: unknown) {
      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
          case "PermissionDeniedError":
            setMessage(
              "⚠️ คุณได้ปฏิเสธการเข้าถึงกล้อง กรุณาอนุญาตในตั้งค่าเบราว์เซอร์"
            );
            break;
          case "NotFoundError":
          case "DevicesNotFoundError":
            setMessage("ไม่พบกล้องในอุปกรณ์นี้");
            break;
          default:
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

  // --- สร้าง instance และ cleanup scanner ---
  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode("reader");

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current?.clear())
          .catch((err) => {
            console.error("Failed to stop the scanner on cleanup.", err);
          });
      }
    };
  }, []);

  // --- สลับกล้อง ---
  const switchCamera = () => {
    if (isSwitching) return;
    setIsSwitching(true);

    const newFacing: FacingMode =
      facingMode === "environment" ? "user" : "environment";

    // หยุดกล้องก่อนสลับ
    if (html5QrCodeRef.current && isScannerReady) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          setScanning(false);
          setIsScannerReady(false);
          setFacingMode(newFacing);
          setMessage("🔁 เปลี่ยนกล้องแล้ว กดเริ่มสแกนอีกครั้ง");
        })
        .catch((e) => {
          console.error("ไม่สามารถหยุดกล้องก่อนสลับได้", e);
          setMessage("❌ ไม่สามารถสลับกล้องได้");
        })
        .finally(() => {
          setIsSwitching(false);
        });
    } else {
      setFacingMode(newFacing);
      setMessage("🔁 เปลี่ยนกล้องแล้ว กดเริ่มสแกนอีกครั้ง");
      setIsSwitching(false);
    }
  };

  // --- เริ่มสแกน ---
  const startCameraWithFacingMode = async (mode: FacingMode) => {
    setIsStarting(true);
    setMessage("กำลังขออนุญาตใช้กล้อง...");

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      setIsStarting(false);
      throw new Error("Permission denied");
    }

    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("reader");
    }

    try {
      await html5QrCodeRef.current.start(
        { facingMode: { exact: mode } },
        {
          fps: 10,
          qrbox: (viewportWidth, viewportHeight) => {
            const minSize = Math.min(viewportWidth, viewportHeight);
            return {
              width: Math.floor(minSize * 0.85),
              height: Math.floor(minSize * 0.85),
            };
          },
        },
        onScanSuccess,
        handleScanError
      );

      setScanning(true);
      setIsScannerReady(true);
      setMessage("✅ กล้องพร้อมแล้ว กรุณาสแกน QR");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === "OverconstrainedError") {
          setMessage(
            "❌ กล้องที่เลือกไม่มีในอุปกรณ์นี้ ลองกดปุ่ม 'เปลี่ยนกล้อง'"
          );
        } else if (err.message.includes("transition")) {
          setMessage("⏳ กล้องกำลังโหลด กรุณารอสักครู่");
        } else {
          setMessage("❌ ไม่สามารถเริ่มการสแกนได้");
        }
        console.error("❌ เริ่มกล้องไม่สำเร็จ", err);
      } else {
        setMessage("❌ ไม่สามารถเริ่มการสแกนได้ (Unknown error)");
        console.error("❌ เริ่มกล้องไม่สำเร็จ (Unknown error)", err);
      }
      throw err;
    } finally {
      setIsStarting(false);
    }
  };

  // --- เริ่มสแกนด้วย facingMode ปัจจุบัน ---
  const handleStartScan = async () => {
    if (isStarting || isStopping || isScannerReady) {
      console.warn("⏳ Scanner ยังไม่พร้อมเริ่มใหม่");
      return;
    }
    try {
      await startCameraWithFacingMode(facingMode);
    } catch {
      // จัดการ error ใน startCameraWithFacingMode แล้ว
    }
  };

  // --- หยุดสแกน ---
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

  // --- ฟังก์ชันสแกนสำเร็จ ---
  const onScanSuccess = async (decodedText: string) => {
    try {
      await html5QrCodeRef.current?.stop();
    } catch (e) {
      console.warn("❌ ไม่สามารถหยุดกล้องได้", e);
    }

    setScanning(false);
    setIsScannerReady(false);

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

    // เช็คข้อมูลจาก server
    try {
      const res = await fetch(`/api/borrow/check?asset_number=${id}`);
      const result = await res.json();

      if (res.status === 404 || result.status === "not_found") {
        setMessage("❌ ไม่พบอุปกรณ์ในระบบ");
        setSuccess(false);
        return;
      }

      // ตรวจสอบสถานะอุปกรณ์ ตามโหมด borrow หรือ return (สมมุติว่ามีตัวแปร data)
      // ปรับใช้จริงตาม logic ที่คุณมี
      if (data === "borrow") {
        if (
          ["borrowed", "pending", "repair", "destroyed"].includes(result.status)
        ) {
          const msg = {
            borrowed: "⚠️ อุปกรณ์นี้ถูกยืมอยู่แล้ว",
            pending: "⚠️ อุปกรณ์นี้กำลังรออนุมัติการยืม",
            repair: "⚠️ อุปกรณ์นี้อยู่ระหว่างซ่อมแซม",
            destroyed: "⚠️ อุปกรณ์นี้ถูกทำลายแล้ว ไม่สามารถยืมได้",
          };
          setMessage(msg[result.status as keyof typeof msg]);
          setSuccess(false);
          return;
        }
      } else if (data === "return") {
        if (
          ["available", "pending", "repair", "destroyed"].includes(
            result.status
          )
        ) {
          const msg = {
            available: "⚠️ อุปกรณ์นี้ยังไม่ได้ถูกยืม",
            pending: "⚠️ อุปกรณ์นี้ยังไม่ได้รับอนุมัติให้ยืม",
            repair: "⚠️ อุปกรณ์นี้อยู่ระหว่างซ่อมแซม ไม่สามารถคืนได้",
            destroyed: "⚠️ อุปกรณ์นี้ถูกทำลายแล้ว ไม่สามารถคืนได้",
          };
          setMessage(msg[result.status as keyof typeof msg]);
          setSuccess(false);
          return;
        }
      }

      // บันทึกอุปกรณ์ที่ตรวจพบ
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
          image: result.asset_image ?? undefined,
        },
      ]);
      setMessage(
        `✅ ${data === "borrow" ? "ยืม" : "คืน"}: ${result.asset_name}`
      );
      setSuccess(true);
    } catch (error) {
      setMessage("❌ เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูลอุปกรณ์");
      setSuccess(false);
      console.error(error);
    }
  };

  // --- ฟังก์ชันจัดการ error ตอนสแกน ---
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

  // --- Modal Handlers ---
  const handleOpenModal = () => {
    if (scannedAssets.length === 0) {
      alert("ยังไม่มีอุปกรณ์ให้ยืนยัน");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  // --- ดึงข้อมูล user ---
  const getUser = async () => {
    try {
      const res = await fetch("/api/access_check");
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      if (data.user) setUser(data.user);
      else console.error("No user data found");
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const notifyOtherTabs = () => {
    const channel = new BroadcastChannel("order_updates");
    channel.postMessage("update");
    channel.close(); // ปิดทันทีหลังส่ง
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !html5QrCodeRef.current) {
      setMessage("❌ ไม่สามารถอ่านไฟล์ได้");
      return;
    }

    setMessage("⏳ กำลังวิเคราะห์ภาพ QR...");
    try {
      const decodedText = await html5QrCodeRef.current.scanFile(file, true); // true = แสดง preview
      await onScanSuccess(decodedText);
    } catch (err) {
      console.error("❌ ไม่พบ QR ในภาพ", err);
      setMessage("❌ ไม่พบ QR Code ในภาพ กรุณาเลือกภาพใหม่");
    } finally {
      // รีเซ็ตไฟล์เพื่อให้อัปโหลดซ้ำได้
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-md w-full space-y-6 shadow-md ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full  text-white text-lg font-semibold ${
              data === "borrow" ? "bg-green-600" : "bg-yellow-500"
            }`}
            aria-label={data === "borrow" ? "โหมดยืม" : "โหมดคืน"}
          >
            {data === "borrow" ? "ยืม" : "คืน"}
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              โหมดการทำงาน
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {data === "borrow" ? "ยืมอุปกรณ์" : "คืนอุปกรณ์"}
            </div>
          </div>
        </div>
        <button
          onClick={() => onCancel()}
          className="text-sm text-gray-600 hover:text-red-600 font-semibold transition-colors dark:text-gray-400 dark:hover:text-red-400"
          title="เปลี่ยนโหมด"
          type="button"
        >
          เปลี่ยน
        </button>
      </div>

      {/* กล้องและสถานะสแกน */}
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* กล่องแสดงภาพกล้อง */}
        <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden border-[6px] border-blue-500 shadow-2xl bg-black dark:bg-gray-800 dark:border-blue-600">
          <div id="reader" className="absolute inset-0 w-full h-full" />
          <button
            onClick={switchCamera}
            disabled={isSwitching}
            className={`absolute top-3 right-4 z-20 px-3 py-1.5 rounded-lg font-semibold shadow-md transition duration-200 active:scale-95 focus:outline-none focus:ring-4
            ${
              facingMode === "environment"
                ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-500"
                : "bg-green-600 hover:bg-green-700 focus:ring-green-400 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-500"
            }
                  text-white flex items-center gap-2 text-sm
                `}
            type="button"
            aria-label="สลับกล้องหน้า-หลัง"
          >
            สลับกล้อง ({facingMode === "environment" ? "หลัง" : "หน้า"})
          </button>

          <button
            onClick={() => document.getElementById("qr-upload")?.click()}
            className="absolute bottom-4 right-4 z-20 w-full sm:w-auto px-2 py-1 bg-blue-600/80 hover:bg-blue-700 text-white rounded font-semibold shadow-lg transition duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400 dark:focus:ring-blue-500 flex justify-center items-center gap-2"
            type="button"
          >
            <ImageUp className="w-4 h-4" /> <span>อัพโหลด</span>
          </button>

          {scanning ? (
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* เส้นสแกน */}
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 animate-scan-line shadow-cyan-400" />

              {/* กรอบมุมทั้ง 4 */}
            </div>
          ) : (
            <div className="absolute inset-0 z-10 bg-black/70 flex flex-col items-center justify-center text-white p-4 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 mb-3 text-white/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <path d="m12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
                <path d="m2 2 20 20" />
              </svg>
              <h3 className="font-semibold text-lg">กล้องปิดอยู่</h3>
              <p className="text-sm text-gray-300">
                กดปุ่มเริ่มสแกนเพื่อเปิดกล้อง
              </p>
            </div>
          )}
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
          {scanning ? (
            <button
              onClick={handleStopScan}
              disabled={isStopping || !isScannerReady}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 px-10 rounded-xl shadow-lg transition duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-400 dark:focus:ring-red-500"
              type="button"
              aria-label="ปิดกล้องสแกน QR Code"
            >
              ❌ ปิดกล้อง
            </button>
          ) : (
            <button
              onClick={handleStartScan}
              disabled={isStarting || isScannerReady}
              className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg transition duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400 dark:focus:ring-green-500"
              type="button"
              aria-label="เริ่มสแกน QR Code"
            >
              {scannedAssets.length > 0 ? "🔄 สแกนชิ้นต่อไป" : "📷 เริ่มสแกน"}
            </button>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          id="qr-upload"
          onChange={handleUploadImage}
          className="hidden"
        />
        {/* ข้อความสถานะ */}
        <p
          className={`text-center text-base font-medium transition-colors min-h-[2.5rem] px-6 py-2 rounded-lg shadow-sm
    ${
      success
        ? "text-green-700 bg-green-100 shadow-green-300"
        : message.startsWith("⚠️") || message.startsWith("QR Code ไม่ถูกต้อง")
          ? "text-yellow-700 bg-yellow-100 shadow-yellow-300"
          : scanning || message.startsWith("กด 'เริ่มสแกน'")
            ? "text-gray-700 bg-gray-100 shadow-gray-200"
            : "text-red-700 bg-red-100 shadow-red-300"
    }
  `}
          aria-live="polite"
        >
          {message}
        </p>

        {scanning && (
          <p className="text-yellow-600 text-sm text-center mt-1 select-none">
            🔍 กำลังสแกน QR Code...
          </p>
        )}
      </div>

      {/* รายการอุปกรณ์ที่สแกนแล้ว */}
      <ul className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-100 bg-white rounded-lg p-2 dark:bg-gray-800">
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
            className="flex items-center gap-4 p-4 rounded-md shadow-md bg-gradient-to-br from-white to-blue-50 border border-blue-100 transition hover:shadow-lg"
          >
            {/* รูปภาพ */}
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-inner flex-shrink-0 bg-white">
              {asset.image ? (
                <Link
                  href={asset.image}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={asset.image ?? "/part1.jpg"}
                    alt={`asset ${asset.asset_number}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </Link>
              ) : (
                <Image
                  src={asset.image ?? "/part1.jpg"}
                  alt={`asset ${asset.asset_number}`}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              )}
            </div>

            {/* รายละเอียด */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-semibold">
                  #{index + 1}
                </span>
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  {asset.asset_number}
                </span>
              </div>

              <div className="text-sm font-semibold text-gray-800 truncate">
                📦 {asset.asset_name}
              </div>
              <div className="text-xs text-gray-600 italic">
                สถานะ: พร้อมใช้งาน
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
          notifyOtherTabs();
        }}
      />
    </div>
  );
}
