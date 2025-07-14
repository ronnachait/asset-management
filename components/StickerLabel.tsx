// app/components/StickerLabel.tsx
"use client";

import html2canvas from "html2canvas";
import { useRef } from "react";
import Image from "next/image";

export default function StickerLabel({
  qrDataUrl,
  assetNumber,
  label,
}: {
  qrDataUrl: string;
  assetNumber: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const downloadPNG = async () => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, {
      backgroundColor: "#fff",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = `QR-${assetNumber}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className=" space-y-4">
      <div className="flex justify-center items-center">
        <div
          ref={ref}
          style={{
            width: "200px",
            height: "120px",
            padding: "8px",
            backgroundColor: "white",
            border: "2px solid #333", // กรอบหลัก
            borderRadius: "6px", // มุมโค้งเล็กน้อย
            display: "flex",
            flexDirection: "row",
            fontFamily: "sans-serif",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // เงาเบาๆ
          }}
        >
          {/* ซ้าย: ข้อมูล */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start", // จาก space-between → ให้ชิดด้านบน
              gap: "5px", // ระยะห่างแต่ละบรรทัด
              paddingRight: "6px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "#1a1a1a",
                paddingBottom: "1px",
                marginBottom: "2px",
              }}
            >
              ASSET - SATT
            </div>

            <div style={{ fontSize: "10px", lineHeight: "1.1", color: "#333" }}>
              <strong>เลข:</strong> {assetNumber}
            </div>

            <div
              style={{
                fontSize: "10px",
                lineHeight: "1.1",
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                color: "#333",
              }}
            >
              <strong>ชื่อ:</strong> {label}
            </div>
          </div>

          {/* ขวา: QR CODE */}
          <div
            style={{
              width: "70px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderLeft: "1px dashed #aaa",
              paddingLeft: "6px",
            }}
          >
            <div
              style={{
                fontSize: "8px",
                color: "#666",
                marginBottom: "2px",
              }}
            >
              QR CODE
            </div>
            <Image
              src={qrDataUrl}
              alt={`QR ${assetNumber}`}
              width={70}
              height={70}
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={downloadPNG}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ดาวน์โหลด PNG
        </button>
        <button
          onClick={() => alert("Coming soon..")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ดาวน์โหลด PDF
        </button>
      </div>
    </div>
  );
}
