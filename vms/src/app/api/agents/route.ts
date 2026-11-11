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
    .select("id,role,agent_id")
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

    if (role === "agent") {
      // Agent can only see their own record
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", profile.agent_id)
        .single();
      if (error) throw error;
      return NextResponse.json([data]);
    }

    if (!hasPermission(role, "VIEW_AGENTS")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("agents")
      .select("*,technicians(count)")
      .order("name");
    if (error) throw error;

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getProfile(supabase);
    if (!profile || !hasPermission(profile.role as Role, "MANAGE_AGENTS")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { data, error } = await supabase
      .from("agents")
      .insert(body)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}
