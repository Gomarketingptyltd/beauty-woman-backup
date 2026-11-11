"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, DoorOpen, Loader2 } from "lucide-react";
import type { Room } from "@/types";
import type { WizardState } from "@/components/desk/OrderWizard";

interface RoomStepProps {
  state: WizardState;
  onNext: (room: Room) => void;
  onBack: () => void;
}

export function RoomStep({ state, onNext, onBack }: RoomStepProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Room | null>(state.room);

  useEffect(() => {
    fetch("/api/rooms?status=free&type=service")
      .then((r) => r.json())
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="font-cinzel text-xl font-semibold silver-text mb-2">
        Step 3 · 选择房间
      </h2>
      <p className="text-brand-silver-dim text-sm mb-6">
        仅显示当前空闲的服务房间
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-brand-red animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelected(room)}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                selected?.id === room.id
                  ? "border-brand-red bg-brand-red/10 shadow-red-glow-sm"
                  : "border-brand-red/15 bg-noir-700/50 hover:border-brand-red/40"
              }`}
            >
              <DoorOpen
                className={`h-6 w-6 mb-1 ${
                  selected?.id === room.id ? "text-brand-red" : "text-brand-silver-dim"
                }`}
              />
              <span
                className={`font-cinzel font-bold text-lg ${
                  selected?.id === room.id
                    ? "text-brand-silver"
                    : "text-brand-silver-dim"
                }`}
              >
                {room.code}
              </span>
              <span className="text-xs text-green-400 mt-0.5">空闲</span>
            </button>
          ))}
          {rooms.length === 0 && (
            <div className="col-span-5 text-center py-8 text-brand-silver-dim">
              <p>暂无空闲房间</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-silver-dim hover:text-brand-silver transition-colors px-4 py-2 rounded-lg border border-brand-silver-dim/20 hover:border-brand-silver-dim/40"
        >
          <ChevronLeft className="h-4 w-4" />
          上一步
        </button>
        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="btn-brand disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          下一步：确认
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
