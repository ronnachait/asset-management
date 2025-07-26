"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader, LogIn, Mail, Lock, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);

    startTransition(async () => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          body: data,
        });
        console.log(res);
        const result = await res.json(); // ✅ อ่าน JSON แค่ครั้งเดียว

        if (!res.ok) {
          console.error("Login error:", result.message);
          toast.error(`Login error: ${result.message}`);
          return;
        }

        toast.success("ล็อกอิน สำเร็จ");
        router.push("/"); // ✅ redirect ไปหลัง login สำเร็จ
      } catch (err) {
        console.error("Login error:", err);
        toast.error(`Login error: ${err}`);
      }
    });
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
        <p className="text-muted-foreground text-sm text-balance">
          กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบของคุณ
        </p>
      </div>

      <div className="grid gap-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        {/* Email */}
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
              value={formData.email}
              required
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            required
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            className="pl-10 pr-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition w-full"
          />

          {/* ปุ่มแสดง/ซ่อนรหัส */}
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1} // เพื่อไม่ให้โฟกัสเมื่อ tab
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* ปุ่ม Login */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow-sm transition cursor-pointer"
          disabled={isPending}
        >
          {!isPending ? (
            <span className="flex justify-center items-center gap-2">
              <LogIn className="w-5 h-5" />
              <span>เข้าสู่ระบบ</span>
            </span>
          ) : (
            <span className="flex justify-center items-center gap-2">
              <Loader className="animate-spin w-5 h-5" />
              <span>กำลังเข้าสู่ระบบ...</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
