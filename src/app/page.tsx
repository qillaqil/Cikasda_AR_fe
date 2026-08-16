import { Settings } from "lucide-react";
import ProjectInfo from "../components/ProjectInfo";
import SpatialViewer from "../components/SpatialViewer";

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
          <SpatialViewer />
          <ProjectInfo />
        </div>
      </div>
    </main>
  );
}
