"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Trash2, User } from "lucide-react";
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

  // const handleAddUser = async () => {
  //   const { email, name } = newUser;
  //   if (!email || !name) {
  //     toast.warning("กรุณากรอกชื่อและอีเมล");
  //     return;
  //   }
  //   const res = await fetch("/api/users", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(newUser),
  //   });
  //   if (res.ok) {
  //     toast.success("เพิ่มผู้ใช้เรียบร้อย");
  //     setNewUser({
  //       email: "",
  //       name: "",
  //       team: "",
  //       phone_number: 0,
  //       access_level: 1,
  //     });
  //     fetchUsers();
  //   } else {
  //     toast.error("เพิ่มผู้ใช้ไม่สำเร็จ");
  //   }
  // };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">
        👥 จัดการผู้ใช้งาน
      </h2>

      {/* ฟอร์มเพิ่มผู้ใช้ใหม่
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-white p-6 rounded-lg shadow border">
        <Input
          placeholder="อีเมล"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          icon={<Mail className="text-gray-400 w-5 h-5" />}
        />
        <Input
          placeholder="ชื่อผู้ใช้"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          icon={<UserIcon className="text-gray-400 w-5 h-5" />}
        />
        <Input
          placeholder="ทีม"
          value={newUser.team}
          onChange={(e) => setNewUser({ ...newUser, team: e.target.value })}
        />
        <Input
          placeholder="เบอร์โทรศัพท์"
          type="number"
          value={newUser.phone_number}
          onChange={(e) => setNewUser({ ...newUser, phone_number: Number(e.target.value) })}
          icon={<Phone className="text-gray-400 w-5 h-5" />}
        />
        <div>
          <Select
            value={String(newUser.access_level)}
            onValueChange={(val) =>
              setNewUser({ ...newUser, access_level: Number(val) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="สิทธิ์ผู้ใช้" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Viewer</SelectItem>
              <SelectItem value="70">Staff</SelectItem>
              <SelectItem value="99">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button onClick={handleAddUser} className="w-full mt-auto">
            <Plus className="mr-2 w-4 h-4" />
            เพิ่มผู้ใช้
          </Button>
        </div>
      </div> */}

      {/* ตารางแสดงผู้ใช้งาน */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">อีเมล</th>
              <th className="px-4 py-3">ทีม</th>
              <th className="px-4 py-3">เบอร์</th>
              <th className="px-4 py-3">สิทธิ์</th>
              <th className="px-4 py-3">การใช้งาน</th>
              <th className="px-4 py-3 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.team || "-"}</td>
                <td className="px-4 py-2">{user.phone_number || "-"}</td>
                <td className="px-4 py-2">
                  <Select
                    value={String(user.access_level)}
                    onValueChange={(val) =>
                      handleRoleChange(user.id, Number(val))
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="สิทธิ์" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Viewer</SelectItem>
                      <SelectItem value="70">Staff</SelectItem>
                      <SelectItem value="99">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2 text-center">
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
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="อนุมัติ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">✅ อนุมัติ</SelectItem>
                      <SelectItem value="false">❌ ไม่อนุมัติ</SelectItem>
                    </SelectContent>
                  </Select>
                </td>

                <td className="px-4 py-2 text-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
