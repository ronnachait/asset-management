"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Image from "next/image";
import ModalFormOrder from "./ModalFormOrder";
import { Camera, List, SwitchCamera, X } from "lucide-react";
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
  const [isScanning, setIsScanning] = useState(false);
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
      setIsScanning(false);
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
      setIsScanning(false);
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
        setIsScanning(false);
      }
    };
  }, []);

  // --- สลับกล้อง ---
  const switchCamera = async () => {
    if (isSwitching) return;
    setIsSwitching(true);

    const newFacing: FacingMode =
      facingMode === "environment" ? "user" : "environment";

    try {
      // ถ้ากำลังสแกน ให้หยุดก่อน
      if (html5QrCodeRef.current && isScannerReady) {
        await html5QrCodeRef.current.stop();
        setScanning(false);
        setIsScanning(false);
        setIsScannerReady(false);
      }
      setIsScanning(false);
      setFacingMode(newFacing);
      setMessage("🔁 เปลี่ยนกล้องแล้ว ปิดกล้องแล้ว...");

      // เรียก start กล้องใหม่ด้วยกล้องที่เลือก
      // await startCameraWithFacingMode(newFacing);
    } catch (e) {
      console.error("❌ ไม่สามารถสลับกล้องได้", e);
      setMessage("❌ ไม่สามารถสลับกล้องได้");
      setIsScanning(false);
    } finally {
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
      const videoConstraints = {
        facingMode: { exact: mode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      } as MediaTrackConstraints;

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
          // ❌ ลบ experimentalFeatures ที่ไม่รองรับออก
          videoConstraints, // ✅ ใช้ constraints ที่ปลอดภัยตาม type
        },
        onScanSuccess,
        handleScanError
      );
      setIsScanning(true);
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
        setIsScanning(false);
      } else {
        setMessage("❌ ไม่สามารถเริ่มการสแกนได้ (Unknown error)");
        console.error("❌ เริ่มกล้องไม่สำเร็จ (Unknown error)", err);
        setIsScanning(false);
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
      // เช็คก่อนว่า scanner กำลังรันอยู่จริง
      if (isScanning) {
        await html5QrCodeRef.current?.stop();
        await new Promise((res) => setTimeout(res, 300));
        setIsScanning(false);
      }
      await startCameraWithFacingMode(facingMode);
    } catch (error: unknown) {
      console.log(error);
      setIsScanning(false);
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
      setIsScanning(false);
    } catch (err) {
      console.error("ปิดกล้องไม่สำเร็จ:", err);
      setMessage("เกิดข้อผิดพลาดในการปิดกล้อง");
      setIsScanning(false);
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
    setIsScanning(false);
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
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-6 sm:p-10 max-w-3xl w-full mx-auto space-y-8 border border-gray-100 dark:border-gray-800">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md ring-2 ring-white/20 ${
              data === "borrow" ? "bg-green-600" : "bg-yellow-500"
            }`}
            aria-label={data === "borrow" ? "โหมดยืม" : "โหมดคืน"}
          >
            {data === "borrow" ? "ยืม" : "คืน"}
          </div>
          <div>
            <div className="text-xs text-gray-400">โหมดการทำงาน</div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">
              {data === "borrow" ? "ยืมอุปกรณ์" : "คืนอุปกรณ์"}
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-sm font-medium text-gray-500 hover:text-red-600 transition"
        >
          เปลี่ยนโหมด
        </button>
      </div>

      {/* Camera Box */}
      <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden border-[6px] border-blue-500 shadow-2xl bg-black dark:bg-gray-800 dark:border-blue-600">
        <button
          onClick={switchCamera}
          disabled={isSwitching}
          className={`
              flex justify-center items-center gap-1 absolute top-3 right-3 z-30 p-1.5 rounded-full
              dark:bg-gray-700/80 backdrop-blur-md shadow-md
              hover:shadow-xl hover:bg-white/90 dark:hover:bg-gray-600/90
              transition-colors duration-200
              text-gray-800 dark:text-white
              ${facingMode === "environment" ? "bg-green-500/80" : "bg-blue-500/80"}
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          title={`สลับกล้อง (${facingMode === "environment" ? "หลัง" : "หน้า"})`}
          type="button"
        >
          <SwitchCamera className="w-5 h-5" />
          <span className="select-none">
            {facingMode === "environment" ? "หลัง" : "หน้า"}
          </span>
        </button>

        <div id="reader" className="absolute inset-0 w-full h-full" />
        <button
          onClick={() => document.getElementById("qr-upload")?.click()}
          className="absolute bottom-4 right-4 z-20  sm:w-auto px-2 py-1 bg-blue-600/80 hover:bg-blue-700 text-white rounded font-semibold shadow-lg transition duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400 dark:focus:ring-blue-500 flex justify-center items-center gap-2"
          type="button"
        >
          <Camera className="w-5 h-5" /> <span>Mobile Camera</span>
        </button>

        {!scanning && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-2 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <path d="m12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
              <path d="m2 2 20 20" />
            </svg>
            <h3 className="font-bold">กล้องปิดอยู่</h3>
            <p className="text-sm text-gray-300">กดเริ่มสแกนเพื่อเปิดกล้อง</p>
          </div>
        )}
      </div>

      {/* Scan Controls */}
      <div className="text-center space-y-3">
        {scanning && (
          <button
            onClick={async () => {
              if (!html5QrCodeRef.current || !isScannerReady) return;
              setMessage("🔄 กำลังโฟกัสใหม่...");
              try {
                await html5QrCodeRef.current.stop();
                await startCameraWithFacingMode(facingMode);
              } catch (err) {
                console.error("❌ รีเฟรชกล้องล้มเหลว", err);
                setMessage("❌ รีเฟรชกล้องล้มเหลว");
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition duration-200 active:scale-95"
          >
            🔍 แตะเพื่อโฟกัสใหม่
          </button>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400">
          💡 ถือตัวกล้องห่างจาก QR ประมาณ 30–50 ซม.
        </p>

        <div className="flex justify-center gap-4">
          {scanning ? (
            <button
              onClick={handleStopScan}
              disabled={isStopping || !isScannerReady}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl shadow-lg transition duration-200 active:scale-95"
            >
              ❌ ปิดกล้อง
            </button>
          ) : (
            <button
              onClick={handleStartScan}
              disabled={isStarting || isScannerReady}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg transition duration-200 active:scale-95"
            >
              📷 เริ่มสแกน
            </button>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          capture="environment" // ✅ เพิ่มบรรทัดนี้เพื่อเปิดกล้องหลัง
          id="qr-upload"
          onChange={handleUploadImage}
          className="hidden"
        />
      </div>

      {/* Scan Status Message */}
      <p
        className={`text-center text-base font-medium px-4 py-2 rounded-lg shadow-sm transition-colors ${
          success
            ? "text-green-700 bg-green-100"
            : message.startsWith("⚠️") ||
                message.startsWith("QR Code ไม่ถูกต้อง")
              ? "text-yellow-700 bg-yellow-100"
              : scanning || message.startsWith("กด 'เริ่มสแกน'")
                ? "text-gray-700 bg-gray-100"
                : "text-red-700 bg-red-100"
        }`}
      >
        {message}
      </p>

      {/* Scanned List */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto space-y-4 border border-gray-200 dark:border-gray-700">
        {scannedAssets.length > 0 && (
          <p className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
            <List className="w-5 h-5 text-blue-500" /> รายการที่สแกน
          </p>
        )}

        {scannedAssets.map((asset, index) => (
          <div
            key={asset.asset_number + "-" + index}
            className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700"
          >
            <div className="w-16 h-16 rounded overflow-hidden border border-gray-300">
              {asset.image ? (
                <Link
                  href={asset.image}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={asset.image ?? "/part1.jpg"}
                    alt={asset.asset_number}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </Link>
              ) : (
                <Image
                  src={"/part1.jpg"}
                  alt={asset.asset_number}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 font-semibold">
                  #{index + 1}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {asset.asset_number}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-800 dark:text-white">
                📦 {asset.asset_name}
              </div>
              <div className="text-xs text-gray-500">สถานะ: พร้อมใช้งาน</div>
            </div>

            <button
              onClick={() => {
                setScannedAssets((prev) => {
                  const updated = prev.filter(
                    (item) => item.asset_number !== asset.asset_number
                  );
                  const stillExists = updated.some(
                    (item) => item.asset_number === asset.asset_number
                  );
                  if (!stillExists)
                    scannedIdsRef.current.delete(asset.asset_number);

                  setMessage(`รายการ ${asset.asset_number} ถูกยกเลิก`);
                  setSuccess(false);
                  if (updated.length === 0)
                    setMessage("ยังไม่มีรายการอุปกรณ์ที่สแกน");

                  return updated;
                });
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X />
            </button>
          </div>
        ))}
      </div>

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
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow-md"
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
