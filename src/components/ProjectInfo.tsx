"use client";

import { Bot, Building2, CalendarDays, MapPin, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import InfoCard from "./InfoCard";
import { useLanguage } from "../context/LanguageContext";

interface InfoCardData {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  accent: string;
}

interface ProjectInfoProps {
  activeTargetIndex: number | null;
}

// Konfigurasi Warna & Ikon untuk 4 slot Card
const CARD_STYLES = [
  {
    icon: Building2,
    accent:
      "bg-[linear-gradient(145deg,#2AA796,#138F87)] text-white shadow-[0_5px_12px_rgba(21,158,145,0.20)]",
  },
  {
    icon: Users,
    accent:
      "bg-[linear-gradient(145deg,#8D6CE1,#7351C8)] text-white shadow-[0_5px_12px_rgba(115,81,200,0.20)]",
  },
  {
    icon: CalendarDays,
    accent:
      "bg-[linear-gradient(145deg,#FFC21A,#F6A900)] text-white shadow-[0_5px_12px_rgba(246,169,0,0.20)]",
  },
  {
    icon: MapPin,
    accent:
      "bg-[linear-gradient(145deg,#2EA6C1,#168CA7)] text-white shadow-[0_5px_12px_rgba(22,140,167,0.20)]",
  },
];

export default function ProjectInfo({ activeTargetIndex }: ProjectInfoProps) {
  const { t, models } = useLanguage();
  const [selectedCard, setSelectedCard] = useState<InfoCardData | null>(null);
  const [lastScannedIndex, setLastScannedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeTargetIndex !== null) {
      setLastScannedIndex(activeTargetIndex);
    }
  }, [activeTargetIndex]);

  const effectiveIndex = activeTargetIndex ?? lastScannedIndex;

  const activeModel =
    effectiveIndex !== null && models[effectiveIndex]
      ? models[effectiveIndex]
      : null;

  const displayName = activeModel ? activeModel.title : "-";

  // Render 4 Card secara dinamis berdasarkan data objek aktif
  const infoCards: InfoCardData[] = Array.from({ length: 4 }).map((_, index) => {
    const cardData = activeModel?.cards[index];
    const style = CARD_STYLES[index];

    return {
      icon: style.icon,
      label: cardData ? cardData.label : "-",
      value: cardData ? cardData.value : "-",
      detail: cardData ? cardData.detail : "-",
      accent: style.accent,
    };
  });

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#DDE9E9] bg-[radial-gradient(circle_at_92%_4%,rgba(211,244,242,0.75),transparent_38%),#F9FCFC] p-4 shadow-[0_7px_22px_rgba(32,83,94,0.08)] sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute -left-5 -top-9 h-16 w-24 rounded-br-[38px] bg-[#FFC21A]" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-2/5 opacity-50 [background-image:linear-gradient(30deg,transparent_45%,#BDEAE8_46%,transparent_49%),linear-gradient(150deg,transparent_45%,#BDEAE8_46%,transparent_49%)] [background-size:28px_28px]" />

      <div className="relative z-10 mb-5">
        <h2 className="max-w-md break-words text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-[#173F53] sm:text-4xl">
          {displayName}
        </h2>
        <p className="mt-2 text-base font-medium text-[#159E9D]">
          {t.projectInfrastructure}
        </p>
      </div>

      <div className="relative z-10 grid gap-3 sm:grid-cols-2">
        {infoCards.map((card, idx) => (
          <InfoCard
            key={`${card.label}-${idx}`}
            icon={card.icon}
            label={card.label}
            value={card.value}
            accent={card.accent}
            onOpen={() => {
              if (activeModel) {
                setSelectedCard(card);
              }
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mt-4 w-full rounded-[20px] border border-[#E2EEEE] bg-white p-3 shadow-[0_6px_18px_rgba(32,83,94,0.08)] sm:p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#159E9D]">
          <Bot className="h-8 w-8 rounded-full bg-[#EAF7F5] p-1.5 text-[#087C88]" />
          {t.chatAssistant}
        </div>
      </div>

      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#123B47]/35 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setSelectedCard(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="information-detail-title"
            className="max-h-[85svh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#DDE9E9] bg-white p-4 shadow-[0_18px_50px_rgba(23,63,83,0.22)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#159E9D]">
                  {selectedCard.label}
                </p>
                <h3
                  id="information-detail-title"
                  className="mt-2 text-2xl font-bold leading-tight text-[#173F53]"
                >
                  {selectedCard.value}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                aria-label={t.closeDetail}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF7F5] text-[#168E82] transition hover:bg-[#D5F0ED]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-[#496875]">
              {selectedCard.detail}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}