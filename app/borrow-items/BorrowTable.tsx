"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { CalendarDays, ClipboardList } from "lucide-react";
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

  return (
    <div className="w-full px-4 py-6">
      <h2 className="text-xl font-bold mb-4 flex gap-2 items-center">
        <ClipboardList className="w-5 h-5" />
        รายการใบยืมอุปกรณ์
      </h2>
      <div className="w-full hidden sm:block overflow-x-auto rounded-md shadow border border-gray-300 bg-white">
        <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left uppercase">#</th>
              <th className="px-4 py-3 text-left uppercase">ผู้ยืม</th>
              <th className="px-4 py-3 text-left uppercase">วันที่ยืม</th>
              <th className="px-4 py-3 text-left uppercase">กำหนดคืน</th>
              <th className="px-4 py-3 text-left uppercase">วันคงเหลือ</th>
              <th className="px-4 py-3 text-left uppercase">วันที่คืน</th>
              <th className="px-4 py-3 text-center uppercase">สถานะ</th>
              <th className="px-4 py-3 text-center uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-gray-400 text-sm"
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
                        "hover:bg-blue-50 transition-colors",
                        order.status === "done" && "bg-green-50"
                      )}
                    >
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {order.accounts.name}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {order.borrow_date ? (
                          <span>
                            {format(
                              new Date(order.borrow_date),
                              "dd MMM yyyy",
                              {
                                locale: th,
                              }
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-medium whitespace-nowrap">
                        {order.return_due_date ? (
                          <span>
                            {format(
                              new Date(order.return_due_date),
                              "dd MMM yyyy",
                              {
                                locale: th,
                              }
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
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
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {order.return_completed_at ? (
                          <span className="text-green-600 font-medium">
                            {format(
                              new Date(order.return_completed_at),
                              "dd MMM yyyy",
                              {
                                locale: th,
                              }
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
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
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => hanldeDetailClick(order)}
                          >
                            ดูรายละเอียด
                          </Button>
                        </div>
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

      {/* Mobile Card Layout */}
      <div className="sm:hidden space-y-4">
        {paginatedOrders.map((order, index) => {
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
              className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-4 space-y-3"
            >
              {/* หัวบัตร */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">หมายเลขใบยืม</span>
                  <span className="text-lg font-bold text-blue-600">
                    #{startIndex + index + 1}
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
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
                  }`}
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
              </div>

              {/* ข้อมูลหลัก */}
              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500">👤 ผู้ยืม:</span>
                  <span className="text-gray-800">{order.accounts.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500">📅 ยืม:</span>
                  <span>
                    {order.borrow_date
                      ? format(new Date(order.borrow_date), "dd MMM yyyy", {
                          locale: th,
                        })
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500">
                    📆 กำหนดคืน:
                  </span>
                  <span className="text-blue-600 font-medium">
                    {order.return_due_date
                      ? format(new Date(order.return_due_date), "dd MMM yyyy", {
                          locale: th,
                        })
                      : "-"}
                  </span>
                </div>
                {order.status !== "done" && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-500">
                      ⏳ วันคงเหลือ:
                    </span>
                    {daysLeft !== null ? (
                      <span
                        className={`font-semibold ${
                          daysLeft < 0
                            ? "text-red-500"
                            : daysLeft <= 3
                            ? "text-yellow-500"
                            : "text-green-600"
                        }`}
                      >
                        {daysLeft} วัน
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500">✅ คืนจริง:</span>
                  <span>
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
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">สร้างเมื่อ:</span>
                  <span className="font-medium text-gray-800">
                    {order.created_at
                      ? format(new Date(order.created_at), "dd MMM yyyy", {
                          locale: th,
                        })
                      : "-"}
                  </span>
                  <span className="text-gray-400">
                    {order.created_at
                      ? format(new Date(order.created_at), "HH:mm น.", {
                          locale: th,
                        })
                      : ""}
                  </span>
                </div>
              </div>

              {/* ปุ่ม */}
              <Button
                className="w-full mt-3 text-sm bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                onClick={() => hanldeDetailClick(order)}
              >
                ดูรายละเอียด
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
