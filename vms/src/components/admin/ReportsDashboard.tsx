"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Users, ShoppingBag, DollarSign, Loader2 } from "lucide-react";
import { formatAUD, todayBusinessDay } from "@/lib/business/business-day";
import type { DailyReport, DailyTrafficPoint } from "@/types";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "#120E10",
    border: "1px solid rgba(200,24,42,0.3)",
    borderRadius: 8,
    color: "#F0EEE9",
    fontSize: 12,
  },
};

export function ReportsDashboard() {
  const [date, setDate] = useState(todayBusinessDay());
  const [report, setReport] = useState<DailyReport | null>(null);
  const [traffic, setTraffic] = useState<DailyTrafficPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAgentData, setShowAgentData] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [repRes, trafficRes] = await Promise.all([
          fetch(`/api/reports/daily?date=${date}`),
          fetch("/api/reports/traffic"),
        ]);
        if (repRes.ok) {
          const data = await repRes.json();
          setReport(data);
          setShowAgentData(data.agent_commission_cents !== undefined);
        }
        if (trafficRes.ok) setTraffic(await trafficRes.json());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 text-brand-red animate-spin" />
      </div>
    );
  }

  const kpis = report
    ? [
        {
          label: "总营业额",
          labelEn: "Total Revenue",
          value: formatAUD(report.total_revenue_cents),
          icon: DollarSign,
          color: "text-brand-red",
        },
        {
          label: "订单数",
          labelEn: "Orders",
          value: String(report.order_count),
          icon: ShoppingBag,
          color: "text-blue-400",
        },
        {
          label: "新客数",
          labelEn: "New Customers",
          value: String(report.new_customer_count),
          icon: Users,
          color: "text-green-400",
        },
        {
          label: "技师佣金",
          labelEn: "Tech Commission",
          value: formatAUD(report.tech_commission_cents),
          icon: TrendingUp,
          color: "text-purple-400",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Date picker */}
      <div className="flex items-center gap-4">
        <label className="text-brand-silver-dim text-sm">营业日：</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg bg-noir-700 border border-brand-silver-dim/20 text-brand-silver text-sm focus:outline-none focus:border-brand-red"
        />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card relative overflow-hidden">
            <div className="accent-bar" />
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-2xl font-bold font-cinzel ${kpi.color}`}>
                  {kpi.value}
                </p>
                <p className="text-brand-silver text-sm mt-1">{kpi.label}</p>
                <p className="text-brand-silver-dim/40 text-xs">{kpi.labelEn}</p>
              </div>
              <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      {/* Agent + Net revenue (admin/manager only) */}
      {showAgentData && report && (
        <div className="grid grid-cols-2 gap-4">
          <div className="kpi-card relative overflow-hidden">
            <div className="accent-bar" />
            <p className="text-2xl font-bold font-cinzel text-amber-400">
              {formatAUD(report.agent_commission_cents)}
            </p>
            <p className="text-brand-silver text-sm mt-1">中介提成</p>
            <p className="text-brand-silver-dim/40 text-xs">Agent Commission</p>
          </div>
          <div className="kpi-card relative overflow-hidden">
            <div className="accent-bar" />
            <p className="text-2xl font-bold font-cinzel text-green-400">
              {formatAUD(report.net_revenue_cents)}
            </p>
            <p className="text-brand-silver text-sm mt-1">店铺净收</p>
            <p className="text-brand-silver-dim/40 text-xs">Net Revenue</p>
          </div>
        </div>
      )}

      {/* Traffic charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="brand-card p-4">
          <h3 className="text-brand-silver font-medium mb-1 text-sm">近7日订单量</h3>
          <p className="text-brand-silver-dim/50 text-xs mb-4">Daily Order Count</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={traffic} barSize={20}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#8A8A96", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  tick={{ fill: "#8A8A96", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={25}
                />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Bar
                  dataKey="orders"
                  fill="#C8182A"
                  radius={[3, 3, 0, 0]}
                  name="订单"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="brand-card p-4">
          <h3 className="text-brand-silver font-medium mb-1 text-sm">近7日营业额 (AUD)</h3>
          <p className="text-brand-silver-dim/50 text-xs mb-4">Daily Revenue</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={traffic}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(200,24,42,0.1)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#8A8A96", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  tick={{ fill: "#8A8A96", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C8182A"
                  strokeWidth={2}
                  dot={{ fill: "#C8182A", r: 4 }}
                  name="营业额 $"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
