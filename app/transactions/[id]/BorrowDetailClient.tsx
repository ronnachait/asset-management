"use client";
import { Archive, ArchiveRestore } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

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
  return_images?: string | null;
  status:
    | "borrowed"
    | "returned"
    | "done"
    | "rejected"
    | "pending"
    | "partially_returned";
  borrow_items: BorrowItem[];
};
export default function BorrowDetailClient({ OrderId }: { OrderId: string }) {
  const [orders, setOrders] = useState<BorrowOrder | null>(null);
  const router = useRouter();
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

  // ฟังก์ชันช่วยฟอร์แมตวันที่แบบไทย
  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMM yyyy ", { locale: th });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-gray-50 rounded-xl shadow-md space-y-8 dark:bg-gray-800">
      {/* 🔙 ปุ่มย้อนกลับ */}
      <button
        onClick={() => router.push("/borrow-items")}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-lg hover:bg-blue-200 transition mb-4 shadow-sm cursor-pointer dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800"
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

      <h1 className="text-2xl font-bold text-blue-700 border-b pb-4 md:text-3xl dark:text-blue-300">
        รายละเอียดคำสั่งยืมอุปกรณ์
      </h1>

      {/* ข้อมูลผู้ยืม */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-all">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
          👤 ข้อมูลผู้ยืม
        </h2>

        <div className="grid sm:grid-cols-2 gap-5 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          <div className="space-y-1">
            <p className="font-medium text-gray-500 dark:text-gray-400">ชื่อ</p>
            <p className="text-gray-800 dark:text-gray-100">{accounts.name}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-500 dark:text-gray-400">
              อีเมล
            </p>
            <p className="text-gray-800 dark:text-gray-100">{accounts.email}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-500 dark:text-gray-400">ทีม</p>
            <p className="text-gray-800 dark:text-gray-100">{accounts.team}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-500 dark:text-gray-400">
              เบอร์โทร
            </p>
            <p className="text-gray-800 dark:text-gray-100">
              {accounts.phone_number}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-all">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
          📅 รายละเอียดการยืม
        </h2>

        <div className="grid sm:grid-cols-2 gap-5 text-sm sm:text-base text-gray-800 dark:text-gray-300">
          {/* วันที่ยืม */}
          <div className="flex items-center gap-2">
            <span className="text-blue-500">📅</span>
            <p>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                วันที่ยืม:
              </span>{" "}
              {formatThaiDate(borrow_date)}
            </p>
          </div>

          {/* กำหนดคืน */}
          <div className="flex items-center gap-2">
            <span className="text-green-500">📆</span>
            <p>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                กำหนดคืน:
              </span>{" "}
              {return_due_date ? formatThaiDate(return_due_date) : "-"}
            </p>
          </div>

          {/* วันที่คืนจริง */}
          <div className="flex items-center gap-2">
            <span className="text-purple-500">✅</span>
            <p>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                วันที่คืนจริง:
              </span>{" "}
              {return_completed_at ? formatThaiDate(return_completed_at) : "-"}
            </p>
          </div>

          {/* สถานะ */}
          <div className="flex items-center gap-2">
            <span className="text-indigo-500">📌</span>
            <p className="flex items-center gap-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                สถานะ:
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full font-medium text-sm
                ${
                  status === "done"
                    ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100"
                    : status === "borrowed"
                    ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100"
                    : status === "rejected"
                    ? "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100"
                    : status === "returned"
                    ? "bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100"
                    : status === "partially_returned"
                    ? "bg-orange-200 text-orange-800 dark:bg-orange-700 dark:text-orange-100"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                }`}
              >
                {status === "done"
                  ? "เสร็จสิ้น"
                  : status === "borrowed"
                  ? "กำลังยืม"
                  : status === "rejected"
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
      </div>

      {orders.borrow_images && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-all">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
            🖼️ ภาพถ่ายก่อนยืม / คืน
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* ภาพก่อนยืม */}
            {orders.borrow_images.split(",").map((url, index) => (
              <div
                key={index}
                className="relative w-full h-60 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Image
                  src={url.trim() || "/image-not-found.png"}
                  alt={`Borrow Image ${index + 1}`}
                  fill
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/image-not-found.png";
                  }}
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={index === 0}
                />
                <div className="absolute top-2 right-2 text-white bg-blue-600 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow">
                  <Archive className="w-4 h-4" />
                  ยืม
                </div>
              </div>
            ))}

            {/* ภาพตอนคืน */}
            {orders.return_images &&
              orders.return_images
                .split(",")
                .filter((url) => url.trim())
                .map((url, index) => (
                  <div
                    key={`return-${index}`}
                    className="relative w-full h-60 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <Image
                      src={url.trim() || "/image-not-found.png"}
                      alt={`Return Image ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute top-2 right-2 text-white bg-amber-600 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow">
                      <ArchiveRestore className="w-4 h-4" />
                      คืน
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* รายการอุปกรณ์ */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-all">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
          📋 รายการอุปกรณ์ที่ยืม
        </h2>

        <ul className="space-y-4">
          {borrow_items.map((item: BorrowItem, index: number) => (
            <li
              key={index}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 dark:border-gray-700"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {item.asset?.asset_name || "-"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  รหัส: {item.asset?.asset_number || "-"}
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    item.status === "returned"
                      ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100"
                      : item.status === "borrowed"
                      ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100"
                      : item.status === "pending"
                      ? "bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100"
                      : item.status === "repair"
                      ? "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100"
                      : item.status === "rejected"
                      ? "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100"
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
                    : item.status === "rejected"
                    ? "ยกเลิก"
                    : "ยังไม่คืน"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* หมายเหตุ */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-all">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
          📝 หมายเหตุ
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          {notes || "ไม่มีหมายเหตุ"}
        </p>
      </div>
    </div>
  );
}
