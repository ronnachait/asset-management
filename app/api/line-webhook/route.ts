import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const events = body.events;
  const supabase = await createClient();

  for (const event of events) {
    if (event.source.type === "group") {
      const groupId = event.source.groupId;

      // ✅ Check ว่ามี group นี้ใน Supabase หรือยัง
      const { data: existingGroup, error: selectError } = await supabase
        .from("line_groups")
        .select("*")
        .eq("group_id", groupId)
        .single();

      if (selectError) {
        console.log(selectError.message);
      }

      if (existingGroup) {
        // ✅ ถ้ามีแล้ว → อัปเดต last_seen_at
        await supabase
          .from("line_groups")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("group_id", groupId);
      } else {
        // ✅ ถ้ายังไม่มี → insert ใหม่
        await supabase.from("line_groups").insert({
          group_id: groupId,
          last_seen_at: new Date().toISOString(),
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
