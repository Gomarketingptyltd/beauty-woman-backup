"use client";

import { useState } from "react";
import { CheckCircle, ChevronRight } from "lucide-react";
import { PackageStep } from "./steps/PackageStep";
import { TechnicianStep } from "./steps/TechnicianStep";
import { RoomStep } from "./steps/RoomStep";
import { ConfirmStep } from "./steps/ConfirmStep";
import { PACKAGE_LIST } from "@/lib/business/packages";
import type { PackageKey, Room, TechnicianPublic } from "@/types";

export interface WizardState {
  package_key: PackageKey | null;
  duration_minutes: number | null;
  price: number | null;
  technician: TechnicianPublic | null;
  room: Room | null;
  member_id: string | null;
  member_name: string | null;
  payment_method: "cash" | "member_account" | "split";
  note: string;
}

const STEPS = [
  { id: 1, label: "选套餐", labelEn: "Package" },
  { id: 2, label: "选技师", labelEn: "Technician" },
  { id: 3, label: "选房间", labelEn: "Room" },
  { id: 4, label: "确认", labelEn: "Confirm" },
];

const initialState: WizardState = {
  package_key: null,
  duration_minutes: null,
  price: null,
  technician: null,
  room: null,
  member_id: null,
  member_name: null,
  payment_method: "cash",
  note: "",
};

export function OrderWizard() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(initialState);

  const updateState = (updates: Partial<WizardState>) =>
    setState((s) => ({ ...s, ...updates }));

  const reset = () => {
    setState(initialState);
    setStep(1);
  };

  return (
    <div className="max-w-4xl">
      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all text-sm font-bold ${
                  step > s.id
                    ? "bg-brand-red border-brand-red text-white"
                    : step === s.id
                    ? "border-brand-red text-brand-red bg-brand-red/10"
                    : "border-brand-silver-dim/30 text-brand-silver-dim/50"
                }`}
              >
                {step > s.id ? <CheckCircle className="h-4 w-4" /> : s.id}
              </div>
              <div className="text-center mt-1">
                <p
                  className={`text-xs font-medium ${
                    step >= s.id ? "text-brand-silver" : "text-brand-silver-dim/50"
                  }`}
                >
                  {s.label}
                </p>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-all ${
                  step > s.id ? "bg-brand-red" : "bg-brand-silver-dim/20"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="brand-card p-6">
        {step === 1 && (
          <PackageStep
            state={state}
            onNext={(pkg, minutes, price) => {
              updateState({ package_key: pkg, duration_minutes: minutes, price });
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <TechnicianStep
            state={state}
            onNext={(tech) => {
              updateState({ technician: tech });
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <RoomStep
            state={state}
            onNext={(room) => {
              updateState({ room });
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <ConfirmStep
            state={state}
            onUpdate={updateState}
            onBack={() => setStep(3)}
            onSuccess={reset}
          />
        )}
      </div>
    </div>
  );
}
