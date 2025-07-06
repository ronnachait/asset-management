"use client";

import QrScanner from "@/components/QrScanner";
import { useState } from "react";

export default function ScanPage() {
  const [choice, setChoice] = useState<"borrow" | "return" | null>(null);
  const onCancel = () => {
    setChoice(null);
  };

  return (
    <div>
      {choice && <QrScanner data={choice} onCancel={onCancel} />}

      {!choice && (
        <div className="min-h-screen bg-gradient-to-tr from-cyan-50 to-blue-100 flex flex-col justify-center items-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full px-8 py-10 text-center space-y-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
              กรุณาเลือกประเภทการทำรายการ
            </h1>

            {/* ปุ่มเลือกโหมด */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={() => setChoice("borrow")}
                className={`group flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all shadow-sm ${
                  choice === "borrow"
                    ? "bg-green-600 text-white border-green-700 shadow-md"
                    : "bg-white hover:bg-green-50 text-green-700 border-green-400"
                }`}
              >
                <div className="text-4xl mb-2">📥</div>
                <div className="text-lg font-semibold">ยืมอุปกรณ์</div>
              </button>

              <button
                onClick={() => setChoice("return")}
                className={`group flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all shadow-sm ${
                  choice === "return"
                    ? "bg-red-600 text-white border-red-700 shadow-md"
                    : "bg-white hover:bg-red-50 text-red-700 border-red-400"
                }`}
              >
                <div className="text-4xl mb-2">📤</div>
                <div className="text-lg font-semibold">คืนอุปกรณ์</div>
              </button>
            </div>

            {/* แสดงสิ่งที่เลือกไว้ */}
            {choice && (
              <div className="mt-6 text-base text-gray-600">
                คุณเลือก:{" "}
                <span className="font-semibold text-gray-900 capitalize">
                  {choice === "borrow" ? "ยืมอุปกรณ์" : "คืนอุปกรณ์"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
