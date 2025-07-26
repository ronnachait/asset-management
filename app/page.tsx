"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import {
  Package,
  CheckCircle2,
  Clock4,
  ClockAlert,
  BadgeAlert,
} from "lucide-react";
import { ReactNode } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export type BorrowItem = {
  id: string;
  borrow_date: string; // ISO format date
  return_due_date: string; // ISO format date
  status: "pending" | "borrowed" | "done" | "returned" | "rejected"; // ปรับตาม enum ที่คุณใช้จริง
  notes: string;
  borrow_images: string | null;
  created_at: string; // ISO format date
  return_completed_at: string | null;
  borrower: string; // user id
  confirm: boolean | null;
  type: "borrowed" | "returned" | string; // เผื่ออนาคตมี type อื่น
  return_images: string | null;
};

export default function DashboardPage() {
  const [borrowStats, setBorrowStats] = useState({
    total: 0,
    returned: 0,
    late: 0,
    onBorrow: 0,
    pending: 0,
  });

  const [historyData, setHistoryData] = useState<
    { date: string; borrowed: number; returned?: number }[]
  >([]);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    const json = await res.json();

    if (!res.ok) {
      console.error(json.message);
      return;
    }

    const result = json.data;

    setHistoryData(getHistoryData(result));
    const now = new Date();

    const returned = result.filter(
      (item: BorrowItem) => item.status === "done" || item.status === "returned"
    );
    const pending = result.filter(
      (item: BorrowItem) => item.status === "pending"
    );
    const late = result.filter((item: BorrowItem) => {
      if (!item.return_due_date) return false;
      const dueDate = new Date(item.return_due_date);
      return (
        dueDate < now &&
        item.status !== "done" &&
        item.status !== "returned" &&
        item.status !== "rejected"
      );
    });
    const onBorrow = result.filter(
      (item: BorrowItem) => item.status === "borrowed"
    );

    setBorrowStats({
      total: result.length,
      returned: returned.length,
      late: late.length,
      onBorrow: onBorrow.length,
      pending: pending.length,
    });
  }, [setBorrowStats, setHistoryData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getHistoryData = (data: BorrowItem[]) => {
    const today = new Date();
    const dateList = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d.toISOString().split("T")[0]; // yyyy-mm-dd
    });

    const historyMap: Record<string, { borrowed: number; returned: number }> =
      {};
    for (const date of dateList) {
      historyMap[date] = { borrowed: 0, returned: 0 };
    }

    data.forEach((item) => {
      const borrowDate = item.borrow_date?.split("T")[0];
      const returnDate = item.return_completed_at?.split("T")[0];

      if (borrowDate && historyMap[borrowDate]) {
        historyMap[borrowDate].borrowed += 1;
      }
      if (returnDate && historyMap[returnDate]) {
        historyMap[returnDate].returned += 1;
      }
    });

    return dateList.map((d) => ({ date: d, ...historyMap[d] }));
  };

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        <SummaryCard
          label="ยืมทั้งหมด"
          value={borrowStats.total}
          gradient="from-blue-500 to-blue-700 dark:from-blue-700 dark:to-blue-900"
          icon={<Package size={26} />}
        />
        <SummaryCard
          label="รอยืนยัน"
          value={borrowStats.pending}
          gradient="from-purple-500 to-purple-700 dark:from-purple-700 dark:to-purple-900"
          icon={<BadgeAlert size={26} />}
        />
        <SummaryCard
          label="คืนแล้ว"
          value={borrowStats.returned}
          gradient="from-green-500 to-green-700 dark:from-green-700 dark:to-green-900"
          icon={<CheckCircle2 size={26} />}
        />
        <SummaryCard
          label="เลยกำหนด"
          value={borrowStats.late}
          gradient="from-red-500 to-red-700 dark:from-red-700 dark:to-red-900"
          icon={<ClockAlert size={26} />}
        />
        <SummaryCard
          label="ยังไม่คืน"
          value={borrowStats.onBorrow}
          gradient="from-yellow-400 to-yellow-600 dark:from-yellow-600 dark:to-yellow-800"
          icon={<Clock4 size={26} />}
        />
      </div>
      {/* Chart */}

      <motion.div
        className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background Gradient หรือ Icon จาง (optional) */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 pointer-events-none" />

        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          📊 สถิติการยืมย้อนหลัง 7 วัน
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={historyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.1}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) =>
                format(new Date(value), "d MMM", { locale: th })
              }
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              stroke="#94a3b8"
              domain={[0, "dataMax"]}
              tick={{ fill: "#64748b", fontSize: 12 }}
              allowDecimals={false} // ✅ ไม่แสดงจุดทศนิยม
              tickFormatter={(value) => Number(value).toFixed(0)} // ✅ ปัดเศษทศนิยมออก
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: 12,
                border: "none",
                padding: 10,
              }}
              labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
              formatter={(value, name) => {
                const labelMap: Record<string, string> = {
                  borrowed: "จำนวนที่ยืม",
                  returned: "จำนวนที่คืน",
                };
                return [`${value} ครั้ง`, labelMap[name as string] || name];
              }}
              labelFormatter={(label) => `📅 วันที่: ${label}`}
            />
            <Bar
              dataKey="borrowed"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="ยืม"
              barSize={20}
            />
            <Bar
              dataKey="returned"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              name="คืน"
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  gradient,
  icon,
}: {
  label: string;
  value: number;
  gradient: string;
  icon: ReactNode;
}) {
  return (
    <div>
      <motion.div
        className={`relative overflow-hidden rounded-2xl p-5 shadow-md backdrop-blur-md ring-1 ring-white/10 bg-gradient-to-br ${gradient} hover:shadow-xl transition-all duration-300`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Icon background ตกแต่ง */}
        <div className="absolute top-2 right-2 opacity-20 text-white text-6xl">
          {icon}
        </div>

        <div className="flex flex-col justify-between h-full z-10 relative">
          <span className="text-sm font-medium uppercase tracking-wide text-white/90 mb-2">
            {label}
          </span>
          <div className="text-3xl font-bold text-white drop-shadow">
            {value}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
