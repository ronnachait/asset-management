"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { differenceInDays, format, isBefore } from "date-fns";


type BorrowReport = {
  order_id: string;
  borrower: string;
  borrow_date: string;
  return_date: string | null;
  due_date: string;
  status: "borrowing" | "returned";
};

export default function AdminReport() {
  const [reports, setReports] = useState<BorrowReport[]>([]);

  useEffect(() => {
    // จำลองข้อมูลที่เกินกำหนด
    const mockData: BorrowReport[] = [
      {
        order_id: "ORD001",
        borrower: "นายเอกชัย",
        borrow_date: "2025-06-15",
        return_date: null,
        due_date: "2025-06-20",
        status: "borrowing",
        
      },
      {
        order_id: "ORD002",
        borrower: "คุณสมใจ",
        borrow_date: "2025-06-10",
        return_date: null,
        due_date: "2025-06-18",
        status: "borrowing",
      },
    ];

    const today = new Date();
    const overdue = mockData.filter(
      (item) =>
        item.status === "borrowing" && isBefore(new Date(item.due_date), today)
    );

    setReports(overdue);
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6" />
        รายงานแจ้งเตือน: ยืมเกินกำหนด
      </h2>

      {reports.length === 0 ? (
        <p className="text-gray-500">✅ ยังไม่มีรายการที่ยืมเกินกำหนด</p>
      ) : (
        <table className="min-w-full text-sm border border-gray-200 rounded">
          <thead className="bg-red-100 text-red-700">
            <tr>
              <th className="text-left px-4 py-2">รหัสรายการ</th>
              <th className="text-left px-4 py-2">ผู้ยืม</th>
              <th className="text-left px-4 py-2">วันที่ยืม</th>
              <th className="text-left px-4 py-2">วันครบกำหนด</th>
              <th className="text-left px-4 py-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((item) => (
              <tr key={item.order_id} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium">{item.order_id}</td>
                <td className="px-4 py-2">{item.borrower}</td>
                <td className="px-4 py-2">
                  {format(new Date(item.borrow_date), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-2 text-red-500">
                  {format(new Date(item.due_date), "dd MMM yyyy")} (
                  <span className="font-semibold">
                    เกิน {differenceInDays(new Date(), new Date(item.due_date))}{" "}
                    วัน
                  </span>
                  )
                </td>
                <td className="px-4 py-2">
                  <span className="inline-block bg-red-200 text-red-700 px-2 py-1 rounded-full text-xs">
                    เกินกำหนด
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
