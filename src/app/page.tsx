'use client';

import dynamic from 'next/dynamic';
import { Settings } from 'lucide-react';
import ProjectInfo from '../components/ProjectInfo';

const ARViewer = dynamic(() => import('@/components/ARViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center rounded-[22px] bg-black px-6 text-center text-white sm:h-[420px] lg:h-[520px]">
      <p className="text-lg font-semibold">Meminta izin kamera...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-[#02090C] px-3 py-4 text-[#F4FFFF] sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] overflow-hidden rounded-[34px] border border-[rgba(90,220,220,0.22)] bg-[radial-gradient(circle_at_top,rgba(93,235,235,0.10),rgba(6,20,25,0.96)_36%,rgba(2,9,12,1)_100%)] shadow-[0_0_30px_rgba(60,220,220,0.06)]">
        <header className="flex items-center justify-between border-b border-[rgba(90,220,220,0.16)] bg-[linear-gradient(145deg,#09242B_0%,#0B2D34_100%)] px-4 py-5 sm:px-6 lg:px-8">
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

        <div className="space-y-5 px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6">
          <section className="relative overflow-hidden rounded-[28px] border border-[rgba(90,220,220,0.22)] bg-[linear-gradient(145deg,#0A242B_0%,#081F26_100%)] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),0_0_30px_rgba(60,220,220,0.06)] sm:p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(93,235,235,0.08),transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(93,235,235,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(93,235,235,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />

            <div className="relative z-10 flex h-full w-full flex-col gap-3">
              <div className="pl-2 pt-2 text-left sm:pl-3 sm:pt-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#A9C4C7]">
                  Spatial Object Viewer
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#F4FFFF] sm:text-2xl">
                  Masjid Raya Baiturrahman
                </h3>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#69E8E8]">
                  Marker-based WebAR
                </p>
              </div>

              <div className="relative h-[320px] w-full overflow-hidden rounded-[22px] border border-[rgba(90,220,220,0.18)] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] sm:h-[420px] lg:h-[520px]">
                <ARViewer />
              </div>
            </div>
          </section>

          <ProjectInfo />
        </div>
      </div>
    </main>
  );
}
