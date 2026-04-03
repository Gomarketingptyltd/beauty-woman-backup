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

    if (!profile || !hasPermission(profile.role as Role, "VOID_ORDER")) {
      return NextResponse.json({ error: "Forbidden — manager/admin only" }, { status: 403 });
    }

    const { reason } = await req.json();

    // Get original order
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status === "voided")
      return NextResponse.json({ error: "Already voided" }, { status: 400 });

    // Void the order
    const { error } = await supabase
      .from("orders")
      .update({
        status: "voided",
        voided_by: profile.id,
        void_reason: reason || "冲正",
        voided_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    // Restore technician to available
    await supabase
      .from("technicians")
      .update({ status: "available" })
      .eq("id", order.technician_id);

    // Free the room
    await supabase
      .from("rooms")
      .update({ status: "free", updated_by: profile.id })
      .eq("id", order.room_id);

    // Refund member balance if applicable
    if (order.member_id && (order.principal_used_cents > 0 || order.reward_used_cents > 0)) {
      await supabase.from("member_transactions").insert({
        member_id: order.member_id,
        tx_type: "void",
        principal_delta: order.principal_used_cents,
        reward_delta: order.reward_used_cents,
        order_id: order.id,
        note: `冲正：${reason || "管理员冲正"}`,
        created_by: profile.id,
      });

      await supabase
        .from("members")
        .update({
          principal_cents: { __increment: order.principal_used_cents },
        } as Record<string, unknown>)
        .eq("id", order.member_id);

      // Use separate RPC for atomic update
      await supabase.rpc("refund_member_balance", {
        p_member_id: order.member_id,
        p_principal_delta: order.principal_used_cents,
        p_reward_delta: order.reward_used_cents,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Void order error:", e);
    return NextResponse.json({ error: "Failed to void order" }, { status: 500 });
  }
}
