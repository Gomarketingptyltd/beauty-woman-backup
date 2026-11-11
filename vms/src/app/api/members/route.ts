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

async function generateMemberCode(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true });
  return String((count ?? 0) + 1).padStart(4, "0");
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getProfile(supabase);
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(profile.role as Role, "VIEW_MEMBERS")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const tier = searchParams.get("tier");

    let query = supabase.from("members").select("*").order("created_at", { ascending: false });

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,phone.ilike.%${search}%,code.ilike.%${search}%`);
    }
    if (tier) query = query.eq("tier", tier);

    const { data, error } = await query.limit(50);
    if (error) throw error;

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getProfile(supabase);
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(profile.role as Role, "CREATE_MEMBER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const code = await generateMemberCode(supabase);

    const { data, error } = await supabase
      .from("members")
      .insert({
        code,
        display_name: body.display_name,
        phone: body.phone || null,
        contact_other: body.contact_other || null,
        tier: body.tier || "Casual",
        notes: body.notes || null,
        created_by: profile.id,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
