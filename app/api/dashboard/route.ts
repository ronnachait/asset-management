import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  if (!supabase) {
    console.log("Connect Supabase failed!");
    return NextResponse.json(
      { message: "Connect Supabase failed!" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase.from("orders").select("*");

  if (error) {
    console.log("GET Data orders Error!", error);
    return NextResponse.json({ message: "GET Data orders Error!", error });
  }

  return NextResponse.json({message: "GET Successfully !", data} , { status: 200 });
}
