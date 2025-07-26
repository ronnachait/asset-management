"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CirclePlus, Loader2 } from "lucide-react"; // เพิ่มการ import
import { format, addDays } from "date-fns";
import { th } from "date-fns/locale"; // สำหรับภาษาไทย
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
export default function ExtendOrder({
  daysLeft,
  oderId,
  return_due_date,
  onUpdate,
}: {
  daysLeft: number;
  oderId: string;
  return_due_date: string;
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countDay, setCountDay] = useState(0);
  const MAX_DAYS = 90;
  const handleSubmit = async () => {
    setIsLoading(true);

    const form = new FormData();
    form.append("id", oderId);
    form.append("date", addDays(new Date(), countDay).toISOString());

    const res = await fetch("/api/extend-order", {
      method: "PATCH",
      body: form,
    });

    const result = await res.json();

    if (!res.ok) {
      console.error(result.message);
      toast.error("Error:", result.message);
      return;
    }
    toast.success(result.message);
    // ทำสิ่งที่ต้องการ เช่น เรียก API
    setIsLoading(false);
    setCountDay(0);
    onUpdate();
  };

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString); // ← เปลี่ยนทุกครั้ง client โหลด
    return format(date, "d MMM yyyy ", { locale: th }); // ← locale อาจต่างกันระหว่าง server กับ client
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex justify-center items-center gap-1 cursor-pointer rounded-2xl bg-amber-500 hover:bg-amber-700 text-white px-3 py-1 text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          type="button"
        >
          <CirclePlus className="w-4 h-4" />
          <span>
            ยืดอายุ <span>({daysLeft}วัน)</span>
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-xl px-6 py-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-600">
            ยืดอายุคำสั่ง
          </DialogTitle>
        </DialogHeader>
        <div>ID: {oderId}</div>
        <div>วันที่กำหนด : {formatThaiDate(return_due_date)}</div>
        <div>
          วันที่ต้องคืน :{" "}
          {countDay > 0
            ? formatThaiDate(addDays(new Date(), countDay).toISOString())
            : formatThaiDate(return_due_date)}
        </div>
        <Input
          type="number"
          inputMode="numeric"
          pattern="\d*"
          value={countDay}
          min={1}
          max={90}
          onChange={(e) => {
            const value = Number(e.target.value);
            setCountDay(Math.min(90, value)); // จำกัดที่ 30 วัน
          }}
          placeholder="จำนวนวันที่จะยืด"
          className="bg-muted/50 rounded-lg"
        />

        {countDay >= MAX_DAYS && (
          <p className="text-sm text-red-500">
            ไม่สามารถยืดเกิน {MAX_DAYS} วันได้
          </p>
        )}

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
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center">ยืดอายุ</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
