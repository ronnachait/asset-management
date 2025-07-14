"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";

type OrderItem = {
  id: string;
  status: string;
  asset: {
    asset_number: string;
    asset_name: string;
  };
};

type Order = {
  id: string;
  status: string;
  type: string;
  borrow_date: string;
  return_due_date: string;
  created_at: string;
  borrow_items: OrderItem[];
  borrower: {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    team: string | null;
  };
};

type CheckItem = {
  status: "normal" | "damaged" | "";
};

export default function ApproveOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [checkedItems, setCheckedItems] = useState<
    Record<string, Record<string, CheckItem>>
  >({});

  // state ใหม่เก็บหมายเหตุรวมแต่ละ order
  const [orderNotes, setOrderNotes] = useState<Record<string, string>>({});

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/borrow/pending-orders");
    const data: Order[] = await res.json();
    setOrders(data);

    const initialChecked: Record<string, Record<string, CheckItem>> = {};
    data.forEach((order) => {
      initialChecked[order.id] = {};
      order.borrow_items.forEach((item) => {
        initialChecked[order.id][item.id] = { status: "" };
      });
    });
    setCheckedItems(initialChecked);

    // เคลียร์หมายเหตุตอนโหลดใหม่
    setOrderNotes({});

    setLoading(false);
  };

  const updateOrderStatus = async (
    id: string,
    action: "approve" | "reject",
    type: string
  ) => {
    if (action === "reject") {
      setIsLoading2(true);
    } else {
      setIsLoading(true);
    }

    if (action === "approve") {
      const allChecked = Object.values(checkedItems[id] || {}).every(
        (v) => v.status === "normal" || v.status === "damaged"
      );
      if (!allChecked) {
        toast.error("กรุณาเลือกสถานะตรวจสอบ (ปกติ หรือ เสียหาย) ของอุปกรณ์");
        setIsLoading(false);
        return;
      }
    }

    const res = await fetch("/api/borrow/approve-order", {
      method: "POST",
      body: JSON.stringify({
        order_id: id,
        action,
        type,
        checkStatus: checkedItems[id],
        note: orderNotes[id] || "",
      }),
    });

    const result = await res.json();
    if (res.ok) {
      toast.success(result.message);
      fetchOrders();
    } else {
      toast.error(result.message);
    }
    if (action === "reject") {
      setIsLoading2(true);
    } else {
      setIsLoading(true);
    }

    fetchOrders();
  };

  const toggleCheckStatus = (
    orderId: string,
    itemId: string,
    status: "normal" | "damaged"
  ) => {
    setCheckedItems((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [itemId]: { status },
      },
    }));
  };

  const updateOrderNote = (orderId: string, note: string) => {
    setOrderNotes((prev) => ({ ...prev, [orderId]: note }));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {loading ? (
        <p className="text-gray-500 text-center">⏳ กำลังโหลด...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400 text-center">ไม่มีใบคำขอที่รออนุมัติ</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl shadow-md p-5 bg-white space-y-4"
            >
              {/* 🔹 ส่วนข้อมูลคำขอ */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="text-gray-700 space-y-1">
                  <h2 className="text-lg font-semibold text-blue-700">
                    📌 คำขอ #{index + 1} -{" "}
                    <span
                      className={`inline-block font-bold ${
                        order.type === "borrowed"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.type === "borrowed" ? "ยืม" : "คืน"}
                    </span>
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>
                      👤 ผู้ยืม:{" "}
                      <span className="font-medium">
                        {order.borrower?.name || "ไม่ระบุ"}
                      </span>
                    </span>
                    <span>
                      📧 อีเมล:{" "}
                      <span className="font-medium">
                        {order.borrower?.email || "ไม่ระบุ"}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>
                      📅 ยืม:{" "}
                      {format(new Date(order.borrow_date), "dd MMM yyyy", {
                        locale: th,
                      })}
                    </span>
                    <span>
                      📅 คืน:{" "}
                      {format(new Date(order.return_due_date), "dd MMM yyyy", {
                        locale: th,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* 🔹 ตารางอุปกรณ์ */}
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full text-sm text-gray-800">
                  <thead className="bg-gray-50 border-b text-gray-600 text-left">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">รหัสอุปกรณ์</th>
                      <th className="px-4 py-2">ชื่ออุปกรณ์</th>
                      <th className="px-4 py-2">สถานะ</th>
                      <th className="px-4 py-2">ตรวจสอบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.borrow_items.map((item, i) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{i + 1}</td>
                        <td className="px-4 py-2">
                          {item.asset?.asset_number ?? "-"}
                        </td>
                        <td className="px-4 py-2">
                          {item.asset?.asset_name ?? "-"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              item.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.status === "borrowed"
                                ? "bg-blue-100 text-blue-800"
                                : item.status === "returned"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 space-y-1 min-w-[140px]">
                          <div className="flex gap-2">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`check_${order.id}_${item.id}`}
                                className="accent-green-600"
                                checked={
                                  checkedItems[order.id]?.[item.id]?.status ===
                                  "normal"
                                }
                                onChange={() =>
                                  toggleCheckStatus(order.id, item.id, "normal")
                                }
                              />
                              <span>ปกติ</span>
                            </label>

                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`check_${order.id}_${item.id}`}
                                className="accent-red-600"
                                checked={
                                  checkedItems[order.id]?.[item.id]?.status ===
                                  "damaged"
                                }
                                onChange={() =>
                                  toggleCheckStatus(
                                    order.id,
                                    item.id,
                                    "damaged"
                                  )
                                }
                              />
                              <span>เสียหาย</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 🔹 หมายเหตุ */}
              <div>
                <label
                  htmlFor={`note_${order.id}`}
                  className="block mb-1 font-medium text-gray-700"
                >
                  หมายเหตุเพิ่มเติม
                </label>
                <textarea
                  id={`note_${order.id}`}
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm resize-y"
                  placeholder="ใส่หมายเหตุเพิ่มเติมเกี่ยวกับคำขอนี้ (ถ้ามี)"
                  value={orderNotes[order.id] || ""}
                  onChange={(e) => updateOrderNote(order.id, e.target.value)}
                />
              </div>

              {/* 🔹 ปุ่มการอนุมัติ */}
              {order.status === "pending" ? (
                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow cursor-pointer"
                    disabled={isLoading}
                    onClick={() =>
                      updateOrderStatus(order.id, "approve", order.type)
                    }
                  >
                    {isLoading ? (
                      <span>⏳ กําลังอนุมัติ...</span>
                    ) : (
                      "✅ อนุมัติทั้งชุด"
                    )}
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm shadow cursor-pointer"
                    disabled={isLoading2}
                    onClick={() =>
                      updateOrderStatus(order.id, "reject", order.type)
                    }
                  >
                    {isLoading2 ? (
                      <span>⏳ กําลังปฏิเสธ...</span>
                    ) : (
                      "❌ ปฏิเสธทั้งชุด"
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-sm text-red-600 font-medium text-right">
                  ❗ ไม่สามารถอนุมัติได้ เพราะยังคืนอุปกรณ์ไม่ครบ
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
