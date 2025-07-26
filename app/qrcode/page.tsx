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
      <div className="  dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center px-4 py-12">
        {choice && <QrScanner data={choice} onCancel={onCancel} />}

        {!choice && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full px-8 py-10 text-center space-y-6 ring-1 ring-gray-200 dark:ring-gray-700 transition">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
              กรุณาเลือกประเภทการทำรายการ
            </h1>

            {/* ปุ่มเลือกโหมด */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={() => setChoice("borrow")}
                className={`group flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ease-in-out shadow-sm ring-1 ring-inset ${
                  choice === "borrow"
                    ? "bg-green-600 text-white border-green-700 shadow-md"
                    : "bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900 text-green-700 dark:text-green-300 border-green-400 dark:border-green-600"
                }`}
              >
                <div className="text-4xl mb-2">📥</div>
                <div className="text-lg font-semibold">ยืมอุปกรณ์</div>
              </button>

              <button
                onClick={() => setChoice("return")}
                className={`group flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ease-in-out shadow-sm ring-1 ring-inset ${
                  choice === "return"
                    ? "bg-red-600 text-white border-red-700 shadow-md"
                    : "bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border-red-400 dark:border-red-600"
                }`}
              >
                <div className="text-4xl mb-2">📤</div>
                <div className="text-lg font-semibold">คืนอุปกรณ์</div>
              </button>
            </div>

            {/* แสดงสิ่งที่เลือกไว้ */}
            {choice && (
              <div className="mt-6 text-base text-gray-600 dark:text-gray-300">
                คุณเลือก:{" "}
                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                  {choice === "borrow" ? "ยืมอุปกรณ์" : "คืนอุปกรณ์"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
