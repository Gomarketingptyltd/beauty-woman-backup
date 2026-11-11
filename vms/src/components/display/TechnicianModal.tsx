"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { TechnicianPublic } from "@/types";
import "./display-theme.css";

interface TechnicianModalProps {
  technician: TechnicianPublic;
  onClose: () => void;
}

const RECEPTION_TEL = "+61426945499";
const RECEPTION_LABEL = "Reception · 0426 945 499";

export function TechnicianModal({ technician, onClose }: TechnicianModalProps) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = technician.photos ?? [];
  const hasPhotos = photos.length > 0;

  const prevPhoto = () =>
    setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIdx((i) => (i + 1) % photos.length);

  return (
    <div
      className="fixed inset-0 z-50 bg-noir-950/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="tech-modal__shell w-full max-w-3xl bg-noir-800 sm:rounded-2xl border border-brand-red/20 overflow-hidden shadow-red-glow-lg animate-slide-up max-h-[100dvh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-noir-700 border border-brand-red/20 flex items-center justify-center text-brand-silver-dim hover:text-brand-red hover:border-brand-red/50 transition-all"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="tech-modal__body">
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-1/2 bg-noir-900">
              <div className="relative" style={{ paddingBottom: "133%" }}>
                {hasPhotos ? (
                  <Image
                    src={photos[photoIdx]}
                    alt={`${technician.name} photo ${photoIdx + 1}`}
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-brand-red/10 to-noir-900">
                    <span className="text-7xl text-brand-silver/20 font-cinzel font-bold">
                      {technician.name[0]}
                    </span>
                  </div>
                )}

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-noir-900/80 border border-brand-red/20 flex items-center justify-center hover:border-brand-red/60 transition-all"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-4 w-4 text-brand-silver" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-noir-900/80 border border-brand-red/20 flex items-center justify-center hover:border-brand-red/60 transition-all"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-4 w-4 text-brand-silver" />
                    </button>

                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIdx(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            i === photoIdx
                              ? "w-4 bg-brand-red"
                              : "w-1.5 bg-brand-silver/40"
                          }`}
                          aria-label={`Photo ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 p-5 sm:p-6">
              <div className="flex items-start justify-between mb-4 gap-3 pr-8">
                <div>
                  <h2 className="font-cinzel text-3xl font-bold silver-text">
                    {technician.name}
                  </h2>
                  <p className="text-brand-silver-dim text-sm mt-0.5 font-cinzel">
                    {technician.code}
                  </p>
                </div>
                <StatusBadge status={technician.status} />
              </div>

              {technician.starting_price && (
                <div className="mb-4 p-3 rounded-lg bg-brand-red/10 border border-brand-red/20">
                  <p className="text-brand-red font-semibold text-lg">
                    {technician.starting_price}
                  </p>
                  <p className="text-brand-silver-dim/60 text-xs">Rates</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                {technician.age != null && (
                  <InfoItem label="Age" value={String(technician.age)} />
                )}
                {technician.height && (
                  <InfoItem label="Height" value={technician.height} />
                )}
                {technician.cup_size && (
                  <InfoItem label="Cup" value={`${technician.cup_size}`} />
                )}
              </div>

              {technician.body && (
                <div className="mb-3">
                  <InfoItem label="Body" value={technician.body} />
                </div>
              )}

              {technician.holder_description && (
                <p className="text-brand-silver/80 text-sm leading-relaxed mb-4">
                  {technician.holder_description}
                </p>
              )}

              {technician.speciality && (
                <div className="mt-4">
                  <p className="text-brand-silver-dim/60 text-xs uppercase tracking-wider mb-1.5">
                    Speciality
                  </p>
                  <p className="text-brand-silver text-sm">{technician.speciality}</p>
                </div>
              )}

              {technician.language && technician.language.length > 0 && (
                <div className="mt-4">
                  <p className="text-brand-silver-dim/60 text-xs uppercase tracking-wider mb-1.5">
                    Languages
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {technician.language.map((lang) => (
                      <span
                        key={lang}
                        className="text-xs px-2 py-1 rounded-md bg-noir-600 text-brand-silver border border-brand-red/15"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <a
          href={`tel:${RECEPTION_TEL}`}
          className="tech-modal__cta"
          onClick={(e) => e.stopPropagation()}
        >
          {RECEPTION_LABEL}
        </a>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-noir-700/50 border border-brand-red/10">
      <p className="text-brand-silver-dim/60 text-xs">{label}</p>
      <p className="text-brand-silver font-medium mt-0.5">{value}</p>
    </div>
  );
}
