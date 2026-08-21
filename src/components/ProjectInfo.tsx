"use client";

import { Bot, Building2, CalendarDays, MapPin, Send, Users, X } from "lucide-react";
import { useState } from "react";
import InfoCard from "./InfoCard";

const infoCards = [
  {
    icon: Building2,
    label: "Bangunan",
    value: "Masjid Raya Baitul Khairaat",
    detail: "Masjid Raya Baitul Khairaat (dahulu dikenal sebagai kawasan Masjid Agung Darussalam) merupakan tempat ibadah umat Islam terbesar di Provinsi Sulawesi Tengah yang berdiri di atas lahan seluas 4 hektare. Bangunan ini mengusung konsep arsitektur modern-kontemporer dengan struktur horizontal ramah lingkungan dan ramah disabilitas. Desain bangunan sarat akan simbolisme numerik Al-Qur'an, seperti tinggi bangunan utama 30 meter (melambangkan 30 juz) dan menara kembar setinggi 66,66 meter (melambangkan 6.666 ayat). Masjid ini memegang dua rekor MURI sekaligus untuk kategori kubah terbesar di Indonesia (diameter 90 meter) dan jam dinding menara terbesar di Indonesia (diameter 19,3 meter).",
    accent: "bg-[linear-gradient(145deg,#2AA796,#138F87)] text-white shadow-[0_5px_12px_rgba(21,158,145,0.20)]",
  },
  {
    icon: Users,
    label: "Keterangan",
    value: "Fungsi Sosial & Ibadah",
    detail: `Masjid Raya Baitul Khairaat memiliki fungsi sosial, ibadah, dan aktivitas bangunan yang saling mendukung.

  Fungsi Ibadah: Sebagai sarana utama ibadah salat fardu berjemaah, salat Jumat, salat Id, iktikaf, dan pengajian rutin dengan kapasitas daya tampung mencapai 10.000 hingga 15.000 jemaah.

  Fungsi Sosial: Berperan sebagai pusat pemberdayaan umat, pengumpulan dan penyaluran zakat/infak/sedekah (ZIS), serta ruang silaturahmi yang mempererat hubungan antarwarga (Hablum minannas).

  Aktivitas Bangunan: Menjadi pusat syiar Islam, pendidikan Al-Qur'an, kegiatan remas (remaja masjid), hari besar keagamaan, serta kawasan destinasi wisata religi edukatif bagi wisatawan lokal maupun luar daerah.`,
    accent: "bg-[linear-gradient(145deg,#8D6CE1,#7351C8)] text-white shadow-[0_5px_12px_rgba(115,81,200,0.20)]",
  },
  {
    icon: CalendarDays,
    label: "Tahun",
    value: "2025",
    detail: "Tahun Pendataan & Peresmian: 2025. Tepatnya diresmikan pada 4 Desember 2025 setelah melalui proses pembangunan kembali pascabencana gempa bumi guna memenuhi standar struktur tahan gempa SNI dengan dukungan 483 titik tiang pancang.",
    accent: "bg-[linear-gradient(145deg,#FFC21A,#F6A900)] text-white shadow-[0_5px_12px_rgba(246,169,0,0.20)]",
  },
  {
    icon: MapPin,
    label: "Kawasan",
    value: "Sulawesi Tengah",
    detail: "Alamat: Jl. Jaelangkara / Jl. WR Supratman, Kelurahan Baru, Kecamatan Palu Barat, Kota Palu, Provinsi Sulawesi Tengah, Kode Pos 94221.\n\nKoordinat Peta: Berada strategis di kawasan pusat kota Palu, tidak jauh dari pesisir Teluk Palu, menjadikannya mudah diakses dari berbagai penjuru kota.",
    accent: "bg-[linear-gradient(145deg,#2EA6C1,#168CA7)] text-white shadow-[0_5px_12px_rgba(22,140,167,0.20)]",
  },
];

export default function ProjectInfo() {
  const [selectedCard, setSelectedCard] = useState<(typeof infoCards)[number] | null>(null);

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#DDE9E9] bg-[radial-gradient(circle_at_92%_4%,rgba(211,244,242,0.75),transparent_38%),#F9FCFC] p-4 shadow-[0_7px_22px_rgba(32,83,94,0.08)] sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute -left-5 -top-9 h-16 w-24 rounded-br-[38px] bg-[#FFC21A]" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-2/5 opacity-50 [background-image:linear-gradient(30deg,transparent_45%,#BDEAE8_46%,transparent_49%),linear-gradient(150deg,transparent_45%,#BDEAE8_46%,transparent_49%)] [background-size:28px_28px]" />

      <div className="relative z-10 mb-5">
        <h2 className="max-w-md break-words text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-[#173F53] sm:text-4xl">
          Masjid Raya
          <br className="hidden sm:block" />
          Baitul Khairaat
        </h2>
        <p className="mt-2 text-base font-medium text-[#159E9D]">Proyek Infrastruktur Publik</p>
      </div>

      <div className="relative z-10 grid gap-3 sm:grid-cols-2">
        {infoCards.map((card) => (
          <InfoCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            accent={card.accent}
            onOpen={() => setSelectedCard(card)}
          />
        ))}
      </div>

      <div className="relative z-10 mt-4 w-full rounded-[20px] border border-[#E2EEEE] bg-white p-3 shadow-[0_6px_18px_rgba(32,83,94,0.08)] sm:p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#159E9D]">
          <Bot className="h-8 w-8 rounded-full bg-[#EAF7F5] p-1.5 text-[#087C88]" />
          CHAT ASSISTANT
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ketik pertanyaan Anda..."
            className="h-11 w-full rounded-xl border border-[#D7EAEC] bg-[#FBFDFD] px-3 text-sm text-[#173F53] placeholder:text-[#91A9B0] outline-none transition focus:border-[#58C6C3] focus:shadow-[0_0_15px_rgba(88,198,195,0.16)]"
            aria-label="Ketik pertanyaan Anda"
          />

          <button
            type="button"
            className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl bg-[#38B8B8] text-white transition hover:bg-[#249F9F] hover:shadow-[0_0_18px_rgba(56,184,184,0.25)]"
            aria-label="Kirim pesan"
          >
            <Send className="h-4 w-4" />
          </button>
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
                <h3 id="information-detail-title" className="mt-2 text-2xl font-bold leading-tight text-[#173F53]">
                  {selectedCard.value}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                aria-label="Tutup detail informasi"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF7F5] text-[#168E82] transition hover:bg-[#D5F0ED]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-[#496875]">{selectedCard.detail}</p>
          </div>
        </div>
      )}
    </section>
  );
}
