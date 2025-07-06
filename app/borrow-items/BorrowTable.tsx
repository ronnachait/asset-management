"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
// Update the import path below to the correct relative path where BorrowOrderDetailModal is located

import { format } from "date-fns";
import { th } from "date-fns/locale"; // สำหรับภาษาไทย
// สำหรับการนำทางไปยังหน้ารายละเอียด
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "@/components/Pagination";
import { BorrowOrderDetailModal } from "@/components/BorrowOrderDetailModal";
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
  status:
    | "borrowed"
    | "returned"
    | "done"
    | "pending"
    | "partially_returned"
    | "cancelled";
  borrow_items: BorrowItem[];
};

export function BorrowTable() {
  const [orders, setOrders] = useState<BorrowOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedOrder, setSelectedOrder] = useState<BorrowOrder | null>(null);
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
    <div className="max-w-7xl w-full mx-auto px-6 py-6">
      <h2 className="text-xl font-bold mb-4 flex gap-2 items-center">
        <ClipboardList className="w-5 h-5" />
        รายการใบยืมอุปกรณ์
      </h2>
      <div className="overflow-x-auto rounded-md shadow border border-gray-300 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left uppercase">#</th>
              <th className="px-4 py-3 text-left uppercase">ผู้ยืม</th>
              <th className="px-4 py-3 text-left uppercase">วันที่ยืม</th>
              <th className="px-4 py-3 text-left uppercase">กำหนดคืน</th>
              <th className="px-4 py-3 text-left uppercase">วันคงเหลือ</th>
              <th className="px-4 py-3 text-left uppercase">วันที่คืน</th>
              <th className="px-4 py-3 text-center uppercase">Status</th>
              <th className="px-4 py-3 text-center uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
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
                .map((order, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "hover:bg-blue-50 transition-colors",
                      order.status === "done" && "bg-green-50"
                    )}
                  >
                    <td className="px-4 py-3 text-gray-800">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-700 flex items-center ">
                      {order.accounts.name}
                    </td>

                    {/* 📅 วันที่ยืม */}
                    <td className="px-4 py-3 text-gray-700">
                      {order.borrow_date ? (
                        <span className="whitespace-nowrap">
                          {format(new Date(order.borrow_date), "dd MMM yyyy", {
                            locale: th,
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* 📅 กำหนดคืน */}
                    <td className="px-4 py-3 text-gray-700">
                      {order.return_due_date ? (
                        <span className="whitespace-nowrap text-blue-600 font-medium">
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
                    {/* 📅 วันคงเหลือ */}
                    <td className="px-4 py-3 text-gray-700 flex items-center ">
                      {(order.status === "borrowed" ||
                        order.status === "pending" ||
                        order.status === "partially_returned") &&
                      order.return_due_date ? (
                        (() => {
                          const dueDate = new Date(order.return_due_date);
                          const today = new Date();
                          const daysLeft = Math.ceil(
                            (dueDate.getTime() - today.getTime()) /
                              (1000 * 60 * 60 * 24)
                          );

                          return (
                            <span
                              className={cn(
                                "whitespace-nowrap font-semibold",
                                daysLeft < 0
                                  ? "text-red-500"
                                  : daysLeft <= 3
                                  ? "text-yellow-500"
                                  : "text-green-600"
                              )}
                            >
                              {daysLeft} วัน
                            </span>
                          );
                        })()
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* 📅 คืนจริง / สถานะคืน */}
                    <td className="px-4 py-3 text-gray-700">
                      {order.return_completed_at ? (
                        <span className="whitespace-nowrap text-green-600 font-medium">
                          {format(
                            new Date(order.return_completed_at),
                            "dd MMM yyyy",
                            { locale: th }
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === "borrowed"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "returned"
                            ? "bg-green-100 text-green-800"
                            : order.status === "done"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : order.status === "pending"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "partially_returned"
                            ? "bg-orange-100 text-orange-800"
                            : ""
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
                          : order.status === "cancelled"
                          ? "ยกเลิก"
                          : order.status === "pending"
                          ? "รอดำเนินการ"
                          : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer"
                          onClick={() => hanldeDetailClick(order)}
                        >
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>

        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
        {selectedOrder && (
          <BorrowOrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
