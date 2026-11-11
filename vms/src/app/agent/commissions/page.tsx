import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatAUD, formatSydneyTime } from "@/lib/business/business-day";
import { getPackage } from "@/lib/business/packages";
import type { PackageKey } from "@/types";
import { format } from "date-fns";

export default async function AgentCommissionsPage() {
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

  const currentMonth = format(new Date(), "yyyy-MM");

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id,order_no,business_day,package_key,duration_minutes,total_cents,agent_commission_cents,created_at,technician:technicians(name,code)"
    )
    .eq("agent_id", profile.agent_id)
    .eq("status", "paid")
    .like("business_day", `${currentMonth}%`)
    .order("created_at", { ascending: false });

  const orderList = orders ?? [];
  const totalCommission = orderList.reduce(
    (s, o) => s + o.agent_commission_cents,
    0
  );

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl font-bold silver-text">提成明细</h1>
          <p className="text-brand-silver-dim text-sm mt-1">
            Commission Statement · {currentMonth}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold font-cinzel text-amber-400">
            {formatAUD(totalCommission)}
          </p>
          <p className="text-brand-silver-dim text-xs">本月应得提成</p>
        </div>
      </div>

      <div className="brand-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-red/15">
              <th className="text-left py-3 px-4 text-brand-silver-dim font-medium">
                订单
              </th>
              <th className="text-left py-3 px-4 text-brand-silver-dim font-medium">
                日期
              </th>
              <th className="text-left py-3 px-4 text-brand-silver-dim font-medium">
                技师
              </th>
              <th className="text-left py-3 px-4 text-brand-silver-dim font-medium">
                套餐
              </th>
              <th className="text-left py-3 px-4 text-brand-silver-dim font-medium">
                订单金额
              </th>
              <th className="text-right py-3 px-4 text-brand-silver-dim font-medium">
                提成
              </th>
            </tr>
          </thead>
          <tbody>
            {orderList.map((order, idx) => {
              const pkg = getPackage(order.package_key as PackageKey);
              const tech = (order.technician as unknown) as { name: string; code: string } | null;
              return (
                <tr
                  key={order.id}
                  className={`border-b border-brand-red/5 ${
                    idx % 2 === 0 ? "bg-noir-700/20" : ""
                  }`}
                >
                  <td className="py-3 px-4 text-brand-silver-dim font-mono text-xs">
                    {order.order_no}
                  </td>
                  <td className="py-3 px-4 text-brand-silver-dim text-xs">
                    {order.business_day}
                  </td>
                  <td className="py-3 px-4 text-brand-silver">
                    {tech?.name ?? "—"}
                    <span className="text-brand-silver-dim/50 text-xs ml-1">
                      {tech?.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-brand-silver-dim text-xs">
                    {pkg.nameCn}
                    <br />
                    <span className="text-brand-silver-dim/50">
                      {order.duration_minutes}min
                    </span>
                  </td>
                  <td className="py-3 px-4 text-brand-silver">
                    {formatAUD(order.total_cents)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-amber-400">
                    {formatAUD(order.agent_commission_cents)}
                  </td>
                </tr>
              );
            })}
            {orderList.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-brand-silver-dim/50"
                >
                  本月暂无提成记录
                </td>
              </tr>
            )}
          </tbody>
          {orderList.length > 0 && (
            <tfoot>
              <tr className="border-t border-brand-red/20 bg-noir-700/30">
                <td
                  colSpan={5}
                  className="py-3 px-4 text-brand-silver font-medium"
                >
                  本月合计
                </td>
                <td className="py-3 px-4 text-right font-bold text-amber-400 text-lg font-cinzel">
                  {formatAUD(totalCommission)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
