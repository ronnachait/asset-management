"use server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

type Body = {
  role?: number;
  action?: string;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await req.json();

  // ตรวจสอบว่าจะอัปเดต field ไหน
  const updateData: Partial<Pick<Body, "role" | "action">> = {
    ...(body.role !== undefined && { access_level: body.role }),
    ...(body.action !== undefined && { action: body.action }),
  };

  console.log(updateData);
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("accounts")
    .update(updateData)
    .eq("id", id);
  console.log(error);
  if (error) {
    console.error("Update failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Updated successfully" });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accountId = id;
  const supabase = await createAdminClient();

  // ✅ Step 1: ดึง user_id ที่เชื่อมกับ auth.users ก่อน
  const { data: account, error: fetchError } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", accountId)
    .single();

  if (fetchError || !account?.id) {
    console.error("Failed to find user_id from accounts:", fetchError?.message);
    return NextResponse.json(
      { error: "ไม่พบ user_id ที่ตรงกับ accounts.id นี้" },
      { status: 404 }
    );
  }

  const userId = account.id;

  // ✅ Step 3: ลบจากตาราง accounts
  const { error: dbError } = await supabase
    .from("accounts")
    .delete()
    .eq("id", userId);

  if (dbError) {
    console.error("Delete from accounts failed:", dbError.message);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  console.log("userId", userId);
  // ✅ Step 2: ลบจาก auth.users
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Delete user from auth failed:", authError.message);
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "User deleted successfully" });
}
