"use client";

import { useState, useEffect } from "react";
import { Plus, UserCog, Loader2, Shield, Check } from "lucide-react";
import type { Profile, Role, Agent } from "@/types";
import { toast } from "sonner";

const ROLE_LABELS: Record<Role, { label: string; color: string }> = {
  admin: { label: "管理员", color: "text-brand-red bg-brand-red/10 border-brand-red/20" },
  manager: { label: "店长", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  staff: { label: "前台", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  agent: { label: "中介", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
};

export function AccountManagement() {
  const [accounts, setAccounts] = useState<Profile[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    display_name: "",
    role: "staff" as Role,
    phone: "",
    agent_id: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/accounts").then((r) => r.json()),
      fetch("/api/agents").then((r) => r.json()),
    ])
      .then(([accs, ags]) => {
        setAccounts(Array.isArray(accs) ? accs : []);
        setAgents(Array.isArray(ags) ? ags : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password) {
      toast.error("请填写账号和密码");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          agent_id: form.agent_id || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "创建失败");
        return;
      }
      const profile = await res.json();
      setAccounts((prev) => [profile, ...prev]);
      setShowCreate(false);
      setForm({
        username: "",
        password: "",
        display_name: "",
        role: "staff",
        phone: "",
        agent_id: "",
      });
      toast.success("账号创建成功");
    } catch {
      toast.error("网络错误");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (profile: Profile) => {
    try {
      const res = await fetch(`/api/accounts/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !profile.is_active }),
      });
      if (!res.ok) throw new Error();
      setAccounts((prev) =>
        prev.map((p) =>
          p.id === profile.id ? { ...p, is_active: !p.is_active } : p
        )
      );
      toast.success(profile.is_active ? "账号已停用" : "账号已启用");
    } catch {
      toast.error("操作失败");
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
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 btn-brand"
        >
          <Plus className="h-4 w-4" />
          新建账号
        </button>
      </div>

      {showCreate && (
        <div className="brand-card p-5 mb-6 grid grid-cols-2 gap-3">
          <h3 className="col-span-2 font-cinzel text-brand-silver font-medium">
            新建账号
          </h3>
          <div>
            <label className="block text-xs text-brand-silver-dim mb-1">
              账号（序号）*
            </label>
            <input
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              placeholder="如：001、staff01"
              className="w-full px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-silver-dim mb-1">
              密码 *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="至少8位"
              className="w-full px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-silver-dim mb-1">
              显示名称
            </label>
            <input
              value={form.display_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, display_name: e.target.value }))
              }
              placeholder="姓名"
              className="w-full px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-silver-dim mb-1">
              角色
            </label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as Role }))
              }
              className="w-full px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground focus:outline-none focus:border-brand-red"
            >
              <option value="staff">前台 (Staff)</option>
              <option value="manager">店长 (Manager)</option>
              <option value="admin">管理员 (Admin)</option>
              <option value="agent">中介 (Agent)</option>
            </select>
          </div>
          {form.role === "agent" && (
            <div className="col-span-2">
              <label className="block text-xs text-brand-silver-dim mb-1">
                关联中介
              </label>
              <select
                value={form.agent_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, agent_id: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground focus:outline-none focus:border-brand-red"
              >
                <option value="">— 选择中介 —</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="col-span-2">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="btn-brand w-full flex items-center justify-center gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "创建账号"
              )}
            </button>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-red/15">
            <th className="text-left py-3 px-3 text-brand-silver-dim font-medium">
              账号
            </th>
            <th className="text-left py-3 px-3 text-brand-silver-dim font-medium">
              角色
            </th>
            <th className="text-left py-3 px-3 text-brand-silver-dim font-medium">
              状态
            </th>
            <th className="text-left py-3 px-3 text-brand-silver-dim font-medium">
              创建时间
            </th>
            <th className="py-3 px-3" />
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc, idx) => {
            const roleInfo = ROLE_LABELS[acc.role as Role] ?? {
              label: acc.role,
              color: "text-gray-400",
            };
            return (
              <tr
                key={acc.id}
                className={`border-b border-brand-red/5 ${
                  idx % 2 === 0 ? "bg-noir-700/20" : "bg-noir-600/10"
                } hover:bg-brand-red/5 transition-colors`}
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-red/15 border border-brand-red/20 flex items-center justify-center">
                      <Shield className="h-3.5 w-3.5 text-brand-red/60" />
                    </div>
                    <div>
                      <p className="text-brand-silver font-medium">
                        {acc.username}
                      </p>
                      {acc.display_name && (
                        <p className="text-brand-silver-dim/50 text-xs">
                          {acc.display_name}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${roleInfo.color}`}
                  >
                    {roleInfo.label}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      acc.is_active
                        ? "text-green-400 bg-green-500/10 border-green-500/20"
                        : "text-gray-500 bg-gray-500/10 border-gray-500/20"
                    }`}
                  >
                    {acc.is_active ? "启用" : "停用"}
                  </span>
                </td>
                <td className="py-3 px-3 text-brand-silver-dim/50 text-xs">
                  {new Date(acc.created_at).toLocaleDateString("zh-AU")}
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => handleToggleActive(acc)}
                    className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                      acc.is_active
                        ? "text-red-400 border-red-500/20 hover:bg-red-500/10"
                        : "text-green-400 border-green-500/20 hover:bg-green-500/10"
                    }`}
                  >
                    {acc.is_active ? "停用" : "启用"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
