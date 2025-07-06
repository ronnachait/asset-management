import { ScanQrCode } from "lucide-react";
import React from "react";
import Image from "next/image";
interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrDataUrl: string;
  assetNumber: string | number;
  assetName: string | number;
}

export default function QrCodeModal({
  isOpen,
  onClose,
  qrDataUrl,
  assetNumber,
  assetName,
}: QrCodeModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "Print QR Code");
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .qr-container {
                width: 5cm;  /* หรือใช้ 50mm / 2in */
                height: 5cm;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                font-size: 10pt;
              }
              .qr-container img {
                width: 100%;
                height: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrDataUrl}" />
            <div>QR Code: ${assetNumber}</div>
          </div>
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-semibold text-gray-800 text-center mb-2 flex justify-center items-center gap-1">
          <ScanQrCode className="animate-pulse w-10 h-10" /><span> QR Code สำหรับอุปกรณ์</span>
        </h3>

        <div className="bg-gray-100 rounded-lg px-4 py-3 mb-4 shadow-inner text-sm space-y-1">
          <div className="text-gray-700 font-medium">
            <span className="text-blue-600 font-semibold">Asset Number:</span>{" "}
            {assetNumber}
          </div>
          <div className="text-gray-700 font-medium">
            <span className="text-blue-600 font-semibold">Asset Name:</span>{" "}
            {assetName}
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Image
            src={qrDataUrl}
            alt={`QR ${assetNumber}`}
            width={250}
            height={250}
            className="rounded-lg border border-gray-200 shadow"
          />
        </div>

        <div className="flex justify-center gap-4 mb-4">
          <a
            href={qrDataUrl}
            download={`QR-${assetNumber}.png`}
            className="px-4 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
            onClick={(e) => {
              if (!confirm("คุณต้องการดาวน์โหลด QR Code หรือไม่?"))
                e.preventDefault();
            }}
          >
            ดาวน์โหลด
          </a>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition"
          >
            พิมพ์
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 mt-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition text-sm"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
}
