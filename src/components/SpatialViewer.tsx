"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SpatialViewer() {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = async () => {
    if (!viewerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await viewerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[rgba(90,220,220,0.22)] bg-[linear-gradient(145deg,#0A242B_0%,#081F26_100%)] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),0_0_30px_rgba(60,220,220,0.06)] backdrop-blur-sm sm:p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(93,235,235,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(93,235,235,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(93,235,235,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />

      <div className="relative z-10 flex h-full w-full flex-col gap-3">
        <div className="pl-2 pt-2 text-left sm:pl-3 sm:pt-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#A9C4C7]">
            Spatial Object Viewer
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#F4FFFF] sm:text-2xl">
            Masjid Raya Baitul Khairaat
          </h3>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#69E8E8]">
            Live Model
          </p>
        </div>

        <div
          ref={viewerRef}
          className="relative h-[240px] w-full overflow-hidden rounded-[22px] border border-[rgba(90,220,220,0.18)] bg-[radial-gradient(circle_at_center,rgba(93,235,235,0.08),rgba(7,30,38,0.55)_45%,rgba(6,24,32,0.95)_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] sm:h-[300px] lg:h-[340px]"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="absolute left-0 top-8 h-[70%] w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
            <div className="absolute right-0 top-8 h-[70%] w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            <div className="relative h-[170px] w-[82%] sm:h-[200px] sm:w-[88%] lg:h-[220px] lg:w-[90%]">
              <div className="absolute inset-x-[12%] bottom-0 h-16 rounded-t-[26px] border border-white/40 bg-white/5 shadow-[0_0_18px_rgba(255,255,255,0.10)]" />
              <div className="absolute inset-x-[16%] bottom-12 h-10 rounded-t-[40%] border border-white/40 bg-white/5" />
              <div className="absolute inset-x-[19%] bottom-20 h-1 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.35)]" />
              <div className="absolute inset-x-[22%] bottom-18 h-14 rounded-t-[36px] border border-white/35 bg-white/5" />
              <div className="absolute left-[26%] bottom-16 h-20 w-11 rounded-t-[24px] border border-white/35 bg-white/5" />
              <div className="absolute right-[26%] bottom-16 h-20 w-11 rounded-t-[24px] border border-white/35 bg-white/5" />
              <div className="absolute left-[36%] bottom-20 h-20 w-12 rounded-t-[22px] border border-white/35 bg-white/5" />
              <div className="absolute right-[36%] bottom-20 h-20 w-12 rounded-t-[22px] border border-white/35 bg-white/5" />
              <div className="absolute left-[48%] bottom-20 h-22 w-14 rounded-t-[26px] border border-white/40 bg-white/5" />
              <div className="absolute left-[24%] bottom-18 h-16 w-[52%] rounded-t-[28px] border border-white/35 bg-white/5" />
              {[...Array(7)].map((_, index) => (
                <div
                  key={index}
                  className="absolute bottom-10 h-8 w-7 rounded-t-[18px] border border-white/30 bg-white/5"
                  style={{
                    left: `${16 + index * 10}%`,
                  }}
                />
              ))}

              <div className="absolute left-[19%] bottom-20 h-24 w-[62%] border-l border-r border-white/30" />
              <div className="absolute left-[30%] bottom-[22%] h-16 w-[40%] rounded-t-[30px] border border-white/35 bg-white/5" />
              <div className="absolute left-[35%] bottom-[38%] h-12 w-[30%] rounded-full border border-white/40 bg-white/5 shadow-[0_0_12px_rgba(255,255,255,0.15)]" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleFullscreen}
            aria-label="Expand Spatial Viewer"
            className="absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(93,235,235,0.28)] bg-[rgba(11,48,53,0.8)] text-[#F4FFFF] shadow-[0_0_15px_rgba(93,235,235,0.12)] transition-all duration-200 hover:scale-105 hover:border-[rgba(93,235,235,0.38)] hover:bg-[rgba(10,55,60,0.9)]"
          >
            {isFullscreen ? <Minimize2 size={20} strokeWidth={1.8} /> : <Maximize2 size={20} strokeWidth={1.8} />}
          </button>
        </div>
      </div>
    </section>
  );
}
