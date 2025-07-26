"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command";
import {
  CalendarClock,
  CalendarPlus,
  CirclePlus,
  TimerReset,
  PackageSearch,
  Loader,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
type BorrowItem = {
  id: string;
  status: string;
  order_id: string;
  return_date: string | null; // วันที่คืน อาจเป็น null ถ้ายังไม่คืน
};

type Asset = {
  id: string;
  asset_number: string;
  asset_name: string;
  asset_location: string;
  asset_image: string; // URL หรือ path ของภาพ
  destroyed: boolean; // สถานะเสียหายหรือไม่
  borrow_items: BorrowItem[]; // ข้อมูลรายการยืมของ asset ตัวนี้
};

type Calibration = {
  asset_id: string;
  next_calibration_date: string;
  last_calibration_date: string | null;
  status: "pending" | "done";
  lead_time: string | null;
};

export default function AddCalibrationDevice({
  onsuccess,
}: {
  onsuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const leadtime = ["30", "60", "90"];

  const [form, setForm] = useState<Calibration>({
    asset_id: "",
    next_calibration_date: "",
    last_calibration_date: new Date().toISOString().slice(0, 10),
    status: "pending",
    lead_time: null,
  });

  const [dataAssets, setDataAssets] = useState<Array<Asset>>([]);
  const [checkbox, setCheckbox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();

  const assets = async () => {
    const res = await fetch("/api/items-asset", { method: "GET" });
    const result = await res.json();
    setDataAssets(result.data);
  };

  const handleSubmit = async () => {
    // ตรวจสอบว่ามีข้อมูลครบ
    setLoading(true);
    if (!form.asset_id || !form.lead_time || !form.last_calibration_date) {
      toast.warning("กรุณากรอกข้อมูลให้ครบถ้วน");
      setLoading(false);
      return;
    }

    // แปลง lead_time เป็นตัวเลข
    const leadTimeDays = parseInt(form.lead_time ?? "0");

    // ใช้ dateStart ถ้า checkbox ถูกติ๊ก, ไม่งั้นใช้ form.last_calibration_date
    const baseDate = new Date(form.last_calibration_date);

    // คำนวณ next_calibration_date
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + leadTimeDays);

    // แปลงเป็น yyyy-mm-dd
    const nextDateStr = nextDate.toISOString().slice(0, 10);

    // เตรียมข้อมูล
    const payload = {
      asset_id: form.asset_id,
      last_calibration_date: baseDate.toISOString().slice(0, 10),
      next_calibration_date: nextDateStr,
      status: form.status,
      lead_time: form.lead_time,
    };

    const res = await fetch("/api/calibrations/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onsuccess(); // โหลดข้อมูลใหม่
      toast.success("เพิ่มอุปกรณ์ สำเร็จ");
      setForm({
        asset_id: "",
        next_calibration_date: "",
        last_calibration_date: new Date().toISOString().slice(0, 10),
        status: "pending",
        lead_time: null,
      });
      setOpen(false);
      setLoading(false);
    } else {
      toast.error(`"❌ เพิ่มข้อมูลไม่สำเร็จ", ${await res.text()}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    assets();
  }, []);

  useEffect(() => {
    const asset = dataAssets.find((item) => item.id === form.asset_id);
    setSelectedAsset(asset);
  }, [form.asset_id, dataAssets]);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded shadow-md flex items-center space-x-2 cursor-pointer">
            <CirclePlus className="w-4 h-4" />
            <span>เพิ่มอุปกรณ์</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[600px] rounded-xl shadow-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-blue-600" />
              เพิ่มอุปกรณ์ Calibration
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Asset Select */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <PackageSearch className="w-4 h-4 text-gray-500" />
                เลือกประเภทอุปกรณ์
              </Label>

              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    // role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full h-11 border border-gray-300 rounded-md shadow-sm px-3 text-left flex items-center justify-between"
                  >
                    <span className="truncate max-w-full block">
                      {selectedAsset
                        ? `${selectedAsset.asset_number} - ${selectedAsset.asset_name}`
                        : "เลือกอุปกรณ์"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-500 shrink-0" />
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-full max-w-[580px] max-h-80 overflow-y-auto p-0 z-[1000]">
                  <Command>
                    <CommandInput placeholder="พิมพ์ชื่อหรือรหัสอุปกรณ์..." />
                    <CommandEmpty>ไม่พบรายการ</CommandEmpty>
                    <CommandGroup>
                      <CommandList className="max-h-60 overflow-y-auto">
                        {dataAssets.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={`${item.asset_number} ${item.asset_name}`}
                            onSelect={() => {
                              setForm((prev) => ({
                                ...prev,
                                asset_id: item.id,
                              }));
                              setSelectedAsset(item);
                              setPopoverOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col items-start w-full">
                              <span className="font-medium text-gray-900 truncate max-w-full block">
                                {item.asset_number}
                              </span>
                              <span className="text-xs text-gray-500 truncate max-w-full block">
                                {item.asset_name}
                              </span>
                            </div>
                            {item.id === form.asset_id && (
                              <Check className="ml-auto h-4 w-4 text-blue-600" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Lead Time */}
            <div>
              <Label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <TimerReset className="w-4 h-4 text-gray-500" />
                Lead Time (จำนวนวัน)
              </Label>
              <div className="flex flex-wrap gap-1 mb-3">
                {leadtime.map((lt) => (
                  <Button
                    key={lt}
                    variant="outline"
                    className={`cursor-pointer whitespace-nowrap ${
                      form.lead_time === lt ? "bg-blue-100 border-blue-400" : ""
                    }`}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, lead_time: lt }))
                    }
                  >
                    <CalendarPlus className=" w-4 h-4" />
                    {lt}
                    <span>วัน</span>
                  </Button>
                ))}
              </div>

              <Input
                value={form.lead_time ?? ""}
                type="number"
                min={0}
                onChange={(e) =>
                  setForm({ ...form, lead_time: e.target.value })
                }
                placeholder="กรอกจำนวนวันอื่น ๆ"
                className="w-full"
              />
            </div>

            {/* Start Date Checkbox */}
            <div>
              <Label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-gray-500" />
                วันที่เริ่มต้น Calibration
              </Label>
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id="startDateCheckbox"
                  onCheckedChange={(checked) => setCheckbox(!!checked)}
                />
                <Label
                  htmlFor="startDateCheckbox"
                  className="text-sm text-gray-700"
                >
                  กำหนดวันที่เอง
                </Label>
              </div>
              {checkbox && (
                <Input
                  value={form.last_calibration_date ?? ""}
                  type="date"
                  onChange={(e) =>
                    setForm({ ...form, last_calibration_date: e.target.value })
                  }
                  className="w-full"
                />
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end space-x-3 ">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="max-w-xs cursor-pointer"
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white max-w-xs"
              onClick={handleSubmit}
              disabled={loading}
            >
              {!loading ? (
                <div className="flex justify-center items-center gap-1 cursor-pointer">
                  <CirclePlus className="w-4 h-4" /> <span>เพิ่มอุปกรณ์</span>
                </div>
              ) : (
                <div className="flex justify-center items-center gap-1 ">
                  <Loader className=" animate-spin w-4 h-4" />
                  <span>กำลังบันทึก ...</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
