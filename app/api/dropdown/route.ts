"use server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
    console.log(type)
  if (!type)
    return NextResponse.json({ message: "Missing type" }, { status: 400 });

  const supabase = await createClient();

  if (!supabase) {
    console.log("Connect Supabase failed!");
    return NextResponse.json(
      { message: "Connect Supabase failed!" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("dropdown")
    .select("*")
    .eq("type", type);

  if (error) {
    console.log("GET Data dropdown Error!", error);
    return NextResponse.json({ message: "GET Data dropdown Error!", error });
  }

  return NextResponse.json(data);
}
