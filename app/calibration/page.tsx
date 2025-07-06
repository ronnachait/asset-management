"use client";

import { useEffect, useState } from "react";
import { differenceInCalendarDays, format, isBefore } from "date-fns";
import { th } from "date-fns/locale";
import {
  AlarmClock,
  RefreshCcw,
  CalendarCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

    if (res.ok) {
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-blue-800">
        <AlarmClock className="w-6 h-6" />
        รายการกำหนด Calibration
      </h2>

      {calibrations.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <CalendarCheck className="w-10 h-10 mx-auto mb-4 text-gray-400" />
          ยังไม่มีรายการ Calibration
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 text-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">ลำดับ</th>
                <th className="px-4 py-3 text-left">เลขอุปกรณ์</th>
                <th className="px-4 py-3 text-left">ชื่ออุปกรณ์</th>
                <th className="px-4 py-3 text-left">วันกำหนด Calibration</th>
                <th className="px-4 py-3 text-left">สถานะ</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
                    className={isDue ? "bg-red-50" : "hover:bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {cal.asset_number}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {cal.asset_name || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {format(
                        new Date(cal.next_calibration_date),
                        "dd MMM yyyy",
                        {
                          locale: th,
                        }
                      )}
                      {daysLeft >= 0 ? (
                        <span className="text-xs text-gray-500 ml-2">
                          (เหลืออีก {daysLeft} วัน)
                        </span>
                      ) : (
                        <span className="text-xs text-red-500 ml-2">
                          (เลยมา {Math.abs(daysLeft)} วัน)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {cal.status === "done" ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✅ ตรวจสอบแล้ว
                        </span>
                      ) : isDue ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          ถึงกำหนดแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          ⏳ รอตรวจสอบ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cal.status === "pending" && isDue && (
                        <Button
                          onClick={() => confirmCalibration(cal.id)}
                          className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 text-sm"
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          ยืนยัน Calibration
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
