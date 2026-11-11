"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TechnicianCard } from "./TechnicianCard";
import { TechnicianModal } from "./TechnicianModal";
import { SlideShow } from "./SlideShow";
import { OceanNoirLogo } from "@/components/shared/OceanNoirLogo";
import type { TechnicianPublic } from "@/types";
import "./display-theme.css";

interface DisplayScreenProps {
  initialTechnicians: TechnicianPublic[];
}

const REFRESH_INTERVAL = 60_000;
const IDLE_TIMEOUT = 90_000;
const RECEPTION_TEL = "+61426945499";
const RECEPTION_LABEL = "Reception · 0426 945 499";

export function DisplayScreen({ initialTechnicians }: DisplayScreenProps) {
  const [technicians, setTechnicians] =
    useState<TechnicianPublic[]>(initialTechnicians);
  const [selected, setSelected] = useState<TechnicianPublic | null>(null);
  const [slideshow, setSlideshow] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch("/api/display/technicians", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data);
      }
    } catch {
      /* keep last good roster */
    }
  }, []);

  useEffect(() => {
    refreshTimer.current = setInterval(refreshData, REFRESH_INTERVAL);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [refreshData]);

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
    <div className="display-screen select-none">
      <header className="sticky top-0 z-30 bg-noir-900/95 backdrop-blur-sm border-b border-brand-red/20 px-4 sm:px-6 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3">
          <OceanNoirLogo size="sm" showTagline={false} />

          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className="flex items-center gap-3 sm:gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-medium">{available.length}</span>
                <span className="text-brand-silver-dim hidden sm:inline">Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-red-400 font-medium">{busy.length}</span>
                <span className="text-brand-silver-dim hidden sm:inline">In service</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-500" />
                <span className="text-gray-400 font-medium">{onBreak.length}</span>
                <span className="text-brand-silver-dim hidden sm:inline">Resting</span>
              </span>
            </div>

            <div className="text-right text-xs text-brand-silver-dim/60 hidden md:block">
              <p className="font-cinzel tracking-wider">SYDNEY · EST. 2010</p>
              <p>Live roster · refreshes every 60s</p>
            </div>
          </div>
        </div>
      </header>

      <main className="display-screen__main max-w-screen-2xl mx-auto w-full px-3 sm:px-4 pt-4 sm:pt-6">
        {technicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <OceanNoirLogo size="lg" />
            <p className="mt-8 text-brand-silver-dim text-lg">
              No technicians on duty yet
            </p>
            <p className="text-brand-silver-dim/50 text-sm mt-2">
              Open daily · 10:00 AM – 5:00 AM
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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

      <a
        href={`tel:${RECEPTION_TEL}`}
        className="display-reception-bar"
        aria-label={RECEPTION_LABEL}
      >
        <span className="display-reception-bar__label">Reception</span>
        <span aria-hidden="true">·</span>
        <span className="display-reception-bar__phone">0426 945 499</span>
      </a>

      {selected && (
        <TechnicianModal
          technician={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
