"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
// Update the import path below to the correct relative path where BorrowOrderDetailModal is located

import { format } from "date-fns";
import { th } from "date-fns/locale"; // สำหรับภาษาไทย
// สำหรับการนำทางไปยังหน้ารายละเอียด
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "@/components/Pagination";
type Asset = {
  id: string;
  asset_number: string;
  asset_name: string;
};

type BorrowItem = {
  id: string;
  asset: Asset | null;
  status: "borrowed" | "returned" | "pending" | "repair";
};

type Account = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  team: string | null;
};

type BorrowOrder = {
  id: string;
  accounts: Account;
  borrow_date: string;
  return_due_date?: string | null;
  return_completed_at?: string | null;
  notes?: string | null;
  borrow_images?: string | null;
  created_at?: string | null;
  status:
    | "borrowed"
    | "returned"
    | "done"
    | "pending"
    | "partially_returned"
    | "rejected";
  borrow_items: BorrowItem[];
};

export function BorrowTable() {
  const [orders, setOrders] = useState<BorrowOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);
  const router = useRouter();

  const fetchOrders = async () => {
    const res = await fetch("/api/borrow-orders-user");
    const result = await res.json();
    console.log("Fetched orders:", result);
    if (res.ok) setOrders(result.data);
    else console.error(result.message);
  };

  const hanldeDetailClick = (order: BorrowOrder) => {
    console.log("Selected order:", order.id);
    router.push(`/borrow-items/${order.id}`);
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  function getStatusLabel(status: string): string {
    switch (status) {
      case "borrowed":
        return "กำลังยืม";
      case "returned":
        return "คืนแล้ว";
      case "done":
        return "เสร็จสิ้น";
      case "rejected":
        return "ยกเลิก";
      case "pending":
        return "รอดำเนินการ";
      case "partially_returned":
        return "คืนอุปกรณ์ไม่ครบ";
      default:
        return "-";
    }
  }

  function getStatusStyle(status: string): string {
    switch (status) {
      case "borrowed":
        return "bg-yellow-100 text-yellow-800";
      case "returned":
        return "bg-green-100 text-green-800";
      case "done":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-purple-100 text-purple-800";
      case "partially_returned":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString); // ← เปลี่ยนทุกครั้ง client โหลด
    return format(date, "d MMM yyyy ", { locale: th }); // ← locale อาจต่างกันระหว่าง server กับ client
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="w-full hidden sm:block overflow-x-auto rounded-xl shadow-md border border-gray-200 bg-white dark:bg-gray-800">
        <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
          <thead className="bg-blue-600 text-white text-xs uppercase tracking-wider dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-center">#</th>
              <th className="px-4 py-3 text-left">ผู้ยืม</th>
              <th className="px-4 py-3 text-left">วันที่ยืม</th>
              <th className="px-4 py-3 text-left">กำหนดคืน</th>
              <th className="px-4 py-3 text-left">วันคงเหลือ</th>
              <th className="px-4 py-3 text-left">วันที่คืน</th>
              <th className="px-4 py-3 text-center">สถานะ</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-gray-400 text-sm dark:text-gray-300"
                >
                  📭 ไม่มีรายการใบยืมอุปกรณ์ในตอนนี้
                </td>
              </tr>
            ) : (
              [...paginatedOrders]
                .sort((a, b) => {
                  if (a.status !== "done" && b.status === "done") return -1;
                  if (a.status === "done" && b.status !== "done") return 1;
                  return (
                    new Date(b.borrow_date).getTime() -
                    new Date(a.borrow_date).getTime()
                  );
                })
                .map((order, index) => {
                  const daysLeft = order.return_due_date
                    ? Math.ceil(
                        (new Date(order.return_due_date).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : null;

                  return (
                    <tr
                      key={index}
                      className={cn(
                        "hover:bg-blue-50 transition-colors duration-200 dark:hover:bg-gray-700",
                        order.status === "done" &&
                          "bg-green-50 dark:bg-gray-700"
                      )}
                    >
                      <td className="px-5 py-3 text-gray-800 font-semibold text-center w-12 dark:text-white">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700 max-w-xs truncate dark:text-white">
                        {order.accounts.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700 max-w-[120px] text-center dark:text-white">
                        {order.borrow_date ? (
                          <span>{formatThaiDate(order.borrow_date)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-medium whitespace-nowrap text-center max-w-[120px] dark:text-blue-700">
                        {order.return_due_date ? (
                          <span>{formatThaiDate(order.return_due_date)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-center max-w-[100px] dark:text-white">
                        {order.status === "done" ||
                        order.status === "rejected" ? (
                          <span className="text-gray-400">-</span>
                        ) : daysLeft !== null ? (
                          <span
                            className={cn(
                              "font-semibold",
                              daysLeft < 0
                                ? "text-red-600"
                                : daysLeft <= 3
                                  ? "text-yellow-600"
                                  : "text-green-700"
                            )}
                          >
                            {daysLeft} วัน
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-center max-w-[120px] dark:text-green-700">
                        {order.return_completed_at ? (
                          <span className="text-green-600 font-semibold">
                            {formatThaiDate(order.return_completed_at)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center max-w-[130px]">
                        <span
                          className={cn(
                            "inline-block px-3 py-1 rounded-full text-xs font-semibold select-none",
                            order.status === "borrowed"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "returned"
                                ? "bg-green-100 text-green-800"
                                : order.status === "done"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : order.status === "pending"
                                      ? "bg-purple-100 text-purple-800"
                                      : order.status === "partially_returned"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-gray-100 text-gray-800"
                          )}
                        >
                          {order.status === "borrowed"
                            ? "กำลังยืม"
                            : order.status === "returned"
                              ? "คืนแล้ว"
                              : order.status === "partially_returned"
                                ? "คืนอุปกรณ์ไม่ครบ"
                                : order.status === "done"
                                  ? "เสร็จสิ้น"
                                  : order.status === "rejected"
                                    ? "ยกเลิก"
                                    : order.status === "pending"
                                      ? "รอดำเนินการ"
                                      : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center w-28">
                        <button
                          aria-label={`ดูรายละเอียดคำสั่งที่ ${
                            startIndex + index + 1
                          }`}
                          className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md"
                          onClick={() => hanldeDetailClick(order)}
                          type="button"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>

        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>

      <div className="sm:hidden space-y-4">
        {paginatedOrders.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-6 dark:text-gray-300">
            📭 ไม่มีรายการใบยืมอุปกรณ์ในตอนนี้
          </div>
        ) : (
          paginatedOrders.map((order, index) => {
            const dueDate = order.return_due_date
              ? new Date(order.return_due_date)
              : null;
            const today = new Date();
            const daysLeft = dueDate
              ? Math.ceil(
                  (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <div
                key={order.id}
                className="relative bg-white border border-gray-200 rounded-xl shadow-md px-4 py-4 space-y-3 transition hover:shadow-lg dark:bg-gray-800 dark:border-gray-700"
              >
                {/* Top bar */}
                <div className="absolute top-0 left-0 h-1 w-full rounded-t-xl bg-blue-500" />

                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      หมายเลข
                    </span>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      #{startIndex + index + 1}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      👤 ผู้ยืม:
                    </span>
                    <span className="font-medium dark:text-white">
                      {order.accounts.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      📅 ยืม:
                    </span>
                    <span className="font-medium dark:text-white">
                      {format(new Date(order.borrow_date), "dd MMM yyyy", {
                        locale: th,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      📆 กำหนดคืน:
                    </span>
                    <span className="text-blue-600 font-medium">
                      {order.return_due_date
                        ? format(
                            new Date(order.return_due_date),
                            "dd MMM yyyy",
                            {
                              locale: th,
                            }
                          )
                        : "-"}
                    </span>
                  </div>
                  {order.status !== "done" && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        ⏳ วันคงเหลือ:
                      </span>
                      {daysLeft !== null ? (
                        <span
                          className={cn(
                            "font-semibold",
                            daysLeft < 0
                              ? "text-red-500"
                              : daysLeft <= 3
                                ? "text-yellow-500"
                                : "text-green-600"
                          )}
                        >
                          {daysLeft} วัน
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      ✅ คืนจริง:
                    </span>
                    <span className="font-medium dark:text-white">
                      {order.return_completed_at
                        ? format(
                            new Date(order.return_completed_at),
                            "dd MMM yyyy",
                            {
                              locale: th,
                            }
                          )
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* Button */}
                <Button
                  className="cursor-pointer w-full mt-2 text-sm bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition dark:bg-blue-400 dark:text-white dark:hover:bg-blue-500"
                  onClick={() => hanldeDetailClick(order)}
                >
                  ดูรายละเอียด
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
