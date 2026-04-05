import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import type { Role } from "@/types";

export async function POST(
  _req: NextRequest,
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

    const { data: order } = await supabase
      .from("orders")
      .select("id,status,technician_id,room_id")
      .eq("id", id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "paid") {
      return NextResponse.json({ error: "Order is not active" }, { status: 400 });
    }

    // Free the room
    await supabase
      .from("rooms")
      .update({ status: "free", updated_by: profile.id })
      .eq("id", order.room_id);

    // Set technician back to available
    await supabase
      .from("technicians")
      .update({ status: "available" })
      .eq("id", order.technician_id);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Complete order error:", e);
    return NextResponse.json({ error: "Failed to complete order" }, { status: 500 });
  }
}
