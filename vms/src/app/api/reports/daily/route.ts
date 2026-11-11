import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { todayBusinessDay } from "@/lib/business/business-day";
import type { Role, DailyReport } from "@/types";

interface OrderRow {
  total_cents: number;
  commission_cents: number;
  agent_commission_cents?: number;
  is_new_customer: boolean;
  member_id: string | null;
  payment_method: string;
  principal_used_cents: number;
  reward_used_cents: number;
  cash_paid_cents: number;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !hasPermission(profile.role as Role, "VIEW_REPORTS")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const role = profile.role as Role;
    const showAgentData = hasPermission(role, "VIEW_AGENT_COMMISSION");

    const { searchParams } = new URL(req.url);
    const businessDay = searchParams.get("date") || todayBusinessDay();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("total_cents,commission_cents,agent_commission_cents,is_new_customer,member_id,payment_method,principal_used_cents,reward_used_cents,cash_paid_cents")
      .eq("business_day", businessDay)
      .eq("status", "paid");

    if (error) throw error;

    const orderList = (orders ?? []) as OrderRow[];

    const report: DailyReport = {
      business_day: businessDay,
      total_revenue_cents: orderList.reduce((s, o) => s + o.total_cents, 0),
      order_count: orderList.length,
      new_customer_count: orderList.filter((o) => o.is_new_customer).length,
      member_order_count: orderList.filter((o) => o.member_id).length,
      cash_revenue_cents: orderList.reduce((s, o) => s + o.cash_paid_cents, 0),
      member_revenue_cents: orderList.reduce(
        (s, o) => s + o.principal_used_cents + o.reward_used_cents,
        0
      ),
      tech_commission_cents: orderList.reduce(
        (s, o) => s + o.commission_cents,
        0
      ),
      agent_commission_cents: showAgentData
        ? orderList.reduce((s, o) => s + (o.agent_commission_cents ?? 0), 0)
        : 0,
      net_revenue_cents: 0,
    };

    report.net_revenue_cents =
      report.total_revenue_cents -
      report.tech_commission_cents -
      report.agent_commission_cents;

    return NextResponse.json(report);
  } catch (e) {
    console.error("Daily report error:", e);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
