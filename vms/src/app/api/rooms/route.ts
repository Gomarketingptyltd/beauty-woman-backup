import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const typeFilter = searchParams.get("type");

    let query = supabase.from("rooms").select("*").order("code");
    if (statusFilter) query = query.eq("status", statusFilter);
    if (typeFilter) query = query.eq("room_type", typeFilter);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}
