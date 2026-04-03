"use client";

import { useState } from "react";
import { ChevronLeft, Search, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { formatAUD } from "@/lib/business/business-day";
import { getPackage } from "@/lib/business/packages";
import { calcMemberDeduction } from "@/lib/business/commission";
import type { Member } from "@/types";
import type { WizardState } from "@/components/desk/OrderWizard";
import { toast } from "sonner";

interface ConfirmStepProps {
  state: WizardState;
  onUpdate: (updates: Partial<WizardState>) => void;
  onBack: () => void;
  onSuccess: () => void;
}

export function ConfirmStep({
  state,
  onUpdate,
  onBack,
  onSuccess,
}: ConfirmStepProps) {
  const [memberSearch, setMemberSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundMember, setFoundMember] = useState<Member | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const pkg = state.package_key ? getPackage(state.package_key) : null;
  const total = state.price ?? 0;

  const deduction =
    foundMember && state.payment_method === "member_account"
      ? calcMemberDeduction(
          total * 100,
          foundMember.principal_cents,
          foundMember.reward_cents
        )
      : null;

  const handleMemberSearch = async () => {
    if (!memberSearch.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/members?search=${encodeURIComponent(memberSearch)}`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setFoundMember(data[0]);
        onUpdate({ member_id: data[0].id, member_name: data[0].display_name });
        toast.success(`找到会员：${data[0].display_name}`);
      } else {
        toast.error("未找到会员，将作为散客开单");
        setFoundMember(null);
        onUpdate({ member_id: null, member_name: null });
      }
    } catch {
      toast.error("查询失败");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!state.package_key || !state.duration_minutes || !state.technician || !state.room) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_key: state.package_key,
          duration_minutes: state.duration_minutes,
          technician_id: state.technician.id,
          room_id: state.room.id,
          member_id: state.member_id,
          payment_method: state.payment_method,
          note: state.note,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "开单失败");
        return;
      }

      const order = await res.json();
      setSuccess(true);
      toast.success(`开单成功 · ${order.order_no}`);
      setTimeout(onSuccess, 2000);
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="font-cinzel text-2xl silver-text mb-2">开单成功</h3>
        <p className="text-brand-silver-dim">正在重置页面...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-cinzel text-xl font-semibold silver-text mb-6">
        Step 4 · 确认开单
      </h2>

      {/* Order summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <SummaryItem label="套餐" value={pkg ? `${pkg.nameCn} · ${pkg.nameEn}` : "—"} />
        <SummaryItem label="时长" value={state.duration_minutes ? `${state.duration_minutes} 分钟` : "—"} />
        <SummaryItem label="技师" value={state.technician?.name ?? "—"} />
        <SummaryItem label="房间" value={state.room?.code ?? "—"} />
        <SummaryItem
          label="总价"
          value={formatAUD(total * 100)}
          highlight
        />
      </div>

      {/* Member lookup */}
      <div className="mb-4 p-4 rounded-xl bg-noir-700/50 border border-brand-red/15">
        <p className="text-brand-silver text-sm font-medium mb-3">会员查询（可选）</p>
        <div className="flex gap-2">
          <input
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleMemberSearch()}
            placeholder="输入手机号、姓名或会员号"
            className="flex-1 px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
          />
          <button
            onClick={handleMemberSearch}
            disabled={searching}
            className="px-3 py-2 rounded-lg bg-brand-red/20 border border-brand-red/30 text-brand-red hover:bg-brand-red/30 transition-colors"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </div>

        {foundMember && (
          <div className="mt-3 p-3 rounded-lg bg-brand-red/10 border border-brand-red/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-silver font-medium">
                  {foundMember.display_name}
                </p>
                <p className="text-xs text-brand-silver-dim">
                  会员 {foundMember.code} ·{" "}
                  <span className="text-brand-red">{foundMember.tier}</span>
                </p>
                <p className="text-xs text-brand-silver-dim/70 mt-0.5">
                  本金：{formatAUD(foundMember.principal_cents)} ·
                  奖励：{formatAUD(foundMember.reward_cents)}
                </p>
              </div>
              <button
                onClick={() => {
                  setFoundMember(null);
                  onUpdate({ member_id: null, member_name: null });
                  setMemberSearch("");
                }}
                className="text-xs text-brand-silver-dim hover:text-red-400"
              >
                清除
              </button>
            </div>
          </div>
        )}

        {!foundMember && (
          <p className="text-xs text-brand-silver-dim/50 mt-2">
            未选择会员将作为散客处理
          </p>
        )}
      </div>

      {/* Payment method */}
      {foundMember && (
        <div className="mb-4 p-4 rounded-xl bg-noir-700/50 border border-brand-red/15">
          <p className="text-brand-silver text-sm font-medium mb-3">支付方式</p>
          <div className="flex gap-2">
            {(["cash", "member_account", "split"] as const).map((method) => (
              <button
                key={method}
                onClick={() => onUpdate({ payment_method: method })}
                className={`flex-1 py-2 rounded-lg text-sm border-2 transition-all ${
                  state.payment_method === method
                    ? "border-brand-red bg-brand-red/10 text-brand-red"
                    : "border-brand-red/15 text-brand-silver-dim hover:border-brand-red/30"
                }`}
              >
                {method === "cash" ? "现金" : method === "member_account" ? "会员账户" : "混合"}
              </button>
            ))}
          </div>
          {deduction && state.payment_method === "member_account" && (
            <div className="mt-2 text-xs text-brand-silver-dim space-y-0.5">
              <p>扣本金：{formatAUD(deduction.principal_deducted)}</p>
              {deduction.reward_deducted > 0 && (
                <p>扣奖励：{formatAUD(deduction.reward_deducted)}</p>
              )}
              {deduction.cash_required > 0 && (
                <p className="text-amber-400">
                  余额不足，需补现金：{formatAUD(deduction.cash_required)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Note */}
      <div className="mb-6">
        <textarea
          value={state.note}
          onChange={(e) => onUpdate({ note: e.target.value })}
          placeholder="备注（可选）"
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red resize-none"
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-silver-dim hover:text-brand-silver transition-colors px-4 py-2 rounded-lg border border-brand-silver-dim/20 hover:border-brand-silver-dim/40"
        >
          <ChevronLeft className="h-4 w-4" />
          上一步
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-brand flex items-center gap-2 text-base px-8"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              处理中...
            </>
          ) : (
            `确认开单 · ${formatAUD(total * 100)}`
          )}
        </button>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-3 rounded-lg bg-noir-700/50 border border-brand-red/10">
      <p className="text-brand-silver-dim/60 text-xs">{label}</p>
      <p
        className={`font-medium mt-0.5 ${
          highlight ? "text-brand-red text-lg font-bold" : "text-brand-silver"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
