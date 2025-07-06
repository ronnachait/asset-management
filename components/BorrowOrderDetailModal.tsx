import {
  X,
  ClipboardList,
  User,
  CalendarDays,
  CheckCircle,
  Clock,
} from "lucide-react";

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
  status: "borrowed" | "returned" | "done" | "cancelled" | "pending" | "partially_returned";
  borrow_items: BorrowItem[];
};

export function BorrowOrderDetailModal({
  order,
  onClose,
}: {
  order: BorrowOrder;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-xl shadow-2xl p-6 relative animate-fade-in border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="text-blue-600 w-6 h-6" />
          <h3 className="text-xl font-semibold text-gray-800">
            รายละเอียดการยืม
          </h3>
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 text-gray-500">
              <User className="w-5 h-5" />
            </span>
            <span>
              <strong>ผู้ยืม:</strong> {order.accounts.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 text-gray-500">
              <CalendarDays className="w-5 h-5" />
            </span>
            <span>
              <strong>วันที่ยืม:</strong> {order.borrow_date}
            </span>
          </div>
          {order.return_due_date && (
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 text-gray-500">
                <CalendarDays className="w-5 h-5" />
              </span>
              <span>
                <strong>วันที่คืน:</strong>{" "}
                {order.return_completed_at || order.return_due_date}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 text-gray-500">
              {order.status === "returned" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-600" />
              )}
            </span>
            <span>
              <strong>สถานะ:</strong>
              <span
                className={
                  order.status === "returned"
                    ? "text-green-600"
                    : order.status === "borrowed"
                    ? "text-yellow-600"
                    : order.status === "pending"
                    ? "text-blue-600"
                    : "text-red-600"
                }
              >
                {order.status === "borrowed"
                  ? "กำลังยืม"
                  : order.status === "returned"
                  ? "คืนแล้ว"
                  : order.status === "pending"
                  ? "รอดำเนินการ"
                  : order.status === "done"
                  ? "เสร็จสิ้น"
                  : "ยกเลิก"}
                  {order.status}
              </span>
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">
            📦 รายการอุปกรณ์ที่ยืม
          </h4>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 max-h-64 overflow-y-auto pr-2">
            {order.borrow_items.map((item) => (
              <li key={item.id}>
                <strong>{item.asset?.asset_number}</strong> -{" "}
                {item.asset?.asset_name} -{" "}
                <span
                  className={
                    item.status === "borrowed"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }
                >
                  {item.status === "borrowed" ? "กำลังยืม" : "คืนแล้ว"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
