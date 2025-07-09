import React, { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { toast } from "sonner";
type items = {
  id: string;
  asset_number: string;
  asset_name: string;
  asset_location: string | null;
  scannedId?: string;
  status: "available" | "borrowed" | "repair";
  image?: string;
};

type ModalFormProps = {
  isOpen: boolean;
  onClose: () => void;
  scannedAssets: items[];
  status: "borrow" | "return";
  user: {
    name?: string;
    email?: string;
    team?: string;
    phone_number: string;
    access_level: string;
  } | null;
  refreshAssets: () => void;
};

type FormDataItem = {
  id: string;
  asset_number: string;
  asset_name: string;
  asset_location: string;
  scannedId: string;
  status: "available" | "borrowed" | "repair";
  image?: string;
  borrowImage?: File | null;
};

export default function ModalFormOrder({
  isOpen,
  onClose,
  status,
  scannedAssets,
  user,
  refreshAssets,
}: ModalFormProps) {
  const [formData, setFormData] = useState<FormDataItem[]>([]);
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    const data = scannedAssets.map((asset) => ({
      id: asset.id,
      asset_name: asset.asset_name,
      asset_number: asset.asset_number,
      asset_location: asset.asset_location ?? "",
      scannedId: asset.scannedId ?? "",
      status: asset.status,
      image: asset.image,
      borrowImage: null,
    }));
    setFormData(data);
    console.log("ข้อมูลอุปกรณ์ที่สแกน:", data);
  }, [scannedAssets]);

  // const handleBorrowImageChange = (
  //   e: ChangeEvent<HTMLInputElement>,
  //   index: number
  // ) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     setFormData((prev) => {
  //       const newData = [...prev];
  //       newData[index].borrowImage = file;
  //       return newData;
  //     });
  //   }
  // };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    setPreviewUrl("");
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl("");
    setBorrowDate("");
    setReturnDate("");
    onClose();
  };
  const handleSubmit = async () => {
    if (!user) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const form = new FormData();

    if (status === "borrow") {
      if (!borrowDate || !returnDate) {
        alert("กรุณากรอกวันที่ยืมและกำหนดคืน");
        return;
      }
      form.append("borrow_date", borrowDate);
      form.append("return_date", returnDate);
      form.append("notes", notes);
    }

    form.append("status", status);
    form.append("user_name", user.name || "");
    form.append("email", user.email || "");
    form.append("team", user.team || "");
    form.append("phone_number", user.phone_number);
    form.append("access_level", user.access_level);

    form.append(
      "assets",
      JSON.stringify(
        formData.map((asset) => ({
          id: asset.id,
          asset_number: asset.asset_number,
          asset_name: asset.asset_name,
          scannedId: asset.scannedId,
          asset_location: asset.asset_location,
          status: asset.status,
        }))
      )
    );

    formData.forEach((asset, index) => {
      if (asset.borrowImage) {
        form.append(`borrow_image_${index}`, asset.borrowImage);
        form.append(`borrow_image_id_${index}`, asset.id);
      }
    });

    if (file) {
      form.append("summary_image", file);
    }

    // กำหนด URL API ตามสถานะ
    const apiUrl =
      status === "borrow" ? "/api/borrow/create" : "/api/borrow/update";

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        body: form,
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("ทำรายการสำเร็จ");
        // รีเซ็ตข้อมูลหลังจากส่งสำเร็จ
        setFile(null);
        setPreviewUrl("");
        setBorrowDate("");
        setReturnDate("");
        setFormData([]);
        // เรียกฟังก์ชันรีเฟรชข้อมูลอุปกรณ์
        refreshAssets();
        // ปิด modal
        handleClose();
      } else {
        console.error("เกิดข้อผิดพลาด:", result);
        alert("ไม่สามารถส่งข้อมูลได้");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50 p-4 sm:p-8 print:p-0">
      <div className="bg-white rounded-lg p-6 sm:p-10 w-full max-w-4xl shadow-none ring-1 ring-gray-300 text-gray-900 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-center border-b pb-4">
          แบบฟอร์มยืนยันข้อมูลอุปกรณ์
        </h2>

        <section className="mb-8 text-gray-800 text-sm sm:text-base flex flex-col gap-2">
          <p>
            <span className="font-semibold">ผู้ยืมอุปกรณ์ :</span>{" "}
            {user?.name ?? "ไม่พบข้อมูลผู้ใช้"}
          </p>
          <p>
            <span className="font-semibold">อีเมล :</span>{" "}
            {user?.email ?? "ไม่พบข้อมูลอีเมล"}
          </p>
          <p>
            <span className="font-semibold">ทีม :</span>{" "}
            {user?.team?.toUpperCase() ?? "ไม่พบข้อมูลทีม"}
          </p>

          {status === "borrow" && (
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <label className="flex flex-col w-full max-w-xs">
                <span className="font-semibold mb-1">วันที่ยืม</span>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </label>
              <label className="flex flex-col w-full max-w-xs">
                <span className="font-semibold mb-1">กำหนดคืน</span>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </label>
            </div>
          )}
        </section>

        <ul className="space-y-4">
          {formData.map((asset, index) => (
            <li
              key={asset.asset_number + "-" + index}
              className="flex items-center gap-4 p-4 rounded-md shadow-md bg-gradient-to-br from-white to-blue-50 border border-blue-100 transition hover:shadow-lg"
            >
              {/* รูปภาพ */}
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-inner flex-shrink-0 bg-white">
                <Image
                  src={asset.image ?? "/part1.jpg"}
                  alt={`asset ${asset.asset_number}`}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* รายละเอียด */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-semibold">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {asset.asset_number}
                  </span>
                </div>

                <div className="text-sm font-semibold text-gray-800 truncate">
                  📦 {asset.asset_name}
                </div>
                <div className="text-xs text-gray-600 italic">
                  สถานะ: พร้อมใช้งาน
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <label className="font-medium mb-1 block">อัปโหลดรูปภาพ</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {previewUrl && (
            <div>
              <p className="text-xs text-gray-500 mt-2">
                รูปภาพที่อัปโหลดจะใช้เป็นหลักฐานการยืม กรุณาอัปโหลดรูปที่ชัดเจน
              </p>
              <div className="flex flex-col justify-center items-center mt-4 border-t p-4 shadow-sm relative">
                <label className="font-medium mb-1 block mt-4">
                  รูปภาพตัวอย่าง:
                </label>
                <Image
                  width={192}
                  height={192}
                  loading="lazy"
                  src={previewUrl}
                  alt="Preview"
                  className="mt-4 w-48 h-48 object-cover rounded"
                />
                <span
                  className="absolute right-2 top-2 text-red-500 hover:text-red-700 cursor-pointer"
                  onClick={handleFileRemove}
                >
                  <X />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <label htmlFor="note" className="font-medium mb-1 block">
            หมายเหตุเพิ่มเติม:
          </label>
          <textarea
            id="note"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="กรอกหมายเหตุเพิ่มเติม เช่น สภาพ, ปัญหาที่พบ ฯลฯ"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            rows={4}
            spellCheck={false}
          />
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-sm font-medium rounded border border-gray-300 hover:bg-gray-100 text-gray-700 cursor-pointer"
            type="button"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            type="button"
          >
            ส่งข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}
