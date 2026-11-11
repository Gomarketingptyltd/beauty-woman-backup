import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types";

export async function GET() {
  try {
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

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*,agent:agents(id,name)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { username, password, display_name, role, agent_id, phone } =
      await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminSupabase = await createAdminClient();

    // Create auth user with a generated email
    const email = `${username}@vms.oceannoir.internal`;
    const { data: newUser, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, display_name, role },
      });

    if (createError) throw createError;

    // Profile is created by trigger, but we update it
    const { data: newProfile, error: profileError } = await adminSupabase
      .from("profiles")
      .update({ username, display_name, role, agent_id: agent_id || null, phone })
      .eq("id", newUser.user.id)
      .select()
      .single();

    if (profileError) throw profileError;

    return NextResponse.json(newProfile, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create account";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
