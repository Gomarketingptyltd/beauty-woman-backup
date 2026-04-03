"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TechnicianCard } from "./TechnicianCard";
import { TechnicianModal } from "./TechnicianModal";
import { SlideShow } from "./SlideShow";
import { OceanNoirLogo } from "@/components/shared/OceanNoirLogo";
import type { TechnicianPublic } from "@/types";

interface DisplayScreenProps {
  initialTechnicians: TechnicianPublic[];
}

const REFRESH_INTERVAL = 60_000; // 60s data refresh
const IDLE_TIMEOUT = 90_000; // 90s idle → slideshow

export function DisplayScreen({ initialTechnicians }: DisplayScreenProps) {
  const [technicians, setTechnicians] =
    useState<TechnicianPublic[]>(initialTechnicians);
  const [selected, setSelected] = useState<TechnicianPublic | null>(null);
  const [slideshow, setSlideshow] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-refresh data every 60s
  const refreshData = useCallback(async () => {
    try {
      const res = await fetch("/api/display/technicians", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    refreshTimer.current = setInterval(refreshData, REFRESH_INTERVAL);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [refreshData]);

  // Idle detection → slideshow
  const resetIdle = useCallback(() => {
    if (slideshow) setSlideshow(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setSlideshow(true), IDLE_TIMEOUT);
  }, [slideshow]);

  useEffect(() => {
    resetIdle();
    const events = ["mousemove", "mousedown", "touchstart", "keydown"];
    events.forEach((e) => window.addEventListener(e, resetIdle));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdle]);

  const available = technicians.filter((t) => t.status === "available");
  const busy = technicians.filter((t) => t.status === "busy");
  const onBreak = technicians.filter((t) => t.status === "break");

  if (slideshow && technicians.length > 0) {
    return (
      <SlideShow
        technicians={technicians}
        onExit={() => setSlideshow(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-noir-900 select-none">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-noir-900/95 backdrop-blur-sm border-b border-brand-red/20 px-6 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <OceanNoirLogo size="sm" showTagline={false} />

          <div className="flex items-center gap-6">
            {/* Status counters */}
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-medium">{available.length}</span>
                <span className="text-brand-silver-dim">可接待</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-red-400 font-medium">{busy.length}</span>
                <span className="text-brand-silver-dim">服务中</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-500" />
                <span className="text-gray-400 font-medium">{onBreak.length}</span>
                <span className="text-brand-silver-dim">休息</span>
              </span>
            </div>

            <div className="text-right text-xs text-brand-silver-dim/60">
              <p className="font-cinzel tracking-wider">SYDNEY · EST. 2010</p>
              <p>实时更新 · 每60秒刷新</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {technicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <OceanNoirLogo size="lg" />
            <p className="mt-8 text-brand-silver-dim text-lg">
              暂无在岗技师，请稍候
            </p>
            <p className="text-brand-silver-dim/50 text-sm mt-2">
              营业时间：10:00 AM – 5:00 AM
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {technicians.map((tech) => (
              <TechnicianCard
                key={tech.id}
                technician={tech}
                onClick={() => setSelected(tech)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer contact */}
      <footer className="border-t border-brand-red/10 px-6 py-3 text-center">
        <div className="flex items-center justify-center gap-6 text-xs text-brand-silver-dim/50">
          <span>📞 0452 629 580</span>
          <span>🇯🇵 日语专线 0433 132 618</span>
          <span>LINE: @347chmhh</span>
          <span>WhatsApp: 0452 629 580</span>
        </div>
      </footer>

      {/* Detail modal */}
      {selected && (
        <TechnicianModal
          technician={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
