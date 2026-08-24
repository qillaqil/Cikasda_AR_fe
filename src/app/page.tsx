"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Camera,
  Info,
  Languages,
  RotateCcw,
  Settings,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ProjectInfo from "../components/ProjectInfo";

const ARViewer = dynamic(() => import("@/components/ARViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] w-full items-center justify-center bg-black px-6 text-center text-white">
      <p className="text-lg font-semibold">Meminta izin kamera...</p>
    </div>
  ),
});

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("Belum diperiksa");
  const [quality, setQuality] = useState("Tinggi");
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [language, setLanguage] = useState("Indonesia");
  const [resetStatus, setResetStatus] = useState("");

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSettingsOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const checkCameraPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("Tidak didukung browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraStatus("Izin kamera aktif");
    } catch {
      setCameraStatus("Izin kamera ditolak");
    }
  };

  const resetView = () => {
    window.dispatchEvent(new Event("ar-reset-view"));
    setResetStatus("Tampilan berhasil direset");
    window.setTimeout(() => setResetStatus(""), 2500);
  };

  return (
    <main className="h-[100svh] overflow-hidden bg-[#02090C] text-[#F4FFFF]">
      <div className="flex h-full flex-col">
        <header className="relative z-30 flex shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-[#DCE8EA] bg-[#FFFFFF] px-3 py-3 shadow-[0_5px_18px_rgba(28,75,88,0.10)] sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute -left-5 -top-8 h-20 w-28 rounded-br-[42px] rounded-tr-[38px] bg-[#35B7B1] opacity-90" />
          <div className="pointer-events-none absolute -right-20 -top-12 h-28 w-56 rounded-[45%] bg-[#DDF5F3] opacity-80" />
          <div className="pointer-events-none absolute left-[46%] top-0 h-16 w-32 opacity-50 [background-image:radial-gradient(#B9D8D9_1px,transparent_1px)] [background-size:7px_7px]" />

          <div className="relative flex min-w-0 items-center gap-2">
            <Image
              src="/public/CIKASDA.svg"
              alt="CIKASDA"
              width={410}
              height={155}
              className="h-9 w-auto max-w-[calc(100vw-5rem)] sm:h-11 sm:max-w-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E1EAEC] bg-[#FFFFFF] text-[#1B5268] shadow-[0_3px_12px_rgba(25,83,100,0.12)] transition hover:border-[#A9D9D5] hover:bg-[#F2FBFA] hover:text-[#168E82]"
            aria-label="Settings"
          >
            <Settings size={22} strokeWidth={1.8} />
          </button>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto scroll-smooth snap-y snap-mandatory">
          <section className="relative h-full snap-start overflow-hidden bg-black">
            <ARViewer />

            <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center">
              <div className="flex h-10 w-24 cursor-grab flex-col items-center justify-center gap-1 active:cursor-grabbing">
                <div className="h-1.5 w-14 rounded-full bg-white/40 shadow-sm" />
                <div className="h-1 w-10 rounded-full bg-white/20" />
              </div>
            </div>
          </section>

          <section className="relative min-h-full snap-start bg-[linear-gradient(145deg,#F4FAFA_0%,#EAF5F4_100%)] px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-4 lg:px-6">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#B7D9D8]" />

            <div className="mx-auto max-w-[1100px] space-y-5">
              <section className="relative overflow-hidden rounded-[20px] border border-[#DCE8EA] bg-[#FFFFFF] p-4 shadow-[0_5px_18px_rgba(28,75,88,0.10)] sm:p-5">
                <div className="absolute -right-12 -top-14 h-32 w-64 rounded-[45%] bg-[#DDF5F3] opacity-80" />
                <div className="absolute left-1/2 top-0 h-24 w-40 opacity-45 [background-image:radial-gradient(#B9D8D9_1px,transparent_1px)] [background-size:7px_7px]" />

                <div className="relative z-10 text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#168E82]">
                    Spatial Object Viewer
                  </p>
                  <h2 className="mt-3 break-words text-2xl font-semibold tracking-[-0.04em] text-[#16445A] sm:text-3xl">
                    Masjid Raya Baitul Khairaat
                  </h2>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5A7B84]">
                    Marker-based WebAR
                  </p>
                </div>
              </section>

              <ProjectInfo />

              <footer className="flex flex-col items-center justify-between gap-2 border-t border-[#D5E7E7] px-2 pb-2 pt-5 text-center sm:flex-row sm:text-left">
                <p className="text-sm font-bold tracking-[-0.02em] text-[#16445A]">
                  CIKASDA <span className="text-[#168E82]">AR</span>
                </p>
                <p className="break-words text-xs font-medium text-[#6A858C]">
                  © 2026 CIKASDA AR · Spatial Object Viewer
                </p>
              </footer>
            </div>
          </section>
        </div>
      </div>

      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-[#123B47]/30 backdrop-blur-sm"
          role="presentation"
          onClick={() => setIsSettingsOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="max-h-[min(680px,88svh)] w-full overflow-y-auto overscroll-contain rounded-t-[28px] border-t border-[#D7E9E8] bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_40px_rgba(23,63,83,0.18)] sm:mx-auto sm:max-w-xl sm:rounded-t-3xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#B7D9D8]" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#159E9D]">
                  Pengaturan
                </p>
                <h2
                  id="settings-title"
                  className="mt-1 text-2xl font-bold text-[#173F53]"
                >
                  Spatial Viewer
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Tutup pengaturan"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF7F5] text-[#168E82] hover:bg-[#D5F0ED]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={checkCameraPermission}
                className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-[#E2EEEE] p-3 text-left hover:bg-[#F4FBFA]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Camera className="h-5 w-5 shrink-0 text-[#159E9D]" />
                  <span className="min-w-0">
                    <strong className="block text-sm text-[#173F53]">
                      Izin Kamera
                    </strong>
                    <small className="block truncate text-xs text-[#6A858C]">
                      {cameraStatus}
                    </small>
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold text-[#159E9D]">
                  Periksa
                </span>
              </button>

              <label className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-[#E2EEEE] p-3">
                <span className="flex min-w-0 items-center gap-3">
                  <Settings className="h-5 w-5 shrink-0 text-[#159E9D]" />
                  <strong className="text-sm text-[#173F53]">
                    Kualitas Model
                  </strong>
                </span>
                <select
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                  className="max-w-[42%] rounded-lg border border-[#D7EAEC] bg-white px-2 py-1 text-sm text-[#173F53] outline-none focus:border-[#58C6C3]"
                >
                  <option>Rendah</option>
                  <option>Sedang</option>
                  <option>Tinggi</option>
                </select>
              </label>

              <label className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-[#E2EEEE] p-3">
                <span className="flex min-w-0 items-center gap-3">
                  <Volume2 className="h-5 w-5 shrink-0 text-[#159E9D]" />
                  <strong className="text-sm text-[#173F53]">Suara</strong>
                </span>
                <input
                  type="checkbox"
                  checked={isSoundOn}
                  onChange={(event) => setIsSoundOn(event.target.checked)}
                  className="h-5 w-5 accent-[#159E9D]"
                />
              </label>

              <label className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-[#E2EEEE] p-3">
                <span className="flex min-w-0 items-center gap-3">
                  <Languages className="h-5 w-5 shrink-0 text-[#159E9D]" />
                  <strong className="text-sm text-[#173F53]">Bahasa</strong>
                </span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="max-w-[42%] rounded-lg border border-[#D7EAEC] bg-white px-2 py-1 text-sm text-[#173F53] outline-none focus:border-[#58C6C3]"
                >
                  <option>Indonesia</option>
                  <option>English</option>
                </select>
              </label>

              <button
                type="button"
                onClick={resetView}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-[#E2EEEE] p-3 text-left hover:bg-[#F4FBFA]"
              >
                <RotateCcw className="h-5 w-5 shrink-0 text-[#159E9D]" />
                <span className="min-w-0">
                  <strong className="block text-sm text-[#173F53]">
                    Reset Tampilan
                  </strong>
                  <small className="block truncate text-xs text-[#6A858C]">
                    {resetStatus || "Kembalikan posisi model"}
                  </small>
                </span>
              </button>
              <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-[#E2EEEE] p-3">
                <Info className="h-5 w-5 shrink-0 text-[#159E9D]" />
                <span className="min-w-0">
                  <strong className="block text-sm text-[#173F53]">
                    Informasi Aplikasi
                  </strong>
                  <small className="block truncate text-xs text-[#6A858C]">
                    CIKASDA AR · Spatial Viewer · Versi 1.0
                  </small>
                </span>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
