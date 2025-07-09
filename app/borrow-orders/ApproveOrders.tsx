"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { th } from "date-fns/locale";

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
    if (action === "approve") {
      const allChecked = Object.values(checkedItems[id] || {}).every(
        (v) => v.status === "normal" || v.status === "damaged"
      );
      if (!allChecked) {
        alert(
          "กรุณาเลือกสถานะตรวจสอบ (ปกติ หรือ เสียหาย) ของอุปกรณ์ทุกชิ้นก่อนอนุมัติ"
        );
        return;
      }
    }

    await fetch("/api/borrow/approve-order", {
      method: "POST",
      body: JSON.stringify({
        order_id: id,
        action,
        type,
        checkStatus: checkedItems[id],
        note: orderNotes[id] || "",
      }),
    });
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        📋 รายการใบคำขอยืมที่รออนุมัติ
      </h1>

      {loading ? (
        <p className="text-gray-500">⏳ กำลังโหลด...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">ไม่มีใบคำขอที่รออนุมัติ</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl shadow-sm p-5 bg-white"
            >
              {/* ข้อมูลคำขอ */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                <div className="space-y-1 text-gray-700">
                  <p className="font-semibold text-lg">
                    📌 คำขอ #{index + 1} - (
                    <span
                      className={`font-bold mx-1 ${
                        order.type === "borrowed"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.type === "borrowed" ? "ยืม" : "คืน"}
                    </span>
                    )
                  </p>
                  <p className="text-sm flex flex-wrap gap-4 text-gray-600">
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
                  </p>
                  <p className="text-sm flex flex-wrap gap-4 text-gray-600">
                    <span>
                      📅 ยืม:{" "}
                      {format(new Date(order.borrow_date), "dd MMMM yyyy", {
                        locale: th,
                      })}
                    </span>
                    <span>
                      📅 คืน:{" "}
                      {format(new Date(order.return_due_date), "dd MMMM yyyy", {
                        locale: th,
                      })}
                    </span>
                  </p>
                </div>
              </div>

              {/* ตารางอุปกรณ์ */}
              <div className="overflow-x-auto rounded-lg border mb-4">
                <table className="min-w-full text-sm text-gray-800">
                  <thead className="bg-gray-50 border-b text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">รหัสอุปกรณ์</th>
                      <th className="px-4 py-2 text-left">ชื่ออุปกรณ์</th>
                      <th className="px-4 py-2 text-left">สถานะ</th>
                      <th className="px-4 py-2 text-left">ตรวจสอบ</th>
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
                        <td className="px-4 py-2 space-x-4">
                          <label className="inline-flex items-center space-x-1 cursor-pointer">
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

                          <label className="inline-flex items-center space-x-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`check_${order.id}_${item.id}`}
                              className="accent-red-600"
                              checked={
                                checkedItems[order.id]?.[item.id]?.status ===
                                "damaged"
                              }
                              onChange={() =>
                                toggleCheckStatus(order.id, item.id, "damaged")
                              }
                            />
                            <span>เสียหาย</span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* หมายเหตุรวมของ order */}
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
              {order.status && order.status === "pending" ? (
                <div className="mt-4 flex gap-2 justify-end">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() =>
                      updateOrderStatus(order.id, "approve", order.type)
                    }
                  >
                    ✅ อนุมัติทั้งชุด
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      updateOrderStatus(order.id, "reject", order.type)
                    }
                  >
                    ❌ ปฏิเสธทั้งชุด
                  </Button>
                </div>
              ) : (
                <div className="mt-4 text-right text-sm text-red-600 font-medium">
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
