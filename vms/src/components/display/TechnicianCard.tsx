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

function statusLabel(status: TechnicianPublic["status"]) {
  if (status === "available") return "AVAILABLE";
  if (status === "busy") return "In Service";
  if (status === "break") return "Resting";
  return "Off";
}

function statsLine(technician: TechnicianPublic) {
  const cup = technician.cup_size
    ? `${String(technician.cup_size).replace(/cup/gi, "").trim()} cup`
    : "";
  return [technician.age ? String(technician.age) : "", technician.height || "", cup]
    .filter(Boolean)
    .join(" · ");
}

export function TechnicianCard({ technician, onClick }: TechnicianCardProps) {
  const cfg = STATUS_CONFIG[technician.status];
  const photo = technician.photos?.[0];
  const colorIdx =
    parseInt(technician.code.replace(/\D/g, "") || "0", 10) %
    PLACEHOLDER_COLORS.length;
  const stats = statsLine(technician);
  const available = technician.status === "available";

  return (
    <button
      type="button"
      className="tech-card group text-left w-full"
      onClick={onClick}
    >
      <div className="tech-card__photo">
        {photo ? (
          <Image
            src={photo}
            alt={technician.name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
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

        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-semibold tracking-[0.14em] uppercase ${cfg.bg} ${cfg.text} ${cfg.border}`}
            style={{ background: "rgba(10,8,16,0.72)" }}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${
                available ? "animate-pulse" : ""
              }`}
            />
            {statusLabel(technician.status)}
          </span>
        </div>
      </div>

      <div className="tech-card__meta">
        <h3 className="font-cinzel text-white truncate text-[1.1rem] font-medium tracking-wide leading-tight">
          {technician.name}
        </h3>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate text-[0.78rem] font-medium text-[#c9a84c]">
            {technician.type || technician.code}
          </span>
          {technician.starting_price && (
            <p className="tech-card__price shrink-0">
              {technician.starting_price}
              <em>/ 60 mins</em>
            </p>
          )}
        </div>
        {stats && <p className="tech-card__stats">{stats}</p>}
      </div>
    </button>
  );
}
