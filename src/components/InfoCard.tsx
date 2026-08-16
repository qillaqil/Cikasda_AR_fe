import type { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
}

export default function InfoCard({ icon: Icon, label, value, accent }: InfoCardProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[rgba(90,220,220,0.16)] bg-[rgba(20,55,60,0.55)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:border-[rgba(93,235,235,0.2)] hover:shadow-[0_0_0_1px_rgba(93,235,235,0.08)] sm:p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[rgba(90,220,220,0.14)] ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#A9C4C7]">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold leading-5 text-[#F4FFFF] sm:text-base">
          {value}
        </p>
      </div>
    </div>
  );
}
