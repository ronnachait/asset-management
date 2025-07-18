"use client";

import { useEffect, useState } from "react";
import {
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  subDays,
} from "date-fns";
import { th } from "date-fns/locale";
import {
  CalendarCheck,
  AlertTriangle,
  Trash2,
  RotateCw,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion"; // ✅ เพิ่ม animation
import CalibrationAdd from "./calibration-add-modal";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ConfirmCalibrationDevice from "./calibration-confirm-modal";

type Calibration = {
  id: string;
  asset_id: string;
  next_calibration_date: string;
  last_calibration_date: string | null;
  status: "pending" | "done";
  lead_time: string;
  asset_name?: string;
  asset_number?: string;
};

export default function CalibrationPage() {
  const [calibrations, setCalibrations] = useState<Calibration[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    const res = await fetch("/api/calibrations");
    const result = await res.json();
    if (res.ok) setCalibrations(result.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMM yyyy", { locale: th });
  };

  const StatusBadge = ({
    isDue,
    isDueSoon,
  }: {
    isDue: boolean;
    isDueSoon: boolean;
  }) => {
    if (isDue) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300"
          title="รายการนี้เลยกำหนดสอบเทียบแล้ว"
        >
          <AlertTriangle className="w-4 h-4" />
          เลยกำหนด
        </span>
      );
    }

    if (isDueSoon) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300"
          title="ใกล้ถึงวันสอบเทียบ (ภายใน 3 วัน)"
        >
          <Clock className="w-4 h-4" />
          ใกล้ถึงกำหนด
        </span>
      );
    }

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
        title="ยังไม่ถึงกำหนดสอบเทียบ"
      >
        <CheckCircle className="w-4 h-4" />
        ปกติ
      </span>
    );
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/calibrations/delete?id=${id}`, {
      method: "DELETE",
    });
    const result = await res.json();

    if (!res.ok) {
      console.log(result.message);
      toast.error(`Error : ${result.message}`);
      return;
    }

    toast.success(result.message);
    fetchData();
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchData(); // สมมุติว่าเป็น async function
    setLoading(false);
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
          <p className="text-lg font-medium">ไม่มีรายการ Calibration</p>
        </motion.div>
      ) : (
        <div>
          <div className="flex justify-end p-4 gap-2">
            <Button
              className="rounded bg-blue-500 hover:bg-blue-700 cursor-pointer flex items-center gap-2 px-3 py-1 text-white text-sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RotateCw
                className={`w-4 h-4 transition-transform ${
                  loading ? "animate-spin" : ""
                }`}
              />
              {loading ? "กำลังโหลด..." : "รีเฟรช"}
            </Button>
            <CalibrationAdd
              onsuccess={() => {
                fetchData();
              }}
            />
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* ปุ่มเพิ่ม */}

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
                    const today = new Date();
                    const isDue =
                      isBefore(new Date(cal.next_calibration_date), today) &&
                      cal.status === "pending";
                    const nextDate = new Date(cal.next_calibration_date);
                    // 3 วันก่อนหน้า
                    const threeDaysBefore = subDays(nextDate, 3);
                    // 3 วันหลังจากนั้น
                    // const threeDaysAfter = addDays(nextDate, 3);
                    const isDueSoon =
                      isAfter(today, threeDaysBefore) &&
                      isBefore(today, nextDate); // ช่วงก่อนถึงกำหนด 3 วัน
                    // const isRecentlyOverdue =
                    //   isAfter(today, nextDate) && isBefore(today, threeDaysAfter); // เลยมาไม่เกิน 3 วัน
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
                          <StatusBadge isDue={isDue} isDueSoon={isDueSoon} />
                        </td>
                        <td className="px-4 py-3 text-center flex justify-end items-center gap-1">
                          {cal.status === "pending" && isDue && (
                            <ConfirmCalibrationDevice
                              asset_Id={cal.asset_id}
                              id={cal.id}
                              onsuccess={() => {
                                handleRefresh();
                              }}
                            />
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm shadow cursor-pointer">
                                <Trash2 className="w-4 h-4 mr-2" />
                                ลบ
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  คุณแน่ใจหรือไม่ว่าจะลบรายการนี้?
                                </DialogTitle>
                                <DialogDescription>
                                  การดำเนินการนี้ไม่สามารถย้อนกลับได้
                                  การลบนี้จะเป็นการลบข้อมูลออกจากระบบอย่างถาวร
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm shadow cursor-pointer">
                                  ยกเลิก
                                </DialogClose>

                                <Button
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm shadow cursor-pointer"
                                  onClick={() => handleDelete(cal.id)}
                                >
                                  ลบรายการ
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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
                const today = new Date();
                const isDue =
                  isBefore(new Date(cal.next_calibration_date), today) &&
                  cal.status === "pending";
                const nextDate = new Date(cal.next_calibration_date);
                // 3 วันก่อนหน้า
                const threeDaysBefore = subDays(nextDate, 3);

                const isDueSoon =
                  isAfter(today, threeDaysBefore) && isBefore(today, nextDate); // ช่วงก่อนถึงกำหนด 3 วัน

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
                      <StatusBadge isDue={isDue} isDueSoon={isDueSoon} />
                      {cal.status === "pending" && isDue && (
                        <ConfirmCalibrationDevice
                          asset_Id={cal.asset_id}
                          id={cal.id}
                          onsuccess={() => {
                            handleRefresh();
                          }}
                        />
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm shadow cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบ
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              คุณแน่ใจหรือไม่ว่าจะลบรายการนี้?
                            </DialogTitle>
                            <DialogDescription>
                              การดำเนินการนี้ไม่สามารถย้อนกลับได้
                              การลบนี้จะเป็นการลบข้อมูลออกจากระบบอย่างถาวร
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm shadow cursor-pointer">
                              ยกเลิก
                            </DialogClose>

                            <Button
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm shadow cursor-pointer"
                              onClick={() => handleDelete(cal.id)}
                            >
                              ลบรายการ
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
