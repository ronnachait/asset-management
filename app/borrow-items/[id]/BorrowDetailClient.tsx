"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    | "cancelled"
    | "pending"
    | "partially_returned";
  borrow_items: BorrowItem[];
};

export default function BorrowDetailClient({ OrderId }: { OrderId: string }) {
  const router = useRouter();
  const [orders, setOrders] = useState<BorrowOrder | null>(null);

  useEffect(() => {
    const fetchOrdersById = async () => {
      const res = await fetch(`/api/borrow-order?id=${OrderId}`);
      const result = await res.json();
      if (res.ok) setOrders(result.data);
      else console.error(result.message);
    };
    fetchOrdersById();
  }, [OrderId]);

  if (!orders)
    return (
      <div className="p-8 text-center text-gray-500 text-lg animate-pulse">
        กำลังโหลดข้อมูลคำสั่งยืม...
      </div>
    );

  const {
    accounts,
    borrow_date,
    return_due_date,
    return_completed_at,
    status,
    borrow_items,
    notes,
  } = orders;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-gray-50 rounded-xl shadow-md space-y-8">
      {/* 🔙 ปุ่มย้อนกลับ */}
      <button
        onClick={() => router.push("/borrow-items")}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-lg hover:bg-blue-200 transition mb-4 shadow-sm cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        ย้อนกลับ
      </button>

      <h1 className="text-3xl font-bold text-blue-700 border-b pb-4">
        รายละเอียดคำสั่งยืมอุปกรณ์
      </h1>

      {/* ข้อมูลผู้ยืม */}
      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
          👤 ข้อมูลผู้ยืม
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-gray-800">
          <p>
            <strong>ชื่อ:</strong> {accounts.name}
          </p>
          <p>
            <strong>อีเมล:</strong> {accounts.email}
          </p>
          <p>
            <strong>ทีม:</strong> {accounts.team}
          </p>
          <p>
            <strong>เบอร์โทร:</strong> {accounts.phone_number}
          </p>
        </div>
      </div>

      {/* รายละเอียดการยืม */}
      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
          📅 รายละเอียดการยืม
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-gray-800">
          <p>
            <strong>วันที่ยืม:</strong> {new Date(borrow_date).toLocaleString()}
          </p>
          <p>
            <strong>กำหนดคืน:</strong>{" "}
            {return_due_date ? new Date(return_due_date).toLocaleString() : "-"}
          </p>
          <p>
            <strong>วันที่คืนจริง:</strong>{" "}
            {return_completed_at
              ? new Date(return_completed_at).toLocaleString()
              : "-"}
          </p>
          <p>
            <strong>สถานะ:</strong>{" "}
            <span
              className={`px-3 py-1 rounded-full font-medium ${
                status === "done"
                  ? "bg-green-200 text-green-800"
                  : status === "borrowed"
                  ? "bg-yellow-200 text-yellow-800"
                  : status === "cancelled"
                  ? "bg-red-200 text-red-800"
                  : status === "partially_returned"
                  ? "bg-orange-200 text-orange-800"
                  : "bg-blue-200 text-blue-800"
              }`}
            >
              {status === "done"
                ? "เสร็จสิ้น"
                : status === "borrowed"
                ? "กำลังยืม"
                : status === "cancelled"
                ? "ยกเลิก"
                : status === "returned"
                ? "คืนแล้ว"
                : status === "pending"
                ? "รอดำเนินการ"
                : status === "partially_returned"
                ? "คืนอุปกรณ์ไม่ครบ"
                : "กำลังดำเนินการ"}
            </span>
          </p>
        </div>
      </div>
      {/* รูปภาพประกอบ */}
      {/* ภาพถ่ายก่อนยืม */}
      {orders.borrow_images && (
        <div className="bg-white p-5 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
            🖼️ ภาพถ่ายก่อนยืม
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {orders.borrow_images.split(",").map((url, index) => (
              <div
                key={index}
                className="relative w-full h-60 rounded-lg overflow-hidden border shadow-sm"
              >
                <Image
                  src={url.trim()}
                  alt={`Borrow Image ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* รายการอุปกรณ์ */}
      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
          📋 รายการอุปกรณ์ที่ยืม
        </h2>
        <ul className="space-y-4">
          {borrow_items.map((item: BorrowItem, index: number) => (
            <li
              key={index}
              className="bg-gray-100 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {item.asset ? item.asset.asset_name : "-"}
                </p>
                <p className="text-sm text-gray-600">
                  รหัส: {item.asset ? item.asset.asset_number : "-"}
                </p>
              </div>
              <div>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    item.status === "returned"
                      ? "bg-green-200 text-green-800"
                      : item.status === "borrowed"
                      ? "bg-yellow-200 text-yellow-800"
                      : item.status === "pending"
                      ? "bg-blue-200 text-blue-800"
                      : item.status === "repair"
                      ? "bg-red-200 text-red-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {item.status === "returned"
                    ? "คืนแล้ว"
                    : item.status === "borrowed"
                    ? "กำลังยืม"
                    : item.status === "pending"
                    ? "รอดำเนินการ"
                    : item.status === "repair"
                    ? "อยู่ระหว่างซ่อม"
                    : "ยังไม่คืน"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* หมายเหตุ */}
      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
          📝 หมายเหตุ
        </h2>
        <p className="text-gray-700 mb-4">{notes || "ไม่มีหมายเหตุ"}</p>

        {/* <label htmlFor="noteInput" className="block text-sm text-gray-600 mb-2">
          หมายเหตุเพิ่มเติม:
        </label>
        <input
          id="noteInput"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="พิมพ์หมายเหตุเพิ่มเติม..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        /> */}
      </div>
    </div>
  );
}
