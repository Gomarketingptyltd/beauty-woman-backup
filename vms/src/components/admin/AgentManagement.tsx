"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronRight, Loader2, Handshake, Users, DollarSign } from "lucide-react";
import { formatAUD } from "@/lib/business/business-day";
import { PACKAGE_LIST } from "@/lib/business/packages";
import type { Agent, AgentPackageCommission, PackageKey } from "@/types";
import { toast } from "sonner";

interface AgentWithStats extends Agent {
  technician_count?: number;
}

export function AgentManagement() {
  const [agents, setAgents] = useState<AgentWithStats[]>([]);
  const [selected, setSelected] = useState<AgentWithStats | null>(null);
  const [commissions, setCommissions] = useState<AgentPackageCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    phone: "",
    wechat: "",
    default_commission: 20,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => setAgents(Array.isArray(data) ? data : []))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectAgent = async (agent: AgentWithStats) => {
    setSelected(agent);
    try {
      const res = await fetch(`/api/agents/${agent.id}/commissions`);
      if (res.ok) setCommissions(await res.json());
    } catch {}
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("请输入中介名称");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          contact: { phone: form.phone, wechat: form.wechat },
          default_commission: Math.round(form.default_commission * 100),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "创建失败");
        return;
      }
      const newAgent = await res.json();
      setAgents((prev) => [newAgent, ...prev]);
      setShowCreate(false);
      toast.success("中介创建成功");
    } catch {
      toast.error("网络错误");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateCommission = async (
    agentId: string,
    packageKey: PackageKey,
    amount: number
  ) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/commissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_key: packageKey,
          commission_amount: Math.round(amount * 100),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("提成规则已更新");
      const updated = await res.json();
      setCommissions(updated);
    } catch {
      toast.error("更新失败");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: agent list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-brand-silver font-medium">中介列表</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-red/15 border border-brand-red/30 text-brand-red text-sm hover:bg-brand-red/25 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            新增中介
          </button>
        </div>

        {showCreate && (
          <div className="brand-card p-4 mb-4 space-y-3">
            <h3 className="text-brand-silver font-medium text-sm">新增中介</h3>
            <input
              placeholder="中介名称 *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
            />
            <textarea
              placeholder="中介简介"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="联系电话"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
              />
              <input
                placeholder="微信"
                value={form.wechat}
                onChange={(e) =>
                  setForm((f) => ({ ...f, wechat: e.target.value }))
                }
                className="px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-brand-silver-dim text-sm whitespace-nowrap">
                默认提成 $
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.default_commission}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    default_commission: parseFloat(e.target.value),
                  }))
                }
                className="w-24 px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground focus:outline-none focus:border-brand-red"
              />
              <span className="text-brand-silver-dim text-xs">AUD / 单</span>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="btn-brand w-full flex items-center justify-center gap-2"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "确认新增"}
            </button>
          </div>
        )}

        <div className="space-y-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleSelectAgent(agent)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selected?.id === agent.id
                  ? "border-brand-red bg-brand-red/10"
                  : "border-brand-red/15 bg-noir-700/50 hover:border-brand-red/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Handshake className="h-5 w-5 text-brand-red/60" />
                  <div>
                    <p className="text-brand-silver font-medium">{agent.name}</p>
                    <p className="text-brand-silver-dim/60 text-xs mt-0.5">
                      默认提成：{formatAUD(agent.default_commission)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-brand-silver-dim/40" />
              </div>
            </button>
          ))}
          {agents.length === 0 && (
            <div className="text-center py-12 text-brand-silver-dim/50">
              <Handshake className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>暂无中介，点击右上角新增</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: agent detail */}
      {selected ? (
        <div className="space-y-4">
          <div className="brand-card p-5">
            <h3 className="font-cinzel text-xl font-bold silver-text mb-1">
              {selected.name}
            </h3>
            {selected.bio && (
              <p className="text-brand-silver-dim text-sm mb-3">{selected.bio}</p>
            )}
            <div className="flex gap-2 text-xs text-brand-silver-dim">
              {(selected.contact as { phone?: string; wechat?: string }).phone && (
                <span>📞 {(selected.contact as { phone?: string }).phone}</span>
              )}
              {(selected.contact as { wechat?: string }).wechat && (
                <span>💬 {(selected.contact as { wechat?: string }).wechat}</span>
              )}
            </div>
          </div>

          {/* Commission rules */}
          <div className="brand-card p-5">
            <h4 className="text-brand-silver font-medium mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-brand-red" />
              套餐提成规则
            </h4>
            <div className="space-y-3">
              {PACKAGE_LIST.map((pkg) => {
                const rule = commissions.find(
                  (c) => c.package_key === pkg.key
                );
                const currentAmount =
                  (rule?.commission_amount ?? selected.default_commission) / 100;

                return (
                  <div
                    key={pkg.key}
                    className="flex items-center gap-3 p-3 rounded-lg bg-noir-700/50 border border-brand-red/10"
                  >
                    <div className="flex-1">
                      <p className="text-brand-silver text-sm">{pkg.nameCn}</p>
                      <p className="text-brand-silver-dim/50 text-xs">
                        {pkg.nameEn}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-silver-dim text-xs">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={currentAmount}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val !== currentAmount) {
                            handleUpdateCommission(selected.id, pkg.key, val);
                          }
                        }}
                        className="w-20 px-2 py-1 rounded bg-noir-600 border border-brand-red/20 text-brand-red text-sm text-right focus:outline-none focus:border-brand-red"
                      />
                      <span className="text-brand-silver-dim text-xs">
                        {!rule ? "(默认)" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="brand-card p-8 flex flex-col items-center justify-center text-center text-brand-silver-dim">
          <Handshake className="h-12 w-12 mb-3 opacity-20" />
          <p>选择左侧中介</p>
          <p className="text-xs mt-1 opacity-60">查看详情 · 配置提成规则</p>
        </div>
      )}
    </div>
  );
}
