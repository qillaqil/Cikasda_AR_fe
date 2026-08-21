import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
  onOpen: () => void;
}

export default function InfoCard({ icon: Icon, label, value, accent, onOpen }: InfoCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#EDF2F2] bg-white p-3 text-left shadow-[0_6px_16px_rgba(32,83,94,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(32,83,94,0.12)] focus:outline-none focus:ring-2 focus:ring-[#58C6C3] sm:p-3.5"
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accent}`}
      >
        <Icon className="h-7 w-7" strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#168E82]">
          {label}
        </p>
        <p className="mt-1 break-words text-[15px] font-semibold leading-5 text-[#173F53] sm:text-base">
          {value}
        </p>
      </div>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF7F5] text-[#159E9D]">
        <ChevronRight className="h-5 w-5" strokeWidth={2} />
      </div>
    </button>
  );
}
