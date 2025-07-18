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
  CalendarClock,
  CalendarPlus,
  TimerReset,
  Loader,
  RefreshCcw,
  ActivitySquare,
  CircleCheck,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Calibration = {
  id: string;
  asset_id: string;
  next_calibration_date: string;
  last_calibration_date: string | null;
  status: "pending" | "done";
  lead_time: string | null;
};

const ConfirmCalibrationDevice = ({
  onsuccess,
  asset_Id,
  id,
}: {
  onsuccess: () => void;
  asset_Id: string;
  id: string;
}) => {
  const [open, setOpen] = useState(false);
  const leadtime = ["30", "60", "90"];
  const [checkbox, setCheckbox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Calibration>({
    id: id,
    asset_id: asset_Id,
    next_calibration_date: "",
    last_calibration_date: new Date().toISOString().slice(0, 10),
    status: "pending",
    lead_time: null,
  });

  const handleSubmit = async () => {
    setLoading(true);
    console.log(form);

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
      id: form.id,
      asset_id: form.asset_id,
      last_calibration_date: baseDate.toISOString().slice(0, 10),
      next_calibration_date: nextDateStr,
      status: form.status,
      lead_time: form.lead_time,
    };

    const res = await fetch("/api/calibrations/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      onsuccess(); // โหลดข้อมูลใหม่
      toast.success("ยืนยันการสอบเทียบ สำเร็จ");
      setForm({
        id: "",
        asset_id: "",
        next_calibration_date: "",
        last_calibration_date: new Date().toISOString().slice(0, 10),
        status: "pending",
        lead_time: null,
      });
      setOpen(false);
      setLoading(false);
    } else {
      toast.error(`"❌ ยืนยันข้อมูลไม่สำเร็จ", ${await res.text()}`);
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs shadow cursor-pointer">
            <RefreshCcw className="w-4 h-4 mr-1" />
            ยืนยัน
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[600px] rounded-xl shadow-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ActivitySquare className="w-5 h-5 text-blue-600" />
              ยืนยันการ การสอบเทียบอุปกรณ์
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
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
              disabled={loading}
              onClick={handleSubmit}
            >
              {!loading ? (
                <div className="flex justify-center items-center gap-1 cursor-pointer">
                  <CircleCheck className="w-4 h-4" /> <span>ยืนยัน</span>
                </div>
              ) : (
                <div className="flex justify-center items-center gap-1">
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
};
export default ConfirmCalibrationDevice;
