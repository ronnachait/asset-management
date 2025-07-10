"use client";

import { useEffect, useState } from "react";
import { differenceInCalendarDays, format, isBefore } from "date-fns";
import { th } from "date-fns/locale";
import {
  RefreshCcw,
  CalendarCheck,
  AlertTriangle,
  CirclePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion"; // ✅ เพิ่ม animation

type Calibration = {
  id: string;
  asset_id: string;
  next_calibration_date: string;
  last_calibration_date: string | null;
  status: "pending" | "done";
  asset_name?: string;
  asset_number?: string;
};

export default function CalibrationPage() {
  const [calibrations, setCalibrations] = useState<Calibration[]>([]);

  const fetchData = async () => {
    const res = await fetch("/api/calibrations");
    const result = await res.json();
    if (res.ok) setCalibrations(result.data);
  };

  const confirmCalibration = async (id: string) => {
    const res = await fetch(`/api/calibrations/${id}`, {
      method: "PATCH",
    });
    if (res.ok) fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMM yyyy", { locale: th });
  };

  const StatusBadge = ({
    status,
    isDue,
  }: {
    status: string;
    isDue: boolean;
  }) => {
    if (status === "done") {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-700 dark:text-white">
          ✅ ตรวจสอบแล้ว
        </span>
      );
    }

    if (isDue) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-700 dark:text-white animate-pulse">
          <AlertTriangle className="w-4 h-4 mr-1" />
          ถึงกำหนดแล้ว
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white">
        ⏳ รอตรวจสอบ
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {calibrations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 dark:text-gray-400 mt-20"
        >
          <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600 animate-pulse" />
          <p className="text-lg font-medium">ยังไม่มีรายการ Calibration</p>
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* ปุ่มเพิ่ม */}
          <div className="flex justify-end p-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow transition">
              <CirclePlus className="w-4 h-4 mr-2" />
              เพิ่มอุปกรณ์ Calibration
            </Button>
          </div>

          {/* TABLE สำหรับจอใหญ่ */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-blue-50 dark:bg-gray-800 text-gray-700 dark:text-white uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3">ลำดับ</th>
                  <th className="px-4 py-3">เลขอุปกรณ์</th>
                  <th className="px-4 py-3">ชื่ออุปกรณ์</th>
                  <th className="px-4 py-3">วัน Calibration</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {calibrations.map((cal, index) => {
                  const isDue =
                    isBefore(new Date(cal.next_calibration_date), new Date()) &&
                    cal.status === "pending";
                  const daysLeft = differenceInCalendarDays(
                    new Date(cal.next_calibration_date),
                    new Date()
                  );

                  return (
                    <tr
                      key={cal.id}
                      className={`${
                        isDue
                          ? "bg-red-50 dark:bg-red-900"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      } transition-colors`}
                    >
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                        {cal.asset_number}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {cal.asset_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                        {formatThaiDate(cal.next_calibration_date)}
                        <span className="ml-2 text-xs">
                          {daysLeft >= 0 ? (
                            <span className="text-gray-500 dark:text-gray-400">
                              (เหลือ {daysLeft} วัน)
                            </span>
                          ) : (
                            <span className="text-red-500 dark:text-red-300">
                              (เลยมา {Math.abs(daysLeft)} วัน)
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={cal.status} isDue={isDue} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {cal.status === "pending" && isDue && (
                          <Button
                            onClick={() => confirmCalibration(cal.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm shadow"
                          >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            ยืนยัน
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CARD สำหรับจอเล็ก (มือถือ) */}
          <div className="sm:hidden space-y-4 p-4">
            {calibrations.map((cal, index) => {
              const isDue =
                isBefore(new Date(cal.next_calibration_date), new Date()) &&
                cal.status === "pending";
              const daysLeft = differenceInCalendarDays(
                new Date(cal.next_calibration_date),
                new Date()
              );

              return (
                <motion.div
                  key={cal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`rounded-xl border p-4 shadow-sm transition-colors ${
                    isDue
                      ? "border-red-400 bg-red-50 dark:bg-red-900"
                      : "border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  }`}
                >
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                    {cal.asset_name || "-"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    รหัส:{" "}
                    <span className="font-medium">{cal.asset_number}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    วัน Calibration:{" "}
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatThaiDate(cal.next_calibration_date)}
                    </span>{" "}
                    {daysLeft >= 0 ? (
                      <span className="text-gray-400">
                        (เหลือ {daysLeft} วัน)
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-300">
                        (เลย {Math.abs(daysLeft)} วัน)
                      </span>
                    )}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <StatusBadge status={cal.status} isDue={isDue} />
                    {cal.status === "pending" && isDue && (
                      <Button
                        onClick={() => confirmCalibration(cal.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs shadow"
                      >
                        <RefreshCcw className="w-4 h-4 mr-1" />
                        ยืนยัน
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
