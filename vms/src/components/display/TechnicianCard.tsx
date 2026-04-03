"use client";

import Image from "next/image";
import { STATUS_CONFIG } from "@/components/shared/StatusBadge";
import type { TechnicianPublic } from "@/types";

interface TechnicianCardProps {
  technician: TechnicianPublic;
  onClick: () => void;
}

const PLACEHOLDER_COLORS = [
  "from-brand-red/20 to-noir-600",
  "from-purple-900/30 to-noir-600",
  "from-blue-900/30 to-noir-600",
  "from-rose-900/30 to-noir-600",
];

export function TechnicianCard({ technician, onClick }: TechnicianCardProps) {
  const cfg = STATUS_CONFIG[technician.status];
  const photo = technician.photos?.[0];
  const colorIdx =
    parseInt(technician.code.replace("T", ""), 10) %
    PLACEHOLDER_COLORS.length;

  return (
    <div
      className="tech-card group cursor-pointer"
      style={{ aspectRatio: "3/4" }}
      onClick={onClick}
    >
      {/* Photo or placeholder */}
      <div className="relative w-full h-full">
        {photo ? (
          <Image
            src={photo}
            alt={technician.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-b ${PLACEHOLDER_COLORS[colorIdx]} flex items-center justify-center`}
          >
            <div className="text-center">
              <div className="text-5xl text-brand-silver/30 font-cinzel font-bold">
                {technician.name[0]}
              </div>
              <div className="text-brand-silver-dim/50 text-xs mt-2 font-cinzel">
                {technician.code}
              </div>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-noir-900/20 to-transparent" />

        {/* Red glow border on hover */}
        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-brand-red/60 transition-all duration-300" />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${
                technician.status === "available" ? "animate-pulse" : ""
              }`}
            />
            {technician.status === "available"
              ? "可接待"
              : technician.status === "busy"
              ? "服务中"
              : "休息"}
          </span>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-cinzel text-lg font-semibold silver-text leading-tight">
            {technician.name}
          </h3>
          {technician.starting_price && (
            <p className="text-brand-red text-sm font-medium mt-0.5">
              {technician.starting_price}
            </p>
          )}
          {technician.holder_description && (
            <p className="text-brand-silver-dim/70 text-xs mt-1 line-clamp-2 leading-relaxed">
              {technician.holder_description}
            </p>
          )}
          {technician.language && technician.language.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {technician.language.slice(0, 3).map((lang) => (
                <span
                  key={lang}
                  className="text-xs px-1.5 py-0.5 rounded bg-noir-700/80 text-brand-silver-dim border border-brand-red/10"
                >
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
