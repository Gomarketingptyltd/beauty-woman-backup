"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Image from "next/image";
import {
  RefreshCw,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { PACKAGE_LIST, getPackage } from "@/lib/business/packages";
import {
  formatAUD,
  todayBusinessDay,
  formatSydneyTime,
  getSydneyNow,
} from "@/lib/business/business-day";
import { calcMemberDeduction } from "@/lib/business/commission";
import { RoomActionDialog } from "./RoomActionDialog";
import type { PackageKey, Member } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface RoomData {
  id: string;
  code: string;
  room_type: "service" | "waiting" | "public";
  status: "free" | "occupied" | "cleaning" | "maintenance";
  active_order: ActiveOrder | null;
}

interface TechData {
  id: string;
  code: string;
  name: string;
  language: string[];
  photos: string[];
  status: string;
}

interface OrderRow {
  id: string;
  order_no: string;
  package_key: string;
  duration_minutes: number;
  total_cents: number;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
  technician: { name: string; code: string } | null;
  room: { code: string } | null;
  member: { display_name: string } | null;
  status: string;
}

// ─── useCountdowns — every-second tick for all occupied rooms ─────────────────

function useCountdowns(rooms: RoomData[]): Map<string, { remainingSec: number; status: "normal" | "warning" | "overtime" }> {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const map = new Map<string, { remainingSec: number; status: "normal" | "warning" | "overtime" }>();
  for (const room of rooms) {
    if (room.status !== "occupied" || !room.active_order?.paid_at) continue;
    const elapsedMs = Date.now() - new Date(room.active_order.paid_at).getTime();
    const totalSec = room.active_order.duration_minutes * 60;
    const remainingSec = totalSec - Math.floor(elapsedMs / 1000);
    const status =
      remainingSec < 0
        ? "overtime"
        : remainingSec <= 5 * 60
        ? "warning"
        : "normal";
    map.set(room.id, { remainingSec, status });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return map;
}

// ─── Small display helpers ────────────────────────────────────────────────────

function fmtCountdown(remainingSec: number): string {
  const abs = Math.abs(remainingSec);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  const base = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return remainingSec < 0 ? `+${base}` : base;
}

// ─── TechPanel — card with L-corner decorations ───────────────────────────────

function TechPanel({ children, title, titleEn }: { children: React.ReactNode; title: string; titleEn?: string }) {
  return (
    <div className="relative bg-[#0D0910] border border-brand-red/20 rounded-2xl p-4 overflow-hidden">
      {/* L-corner decorations */}
      {(["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"] as const).map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-4 h-4 pointer-events-none`}
          style={{
            borderColor: "rgba(200,24,42,0.55)",
            borderStyle: "solid",
            borderWidth: 0,
            ...(pos.includes("top") && pos.includes("left")
              ? { borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: "0.75rem" }
              : pos.includes("top") && pos.includes("right")
              ? { borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: "0.75rem" }
              : pos.includes("bottom") && pos.includes("left")
              ? { borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: "0.75rem" }
              : { borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: "0.75rem" }),
          }}
        />
      ))}
      <div className="flex items-baseline gap-2 mb-3 pb-2 border-b border-brand-red/10">
        <h2 className="font-cinzel font-semibold silver-text text-sm">{title}</h2>
        {titleEn && <span className="text-brand-silver-dim/40 text-xs">{titleEn}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── SelectionPill ────────────────────────────────────────────────────────────

function SelectionPill({ label, value }: { label: string; value: string | null }) {
  return (
    <div className={`flex-1 p-2.5 rounded-xl border-2 text-center transition-all ${
      value
        ? "border-brand-red/50 bg-brand-red/10"
        : "border-brand-silver-dim/10 bg-noir-700/20"
    }`}>
      <p className="text-brand-silver-dim/50 text-[10px] uppercase tracking-wider font-cinzel">{label}</p>
      <p className={`text-sm font-medium mt-0.5 truncate ${value ? "text-brand-silver" : "text-brand-silver-dim/25"}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function QuickOrderPage() {
  // Selections
  const [selPkg, setSelPkg] = useState<PackageKey | null>(null);
  const [selDuration, setSelDuration] = useState<number | null>(null);
  const [selPrice, setSelPrice] = useState<number | null>(null);
  const [selTechId, setSelTechId] = useState<string | null>(null);
  const [selRoomId, setSelRoomId] = useState<string | null>(null);

  // Member
  const [memberQuery, setMemberQuery] = useState("");
  const [memberSearching, setMemberSearching] = useState(false);
  const [selMember, setSelMember] = useState<Member | null>(null);
  const [payMethod, setPayMethod] = useState<"cash" | "member_account" | "split">("cash");

  // Data
  const [techs, setTechs] = useState<TechData[]>([]);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Dialog
  const [dialogRoom, setDialogRoom] = useState<RoomData | null>(null);

  // Order table pagination
  const [orderPage, setOrderPage] = useState(1);
  const PAGE_SIZE = 25;

  // Submit
  const [submitting, setSubmitting] = useState(false);

  // Note
  const [orderNote, setOrderNote] = useState("");

  // ── Refresh ──────────────────────────────────────────────────────────────
  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const today = todayBusinessDay();
      const [techRes, roomRes, orderRes] = await Promise.all([
        fetch("/api/technicians?active=true"),
        fetch("/api/rooms"),
        fetch(`/api/orders?business_day=${today}&status=paid`),
      ]);

      if (techRes.ok) setTechs(await techRes.json());
      if (roomRes.ok) setRooms(await roomRes.json());
      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrders(Array.isArray(data) ? data : []);
      }
      setLastRefresh(new Date());

      // Invalidate stale selections
      if (techRes.ok) {
        const freshTechs: TechData[] = await (await fetch("/api/technicians?active=true")).json().catch(() => []);
        setSelTechId((prev) =>
          prev && freshTechs.find((t) => t.id === prev && t.status === "available") ? prev : null
        );
      }
      if (roomRes.ok) {
        const freshRooms: RoomData[] = await (await fetch("/api/rooms")).json().catch(() => []);
        setSelRoomId((prev) =>
          prev && freshRooms.find((r) => r.id === prev && r.status === "free") ? prev : null
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Simpler version for background refresh that doesn't reset loading
  const refreshData = useCallback(async () => {
    try {
      const today = todayBusinessDay();
      const [techRes, roomRes, orderRes] = await Promise.all([
        fetch("/api/technicians?active=true"),
        fetch("/api/rooms"),
        fetch(`/api/orders?business_day=${today}&status=paid`),
      ]);
      if (techRes.ok) {
        const data: TechData[] = await techRes.json();
        setTechs(data);
        setSelTechId((prev) =>
          prev && data.find((t) => t.id === prev && t.status === "available") ? prev : null
        );
      }
      if (roomRes.ok) {
        const data: RoomData[] = await roomRes.json();
        setRooms(data);
        setSelRoomId((prev) =>
          prev && data.find((r) => r.id === prev && r.status === "free") ? prev : null
        );
      }
      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrders(Array.isArray(data) ? data : []);
      }
      setLastRefresh(new Date());
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(refreshData, 30_000);
    return () => clearInterval(id);
  }, [refreshData]);

  // ── Countdown ────────────────────────────────────────────────────────────
  const countdowns = useCountdowns(rooms);

  // ── Derived ──────────────────────────────────────────────────────────────
  const availableTechs = techs.filter((t) => t.status === "available");
  const serviceRooms = rooms.filter((r) => r.room_type === "service");
  const freeRooms = serviceRooms.filter((r) => r.status === "free").length;
  const busyTechs = techs.filter((t) => t.status === "busy").length;

  const selTech = techs.find((t) => t.id === selTechId) ?? null;
  const selRoom = rooms.find((r) => r.id === selRoomId) ?? null;
  const canOrder = !!(selPkg && selDuration && selTechId && selRoomId);

  const deduction =
    selMember && payMethod === "member_account" && selPrice
      ? calcMemberDeduction(selPrice * 100, selMember.principal_cents, selMember.reward_cents)
      : null;

  const orderPageTotal = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const pagedOrders = orders.slice((orderPage - 1) * PAGE_SIZE, orderPage * PAGE_SIZE);

  // ── Member search ─────────────────────────────────────────────────────────
  const searchMember = async () => {
    if (!memberQuery.trim()) return;
    setMemberSearching(true);
    try {
      const res = await fetch(`/api/members?search=${encodeURIComponent(memberQuery)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSelMember(data[0]);
        toast.success(`找到会员：${data[0].display_name}`);
      } else {
        toast.error("未找到会员，将作为散客开单");
        setSelMember(null);
      }
    } catch {
      toast.error("查询失败");
    } finally {
      setMemberSearching(false);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canOrder) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_key: selPkg,
          duration_minutes: selDuration,
          technician_id: selTechId,
          room_id: selRoomId,
          member_id: selMember?.id ?? null,
          payment_method: selMember ? payMethod : "cash",
          note: orderNote || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "开单失败");
        return;
      }
      const order = await res.json();
      toast.success(`开单成功 · ${order.order_no}`);
      // Reset
      setSelPkg(null);
      setSelDuration(null);
      setSelPrice(null);
      setSelTechId(null);
      setSelRoomId(null);
      setSelMember(null);
      setMemberQuery("");
      setPayMethod("cash");
      setOrderNote("");
      await refreshData();
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── LIVE Status Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0D0910] border border-brand-red/20">
        {/* Left: LIVE + date */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-red animate-pulse" />
            <span className="font-cinzel text-xs font-bold text-brand-red tracking-widest">LIVE</span>
          </div>
          <span className="text-brand-silver-dim/50 text-xs font-cinzel tracking-wide">
            {format(getSydneyNow(), "yyyy-MM-dd")}
          </span>
        </div>

        {/* Middle: stats */}
        <div className="flex items-center gap-5">
          <Stat label="可接待" value={availableTechs.length} color="text-green-400" />
          <Stat label="服务中" value={busyTechs} color="text-red-400" />
          <Stat label="空闲房" value={freeRooms} color="text-blue-400" />
          <Stat label="今日单" value={orders.length} color="text-amber-400" />
        </div>

        {/* Right: last refresh + refresh button */}
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-brand-silver-dim/30 text-xs hidden sm:block">
              {formatSydneyTime(lastRefresh.toISOString(), "HH:mm:ss")}
            </span>
          )}
          <button
            onClick={() => refreshData()}
            className="p-1.5 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* ── LEFT col (packages + technicians + confirm) ─────────────── */}
        <div className="xl:col-span-3 space-y-4">

          {/* Packages — 5 rows */}
          <TechPanel title="套餐选择" titleEn="Select Package">
            <div className="space-y-3">
              {PACKAGE_LIST.map((pkg, pkgIdx) => {
                const isRowSelected = selPkg === pkg.key;
                return (
                  <div key={pkg.key}>
                    <div className="flex items-center gap-3">
                      {/* Package name - left */}
                      <div className="w-36 flex-shrink-0">
                        <p className={`text-sm font-cinzel font-medium leading-tight ${isRowSelected ? "text-brand-red" : "text-brand-silver"}`}>
                          {pkg.nameCn}
                        </p>
                        <p className="text-[10px] text-brand-silver-dim/40 leading-tight mt-0.5 truncate">
                          {pkg.nameEn}
                          {pkg.requiresBooking && (
                            <span className="ml-1 text-amber-400/70">预约</span>
                          )}
                        </p>
                      </div>
                      {/* Duration buttons - right */}
                      <div className="flex gap-1.5 flex-1 flex-wrap">
                        {pkg.durations.map((d) => {
                          const active = isRowSelected && selDuration === d.minutes;
                          return (
                            <button
                              key={d.minutes}
                              onClick={() => {
                                setSelPkg(pkg.key);
                                setSelDuration(d.minutes);
                                setSelPrice(d.price);
                              }}
                              className={`flex-1 min-w-[68px] py-2 rounded-lg text-xs border-2 transition-all ${
                                active
                                  ? "border-brand-red bg-brand-red/15 text-brand-red font-bold shadow-red-glow-sm"
                                  : "border-brand-red/15 text-brand-silver-dim hover:border-brand-red/35 hover:text-brand-silver"
                              }`}
                            >
                              <span className="block font-medium">{d.minutes}min</span>
                              <span className={`block text-[10px] mt-0.5 ${active ? "text-brand-red/70" : "text-brand-silver-dim/40"}`}>
                                ${d.price}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {pkgIdx < PACKAGE_LIST.length - 1 && (
                      <div className="mt-2.5 border-b border-brand-red/8" />
                    )}
                  </div>
                );
              })}
            </div>
          </TechPanel>

          {/* Technicians */}
          <TechPanel title="选技师" titleEn="Available Technicians">
            {availableTechs.length === 0 ? (
              <p className="text-center py-6 text-brand-silver-dim/40 text-sm">暂无可接待技师</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {availableTechs.map((tech) => {
                  const active = selTechId === tech.id;
                  return (
                    <button
                      key={tech.id}
                      onClick={() => setSelTechId(active ? null : tech.id)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        active
                          ? "border-brand-red shadow-red-glow-sm scale-[1.02]"
                          : "border-brand-red/10 hover:border-brand-red/40"
                      }`}
                    >
                      <div className="aspect-[3/4] relative bg-noir-700">
                        {tech.photos?.[0] ? (
                          <Image
                            src={tech.photos[0]}
                            alt={tech.name}
                            fill
                            className="object-cover"
                            sizes="100px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-cinzel font-bold text-brand-silver/20 text-xl">
                              {tech.name[0]}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-transparent to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 px-1 pb-1.5 text-center">
                        <p className={`text-[10px] font-cinzel font-bold truncate ${active ? "text-brand-red" : "text-brand-silver"}`}>
                          {tech.name}
                        </p>
                        <p className="text-brand-silver-dim/40 text-[9px]">{tech.code}</p>
                        {tech.language?.[0] && (
                          <p className="text-brand-silver-dim/30 text-[9px] truncate">{tech.language[0]}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </TechPanel>

          {/* Confirm bar */}
          <div className="bg-[#0D0910] border border-brand-red/20 rounded-2xl p-4 space-y-3">
            {/* Selection pills */}
            <div className="flex gap-2">
              <SelectionPill
                label="套餐"
                value={selPkg ? `${getPackage(selPkg).nameCn} ${selDuration}min` : null}
              />
              <SelectionPill label="技师" value={selTech?.name ?? null} />
              <SelectionPill label="房间" value={selRoom?.code ?? null} />
            </div>

            {/* Member query */}
            <div className="flex gap-2">
              <input
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchMember()}
                placeholder="会员手机号 / 姓名 / 会员号（可选）"
                className="flex-1 px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/15 text-sm text-foreground placeholder:text-brand-silver-dim/35 focus:outline-none focus:border-brand-red"
              />
              <button
                onClick={searchMember}
                disabled={memberSearching}
                className="px-3 py-2 rounded-lg bg-brand-red/15 border border-brand-red/25 text-brand-red hover:bg-brand-red/25 transition-colors"
              >
                {memberSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </div>

            {selMember && (
              <div className="p-3 rounded-xl bg-brand-red/8 border border-brand-red/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-silver font-medium text-sm">{selMember.display_name}</p>
                    <p className="text-xs text-brand-silver-dim/60">
                      {selMember.code} · <span className="text-amber-400">{selMember.tier}</span>
                    </p>
                    <p className="text-xs text-brand-silver-dim/50 mt-0.5">
                      本金 {formatAUD(selMember.principal_cents)} · 奖励 {formatAUD(selMember.reward_cents)}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelMember(null); setMemberQuery(""); setPayMethod("cash"); }}
                    className="text-xs text-brand-silver-dim/40 hover:text-red-400"
                  >
                    清除
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {(["cash", "member_account", "split"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`flex-1 py-1.5 rounded-lg text-xs border-2 transition-all ${
                        payMethod === m
                          ? "border-brand-red bg-brand-red/10 text-brand-red"
                          : "border-brand-red/10 text-brand-silver-dim hover:border-brand-red/25"
                      }`}
                    >
                      {m === "cash" ? "现金" : m === "member_account" ? "会员账户" : "混合"}
                    </button>
                  ))}
                </div>
                {deduction && payMethod === "member_account" && (
                  <div className="text-xs text-brand-silver-dim space-y-0.5">
                    <p>扣本金：{formatAUD(deduction.principal_deducted)}</p>
                    {deduction.reward_deducted > 0 && <p>扣奖励：{formatAUD(deduction.reward_deducted)}</p>}
                    {deduction.cash_required > 0 && (
                      <p className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        余额不足，需补现金 {formatAUD(deduction.cash_required)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <input
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="备注（可选）"
              className="w-full px-3 py-2 rounded-lg bg-noir-600 border border-brand-silver-dim/15 text-sm text-foreground placeholder:text-brand-silver-dim/35 focus:outline-none focus:border-brand-red"
            />

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!canOrder || submitting}
              className={`w-full btn-brand py-3 text-base flex items-center justify-center gap-3 ${
                !canOrder ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" />处理中...</>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  {canOrder && selPrice
                    ? `确认开单 · ${formatAUD(selPrice * 100)}`
                    : "请选择套餐 · 技师 · 房间"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT col (room grid) ────────────────────────────────────── */}
        <div className="xl:col-span-2">
          <TechPanel title="房间状态" titleEn="Room Grid">
            <div className="grid grid-cols-3 gap-2">
              {serviceRooms.map((room) => {
                const cd = countdowns.get(room.id);
                const occupied = room.status === "occupied";
                const free = room.status === "free";
                const selected = selRoomId === room.id;

                const borderColor = selected
                  ? "border-brand-red shadow-red-glow-sm"
                  : free
                  ? "border-green-500/40 hover:border-green-500/70"
                  : occupied
                  ? cd?.status === "overtime"
                    ? "border-red-500/50"
                    : cd?.status === "warning"
                    ? "border-amber-500/40"
                    : "border-brand-silver-dim/15 hover:border-brand-silver-dim/30"
                  : "border-zinc-700/20 opacity-40 cursor-not-allowed";

                const bgColor = selected
                  ? "bg-brand-red/15"
                  : free
                  ? "bg-green-500/8"
                  : occupied
                  ? "bg-[#0A0608]"
                  : "bg-zinc-900/30";

                return (
                  <button
                    key={room.id}
                    disabled={!free && !occupied}
                    onClick={() => {
                      if (free) setSelRoomId(selected ? null : room.id);
                      else if (occupied) setDialogRoom(room);
                    }}
                    className={`relative p-2 rounded-xl border-2 transition-all text-left ${borderColor} ${bgColor}`}
                  >
                    <p className={`font-cinzel font-bold text-sm leading-none mb-1 ${
                      selected ? "text-brand-red" : free ? "text-green-400" : "text-brand-silver-dim"
                    }`}>
                      {room.code}
                    </p>

                    {free ? (
                      <span className="text-[9px] text-green-400/60">空闲</span>
                    ) : occupied && cd ? (
                      <div>
                        <p className="text-[9px] text-brand-silver-dim/50 truncate leading-tight">
                          {room.active_order?.technician_name}
                        </p>
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            cd.status === "overtime"
                              ? "text-red-400 animate-pulse"
                              : cd.status === "warning"
                              ? "text-amber-400"
                              : "text-green-300/80"
                          }`}
                        >
                          {fmtCountdown(cd.remainingSec)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-zinc-500 capitalize">{room.status}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-brand-silver-dim/30 mt-3 text-center">
              绿色=空闲可选 · 点击占用房间查看详情/下钟
            </p>
          </TechPanel>
        </div>
      </div>

      {/* ── Today's Orders Table ─────────────────────────────────────── */}
      <TechPanel title="今日订单" titleEn={`Today's Orders · ${orders.length} 笔`}>
        {orders.length === 0 ? (
          <p className="text-center py-8 text-brand-silver-dim/40 text-sm">今日暂无进行中订单</p>
        ) : (
          <>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-brand-red/10">
                    {["单号", "套餐", "时长", "技师", "房间", "金额", "会员", "时间", "状态"].map((h) => (
                      <th
                        key={h}
                        className="text-left py-2 px-2 text-brand-silver-dim/50 font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((order, idx) => {
                    const pkg = (() => {
                      try { return getPackage(order.package_key as PackageKey); } catch { return null; }
                    })();
                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-brand-red/5 transition-colors hover:bg-brand-red/5 ${
                          idx % 2 === 0 ? "bg-noir-700/10" : ""
                        }`}
                      >
                        <td className="py-2 px-2 font-mono text-brand-silver-dim/50 whitespace-nowrap">
                          {order.order_no}
                        </td>
                        <td className="py-2 px-2 text-brand-silver-dim whitespace-nowrap">
                          {pkg?.nameCn ?? order.package_key}
                        </td>
                        <td className="py-2 px-2 text-brand-silver-dim/60 whitespace-nowrap">
                          {order.duration_minutes}min
                        </td>
                        <td className="py-2 px-2 text-brand-silver whitespace-nowrap">
                          {order.technician?.name ?? "—"}
                          <span className="text-brand-silver-dim/40 ml-1">{order.technician?.code}</span>
                        </td>
                        <td className="py-2 px-2 text-brand-silver-dim/60 whitespace-nowrap">
                          {order.room?.code ?? "—"}
                        </td>
                        <td className="py-2 px-2 font-medium text-brand-red whitespace-nowrap">
                          {formatAUD(order.total_cents)}
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          {order.member ? (
                            <span className="text-amber-400/80">{order.member.display_name}</span>
                          ) : (
                            <span className="text-brand-silver-dim/30">散客</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-brand-silver-dim/50 whitespace-nowrap">
                          {order.paid_at ? formatSydneyTime(order.paid_at, "HH:mm") : "—"}
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px]">
                            进行中
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {orderPageTotal > 1 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-red/10">
                <button
                  onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                  disabled={orderPage <= 1}
                  className="p-1.5 rounded-lg bg-noir-700 border border-brand-red/15 text-brand-silver-dim disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-brand-silver-dim/40">
                  第 {orderPage} 页 / 共 {orderPageTotal} 页 · {orders.length} 笔
                </span>
                <button
                  onClick={() => setOrderPage((p) => Math.min(orderPageTotal, p + 1))}
                  disabled={orderPage >= orderPageTotal}
                  className="p-1.5 rounded-lg bg-noir-700 border border-brand-red/15 text-brand-silver-dim disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </TechPanel>

      {/* ── RoomActionDialog ─────────────────────────────────────────── */}
      {dialogRoom?.active_order && (
        <RoomActionDialog
          roomCode={dialogRoom.code}
          activeOrder={dialogRoom.active_order}
          onClose={() => setDialogRoom(null)}
          onDone={() => {
            setDialogRoom(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-cinzel font-bold text-sm ${color}`}>{value}</span>
      <span className="text-brand-silver-dim/50 text-xs">{label}</span>
    </div>
  );
}
