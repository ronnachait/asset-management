import { ScanQrCode } from "lucide-react";
import React from "react";
import StickerLabel from "./StickerLabel";
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
          <ScanQrCode className="animate-pulse w-10 h-10" />
          <span> QR Code สำหรับอุปกรณ์</span>
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

        <div className="flex justify-center items-center gap-4 mb-4">
          <StickerLabel
            qrDataUrl={qrDataUrl}
            assetNumber={assetNumber.toString()}
            label={assetName.toString()}
          />
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
