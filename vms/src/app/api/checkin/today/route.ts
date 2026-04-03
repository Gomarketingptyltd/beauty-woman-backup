import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { todayBusinessDay } from "@/lib/business/business-day";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const businessDay = todayBusinessDay();

    const { data, error } = await supabase
      .from("technician_shifts")
      .select("*,technician:technicians(id,code,name)")
      .eq("business_day", businessDay)
      .in("status", ["working", "paused"])
      .order("checked_in_at");

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
