import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatAUD, todayBusinessDay } from "@/lib/business/business-day";
import { format, subDays } from "date-fns";
import { DollarSign, Users, ShoppingBag } from "lucide-react";

export default async function AgentDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agent_id")
    .eq("id", user.id)
    .single();

  if (!profile?.agent_id) redirect("/login");

  const agentId = profile.agent_id;

  // Get this month's orders for this agent
  const thisMonth = format(new Date(), "yyyy-MM");
  const { data: monthOrders } = await supabase
    .from("orders")
    .select("agent_commission_cents,technician_id")
    .eq("agent_id", agentId)
    .eq("status", "paid")
    .like("business_day", `${thisMonth}%`);

  // Get technician count
  const { count: techCount } = await supabase
    .from("technicians")
    .select("id", { count: "exact", head: true })
    .eq("agent_id", agentId)
    .eq("is_active", true);

  const monthOrders_ = monthOrders ?? [];
  const monthCommission = monthOrders_.reduce(
    (s, o) => s + o.agent_commission_cents,
    0
  );
  const monthOrderCount = monthOrders_.length;

  return (
    <div>
      <div className="page-header">
        <h1 className="font-cinzel text-2xl font-bold silver-text">中介仪表盘</h1>
        <p className="text-brand-silver-dim text-sm mt-1">Agent Dashboard</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="kpi-card relative overflow-hidden">
          <div className="accent-bar" />
          <DollarSign className="h-8 w-8 text-amber-400/20 absolute top-3 right-3" />
          <p className="text-2xl font-bold font-cinzel text-amber-400">
            {formatAUD(monthCommission)}
          </p>
          <p className="text-brand-silver text-sm mt-1">本月应得提成</p>
          <p className="text-brand-silver-dim/40 text-xs">Monthly Commission</p>
        </div>
        <div className="kpi-card relative overflow-hidden">
          <div className="accent-bar" />
          <ShoppingBag className="h-8 w-8 text-blue-400/20 absolute top-3 right-3" />
          <p className="text-2xl font-bold font-cinzel text-blue-400">
            {monthOrderCount}
          </p>
          <p className="text-brand-silver text-sm mt-1">本月订单</p>
          <p className="text-brand-silver-dim/40 text-xs">Monthly Orders</p>
        </div>
        <div className="kpi-card relative overflow-hidden">
          <div className="accent-bar" />
          <Users className="h-8 w-8 text-green-400/20 absolute top-3 right-3" />
          <p className="text-2xl font-bold font-cinzel text-green-400">
            {techCount ?? 0}
          </p>
          <p className="text-brand-silver text-sm mt-1">旗下技师</p>
          <p className="text-brand-silver-dim/40 text-xs">Active Technicians</p>
        </div>
      </div>

      <div className="brand-card p-4">
        <p className="text-brand-silver-dim text-sm">
          如需查看详细提成明细，请访问「提成明细」页面。
        </p>
        <p className="text-brand-silver-dim/50 text-xs mt-1">
          提成结算周期：每月底结算，具体请联系管理员。
        </p>
      </div>
    </div>
  );
}
