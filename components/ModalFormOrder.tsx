"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { useNotify } from "@/hooks/notify-system";

type items = {
  id: string;
  asset_number: string;
  asset_name: string;
  asset_location: string | null;
  scannedId?: string;
  status: "available" | "borrowed" | "repair";
  image?: string;
};

type Order = {
  borrower: string;
  email: string;
  phone: string;
  team: string;
  borrowed_at: string;
  returned_at: string;
  items_count: number;
  status: "borrow" | "return";
  note: string;
  updated_at: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const { notify } = useNotify();
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
    setIsLoading(true);
    if (!user) {
      setIsLoading(false);
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const order: Order = {
      borrower: user?.name?.toUpperCase() || "UNKNOWN",
      email: user?.email || "unknown@example.com",
      phone: user?.phone_number || "-",
      team: user?.team?.toUpperCase() || "-",
      borrowed_at: new Date(borrowDate).toLocaleString("th-TH"),
      returned_at: new Date(returnDate).toLocaleString("th-TH"),
      items_count: scannedAssets.length,
      status: status,
      note: notes,
      updated_at: new Date().toLocaleString("th-TH"),
    };

    const form = new FormData();

    if (status === "borrow") {
      if (!borrowDate || !returnDate) {
        setIsLoading(false);
        toast.warning("กรุณากรอกวันที่ยืมและกำหนดคืน");
        setIsLoading(false);
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
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1.5, // ไม่ควรเกิน 1.5MB ถ้าอยากคุณภาพสูงหน่อย
          maxWidthOrHeight: 1024, // ปรับขนาดไม่ให้ใหญ่เกินไป
          useWebWorker: true,
        });

        if (compressedFile.size > 5 * 1024 * 1024) {
          toast.error("รูปภาพหลังบีบอัดยังใหญ่เกิน 5MB");
          setIsLoading(false);
          return;
        }
        form.append("summary_image", compressedFile);
      } catch (error) {
        console.error("Error compressing image", error);
        toast.error("บีบอัดรูปไม่สำเร็จ");
        setIsLoading(false);
        return;
      }
    } else {
      toast.error("กรุณาถ่ายรูปทุกครั้ง");
      return;
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
        notify(order);
        setFile(null);
        setPreviewUrl("");
        setBorrowDate("");
        setReturnDate("");
        setFormData([]);
        refreshAssets();
        setIsLoading(false);
        handleClose();
      } else {
        setIsLoading(false);
        console.error("เกิดข้อผิดพลาด:", result);
        toast.error(`Error : ${result.message} Status : ${res.status}`);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("เกิดข้อผิดพลาด:", error);
      toast.error(`Error : ${error}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50 p-2 sm:p-6 print:p-0">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg ring-1 ring-gray-300 text-gray-900">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-center border-b pb-3">
          แบบฟอร์มยืนยันข้อมูลอุปกรณ์
        </h2>

        {/* ข้อมูลผู้ใช้ */}
        <section className="mb-5 text-gray-800 text-sm space-y-1">
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
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {/* วันที่ยืม */}
              <label className="flex flex-col w-full">
                <span className="text-sm font-medium text-gray-700 mb-1">
                  วันที่ยืม
                </span>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </label>

              {/* กำหนดคืน */}
              <label className="flex flex-col w-full">
                <span className="text-sm font-medium text-gray-700 mb-1">
                  กำหนดคืน
                </span>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </label>
            </div>
          )}
        </section>

        {/* รายการอุปกรณ์ */}
        <ul className="space-y-3">
          {formData.map((asset, index) => (
            <li
              key={asset.asset_number + "-" + index}
              className="flex items-center gap-4 p-3 rounded-md bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-sm"
            >
              <div className="w-14 h-14 rounded-md overflow-hidden bg-white border shadow-inner flex-shrink-0">
                <Image
                  src={asset.image ?? "/part1.jpg"}
                  alt={asset.asset_number}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>#{index + 1}</span>
                  <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
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

        {/* อัปโหลดภาพ */}
        <div className="mt-6">
          {!previewUrl && (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="camera-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">คลิ๊กเพื่ออีพโหลด</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SVG, PNG, JPG or GIF (ขนาดสูงสุด. 5mb)
                  </p>
                </div>
                <input
                  id="camera-upload"
                  accept="image/*"
                  capture="environment"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {previewUrl && (
            <div className="mt-4 border-t pt-4 relative">
              <label className="font-medium mb-1 block">รูปภาพตัวอย่าง:</label>
              <Image
                width={192}
                height={192}
                loading="lazy"
                src={previewUrl}
                alt="Preview"
                className="w-48 h-48 object-cover rounded mx-auto"
              />
              <button
                type="button"
                onClick={handleFileRemove}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <X />
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                กรุณาอัปโหลดรูปที่ชัดเจน
              </p>
            </div>
          )}
        </div>

        {/* หมายเหตุ */}
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
          />
        </div>

        {/* ปุ่ม */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            type="button"
            disabled={isLoading}
            className="px-5 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            disabled={isLoading}
            className="px-6 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                กำลังส่ง...
              </>
            ) : (
              "ส่งข้อมูล"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
