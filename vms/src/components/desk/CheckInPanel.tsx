"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LogIn, LogOut, Pause, Play, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Technician, TechnicianShift } from "@/types";
import { toast } from "sonner";

interface TechWithShift extends Technician {
  activeShift?: TechnicianShift | null;
}

export function CheckInPanel() {
  const [technicians, setTechnicians] = useState<TechWithShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [techRes, shiftRes] = await Promise.all([
        fetch("/api/technicians?active=true"),
        fetch("/api/checkin/today"),
      ]);
      const techs: Technician[] = await techRes.json();
      const shifts: TechnicianShift[] = shiftRes.ok ? await shiftRes.json() : [];

      const merged = techs.map((t) => ({
        ...t,
        activeShift: shifts.find(
          (s) =>
            s.technician_id === t.id &&
            (s.status === "working" || s.status === "paused")
        ) ?? null,
      }));
      setTechnicians(merged);
    } catch {
      toast.error("加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckin = async (techId: string) => {
    setActionId(techId);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technician_id: techId }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "签到失败");
        return;
      }
      toast.success("签到成功");
      await fetchData();
    } catch {
      toast.error("网络错误");
    } finally {
      setActionId(null);
    }
  };

  const handleShiftAction = async (
    shiftId: string,
    action: "checkout" | "pause" | "resume"
  ) => {
    setActionId(shiftId);
    try {
      const res = await fetch("/api/checkin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shift_id: shiftId, action }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "操作失败");
        return;
      }
      const labels = { checkout: "签退", pause: "暂停", resume: "恢复" };
      toast.success(`${labels[action]}成功`);
      await fetchData();
    } catch {
      toast.error("网络错误");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 text-brand-red animate-spin" />
      </div>
    );
  }

  const checkedIn = technicians.filter((t) => t.status !== "off");
  const notIn = technicians.filter((t) => t.status === "off");

  return (
    <div className="space-y-8">
      {/* Checked-in technicians */}
      {checkedIn.length > 0 && (
        <div>
          <h2 className="text-brand-silver font-medium mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            今日在岗 ({checkedIn.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {checkedIn.map((tech) => (
              <TechCard
                key={tech.id}
                tech={tech}
                onCheckin={() => handleCheckin(tech.id)}
                onShiftAction={(action) =>
                  tech.activeShift && handleShiftAction(tech.activeShift.id, action)
                }
                loading={actionId === tech.id || actionId === tech.activeShift?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Not checked in */}
      {notIn.length > 0 && (
        <div>
          <h2 className="text-brand-silver-dim font-medium mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
            未签到 ({notIn.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {notIn.map((tech) => (
              <TechCard
                key={tech.id}
                tech={tech}
                onCheckin={() => handleCheckin(tech.id)}
                onShiftAction={() => {}}
                loading={actionId === tech.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TechCard({
  tech,
  onCheckin,
  onShiftAction,
  loading,
}: {
  tech: TechWithShift;
  onCheckin: () => void;
  onShiftAction: (action: "checkout" | "pause" | "resume") => void;
  loading: boolean;
}) {
  const photo = tech.photos?.[0];

  return (
    <div className="brand-card overflow-hidden">
      {/* Photo */}
      <div className="relative" style={{ paddingBottom: "75%" }}>
        {photo ? (
          <Image
            src={photo}
            alt={tech.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-red/10 to-noir-700 flex items-center justify-center">
            <span className="text-3xl text-brand-silver/20 font-cinzel font-bold">
              {tech.name[0]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-900/80 to-transparent" />
        <div className="absolute bottom-2 left-2">
          <StatusBadge status={tech.status} size="sm" />
        </div>
      </div>

      {/* Info + actions */}
      <div className="p-3">
        <p className="text-brand-silver font-medium text-sm font-cinzel mb-2">
          {tech.name}
        </p>
        <p className="text-brand-silver-dim/50 text-xs mb-3">{tech.code}</p>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 text-brand-red animate-spin" />
          </div>
        ) : tech.status === "off" ? (
          <button
            onClick={onCheckin}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-brand-red/15 border border-brand-red/30 text-brand-red text-xs font-medium hover:bg-brand-red/25 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            签到
          </button>
        ) : (
          <div className="flex gap-1.5">
            {tech.status !== "busy" && (
              <>
                {tech.status === "break" ? (
                  <button
                    onClick={() => onShiftAction("resume")}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-green-500/15 border border-green-500/30 text-green-400 text-xs hover:bg-green-500/25 transition-colors"
                  >
                    <Play className="h-3 w-3" />
                    恢复
                  </button>
                ) : (
                  <button
                    onClick={() => onShiftAction("pause")}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs hover:bg-amber-500/25 transition-colors"
                  >
                    <Pause className="h-3 w-3" />
                    暂停
                  </button>
                )}
                <button
                  onClick={() => onShiftAction("checkout")}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-gray-500/15 border border-gray-500/30 text-gray-400 text-xs hover:bg-gray-500/25 transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  签退
                </button>
              </>
            )}
            {tech.status === "busy" && (
              <p className="text-xs text-red-400/70 text-center w-full py-1">
                服务中...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
