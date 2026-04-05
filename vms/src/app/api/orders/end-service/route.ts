import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import type { Role } from "@/types";

/**
 * POST /api/orders/end-service
 * Body: { technician_id: string }
 *
 * Ends an active service session:
 *  - Finds the latest paid order for the given technician
 *  - Frees the room
 *  - Sets technician status → available
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id,role")
      .eq("id", user.id)
      .single();

    if (!profile || !hasPermission(profile.role as Role, "CREATE_ORDER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { technician_id } = body as { technician_id: string };

    if (!technician_id) {
      return NextResponse.json(
        { error: "technician_id is required" },
        { status: 400 }
      );
    }

    // Find the latest paid order for this technician
    const { data: order } = await supabase
      .from("orders")
      .select("id,room_id,technician_id,status")
      .eq("technician_id", technician_id)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: "No active order found for this technician" },
        { status: 404 }
      );
    }

    // Free the room
    if (order.room_id) {
      await supabase
        .from("rooms")
        .update({ status: "free", updated_by: profile.id })
        .eq("id", order.room_id);
    }

    // Set technician → available
    await supabase
      .from("technicians")
      .update({ status: "available" })
      .eq("id", technician_id);

    return NextResponse.json({ success: true, order_id: order.id });
  } catch (e) {
    console.error("end-service error:", e);
    return NextResponse.json(
      { error: "Failed to end service" },
      { status: 500 }
    );
  }
}
