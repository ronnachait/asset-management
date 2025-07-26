"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, CheckCircle, Ungroup, Phone } from "lucide-react";
import { toast } from "sonner";

type RegisterFormProps = React.ComponentProps<"form"> & {
  onSuccess?: () => void;
};

export function RegisterForm({
  className,
  onSuccess,
  ...props
}: RegisterFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formDataObj = new FormData(form);

    const email = formDataObj.get("email") as string;

    if (!email.endsWith("@kubota.com")) {
      toast.error("กรุณาใช้ @kubota.com");
      return;
    }
    // ดึงค่าจาก FormData ไปใส่ใน state
    const data = {
      name: formDataObj.get("name") as string,
      team: formDataObj.get("team") as string,
      phone: formDataObj.get("phone") as string,
      email: formDataObj.get("email") as string,
      password: formDataObj.get("password") as string,
      password_confirm: formDataObj.get("password_confirm") as string,
    };

    // ส่งไปที่ API
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      toast.success("สมัครสมาชิกสำเร็จแล้ว");
      if (onSuccess) onSuccess(); // แจ้ง parent ว่าสมัครเสร็จ
    } else {
      toast.error(result.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-6 bg-white p-4 rounded-xl shadow-lg border border-gray-200 ">
        {/* ชื่อ - นามสกุล */}
        <div className="grid gap-1.5">
          <Label htmlFor="name" className="text-gray-700 font-medium">
            ชื่อ - นามสกุล
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="เช่น สมชาย ใจดี"
              required
              className="pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="name" className="text-gray-700 font-medium">
            ทีม
          </Label>
          <div className="relative">
            <Ungroup className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <Input
              id="team"
              name="team"
              type="text"
              placeholder="เช่น satt"
              required
              className="pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone" className="text-gray-700 font-medium">
            เบอร์มือถือ
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              pattern="0[0-9]{9}" // ขึ้นต้นด้วย 0 และตามด้วยตัวเลข 9 ตัว
              maxLength={10}
              inputMode="numeric" // มือถือจะใช้ keypad ตัวเลข
              placeholder="เช่น 0888888888"
              required
              className="pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
        </div>
        {/* อีเมล */}
        <div className="grid gap-1.5">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            อีเมล
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              className="pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
        </div>
        {/* รหัสผ่าน */}
        <div className="grid gap-1.5">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            รหัสผ่าน
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
        </div>
        {/* ยืนยันรหัสผ่าน */}
        <div className="grid gap-1.5">
          <Label
            htmlFor="password_confirm"
            className="text-gray-700 font-medium"
          >
            ยืนยันรหัสผ่าน
          </Label>
          <div className="relative">
            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <Input
              id="password_confirm"
              name="password_confirm"
              type="password"
              placeholder="••••••••"
              required
              className="pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
        </div>
        {/* ปุ่มสมัคร */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow-sm transition"
        >
          สมัครสมาชิก
        </Button>
      </div>
    </form>
  );
}
