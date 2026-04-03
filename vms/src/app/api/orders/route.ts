import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { calcTechCommission } from "@/lib/business/commission";
import { todayBusinessDay } from "@/lib/business/business-day";
import { getPriceInCents } from "@/lib/business/packages";
import { DEFAULT_AGENT_COMMISSION_CENTS } from "@/lib/business/commission";
import type { Role, PackageKey } from "@/types";

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

async function generateOrderNo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessDay: string
): Promise<string> {
  const prefix = `ON-${businessDay.replace(/-/g, "")}`;
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .like("order_no", `${prefix}%`);
  const seq = String((count ?? 0) + 1).padStart(4, "0");
  return `${prefix}-${seq}`;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getProfile(supabase);
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const businessDay = searchParams.get("business_day");
    const status = searchParams.get("status");

    const role = profile.role as Role;

    // Fields visible to staff (no agent commission)
    const staffFields = `
      id,order_no,business_day,member_id,is_new_customer,technician_id,
      room_id,staff_id,package_key,duration_minutes,total_cents,
      commission_cents,principal_used_cents,reward_used_cents,
      cash_paid_cents,payment_method,status,note,created_at,paid_at,
      voided_at,void_reason,
      technician:technicians(id,code,name,photos),
      room:rooms(id,code),
      member:members(id,code,display_name,tier)
    `;

    const adminFields = staffFields + `,agent_id,agent_commission_cents,
      agent:agents(id,name)`;

    const showAgent = hasPermission(role, "VIEW_AGENT_COMMISSION");
    let query = supabase
      .from("orders")
      .select(showAgent ? adminFields : staffFields)
      .order("created_at", { ascending: false });

    if (businessDay) query = query.eq("business_day", businessDay);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.limit(100);
    if (error) throw error;

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getProfile(supabase);
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(profile.role as Role, "CREATE_ORDER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      package_key,
      duration_minutes,
      technician_id,
      room_id,
      member_id,
      payment_method,
      note,
    } = body;

    // Calculate total
    const totalCents = getPriceInCents(package_key as PackageKey, duration_minutes);
    if (!totalCents) {
      return NextResponse.json({ error: "Invalid package/duration" }, { status: 400 });
    }

    const commissionCents = calcTechCommission(totalCents);
    const businessDay = todayBusinessDay();

    // Get technician to check agent
    const { data: tech } = await supabase
      .from("technicians")
      .select("id,status,agent_id")
      .eq("id", technician_id)
      .single();

    if (!tech || tech.status !== "available") {
      return NextResponse.json(
        { error: "Technician not available" },
        { status: 400 }
      );
    }

    // Check room
    const { data: room } = await supabase
      .from("rooms")
      .select("id,status")
      .eq("id", room_id)
      .single();

    if (!room || room.status !== "free") {
      return NextResponse.json({ error: "Room not available" }, { status: 400 });
    }

    // Calculate agent commission
    let agentCommissionCents = 0;
    const agentId = tech.agent_id ?? null;

    if (agentId) {
      const { data: commRule } = await supabase
        .from("agent_package_commissions")
        .select("commission_amount")
        .eq("agent_id", agentId)
        .eq("package_key", package_key)
        .single();

      agentCommissionCents = commRule?.commission_amount ?? DEFAULT_AGENT_COMMISSION_CENTS;
    }

    // Handle member payment
    let principalUsed = 0;
    let rewardUsed = 0;
    let cashPaid = totalCents;
    let isNewCustomer = !member_id;

    if (member_id && payment_method !== "cash") {
      const { data: member } = await supabase
        .from("members")
        .select("principal_cents,reward_cents")
        .eq("id", member_id)
        .single();

      if (member) {
        if (payment_method === "member_account") {
          principalUsed = Math.min(member.principal_cents, totalCents);
          const rem = totalCents - principalUsed;
          rewardUsed = Math.min(member.reward_cents, rem);
          cashPaid = totalCents - principalUsed - rewardUsed;
        } else if (payment_method === "split") {
          // Partial member, partial cash
          principalUsed = body.principal_used_cents ?? 0;
          rewardUsed = body.reward_used_cents ?? 0;
          cashPaid = totalCents - principalUsed - rewardUsed;
        }
      }
    }

    const orderNo = await generateOrderNo(supabase, businessDay);

    // Start transaction (use RPC or sequential calls)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_no: orderNo,
        business_day: businessDay,
        member_id: member_id || null,
        is_new_customer: isNewCustomer,
        technician_id,
        room_id,
        staff_id: profile.id,
        package_key,
        duration_minutes,
        total_cents: totalCents,
        commission_cents: commissionCents,
        agent_id: agentId,
        agent_commission_cents: agentCommissionCents,
        principal_used_cents: principalUsed,
        reward_used_cents: rewardUsed,
        cash_paid_cents: cashPaid,
        payment_method,
        status: "paid",
        note: note || null,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Update technician status → busy
    await supabase
      .from("technicians")
      .update({ status: "busy" })
      .eq("id", technician_id);

    // Update room → occupied
    await supabase
      .from("rooms")
      .update({ status: "occupied", updated_by: profile.id })
      .eq("id", room_id);

    // Deduct member balance
    if (member_id && (principalUsed > 0 || rewardUsed > 0)) {
      await supabase.rpc("deduct_member_balance", {
        p_member_id: member_id,
        p_principal_delta: -principalUsed,
        p_reward_delta: -rewardUsed,
        p_order_id: order.id,
        p_created_by: profile.id,
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error("Create order error:", e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
