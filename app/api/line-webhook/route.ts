import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;

async function getGroupSummary(groupId: string) {
  const res = await fetch(
    `https://api.line.me/v2/bot/group/${groupId}/summary`,
    {
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch group summary: ${res.statusText}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events = body.events;
    const supabase = await createClient();

    for (const event of events) {
      if (event.source.type === "group") {
        const groupId = event.source.groupId;
        const userId = event.source.userId || null;
        const timestamp = new Date(event.timestamp).toISOString();

        // ดึงชื่อกลุ่มจาก LINE API
        let groupName = null;
        try {
          const summary = await getGroupSummary(groupId);
          groupName = summary.groupName || null;
        } catch (error) {
          console.error("Failed to get group summary:", error);
        }

        // เก็บข้อมูลกลุ่มในตาราง line_groups
        const { data: existingGroup } = await supabase
          .from("line_groups")
          .select("group_id")
          .eq("group_id", groupId)
          .single();

        if (existingGroup) {
          await supabase
            .from("line_groups")
            .update({
              group_name: groupName,
              last_seen_at: new Date().toISOString(),
            })
            .eq("group_id", groupId);
        } else {
          await supabase.from("line_groups").insert({
            group_id: groupId,
            group_name: groupName,
            created_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
          });
        }

        // เก็บ log event ข้อความ (เฉพาะข้อความที่เป็น type "message")
        if (event.type === "message" && event.message.type === "text") {
          const messageText = event.message.text;

          await supabase.from("line_events").insert({
            group_id: groupId,
            user_id: userId,
            event_type: event.type,
            message_text: messageText,
            timestamp,
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
