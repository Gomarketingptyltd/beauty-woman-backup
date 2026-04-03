import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { todayBusinessDay } from "@/lib/business/business-day";
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

// POST: check-in
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getProfile(supabase);
    if (!profile || !hasPermission(profile.role as Role, "CHECKIN_TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { technician_id } = await req.json();
    const businessDay = todayBusinessDay();

    // Check if already checked in today
    const { data: existing } = await supabase
      .from("technician_shifts")
      .select("id,status")
      .eq("technician_id", technician_id)
      .eq("business_day", businessDay)
      .in("status", ["working", "paused"])
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already checked in" }, { status: 400 });
    }

    const { data: shift, error } = await supabase
      .from("technician_shifts")
      .insert({
        technician_id,
        business_day: businessDay,
        created_by: profile.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Update technician status → available
    await supabase
      .from("technicians")
      .update({ status: "available" })
      .eq("id", technician_id);

    return NextResponse.json(shift, { status: 201 });
  } catch (e) {
    console.error("Checkin error:", e);
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}

// PATCH: update shift (checkout/pause/resume)
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getProfile(supabase);
    if (!profile || !hasPermission(profile.role as Role, "CHECKIN_TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shift_id, action } = await req.json();

    const now = new Date().toISOString();
    let shiftUpdate: Record<string, unknown> = {};
    let techStatus: string;

    switch (action) {
      case "checkout":
        shiftUpdate = { status: "completed", checked_out_at: now };
        techStatus = "off";
        break;
      case "pause":
        shiftUpdate = { status: "paused", paused_at: now };
        techStatus = "break";
        break;
      case "resume":
        shiftUpdate = { status: "working", resumed_at: now };
        techStatus = "available";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data: shift, error } = await supabase
      .from("technician_shifts")
      .update(shiftUpdate)
      .eq("id", shift_id)
      .select("*,technician:technicians(id)")
      .single();

    if (error) throw error;

    // Update technician status
    await supabase
      .from("technicians")
      .update({ status: techStatus })
      .eq("id", (shift.technician as { id: string }).id);

    return NextResponse.json(shift);
  } catch (e) {
    console.error("Shift update error:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
