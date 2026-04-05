"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, Clock, Loader2 } from "lucide-react";
import { getPackage } from "@/lib/business/packages";
import { formatAUD } from "@/lib/business/business-day";
import type { PackageKey } from "@/types";
import { toast } from "sonner";

interface ActiveOrder {
  order_id: string;
  order_no: string;
  technician_id: string;
  technician_name: string;
  technician_code: string;
  package_key: string;
  duration_minutes: number;
  paid_at: string | null;
}

interface RoomActionDialogProps {
  roomCode: string;
  activeOrder: ActiveOrder;
  onClose: () => void;
  onDone: () => void;
}

function useSecondCountdown(paidAt: string | null, durationMinutes: number) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!paidAt) return;
    const tick = () => {
      const elapsedMs = Date.now() - new Date(paidAt).getTime();
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const totalSec = durationMinutes * 60;
      setRemaining(totalSec - elapsedSec);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [paidAt, durationMinutes]);

  return remaining;
}

function formatCountdown(remainingSec: number | null): {
  display: string;
  status: "normal" | "warning" | "overtime";
} {
  if (remainingSec === null) {
    return { display: "--:--", status: "normal" };
  }
  if (remainingSec < 0) {
    const abs = Math.abs(remainingSec);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    return {
      display: `+${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      status: "overtime",
    };
  }
  const m = Math.floor(remainingSec / 60);
  const s = remainingSec % 60;
  const display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  // warning ≤ 5 minutes
  const status = m < 5 || (m === 5 && s === 0) ? "warning" : "normal";
  return { display, status };
}

export function RoomActionDialog({
  roomCode,
  activeOrder,
  onClose,
  onDone,
}: RoomActionDialogProps) {
  const [mode, setMode] = useState<"main" | "extend">("main");
  const [extendDuration, setExtendDuration] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const remainingSec = useSecondCountdown(
    activeOrder.paid_at,
    activeOrder.duration_minutes
  );
  const { display: cdDisplay, status: cdStatus } = formatCountdown(remainingSec);

  const pkg = (() => {
    try {
      return getPackage(activeOrder.package_key as PackageKey);
    } catch {
      return null;
    }
  })();

  const cdColor =
    cdStatus === "overtime"
      ? "text-red-400"
      : cdStatus === "warning"
      ? "text-amber-400"
      : "text-white";

  const cdPulse = cdStatus === "overtime" ? "animate-pulse" : "";

  // End service
  const handleEndService = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/orders/end-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technician_id: activeOrder.technician_id }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "下钟失败");
        return;
      }
      toast.success(
        `下钟成功 · ${activeOrder.technician_name} · 房间 ${roomCode} 已释放`
      );
      onDone();
    } catch {
      toast.error("网络错误");
    } finally {
      setBusy(false);
    }
  };

  // Extend (new order with skip_status_update)
  const handleExtend = async () => {
    if (!extendDuration || !pkg) return;
    setBusy(true);
    try {
      // Find price for selected duration
      const durOption = pkg.durations.find((d) => d.minutes === extendDuration);
      if (!durOption) {
        toast.error("无效时长");
        return;
      }

      // We need the room_id — fetch from latest order
      const orderRes = await fetch(
        `/api/orders?status=paid&technician_id=${activeOrder.technician_id}`
      );
      const orders = orderRes.ok ? await orderRes.json() : [];
      const latestOrder = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;
      const roomId = latestOrder?.room_id ?? null;

      if (!roomId) {
        toast.error("无法获取房间信息");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_key: activeOrder.package_key,
          duration_minutes: extendDuration,
          technician_id: activeOrder.technician_id,
          room_id: roomId,
          member_id: null,
          payment_method: "cash",
          note: `加时单 (延续 ${activeOrder.order_no})`,
          skip_status_update: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "加时失败");
        return;
      }
      const newOrder = await res.json();
      toast.success(`加时成功 · ${newOrder.order_no} · +${extendDuration}min`);
      onDone();
    } catch {
      toast.error("网络错误");
    } finally {
      setBusy(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-noir-950/75 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Dialog — fixed 272px wide */}
      <div
        className="relative flex flex-col bg-[#0A0608] border border-brand-red/60 rounded-2xl overflow-hidden"
        style={{
          width: 272,
          boxShadow:
            "0 0 0 1px rgba(200,24,42,0.3), 0 0 30px rgba(200,24,42,0.25), 0 0 60px rgba(200,24,42,0.12)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-brand-silver-dim/40 hover:text-brand-silver hover:bg-white/5 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-brand-red/15">
          <div className="flex items-baseline gap-2">
            <span className="font-cinzel text-2xl font-bold silver-text">
              {roomCode}
            </span>
            <span className="text-brand-silver-dim/50 text-xs">服务中</span>
          </div>

          {/* Countdown */}
          <div className="mt-3 flex items-center justify-center">
            <span
              className={`font-cinzel text-4xl font-bold tabular-nums tracking-widest ${cdColor} ${cdPulse}`}
            >
              {cdDisplay}
            </span>
          </div>
          {cdStatus === "overtime" && (
            <p className="text-center text-xs text-red-400/80 mt-1">超时</p>
          )}
          {cdStatus === "warning" && (
            <p className="text-center text-xs text-amber-400/80 mt-1">即将结束</p>
          )}
        </div>

        {/* Order info */}
        <div className="px-5 py-3 space-y-1 border-b border-brand-red/10">
          <InfoRow label="技师" value={`${activeOrder.technician_code} ${activeOrder.technician_name}`} />
          <InfoRow label="套餐" value={pkg ? `${pkg.nameCn}` : activeOrder.package_key} />
          <InfoRow label="时长" value={`${activeOrder.duration_minutes} min`} />
          <InfoRow label="单号" value={activeOrder.order_no} mono />
        </div>

        {/* Actions */}
        <div className="px-5 py-4 space-y-2">
          {mode === "main" && (
            <>
              {/* End service */}
              <button
                onClick={handleEndService}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/15 border border-green-500/35 text-green-400 text-sm font-medium hover:bg-green-500/25 transition-colors"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                下钟 · 完成服务
              </button>

              {/* Extend */}
              {pkg && (
                <button
                  onClick={() => setMode("extend")}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-400 text-sm font-medium hover:bg-amber-500/25 transition-colors"
                >
                  <Clock className="h-4 w-4" />
                  加时 · 续单
                </button>
              )}
            </>
          )}

          {mode === "extend" && pkg && (
            <>
              <p className="text-xs text-brand-silver-dim/60 mb-2">
                选择加时套餐（全价新单）：
              </p>
              <div className="space-y-1.5">
                {pkg.durations.map((d) => (
                  <button
                    key={d.minutes}
                    onClick={() =>
                      setExtendDuration(
                        extendDuration === d.minutes ? null : d.minutes
                      )
                    }
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      extendDuration === d.minutes
                        ? "border-brand-red bg-brand-red/15 text-brand-red"
                        : "border-brand-red/15 text-brand-silver-dim hover:border-brand-red/35"
                    }`}
                  >
                    <span>{d.minutes} min</span>
                    <span className="font-medium">{formatAUD(d.price * 100)}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setMode("main"); setExtendDuration(null); }}
                  className="flex-1 py-2 rounded-lg border border-brand-silver-dim/20 text-brand-silver-dim text-sm hover:border-brand-silver-dim/40 transition-colors"
                >
                  返回
                </button>
                <button
                  onClick={handleExtend}
                  disabled={!extendDuration || busy}
                  className="flex-1 btn-brand text-sm flex items-center justify-center gap-2 py-2"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  确认加时
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-brand-silver-dim/50 flex-shrink-0">{label}</span>
      <span
        className={`text-xs text-brand-silver truncate ${mono ? "font-mono text-brand-silver-dim/70" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
