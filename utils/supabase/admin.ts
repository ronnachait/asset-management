// utils/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ห้ามเผยแพร่! ใช้ใน server เท่านั้น
  );
  return supabaseAdmin;
};
