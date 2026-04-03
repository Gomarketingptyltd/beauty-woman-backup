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

    // Record transaction
    await supabase.from("member_transactions").insert({
      member_id: id,
      tx_type: "topup",
      principal_delta: principalDelta,
      reward_delta: rewardDelta,
      note: note || "充值",
      created_by: profile.id,
    });

    // Update balance
    const { data: member, error } = await supabase
      .from("members")
      .select("principal_cents,reward_cents")
      .eq("id", id)
      .single();

    if (error || !member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("members")
      .update({
        principal_cents: member.principal_cents + principalDelta,
        reward_cents: member.reward_cents + rewardDelta,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Topup error:", e);
    return NextResponse.json({ error: "Topup failed" }, { status: 500 });
  }
}
