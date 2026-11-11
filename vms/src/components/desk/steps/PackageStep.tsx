"use client";

import { useState } from "react";
import { Clock, AlertCircle, ChevronRight } from "lucide-react";
import { PACKAGE_LIST } from "@/lib/business/packages";
import type { PackageKey } from "@/types";
import type { WizardState } from "@/components/desk/OrderWizard";

interface PackageStepProps {
  state: WizardState;
  onNext: (pkg: PackageKey, minutes: number, price: number) => void;
}

export function PackageStep({ state, onNext }: PackageStepProps) {
  const [selectedPkg, setSelectedPkg] = useState<PackageKey | null>(
    state.package_key
  );
  const [selectedDuration, setSelectedDuration] = useState<number | null>(
    state.duration_minutes
  );

  const pkg = selectedPkg ? PACKAGE_LIST.find((p) => p.key === selectedPkg) : null;

  const handleNext = () => {
    if (!selectedPkg || !selectedDuration || !pkg) return;
    const dur = pkg.durations.find((d) => d.minutes === selectedDuration);
    if (!dur) return;
    onNext(selectedPkg, selectedDuration, dur.price);
  };

  return (
    <div>
      <h2 className="font-cinzel text-xl font-semibold silver-text mb-6">
        Step 1 · 选择套餐
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {PACKAGE_LIST.map((p) => (
          <button
            key={p.key}
            onClick={() => {
              setSelectedPkg(p.key);
              setSelectedDuration(null);
            }}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              selectedPkg === p.key
                ? "border-brand-red bg-brand-red/10 shadow-red-glow-sm"
                : "border-brand-red/15 bg-noir-700/50 hover:border-brand-red/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-brand-silver font-medium text-sm">
                  {p.nameCn}
                </p>
                <p className="text-brand-silver-dim/60 text-xs mt-0.5 font-cinzel tracking-wide">
                  {p.nameEn}
                </p>
                {p.description && (
                  <p className="text-brand-silver-dim/50 text-xs mt-1">
                    {p.description}
                  </p>
                )}
              </div>
              {p.requiresBooking && (
                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-1.5 py-0.5 ml-2 whitespace-nowrap">
                  <AlertCircle className="h-3 w-3" />
                  需预约
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {p.durations.map((d) => (
                <span
                  key={d.minutes}
                  className="text-xs px-2 py-0.5 rounded bg-brand-red/10 text-brand-red border border-brand-red/20"
                >
                  {d.minutes}min · ${d.price}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Duration selection */}
      {pkg && (
        <div className="mb-6 p-4 rounded-xl bg-noir-700/50 border border-brand-red/20">
          <p className="text-brand-silver text-sm font-medium mb-3">
            <span className="text-brand-red">{pkg.nameCn}</span> · 选择时长
          </p>
          <div className="flex flex-wrap gap-3">
            {pkg.durations.map((d) => (
              <button
                key={d.minutes}
                onClick={() => setSelectedDuration(d.minutes)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 min-w-[100px] transition-all ${
                  selectedDuration === d.minutes
                    ? "border-brand-red bg-brand-red/15 shadow-red-glow-sm"
                    : "border-brand-red/20 bg-noir-700 hover:border-brand-red/40"
                }`}
              >
                <Clock className="h-5 w-5 text-brand-red mb-1" />
                <span className="text-brand-silver font-bold text-lg">
                  {d.minutes}
                </span>
                <span className="text-brand-silver-dim text-xs">分钟</span>
                <span className="text-brand-red font-bold mt-1">
                  ${d.price}
                </span>
                <span className="text-brand-silver-dim/50 text-xs">AUD</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedPkg || !selectedDuration}
          className="btn-brand disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          下一步：选技师
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

