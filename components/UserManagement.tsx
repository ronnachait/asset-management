"use client";

import { useEffect, useState } from "react";
import { RotateCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
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
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const result = await res.json();
    if (res.ok) setUsers(result.users);
    else toast.error("โหลดผู้ใช้ล้มเหลว");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchUsers(); // สมมุติว่าเป็น async function
    setLoading(false);
  };

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

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: newStatus }),
    });
    if (res.ok) {
      toast.success("อัปเดตสถานะเรียบร้อย");
      fetchUsers();
    } else {
      toast.error("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  // const handleDelete = async (id: string) => {
  //   if (confirm("คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?")) {
  //     const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
  //     res.ok
  //       ? (toast.success("ลบผู้ใช้แล้ว"), fetchUsers())
  //       : toast.error("ไม่สามารถลบผู้ใช้ได้");
  //   }
  // };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-end items-center mb-3">
        <Button
          className="rounded bg-blue-500 hover:bg-blue-700 cursor-pointer flex items-center gap-2 px-3 py-1 text-white text-sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RotateCw
            className={`w-4 h-4 transition-transform ${
              loading ? "animate-spin" : ""
            }`}
          />
          {loading ? "กำลังโหลด..." : "รีเฟรช"}
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 border-b">ชื่อ</th>
              <th className="px-4 py-3 border-b">อีเมล</th>
              <th className="px-4 py-3 border-b">ทีม</th>
              <th className="px-4 py-3 border-b">เบอร์</th>
              <th className="px-4 py-3 border-b">สิทธิ์</th>
              <th className="px-4 py-3 border-b">สถานะ</th>
              <th className="px-4 py-3 border-b text-center">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
              >
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.team || "–"}</td>
                <td className="px-4 py-3">{user.phone_number || "–"}</td>
                <td className="px-4 py-2">
                  {user.access_level === 99 ? (
                    <div className="text-xs w-28 px-3 py-2 border rounded bg-gray-100 text-gray-500">
                      👑 Admin
                    </div>
                  ) : (
                    <Select
                      value={String(user.access_level)}
                      onValueChange={(val) =>
                        handleRoleChange(user.id, Number(val))
                      }
                    >
                      <SelectTrigger className="text-xs w-28">
                        <SelectValue placeholder="สิทธิ์" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">👀 Viewer</SelectItem>
                        <SelectItem value="70">🛠️ Staff</SelectItem>
                        <SelectItem value="99">👑 Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>
                <td className="px-4 py-2">
                  <Select
                    value={String(user.action)}
                    onValueChange={(val) =>
                      handleStatusChange(user.id, val === "true")
                    }
                  >
                    <SelectTrigger className="text-xs w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">✅ อนุมัติ</SelectItem>
                      <SelectItem value="false">❌ ไม่อนุมัติ</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2 text-center">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      // handleDelete(user.id);
                      toast.warning("ไม่สามารถลบได้");
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  ไม่พบผู้ใช้ในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
