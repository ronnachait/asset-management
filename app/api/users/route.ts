import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: users } = await supabase.from("accounts").select("*");
    
  return NextResponse.json({ users: users });
}
