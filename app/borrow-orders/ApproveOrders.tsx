"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { useNotify } from "@/hooks/notify-approve";
import Image from "next/image";
import Link from "next/link";

type OrderItem = {
  id: string;
  status: string;
  asset: {
    asset_number: string;
    asset_name: string;
  };
};

export type NotifyPayload = {
  status: "approve" | "reject";
  borrower: string;
  reason: string;
  updated_at: string;
};

type Order = {
  id: string;
  status: string;
  type: string;
  borrow_date: string;
  notes: string;
  borrow_images: string;
  return_images: string;
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
  const { notify } = useNotify();

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

    try {
      const res = await fetch("/api/borrow/approve-order", {
        method: "POST",
        body: JSON.stringify({
          order_id: id,
          action,
          type,
          checkStatus: checkedItems[id],
          note: orderNotes[id] || "",
          borrow_items: orders.find((o) => o.id === id)?.borrow_items || [],
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        fetchOrders();
        notify({
          status: action,
          borrower: orders.find((o) => o.id === id)?.borrower.id || "",
          reason: orderNotes[id] || "",
          updated_at: new Date().toLocaleString("th-TH"),
        });
      } else {
        toast.error(result.message);
      }
    } catch (error: unknown) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      console.log(error);
    } finally {
      setIsLoading(false);
      setIsLoading2(false);
    }
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
              className="border border-gray-200 rounded-2xl shadow-sm p-5 bg-white hover:shadow-lg transition-all duration-200 space-y-5"
            >
              {/* ✅ Header */}
              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
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
              </div>

              {/* ✅ รายละเอียดคำขอ */}
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 text-sm text-gray-700">
                <div className="space-y-1">
                  <p>
                    👤 <strong>ผู้ยืม:</strong>{" "}
                    {order.borrower?.name || "ไม่ระบุ"}
                  </p>
                  <p>
                    📧 <strong>อีเมล:</strong>{" "}
                    {order.borrower?.email || "ไม่ระบุ"}
                  </p>
                  <p>
                    📅 <strong>ยืม:</strong>{" "}
                    {format(new Date(order.borrow_date), "dd MMM yyyy", {
                      locale: th,
                    })}
                  </p>
                  <p>
                    📅 <strong>คืน:</strong>{" "}
                    {format(new Date(order.return_due_date), "dd MMM yyyy", {
                      locale: th,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 italic bg-gray-50 rounded p-3 border border-gray-200">
                    💬 หมายเหตุ: {order.notes || "-"}
                  </p>
                </div>
              </div>

              {/* ✅ รูปภาพ */}
              {(order.borrow_images || order.return_images) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                  {order.borrow_images && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        📸 รูปตอนยืม
                      </p>
                      <Link href={order.borrow_images} target="_blank">
                        <Image
                          width={160}
                          height={160}
                          src={order.borrow_images}
                          alt="รูปตอนยืม"
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                      </Link>
                    </div>
                  )}
                  {order.return_images && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        📸 รูปตอนคืน
                      </p>
                      <Link href={order.return_images} target="_blank">
                        <Image
                          width={160}
                          height={160}
                          src={order.return_images}
                          alt="รูปตอนคืน"
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ ตารางอุปกรณ์ */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-left">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">รหัสอุปกรณ์</th>
                      <th className="px-4 py-2">ชื่ออุปกรณ์</th>
                      <th className="px-4 py-2">สถานะ</th>
                      <th className="px-4 py-2">ตรวจสอบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-gray-800">
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
                        <td className="px-4 py-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <label className="inline-flex items-center gap-1">
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
                            <label className="inline-flex items-center gap-1">
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

              {/* ✅ หมายเหตุเพิ่มเติม */}
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

              {/* ✅ ปุ่มอนุมัติ */}
              {order.status === "pending" ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-end mt-2">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow transition"
                    disabled={isLoading}
                    onClick={() =>
                      updateOrderStatus(order.id, "approve", order.type)
                    }
                  >
                    {isLoading ? "⏳ กําลังอนุมัติ..." : "✅ อนุมัติทั้งชุด"}
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm shadow transition"
                    disabled={isLoading2}
                    onClick={() =>
                      updateOrderStatus(order.id, "reject", order.type)
                    }
                  >
                    {isLoading2 ? "⏳ กําลังปฏิเสธ..." : "❌ ปฏิเสธทั้งชุด"}
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
