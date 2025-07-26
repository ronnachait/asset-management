// lib/sendNotification.ts
import webpush from "web-push";
import { createClient } from "@/utils/supabase/server";

webpush.setVapidDetails(
  "mailto:admin@example.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const sendNotification = async (title: string, message: string) => {
  const supabase = await createClient();
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*");

  const payload = JSON.stringify({ title, body: message });

  for (const sub of subscriptions || []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payload
      );
    } catch (err) {
      console.error("Push failed", err);
    }
  }
};
