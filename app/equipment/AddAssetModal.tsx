"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  PackagePlus,
  ImagePlus,
  MapPin,
  BadgeInfo,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
type Asset = {
  asset_number: string;
  asset_name: string;
  asset_location: string;
  asset_image: File | null;
};

export default function AddAssetModal({
  onAdd,
}: {
  onAdd: (asset: Asset) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Asset>({
    asset_number: "",
    asset_name: "",
    asset_location: "",
    asset_image: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.asset_name || !form.asset_number)
      return toast.warning("กรุณากรอกข้อมูลให้ครบ");
    onAdd(form);
    const formData = new FormData();

    formData.append("asset_number", form.asset_number);
    formData.append("asset_name", form.asset_name);
    formData.append("asset_location", form.asset_location);

    if (form.asset_image) {
      formData.append("asset_image", form.asset_image);
    }

    const res = await fetch("/api/items-asset/item-add", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
      console.log(result.message);
      toast.error("Error :", result.message);
      return;
    }

    toast.success("สร้าง asset ใหม่สำเร็จ");
    setForm({
      asset_number: "",
      asset_name: "",
      asset_location: "",
      asset_image: null,
    });
    setPreviewUrl(null);
    setOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, asset_image: file });
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    console.log(form);
  }, [form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer gap-2 dark:bg-blue-500 dark:hover:bg-blue-600">
          <PackagePlus className="w-4 h-4" />
          เพิ่มอุปกรณ์
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-xl px-6 py-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-600">
            <PackagePlus className="w-5 h-5" />
            เพิ่มอุปกรณ์ใหม่
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-4 text-sm">
          {/* รหัสอุปกรณ์ */}
          <div className="space-y-1">
            <Label className="text-base font-medium flex items-center gap-2">
              <BadgeInfo className="w-4 h-4 text-gray-500" />
              รหัสอุปกรณ์ (Asset Code)
            </Label>
            <Input
              value={form.asset_number}
              onChange={(e) =>
                setForm({ ...form, asset_number: e.target.value })
              }
              placeholder="เช่น 200000000***"
              className="bg-muted/50 rounded-lg"
            />
          </div>
          {/* ชื่ออุปกรณ์ */}
          <div className="space-y-1">
            <Label className="text-base font-medium flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-500" />
              ชื่ออุปกรณ์
            </Label>
            <Input
              value={form.asset_name}
              onChange={(e) => setForm({ ...form, asset_name: e.target.value })}
              placeholder="เช่น คอมพิวเตอร์"
              className="bg-muted/50 rounded-lg"
            />
          </div>

          {/* สถานที่ */}
          <div className="space-y-1">
            <Label className="text-base font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              สถานที่เก็บอุปกรณ์
            </Label>
            <Input
              value={form.asset_location}
              onChange={(e) =>
                setForm({ ...form, asset_location: e.target.value })
              }
              placeholder="เช่น ห้อง IT, ชั้น 3"
              className="bg-muted/50 rounded-lg"
            />
          </div>

          {/* แนบรูป */}
          <div className="space-y-2">
            <Label className="text-base font-medium flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-gray-500" />
              แนบรูปภาพ
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="bg-muted/50 rounded-lg"
            />
            {previewUrl && (
              <div className="relative mt-2 w-full h-48 rounded-lg border overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* ปุ่ม */}
          <div className="pt-2 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-lg"
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
              onClick={handleSubmit}
            >
              บันทึก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
