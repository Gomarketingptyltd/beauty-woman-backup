"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { TechnicianPublic } from "@/types";
import type { WizardState } from "@/components/desk/OrderWizard";

interface TechnicianStepProps {
  state: WizardState;
  onNext: (tech: TechnicianPublic) => void;
  onBack: () => void;
}

export function TechnicianStep({ state, onNext, onBack }: TechnicianStepProps) {
  const [technicians, setTechnicians] = useState<TechnicianPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TechnicianPublic | null>(
    state.technician
  );

  useEffect(() => {
    fetch("/api/technicians?status=available")
      .then((r) => r.json())
      .then((data) => setTechnicians(Array.isArray(data) ? data : []))
      .catch(() => setTechnicians([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="font-cinzel text-xl font-semibold silver-text mb-2">
        Step 2 · 选择技师
      </h2>
      <p className="text-brand-silver-dim text-sm mb-6">
        仅显示当前可接待的技师
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-brand-red animate-spin" />
        </div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-16 text-brand-silver-dim">
          <p className="text-lg mb-2">暂无可接待技师</p>
          <p className="text-sm text-brand-silver-dim/50">
            请先在「技师签到」页面完成签到
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {technicians.map((tech) => (
            <button
              key={tech.id}
              onClick={() => setSelected(tech)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                selected?.id === tech.id
                  ? "border-brand-red shadow-red-glow"
                  : "border-brand-red/15 hover:border-brand-red/40"
              }`}
              style={{ aspectRatio: "3/4" }}
            >
              {tech.photos?.[0] ? (
                <Image
                  src={tech.photos[0]}
                  alt={tech.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-brand-red/15 to-noir-700 flex items-center justify-center">
                  <span className="text-3xl text-brand-silver/30 font-cinzel font-bold">
                    {tech.name[0]}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-noir-900/90 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-brand-silver text-sm font-medium font-cinzel">
                  {tech.name}
                </p>
                {tech.starting_price && (
                  <p className="text-brand-red text-xs">{tech.starting_price}</p>
                )}
              </div>
              {selected?.id === tech.id && (
                <div className="absolute top-2 right-2">
                  <div className="h-5 w-5 rounded-full bg-brand-red flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-silver-dim hover:text-brand-silver transition-colors px-4 py-2 rounded-lg border border-brand-silver-dim/20 hover:border-brand-silver-dim/40">
          <ChevronLeft className="h-4 w-4" />
          上一步
        </button>
        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="btn-brand disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          下一步：选房间
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
