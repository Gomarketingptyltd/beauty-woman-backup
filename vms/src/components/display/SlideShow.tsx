"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { OceanNoirLogo } from "@/components/shared/OceanNoirLogo";
import { STATUS_CONFIG } from "@/components/shared/StatusBadge";
import type { TechnicianPublic } from "@/types";

interface SlideShowProps {
  technicians: TechnicianPublic[];
  onExit: () => void;
}

const SLIDE_DURATION = 4000; // 4s per slide

export function SlideShow({ technicians, onExit }: SlideShowProps) {
  const [idx, setIdx] = useState(0);

  // Only show active technicians in slideshow
  const activeTechs = technicians.filter(
    (t) => t.status === "available" || t.status === "busy"
  );

  useEffect(() => {
    if (activeTechs.length === 0) return;
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % activeTechs.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [activeTechs.length]);

  if (activeTechs.length === 0) {
    onExit();
    return null;
  }

  const current = activeTechs[idx];
  const photo = current.photos?.[0];
  const cfg = STATUS_CONFIG[current.status];

  return (
    <div
      className="fixed inset-0 z-50 bg-noir-950 flex items-center justify-center cursor-pointer"
      onClick={onExit}
    >
      {/* Background photo */}
      {photo && (
        <div className="absolute inset-0">
          <Image
            src={photo}
            alt={current.name}
            fill
            className="object-cover opacity-30 blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir-950/80 via-noir-950/40 to-noir-950/90" />
        </div>
      )}

      {/* Main content */}
      <div className="relative text-center px-4 animate-fade-in" key={current.id}>
        {/* Photo */}
        <div className="relative mx-auto mb-6" style={{ width: 280, height: 373 }}>
          {photo ? (
            <Image
              src={photo}
              alt={current.name}
              fill
              className="object-cover rounded-2xl"
              style={{ boxShadow: "0 0 60px rgba(200,24,42,0.4)" }}
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-brand-red/20 to-noir-700 flex items-center justify-center">
              <span className="text-8xl text-brand-silver/20 font-cinzel font-bold">
                {current.name[0]}
              </span>
            </div>
          )}
          {/* Border */}
          <div
            className="absolute inset-0 rounded-2xl border-2 border-brand-red/40"
            style={{ boxShadow: "0 0 40px rgba(200,24,42,0.3)" }}
          />
        </div>

        {/* Name */}
        <h2 className="font-cinzel text-5xl font-bold silver-text mb-2">
          {current.name}
        </h2>

        {/* Status */}
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${cfg.bg} ${cfg.text} ${cfg.border} mb-4`}
        >
          <span
            className={`h-2 w-2 rounded-full ${cfg.dot} ${
              current.status === "available" ? "animate-pulse" : ""
            }`}
          />
          {current.status === "available" ? "现在可接待" : "服务中"}
        </span>

        {current.starting_price && (
          <p className="text-brand-red text-xl font-semibold mb-2">
            {current.starting_price}
          </p>
        )}

        {current.speciality && (
          <p className="text-brand-silver/60 text-sm max-w-sm mx-auto">
            {current.speciality}
          </p>
        )}

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {activeTechs.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === idx ? "w-8 bg-brand-red" : "w-1.5 bg-brand-silver/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <OceanNoirLogo size="sm" showTagline={false} />
      </div>

      {/* Exit hint */}
      <button
        onClick={onExit}
        className="absolute top-6 right-6 h-10 w-10 rounded-full bg-noir-700/60 border border-brand-red/20 flex items-center justify-center text-brand-silver-dim hover:text-brand-red transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-brand-silver-dim/30 text-xs">
        点击任意位置退出幻灯片
      </p>
    </div>
  );
}
