import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import type { Role } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role,agent_id")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = profile.role as Role;
    if (
      !hasPermission(role, "VIEW_AGENTS") &&
      !(role === "agent" && profile.agent_id === id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("agent_package_commissions")
      .select("*")
      .eq("agent_id", id);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !hasPermission(profile.role as Role, "MANAGE_AGENTS")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { package_key, commission_amount } = await req.json();

    const { data, error } = await supabase
      .from("agent_package_commissions")
      .upsert(
        { agent_id: id, package_key, commission_amount },
        { onConflict: "agent_id,package_key" }
      )
      .select();

    if (error) throw error;

    // Return all commissions for this agent
    const { data: all } = await supabase
      .from("agent_package_commissions")
      .select("*")
      .eq("agent_id", id);

    return NextResponse.json(all ?? []);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
