"use client";

import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { createClient } from "@/utils/supabase/client";
import { checkAndNotifyOverdueOrders } from "@/lib/checkOverdueOrders";

export default function SettingsPage() {
  const [isLineEnabled, setIsLineEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setSending(true);
    setSuccess(null);
    setError(null);
    try {
      await checkAndNotifyOverdueOrders();
      setSuccess("ส่งอีเมลสำเร็จแล้ว!");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งอีเมล"
      );
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const fetchInitialSetting = async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("setting")
        .select("action")
        .eq("value", "line")
        .single();

      if (error) {
        console.error("fetchInitialSetting error:", error);
      } else if (data) {
        setIsLineEnabled(Boolean(data.action));
      }
      setLoading(false);
    };

    fetchInitialSetting();
  }, []);

  useEffect(() => {
    if (loading) return;

    const updateSetting = async () => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("setting")
        .update({ action: isLineEnabled })
        .eq("value", "line");

      if (error) {
        console.error("updateSetting error:", error);
      }
    };

    updateSetting();
  }, [isLineEnabled, loading]);

  return (
    <div className="max-w-3xl w-full mx-auto p-6">
      <div className="bg-white shadow-md border rounded-lg p-6 space-y-8">
        {/* Section: การแจ้งเตือน */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">
            การแจ้งเตือน
          </h3>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 font-medium">
              เปิดแจ้งเตือนผ่าน LINE
            </span>
            <Switch
              checked={isLineEnabled}
              onChange={setIsLineEnabled}
              className={`${
                isLineEnabled ? "bg-green-500" : "bg-gray-300"
              } relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300`}
            >
              <span
                className={`${
                  isLineEnabled ? "translate-x-7" : "translate-x-1"
                } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
              />
            </Switch>
          </div>
        </section>

        {/* Section: ทดสอบส่ง Email */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">
            ทดสอบระบบการส่ง Email
          </h3>

          <div className="text-gray-600 italic mb-3">
            * กดปุ่มเพื่อทดสอบส่งอีเมลแจ้งเตือน
          </div>

          <button
            onClick={handleSend}
            disabled={loading || sending}
            className={`px-5 py-2 rounded text-white font-semibold transition ${
              loading || sending
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {sending ? "กำลังส่ง..." : "ส่งอีเมล"}
          </button>

          {success && <p className="text-green-600 mt-3">{success}</p>}
          {error && <p className="text-red-600 mt-3">{error}</p>}
        </section>
      </div>
    </div>
  );
}
