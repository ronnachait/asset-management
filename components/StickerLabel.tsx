// app/components/StickerLabel.tsx
"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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

  const downloadPDF = async () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [50, 30],
    });
    const img = new window.Image();
    img.src = qrDataUrl;
    img.onload = () => {
      doc.addImage(img, "PNG", 2, 2, 20, 20);
      doc.setFontSize(10);
      doc.text(assetNumber, 25, 12);
      doc.setFontSize(8);
      doc.text(label, 25, 18);
      doc.save(`Label-${assetNumber}.pdf`);
    };
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
            fontSize: "10px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={qrDataUrl}
            alt={`QR ${assetNumber}`}
            width={80}
            height={80}
          />
          <div style={{ fontWeight: "bold" }}>{assetNumber}</div>
          <div>{label}</div>
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
          onClick={downloadPDF}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ดาวน์โหลด PDF
        </button>
      </div>
    </div>
  );
}
