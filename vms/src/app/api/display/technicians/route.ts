import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("technicians")
      .select(
        "id,code,name,age,body,cup_size,height,language,type,speciality,starting_price,holder_description,photos,status,created_at"
      )
      .eq("is_active", true)
      .neq("status", "off")
      .order("status")
      .order("name");

    if (error) throw error;

    return NextResponse.json(data ?? [], {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e) {
    console.error("Display technicians error:", e);
    return NextResponse.json([], { status: 200 });
  }
}
