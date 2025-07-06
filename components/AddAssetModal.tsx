"use client";

import { useState } from "react";
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
import { PackagePlus, ImagePlus, MapPin, BadgeInfo, ClipboardList } from "lucide-react";

type Asset = {
  name: string;
  code: string;
  location: string;
  status: string;
  file: File | null;
};

export default function AddAssetModal({
  onAdd,
}: {
  onAdd: (asset: Asset) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Asset>({
    name: "",
    code: "",
    location: "",
    status: "",
    file: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.name || !form.code) return alert("กรุณากรอกข้อมูลให้ครบ");
    onAdd(form);
    setForm({ name: "", code: "", location: "", status: "", file: null });
    setPreviewUrl(null);
    setOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, file });
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer gap-2"
        >
          <PackagePlus className="w-4 h-4" />
          เพิ่มอุปกรณ์
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex justify-start items-center gap-2 text-blue-500">
            <PackagePlus className="w-5 h-5" />
            <span>เพิ่มอุปกรณ์ใหม่</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm">
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-500" />
              ชื่ออุปกรณ์
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="เช่น คอมพิวเตอร์"
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <BadgeInfo className="w-4 h-4 text-gray-500" />
              รหัสอุปกรณ์ (Asset Code)
            </Label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="เช่น ASSET-001"
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <BadgeInfo className="w-4 h-4 text-gray-500" />
              สถานะปัจจุบัน
            </Label>
            <Input
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              placeholder="เลือก สถานะอุปกรณ์ เช่น พร้อมใช้งาน / ซ่อม"
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              สถานที่เก็บอุปกรณ์
            </Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="เช่น ห้อง IT, ชั้น 3"
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-gray-500" />
              แนบไฟล์ (เฉพาะรูปภาพ)
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="bg-muted/50"
            />
            {previewUrl && (
              <Image
                fill
                src={previewUrl}
                alt="Preview"
                className="mt-2 w-full max-h-48 object-contain border rounded-lg"
              />
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-green-600 text-white hover:bg-green-700 cursor-pointer"
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
