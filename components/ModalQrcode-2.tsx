import { ScanQrCode, ShieldAlert } from "lucide-react";
import React from "react";
import Image from "next/image";

interface QRItem {
  qrDataUrl: string;
  assetNumber: string | number;
  assetName: string | number;
}

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrItems: QRItem[];
}

export default function QrCodeModal2({
  isOpen,
  onClose,
  qrItems,
}: QrCodeModalProps) {
  if (!isOpen) return null;

const handlePrintSmallQRCodes = () => {
  const printWindow = window.open("", "Print Small QR Codes");
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Small QR Codes</title>
          <style>
            @media print {
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }

            body {
              font-family: sans-serif;
              display: flex;
              flex-wrap: wrap;
              justify-content: flex-start;
              padding: 10mm;
              box-sizing: border-box;
            }

            .qr-small {
              width: 4cm;
              height: 4.5cm;
              margin: 5mm;
              border: 0.5px dashed #999;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-size: 8pt;
              box-sizing: border-box;
              page-break-inside: avoid;
              text-align: center;
            }

            .qr-small img {
              width: 3cm;
              height: 3cm;
              object-fit: contain;
              margin-bottom: 4px;
            }

            .qr-small strong {
              font-size: 9pt;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
            }
          </style>
        </head>
        <body>
          ${qrItems
            .map(
              (item) => `
                <div class="qr-small">
                  <img src="${item.qrDataUrl}" alt="QR ${item.assetNumber}" />
                  <strong>${item.assetNumber}</strong>
                </div>
              `
            )
            .join("")}
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
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <ScanQrCode className="animate-pulse w-8 h-8" />
              QR Code สำหรับอุปกรณ์
            </h3>
            <span className=" text-gray-400 px-3">จำนวนคิวอาร์โค้ดทั้งหมด ( {qrItems.length} อัน )</span>
          </div>
          <div className="flex justify-center items-center gap-2">
            {qrItems.length !== 0 && (
              <button
                onClick={handlePrintSmallQRCodes}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                🖨️ พิมพ์ทั้งหมด
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded transition text-sm"
            >
              X ปิดหน้าต่าง
            </button>
          </div>
        </div>

        {/* QR Grid */}
        {qrItems.length === 0 && (
          <div className="flex justify-center items-center gap-1 text-red-500 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
            <span>กรุณาเลือก QR Code ที่ต้องการพิมพ์ !</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {qrItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col items-center shadow-sm"
            >
              <Image
                src={item.qrDataUrl}
                alt={`QR ${item.assetNumber}`}
                width={180}
                height={180}
                className="rounded border shadow mb-2"
              />
              <div className="text-center text-sm text-gray-700 mb-2">
                <div>
                  <span className="text-blue-600 font-semibold">Asset:</span>{" "}
                  {item.assetNumber}
                </div>
                <div>
                  <span className="text-blue-600 font-semibold">Name:</span>{" "}
                  {item.assetName}
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={item.qrDataUrl}
                  download={`QR-${item.assetNumber}.png`}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700"
                  onClick={(e) => {
                    if (!confirm("ดาวน์โหลด QR Code นี้?")) e.preventDefault();
                  }}
                >
                  ดาวน์โหลด
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="w-full py-2 mt-6 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition text-sm"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
}
