"use client";

import { useState } from "react";
import { Search, UserPlus, CreditCard, Loader2 } from "lucide-react";
import { formatAUD } from "@/lib/business/business-day";
import type { Member, MemberTier } from "@/types";
import { toast } from "sonner";

const TIER_COLORS: Record<MemberTier, string> = {
  Casual: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  Standard: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  VIP: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Board: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export function MemberPanel() {
  const [tab, setTab] = useState<"search" | "create">("search");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Member | null>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupAccount, setTopupAccount] = useState<"principal" | "reward">("principal");
  const [topupNote, setTopupNote] = useState("");
  const [topping, setTopping] = useState(false);

  // Create form
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    tier: "Casual" as MemberTier,
    notes: "",
  });
  const [creating, setCreating] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/members?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      if (!Array.isArray(data) || data.length === 0) {
        toast.info("未找到匹配会员");
      }
    } catch {
      toast.error("查询失败");
    } finally {
      setSearching(false);
    }
  };

  const handleTopup = async () => {
    if (!selected || !topupAmount) return;
    const cents = Math.round(parseFloat(topupAmount) * 100);
    if (isNaN(cents) || cents <= 0) {
      toast.error("请输入有效金额");
      return;
    }
    setTopping(true);
    try {
      const res = await fetch(`/api/members/${selected.id}/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_cents: cents,
          account: topupAccount,
          note: topupNote || "手动充值",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "充值失败");
        return;
      }
      const updated = await res.json();
      setSelected(updated);
      setResults((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setTopupAmount("");
      setTopupNote("");
      toast.success(`充值成功 · ${formatAUD(cents)}`);
    } catch {
      toast.error("网络错误");
    } finally {
      setTopping(false);
    }
  };

  const handleCreate = async () => {
    if (!form.display_name.trim()) {
      toast.error("请输入姓名");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "创建失败");
        return;
      }
      const member = await res.json();
      toast.success(`会员创建成功 · ${member.code}`);
      setForm({ display_name: "", phone: "", tier: "Casual", notes: "" });
      setTab("search");
      setSearch(member.phone || member.display_name);
      setResults([member]);
    } catch {
      toast.error("网络错误");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: search/create */}
      <div>
        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-lg bg-noir-700">
          {(["search", "create"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                tab === t
                  ? "bg-brand-red text-white"
                  : "text-brand-silver-dim hover:text-brand-silver"
              }`}
            >
              {t === "search" ? "🔍 查询会员" : "➕ 新建会员"}
            </button>
          ))}
        </div>

        {tab === "search" && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="手机号 / 姓名 / 会员号"
                className="flex-1 px-3 py-2.5 rounded-lg bg-noir-700 border border-brand-silver-dim/20 text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red text-sm"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2.5 rounded-lg bg-brand-red text-white hover:bg-brand-red-light transition-colors"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="space-y-2">
              {results.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelected(member)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selected?.id === member.id
                      ? "border-brand-red bg-brand-red/10"
                      : "border-brand-red/15 bg-noir-700/50 hover:border-brand-red/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-silver font-medium">
                        {member.display_name}
                      </p>
                      <p className="text-brand-silver-dim text-xs">
                        {member.code} · {member.phone || "无手机"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${TIER_COLORS[member.tier]}`}
                    >
                      {member.tier}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-brand-silver-dim">
                    <span>本金：{formatAUD(member.principal_cents)}</span>
                    <span>奖励：{formatAUD(member.reward_cents)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "create" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-brand-silver-dim mb-1">
                姓名 *
              </label>
              <input
                value={form.display_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_name: e.target.value }))
                }
                placeholder="会员姓名"
                className="w-full px-3 py-2 rounded-lg bg-noir-700 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
              />
            </div>
            <div>
              <label className="block text-xs text-brand-silver-dim mb-1">
                手机号
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="04XXXXXXXX"
                className="w-full px-3 py-2 rounded-lg bg-noir-700 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
              />
            </div>
            <div>
              <label className="block text-xs text-brand-silver-dim mb-1">
                会员等级
              </label>
              <select
                value={form.tier}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tier: e.target.value as MemberTier }))
                }
                className="w-full px-3 py-2 rounded-lg bg-noir-700 border border-brand-silver-dim/20 text-sm text-foreground focus:outline-none focus:border-brand-red"
              >
                <option value="Casual">Casual — 散客</option>
                <option value="Standard">Standard — 普通会员 ($50年费)</option>
                <option value="VIP">VIP — 高级会员 ($10,000预充)</option>
                <option value="Board">Board — 董事会员 ($100,000预充)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-silver-dim mb-1">
                备注
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-noir-700 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red resize-none"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="btn-brand w-full flex items-center justify-center gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              创建会员
            </button>
          </div>
        )}
      </div>

      {/* Right: member detail + topup */}
      {selected ? (
        <div className="brand-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-cinzel text-xl font-bold silver-text">
                {selected.display_name}
              </h3>
              <p className="text-brand-silver-dim text-sm">
                会员 {selected.code} · {selected.phone || "无手机"}
              </p>
            </div>
            <span
              className={`text-sm px-3 py-1 rounded-full border ${TIER_COLORS[selected.tier]}`}
            >
              {selected.tier}
            </span>
          </div>

          {/* Balance */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-4 rounded-xl bg-noir-700 border border-brand-red/15 text-center">
              <p className="text-xs text-brand-silver-dim mb-1">本金余额</p>
              <p className="text-2xl font-bold text-brand-silver">
                {formatAUD(selected.principal_cents)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-noir-700 border border-brand-red/15 text-center">
              <p className="text-xs text-brand-silver-dim mb-1">奖励余额</p>
              <p className="text-2xl font-bold text-amber-400">
                {formatAUD(selected.reward_cents)}
              </p>
            </div>
          </div>

          {/* Topup */}
          <div className="border-t border-brand-red/10 pt-4">
            <h4 className="text-brand-silver font-medium mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-red" />
              充值
            </h4>
            <div className="flex gap-2 mb-3">
              {(["principal", "reward"] as const).map((acc) => (
                <button
                  key={acc}
                  onClick={() => setTopupAccount(acc)}
                  className={`flex-1 py-2 rounded-lg text-sm border-2 transition-all ${
                    topupAccount === acc
                      ? "border-brand-red bg-brand-red/10 text-brand-red"
                      : "border-brand-red/15 text-brand-silver-dim hover:border-brand-red/30"
                  }`}
                >
                  {acc === "principal" ? "充入本金" : "充入奖励"}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <input
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="金额 (AUD)"
                type="number"
                min="0"
                step="0.01"
                className="flex-1 px-3 py-2 rounded-lg bg-noir-700 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
              />
            </div>
            <input
              value={topupNote}
              onChange={(e) => setTopupNote(e.target.value)}
              placeholder="备注（可选）"
              className="w-full px-3 py-2 rounded-lg bg-noir-700 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red mb-3"
            />
            <button
              onClick={handleTopup}
              disabled={topping || !topupAmount}
              className="btn-brand w-full flex items-center justify-center gap-2"
            >
              {topping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "确认充值"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="brand-card p-8 flex flex-col items-center justify-center text-center text-brand-silver-dim">
          <CreditCard className="h-12 w-12 mb-3 opacity-20" />
          <p>选择左侧会员</p>
          <p className="text-xs mt-1 opacity-60">查看余额 · 充值 · 修改信息</p>
        </div>
      )}
    </div>
  );
}
