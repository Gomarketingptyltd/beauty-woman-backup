import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import type { Role } from "@/types";

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
      .select("id,role")
      .eq("id", user.id)
      .single();

    if (!profile || !hasPermission(profile.role as Role, "CREATE_ORDER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const extendMinutes = Number(body.extend_minutes);

    if (!extendMinutes || extendMinutes < 1 || extendMinutes > 240) {
      return NextResponse.json({ error: "Invalid extend_minutes (1-240)" }, { status: 400 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id,status,duration_minutes")
      .eq("id", id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "paid") {
      return NextResponse.json({ error: "Order is not active" }, { status: 400 });
    }

    const newDuration = (order.duration_minutes || 0) + extendMinutes;

    const { error } = await supabase
      .from("orders")
      .update({
        duration_minutes: newDuration,
        note: `[加时 +${extendMinutes}min]`,
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, new_duration_minutes: newDuration });
  } catch (e) {
    console.error("Extend order error:", e);
    return NextResponse.json({ error: "Failed to extend order" }, { status: 500 });
  }
}
