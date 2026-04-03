import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import type { Role } from "@/types";

async function getProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("id", user.id)
    .single();
  return data;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getProfile(supabase);
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = profile.role as Role;
    const showAgentId = hasPermission(role, "VIEW_TECH_AGENT");

    const selectFields = showAgentId
      ? "*,agent:agents(id,name)"
      : "id,code,name,age,body,cup_size,height,language,type,speciality,starting_price,holder_description,photos,status,is_active,created_at";

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const activeOnly = searchParams.get("active") !== "false";

    let query = supabase.from("technicians").select(selectFields);

    if (activeOnly) query = query.eq("is_active", true);
    if (statusFilter) query = query.eq("status", statusFilter);

    const { data, error } = await query.order("code");
    if (error) throw error;

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch technicians" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getProfile(supabase);
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(profile.role as Role, "MANAGE_TECHNICIANS")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { data, error } = await supabase
      .from("technicians")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create technician" }, { status: 500 });
  }
}
