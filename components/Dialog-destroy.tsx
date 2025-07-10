import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DestroyDialog({
  recordId,
  onsubmit,
}: {
  recordId: string;
  onsubmit: () => void;
}) {
  const [open, setOpen] = useState(false);

  const handledestroy = async () => {
    const res = await fetch("/api/items-asset/item-destroy", {
      method: "PUT",
      body: JSON.stringify({ id: recordId }),
    });
    const result = await res.json();

    if (res.ok) {
      toast.success("ลบอุปกรณ์สำเร็จ");
      setOpen(false); // ✅ ปิด dialog พร้อม animation
      // reload data
      onsubmit();
    } else {
      toast.error(result.message || "ลบไม่สำเร็จ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-red-400 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center justify-center cursor-pointer dark:bg-red-500 dark:hover:bg-red-600">
          <Trash2 className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-red-600">
            ยืนยันการทำลายอุปกรณ์?
          </DialogTitle>
          <DialogDescription>การกระทำนี้ไม่สามารถย้อนกลับได้</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={handledestroy}
          >
            ทำลาย
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            onClick={() => setOpen(false)}
          >
            ยกเลิก
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
