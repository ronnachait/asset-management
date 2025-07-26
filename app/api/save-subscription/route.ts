import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 Received subscription:", body);

    if (!body?.endpoint || !body?.keys?.auth || !body?.keys?.p256dh) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 🔐 Get user info
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("❌ Failed to get user:", userError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 👤 Get access level from 'accounts'
    const { data: roleData, error: roleError } = await supabase
      .from("accounts")
      .select("access_level , id")
      .eq("id", user.id)
      .single();

    if (roleError || !roleData) {
      console.error("❌ Failed to fetch access level:", roleError?.message);
      return NextResponse.json(
        { error: "Cannot get user role" },
        { status: 500 }
      );
    }

    const accessLevel = roleData.access_level ?? 0;

    // 🔎 Check if subscription already exists
    const { data: existingSubs, error: selectError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("endpoint", body.endpoint)
      .limit(1);

    if (selectError) {
      console.error("❌ Failed to select subscription:", selectError.message);
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    const existing = existingSubs?.length > 0 ? existingSubs[0] : null;
    const now = new Date().toISOString();

    if (existing) {
      // 🔁 Update existing subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          keys: body.keys,
          updated_at: now,
          user_id: roleData.id,
          accessLevel: accessLevel,
        })
        .eq("endpoint", body.endpoint);

      if (updateError) {
        console.error("❌ Failed to update subscription:", updateError.message);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // ➕ Insert new subscription
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          endpoint: body.endpoint,
          keys: body.keys,
          user_id: roleData.id,
          accessLevel: accessLevel,
          created_at: now,
          updated_at: now,
        });

      if (insertError) {
        console.error("❌ Failed to insert subscription:", insertError.message);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("❌ Unexpected error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
