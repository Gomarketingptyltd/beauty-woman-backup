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

    if (!profile || !hasPermission(profile.role as Role, "TOPUP_MEMBER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { amount_cents, account, note } = await req.json();

    if (!amount_cents || amount_cents <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const principalDelta = account === "principal" ? amount_cents : 0;
    const rewardDelta = account === "reward" ? amount_cents : 0;

    // Verify member exists
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id")
      .eq("id", id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Atomic topup via RPC: updates balance and inserts transaction in one call
    const { error: rpcError } = await supabase.rpc("topup_member_balance", {
      p_member_id: id,
      p_principal_delta: principalDelta,
      p_reward_delta: rewardDelta,
      p_created_by: profile.id,
      p_note: note || "充值",
    });

    if (rpcError) throw rpcError;

    // Return updated member record
    const { data: updated, error: fetchError } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Topup error:", e);
    return NextResponse.json({ error: "Topup failed" }, { status: 500 });
  }
}
