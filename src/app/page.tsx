'use client';

import dynamic from 'next/dynamic';
import { Settings } from 'lucide-react';
import ProjectInfo from '../components/ProjectInfo';

const ARViewer = dynamic(() => import('@/components/ARViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] w-full items-center justify-center bg-black px-6 text-center text-white">
      <p className="text-lg font-semibold">Meminta izin kamera...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="h-[100svh] overflow-hidden bg-[#02090C] text-[#F4FFFF]">
      <div className="flex h-full flex-col">
        <header className="z-30 flex shrink-0 items-center justify-between border-b border-[rgba(90,220,220,0.16)] bg-[linear-gradient(145deg,#09242B_0%,#0B2D34_100%)] px-4 py-4 shadow-[0_8px_28px_rgba(0,0,0,0.26)] sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-[-0.06em] text-[#F4FFFF] sm:text-3xl">
            Spatial Viewer
          </h1>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(90,220,220,0.16)] bg-[rgba(255,255,255,0.02)] text-[#F4FFFF]/80 transition hover:border-[rgba(93,235,235,0.25)] hover:bg-[rgba(93,235,235,0.04)] hover:text-[#F4FFFF] hover:shadow-[0_0_15px_rgba(93,235,235,0.15)]"
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

          <section className="relative min-h-full snap-start bg-[radial-gradient(circle_at_top,rgba(93,235,235,0.10),rgba(6,20,25,0.96)_36%,rgba(2,9,12,1)_100%)] px-3 pb-6 pt-4 sm:px-4 lg:px-6">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/30" />

            <div className="mx-auto max-w-[1100px] space-y-5">
              <section className="relative overflow-hidden rounded-[28px] border border-[rgba(90,220,220,0.22)] bg-[linear-gradient(145deg,#0A242B_0%,#081F26_100%)] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),0_0_30px_rgba(60,220,220,0.06)] sm:p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(93,235,235,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(93,235,235,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(93,235,235,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />

                <div className="relative z-10 text-left">
                  <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#A9C4C7]">
                    Spatial Object Viewer
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#F4FFFF] sm:text-3xl">
                    Masjid Raya Baiturrahman
                  </h2>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#69E8E8]">
                    Marker-based WebAR
                  </p>
                </div>
              </section>

              <ProjectInfo />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
