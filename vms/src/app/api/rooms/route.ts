import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/rooms
 * Query params: status, type
 *
 * Returns rooms with optional active-order info for occupied rooms.
 * Active order fields: order_id, order_no, technician_id, technician_name,
 *                      technician_code, package_key, duration_minutes, paid_at
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const typeFilter = searchParams.get("type");

    // Base room query
    let query = supabase
      .from("rooms")
      .select(
        `
        id, code, room_type, status, updated_at, updated_by
        `
      )
      .order("code");

    if (statusFilter) query = query.eq("status", statusFilter);
    if (typeFilter) query = query.eq("room_type", typeFilter);

    const { data: rooms, error } = await query;
    if (error) throw error;

    if (!rooms || rooms.length === 0) {
      return NextResponse.json([]);
    }

    // For occupied rooms, fetch the latest paid order per room
    const occupiedRoomIds = rooms
      .filter((r) => r.status === "occupied")
      .map((r) => r.id);

    let ordersByRoom: Record<string, {
      order_id: string;
      order_no: string;
      technician_id: string;
      technician_name: string;
      technician_code: string;
      package_key: string;
      duration_minutes: number;
      paid_at: string | null;
    }> = {};

    if (occupiedRoomIds.length > 0) {
      // Get latest paid order for each occupied room
      const { data: orders } = await supabase
        .from("orders")
        .select(
          `id, order_no, room_id, technician_id, package_key, duration_minutes, paid_at,
           technician:technicians(id, code, name)`
        )
        .in("room_id", occupiedRoomIds)
        .eq("status", "paid")
        .order("created_at", { ascending: false });

      if (orders) {
        // Keep only the most recent per room
        for (const o of orders) {
          if (!ordersByRoom[o.room_id]) {
            const tech = (o.technician as unknown) as { id: string; code: string; name: string } | null;
            ordersByRoom[o.room_id] = {
              order_id: o.id,
              order_no: o.order_no,
              technician_id: o.technician_id,
              technician_name: tech?.name ?? "",
              technician_code: tech?.code ?? "",
              package_key: o.package_key,
              duration_minutes: o.duration_minutes,
              paid_at: o.paid_at,
            };
          }
        }
      }
    }

    // Merge room + active order info
    const result = rooms.map((room) => ({
      ...room,
      active_order: ordersByRoom[room.id] ?? null,
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error("Rooms fetch error:", e);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
