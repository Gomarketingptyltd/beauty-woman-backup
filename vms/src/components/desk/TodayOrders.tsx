"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw } from "lucide-react";
import { formatAUD, todayBusinessDay } from "@/lib/business/business-day";
import { getPackage } from "@/lib/business/packages";
import type { Order, PackageKey } from "@/types";
import { toast } from "sonner";

type OrderWithRelations = Omit<Order, "technician" | "room" | "member"> & {
  technician?: { id: string; code: string; name: string; photos: string[] };
  room?: { id: string; code: string };
  member?: { id: string; code: string; display_name: string; tier: string } | null;
};

function useCountdown(paidAt: string | null, durationMinutes: number) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!paidAt) return;
    const tick = () => {
      const start = new Date(paidAt).getTime();
      const now = Date.now();
      const elapsedMs = now - start;
      const elapsedMin = Math.floor(elapsedMs / 60000);
      const rem = durationMinutes - elapsedMin;
      setElapsed(elapsedMin);
      setRemaining(rem);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [paidAt, durationMinutes]);

  return { remaining, elapsed };
}

function CountdownBadge({
  paidAt,
  durationMinutes,
}: {
  paidAt: string | null;
  durationMinutes: number;
}) {
  const { remaining, elapsed } = useCountdown(paidAt, durationMinutes);

  if (remaining === null) {
    return (
      <span className="text-xs text-brand-silver-dim/50">
        {durationMinutes}min
      </span>
    );
  }

  if (remaining <= 0) {
    return (
      <span className="text-xs font-bold text-red-400 animate-pulse">
        超时 {Math.abs(remaining)}min
      </span>
    );
  }

  const pct = Math.max(0, Math.min(100, (remaining / durationMinutes) * 100));
  const color =
    remaining <= 10
      ? "text-amber-400"
      : remaining <= 5
      ? "text-red-400 animate-pulse"
      : "text-green-400";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-noir-600 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            remaining <= 10 ? "bg-amber-400" : "bg-green-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${color}`}>
        剩 {remaining}min
      </span>
    </div>
  );
}

interface VoidDialogProps {
  order: OrderWithRelations;
  onClose: () => void;
  onVoided: () => void;
}

function VoidDialog({ order, onClose, onVoided }: VoidDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleVoid = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "前台冲正" }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "冲正失败");
        return;
      }
      toast.success(`订单 ${order.order_no} 已冲正`);
      onVoided();
    } catch {
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-noir-950/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="brand-card w-full max-w-md p-6 mx-4">
        <h3 className="font-cinzel text-lg font-bold silver-text mb-2">
          确认冲正
        </h3>
        <p className="text-brand-silver-dim text-sm mb-4">
          订单 <span className="text-brand-red font-mono">{order.order_no}</span> ·{" "}
          {order.technician?.name} · {formatAUD(order.total_cents)}
        </p>
        <div className="mb-4">
          <label className="block text-xs text-brand-silver-dim mb-1">冲正原因</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="前台冲正 / 客人取消 / 其他"
            className="w-full px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/20 text-sm text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red"
          />
        </div>
        <p className="text-xs text-amber-400/80 mb-4">
          冲正后将释放房间、技师恢复可接待，会员余额将退回。
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-brand-silver-dim/20 text-brand-silver-dim hover:border-brand-silver-dim/40 text-sm transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleVoid}
            disabled={submitting}
            className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 text-sm transition-colors font-medium flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            确认冲正
          </button>
        </div>
      </div>
    </div>
  );
}

interface ExtendDialogProps {
  order: OrderWithRelations;
  onClose: () => void;
  onExtended: () => void;
}

function ExtendDialog({ order, onClose, onExtended }: ExtendDialogProps) {
  const [minutes, setMinutes] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const handleExtend = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extend_minutes: minutes }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "加时失败");
        return;
      }
      toast.success(`已加时 ${minutes} 分钟`);
      onExtended();
    } catch {
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-noir-950/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="brand-card w-full max-w-sm p-6 mx-4">
        <h3 className="font-cinzel text-lg font-bold silver-text mb-2">加时</h3>
        <p className="text-brand-silver-dim text-sm mb-4">
          {order.technician?.name} · 房间 {order.room?.code}
        </p>
        <div className="flex gap-2 mb-4">
          {[15, 30, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => setMinutes(m)}
              className={`flex-1 py-2 rounded-lg text-sm border-2 transition-all ${
                minutes === m
                  ? "border-brand-red bg-brand-red/10 text-brand-red"
                  : "border-brand-red/15 text-brand-silver-dim hover:border-brand-red/30"
              }`}
            >
              {m}min
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-brand-silver-dim/20 text-brand-silver-dim hover:border-brand-silver-dim/40 text-sm transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleExtend}
            disabled={submitting}
            className="flex-1 btn-brand text-sm flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            确认加时
          </button>
        </div>
      </div>
    </div>
  );
}

export function TodayOrders() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [voidTarget, setVoidTarget] = useState<OrderWithRelations | null>(null);
  const [extendTarget, setExtendTarget] = useState<OrderWithRelations | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const today = todayBusinessDay();
      const res = await fetch(
        `/api/orders?business_day=${today}&status=paid`
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent refresh
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 60_000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const handleComplete = async (order: OrderWithRelations) => {
    setActionId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "操作失败");
        return;
      }
      toast.success(
        `下钟成功 · ${order.technician?.name} · 房间 ${order.room?.code} 已释放`
      );
      await fetchOrders();
    } catch {
      toast.error("网络错误");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-cinzel text-lg font-semibold silver-text">
            今日订单
          </h2>
          <p className="text-brand-silver-dim/60 text-xs mt-0.5">
            Today&apos;s Active Orders · {orders.length} 笔
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20 transition-colors"
          title="刷新"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-brand-silver-dim/50">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>今日暂无进行中的订单</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const pkg = order.package_key
              ? getPackage(order.package_key as PackageKey)
              : null;
            const isActing = actionId === order.id;

            return (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-noir-700/40 border border-brand-red/15 hover:border-brand-red/25 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-brand-silver-dim/60">
                        {order.order_no}
                      </span>
                      {order.member && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          {order.member.display_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-brand-silver font-medium text-sm">
                        {order.technician?.name ?? "—"}
                        <span className="text-brand-silver-dim/50 text-xs ml-1">
                          {order.technician?.code}
                        </span>
                      </span>
                      <span className="text-brand-silver-dim/50 text-xs">
                        房 {order.room?.code ?? "—"}
                      </span>
                      {pkg && (
                        <span className="text-brand-silver-dim text-xs">
                          {pkg.nameCn} · {order.duration_minutes}min
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <CountdownBadge
                        paidAt={order.paid_at}
                        durationMinutes={order.duration_minutes}
                      />
                      <span className="text-brand-red font-medium text-sm">
                        {formatAUD(order.total_cents)}
                      </span>
                      <span className="text-brand-silver-dim/50 text-xs capitalize">
                        {order.payment_method === "cash"
                          ? "现金"
                          : order.payment_method === "member_account"
                          ? "会员账户"
                          : "混合"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleComplete(order)}
                      disabled={isActing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/25 transition-colors whitespace-nowrap"
                    >
                      {isActing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      下钟
                    </button>
                    <button
                      onClick={() => setExtendTarget(order)}
                      disabled={isActing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors whitespace-nowrap"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      加时
                    </button>
                    <button
                      onClick={() => setVoidTarget(order)}
                      disabled={isActing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/70 text-xs hover:bg-red-500/20 transition-colors whitespace-nowrap"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      冲正
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {voidTarget && (
        <VoidDialog
          order={voidTarget}
          onClose={() => setVoidTarget(null)}
          onVoided={() => {
            setVoidTarget(null);
            fetchOrders();
          }}
        />
      )}

      {extendTarget && (
        <ExtendDialog
          order={extendTarget}
          onClose={() => setExtendTarget(null)}
          onExtended={() => {
            setExtendTarget(null);
            fetchOrders();
          }}
        />
      )}
    </>
  );
}
