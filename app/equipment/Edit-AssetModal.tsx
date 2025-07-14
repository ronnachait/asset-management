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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ImagePlus,
  MapPin,
  BadgeInfo,
  ClipboardList,
  SquarePen,
  Settings,
  Loader2,
  PackagePlus,
} from "lucide-react";
import { toast } from "sonner";
type Asset = {
  id: string;
  asset_number: string;
  asset_name: string;
  asset_location: string;
  asset_image: File | null;
};

type items = {
  id: string;
  asset_number: string;
  asset_name: string;
  asset_location: string;
  asset_image?: string;
  borrow_items?: {
    status: string;
    return_date: string | null;
  }[];
  current_status?: string;
};

type dropdown = {
  id: string;
  value: string;
  type: string;
};

export default function EditAssetModal({
  onAdd,
  data,
}: {
  onAdd: () => void;
  data: items;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Asset>({
    id: "",
    asset_number: "",
    asset_name: "",
    asset_location: "",
    asset_image: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState<dropdown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
    setIsLoading(true);
    if (!form.asset_name || !form.asset_number) {
      setIsLoading(false);
      return toast.warning("กรุณากรอกข้อมูลให้ครบ");
    }

    const formData = new FormData();

    formData.append("id", data.id);
    formData.append("asset_number", form.asset_number);
    formData.append("asset_name", form.asset_name);
    formData.append("asset_location", form.asset_location);

    if (form.asset_image) {
      formData.append("asset_image", form.asset_image);
    }

    const res = await fetch("/api/items-asset/item-update", {
      method: "PATCH",
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
      console.log(result.message);
      toast.error(`Error : ${result.message} Status : ${res.status}`);
      return;
    }

    toast.success("แก้ไข asset สําเร็จ");
    setIsLoading(false);
    onAdd();
    console.log("onAdd");
    console.log(result);
    setForm({
      id: "",
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

  const fetchDatadropdown = async (type: string) => {
    const res = await fetch("/api/dropdown?type=" + type);
    const data = await res.json();

    if (!res.ok) {
      console.log(data.message);
      return;
    }

    console.log(data);
    setDropdown(data);
    return data;
  };

  useEffect(() => {
    if (open) {
      console.log(data);
      fetchDatadropdown("location");
      setForm((prev) => ({
        ...prev,
        asset_number: data.asset_number,
        asset_name: data.asset_name,
        asset_location: data.asset_location,
      }));
    }
  }, [open, data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer bg-amber-400 hover:bg-amber-500 px-3 py-2 rounded-md text-white  flex items-center justify-center dark:hover:bg-amber-600 dark:bg-amber-500">
          <SquarePen className="w-5 h-5" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-xl px-6 py-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-600">
            <Settings className="w-5 h-5" />
            แก้ไขอุปกรณ์
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

            <Select
              value={form.asset_location}
              onValueChange={(e) => setForm({ ...form, asset_location: e })}
            >
              <SelectTrigger className="w-full bg-muted/50 rounded-lg">
                <SelectValue placeholder="เลือกสถานที่" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>เลือกสถานที่</SelectLabel>
                  {dropdown && dropdown.length > 0 ? (
                    dropdown.map((item: dropdown) => (
                      <SelectItem
                        key={item.id}
                        value={item.value.toLocaleUpperCase()}
                        className="capitalize"
                      >
                        {item.value.toLocaleUpperCase()}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="ไม่มีข้อมูล" className="capitalize">
                      ไม่มีข้อมูล
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
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
              className="bg-muted/50 rounded-lg cursor-pointer"
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
          <div className="pt-2 flex justify-end gap-3 cursor-pointer">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-lg"
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center">
                  <PackagePlus className="w-4 h-4 mr-2" />
                  <span>อัพเดตข้อมูล</span>
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
