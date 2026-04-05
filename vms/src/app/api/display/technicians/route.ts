import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    let query = supabase
      .from("technicians")
      .select(
        "id,code,name,age,body,cup_size,height,language,type,speciality,starting_price,holder_description,photos,status,created_at"
      )
      .eq("is_active", true)
      .order("status")
      .order("name");

    // Default: only show techs who are checked in (not "off")
    // ?all=true returns every active technician regardless of status
    if (!all) {
      query = query.neq("status", "off");
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data ?? [], {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (e) {
    console.error("Display technicians error:", e);
    return NextResponse.json([], { status: 200 });
  }
}
