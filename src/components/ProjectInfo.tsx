import { Building2, CalendarDays, MapPin, Send, Users } from "lucide-react";
import InfoCard from "./InfoCard";

const infoCards = [
  {
    icon: Building2,
    label: "Bangunan",
    value: "Masjid Raya Baiturrahman",
    accent: "bg-[rgba(36,230,184,0.12)] text-[#24E6B8] shadow-[0_0_18px_rgba(36,230,184,0.10)]",
  },
  {
    icon: Users,
    label: "Keterangan",
    value: "Fungsi Sosial & Ibadah",
    accent: "bg-[rgba(215,123,255,0.12)] text-[#D77BFF] shadow-[0_0_18px_rgba(215,123,255,0.10)]",
  },
  {
    icon: CalendarDays,
    label: "Tahun",
    value: "2026",
    accent: "bg-[rgba(255,201,40,0.12)] text-[#FFC928] shadow-[0_0_18px_rgba(255,201,40,0.10)]",
  },
  {
    icon: MapPin,
    label: "Kawasan",
    value: "Sulawesi Tengah",
    accent: "bg-[rgba(80,232,255,0.12)] text-[#50E8FF] shadow-[0_0_18px_rgba(80,232,255,0.10)]",
  },
];

export default function ProjectInfo() {
  return (
    <section className="rounded-[28px] border border-[rgba(90,220,220,0.12)] bg-[linear-gradient(145deg,#0A2930_0%,#0B3035_100%)] p-4 shadow-[0_0_30px_rgba(60,220,220,0.05)] backdrop-blur-sm sm:p-6 lg:p-7">
      <div className="mb-5">
        <h2 className="text-3xl font-extrabold tracking-[-0.06em] text-[#F4FFFF] sm:text-4xl">
          Masjid Raya
          <br className="hidden sm:block" />
          Baiturrahman
        </h2>
        <p className="mt-2 text-sm text-[#A9C4C7]">Proyek Infrastruktur Publik</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {infoCards.map((card) => (
          <InfoCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            accent={card.accent}
          />
        ))}
      </div>

      <div className="mt-4 w-full rounded-[22px] border border-[rgba(90,220,220,0.16)] bg-[rgba(7,21,26,0.88)] p-3 shadow-[0_0_18px_rgba(60,220,220,0.05)] backdrop-blur-sm sm:p-4">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A9C4C7]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5DEBEB] shadow-[0_0_10px_rgba(93,235,235,0.65)]" />
          CHAT ASSISTANT
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ketik pertanyaan Anda..."
            className="h-11 w-full rounded-xl border border-[rgba(90,220,220,0.16)] bg-[rgba(5,20,25,0.8)] px-3 text-sm text-[#F4FFFF] placeholder:text-[#A9C4C7]/70 outline-none transition focus:border-[rgba(93,235,235,0.34)] focus:shadow-[0_0_15px_rgba(93,235,235,0.12)]"
            aria-label="Ketik pertanyaan Anda"
          />

          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5DEBEB] text-[#061419] transition hover:bg-[#69E8E8] hover:shadow-[0_0_18px_rgba(93,235,235,0.18)]"
            aria-label="Kirim pesan"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
