"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Trash2, User, UserCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type User = {
  id: string;
  email: string;
  name: string;
  team: string;
  phone_number: number;
  access_level: number;
  action: boolean;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const result = await res.json();
    if (res.ok) setUsers(result.users);
    else toast.error("โหลดผู้ใช้ล้มเหลว");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: number) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success("อัปเดตสิทธิ์เรียบร้อย");
      fetchUsers();
    } else {
      toast.error("อัปเดตสิทธิ์ไม่สำเร็จ");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?")) {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบผู้ใช้แล้ว");
        fetchUsers();
      } else {
        toast.error("ไม่สามารถลบผู้ใช้ได้");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
      {/* 👉 Card Layout สำหรับทุกขนาดหน้าจอ */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-transform hover:scale-[1.01]"
          >
            {/* ชื่อ + อีเมล */}
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-white p-3 rounded-full shadow">
                <UserCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            {/* รายละเอียด */}
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-4">
              <p>
                📁 <span className="font-medium">ทีม:</span> {user.team || "–"}
              </p>
              <p>
                📞 <span className="font-medium">เบอร์:</span>{" "}
                {user.phone_number || "–"}
              </p>
            </div>

            {/* การจัดการสิทธิ์ */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  สิทธิ์การใช้งาน
                </label>
                <Select
                  value={String(user.access_level)}
                  onValueChange={(val) =>
                    handleRoleChange(user.id, Number(val))
                  }
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="เลือกสิทธิ์" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">👀 Viewer</SelectItem>
                    <SelectItem value="70">🛠️ Staff</SelectItem>
                    <SelectItem value="99">👑 Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  สถานะการใช้งาน
                </label>
                <Select
                  value={String(user.action ?? "")}
                  onValueChange={async (val) => {
                    await fetch(`/api/users/${user.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ action: val === "true" }),
                    });
                    fetchUsers();
                  }}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="สถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">✅ อนุมัติ</SelectItem>
                    <SelectItem value="false">❌ ไม่อนุมัติ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ปุ่มลบ */}
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-3"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  ลบผู้ใช้งาน
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
