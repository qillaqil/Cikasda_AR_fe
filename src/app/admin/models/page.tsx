"use client";

import { useEffect, useState } from "react";
import {
  Box,
  CheckCircle2,
  Copy,
  Download,
  FileBox,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "@/lib/hooks/useProjects";
import ModelViewer3D from "@/components/admin/ModelViewer3D";
import GLBUploader from "@/components/admin/GLBUploader";
import { getPublicStorageUrl } from "@/lib/supabase/client";

export default function AdminModelsPage() {
  const { projects } = useProjects();
  const [selectedModelUrl, setSelectedModelUrl] = useState(
    getPublicStorageUrl("ar-models", "mosque.glb")
  );
  const [selectedModelScale, setSelectedModelScale] = useState("0.1 0.1 0.1");
  const [selectedTitle, setSelectedTitle] = useState("Masjid Raya Baitul Khairaat");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (projects.length > 0) {
      setSelectedModelUrl(projects[0].model_url);
      setSelectedModelScale(projects[0].model_scale || "0.1 0.1 0.1");
      setSelectedTitle(projects[0].title_id);
    }
  }, [projects]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(selectedModelUrl);
    setCopied(true);
    toast.success("URL file 3D .glb berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0b3558] sm:text-3xl">
          3D GLB Studio & Kalibrator
        </h2>
        <p className="text-xs sm:text-sm text-[#476788] mt-1">
          Inspeksi visual model 3D glTF dan kalibrasi rasio skala model agar pas saat ditangkap kamera AR
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 w-full">
        {/* Left Column: 3D Canvas Viewport (8 cols on wide screens) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="w-full rounded-2xl sm:rounded-3xl border border-[#d4e0ed] bg-white p-5 sm:p-6 shadow-[0_4px_16px_rgba(71,103,136,0.04)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#d4e0ed]/80 pb-3.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006bff]">
                  Model 3D Aktif
                </span>
                <h3 className="text-base font-bold text-[#0b3558] tracking-tight">
                  {selectedTitle}
                </h3>
              </div>
              <span className="font-mono text-xs text-[#004eba] bg-[#e6f0ff] border border-[#d4e0ed] px-3 py-1 rounded-full font-semibold w-fit">
                Scale: {selectedModelScale}
              </span>
            </div>

            {/* Canvas Viewport Container with Mobile Scroll Guard */}
            <div className="relative rounded-xl overflow-hidden border border-[#d4e0ed]/80 bg-[#f8f9fb]">
              <ModelViewer3D
                modelUrl={selectedModelUrl}
                initialScale={selectedModelScale}
                onScaleChange={(newScale) => setSelectedModelScale(newScale)}
              />
            </div>

            {/* Helper text for touch/mobile devices */}
            <div className="flex items-center gap-2 text-[11px] text-[#476788] bg-[#f0f3f8] px-3.5 py-2 rounded-lg border border-[#d4e0ed]/60">
              <Info className="h-3.5 w-3.5 text-[#006bff] shrink-0" />
              <span>Gunakan kursor atau satu sentuhan untuk memutar model. Geser di luar area kanvas untuk menggulir halaman.</span>
            </div>
          </div>

          {/* Model Details & Quick Action Bar */}
          <div className="w-full rounded-2xl border border-[#d4e0ed] bg-white p-4 sm:p-5 shadow-[0_4px_16px_rgba(71,103,136,0.04)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="min-w-0 pr-2">
              <span className="block font-bold text-[#0b3558]">URL Penyimpanan Model:</span>
              <span className="block font-mono text-[11px] text-[#476788] truncate mt-0.5">
                {selectedModelUrl}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4e0ed] bg-white hover:bg-[#f0f3f8] px-3.5 py-2 font-semibold text-[#0b3558] transition-all shadow-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Tersalin!" : "Salin URL"}
              </button>
              <a
                href={selectedModelUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#006bff] hover:bg-[#0058d6] px-3.5 py-2 font-semibold text-white shadow-[0_4px_12px_rgba(0,107,255,0.25)] transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh .glb
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Model Selector & Quick Upload (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="w-full rounded-2xl border border-[#d4e0ed] bg-white p-5 shadow-[0_4px_16px_rgba(71,103,136,0.04)] space-y-3">
            <div className="flex items-center gap-2 border-b border-[#d4e0ed] pb-3">
              <FileBox className="h-4 w-4 text-[#006bff]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b3558]">
                Pilih Model untuk Diinspeksi
              </h3>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {projects.map((p) => {
                const isSelected = selectedModelUrl === p.model_url;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedModelUrl(p.model_url);
                      setSelectedModelScale(p.model_scale || "0.1 0.1 0.1");
                      setSelectedTitle(p.title_id);
                      toast.info(`Menampilkan ${p.title_id}`);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-[#006bff] bg-[#e6f0ff] shadow-xs"
                        : "border-[#d4e0ed] bg-white hover:bg-[#f0f3f8]"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate text-xs font-bold text-[#0b3558]">
                        {p.title_id}
                      </p>
                      <p className="truncate font-mono text-[10px] text-[#476788] mt-0.5">
                        {p.model_url.split("/").pop()}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#006bff]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full rounded-2xl border border-[#d4e0ed] bg-white p-5 shadow-[0_4px_16px_rgba(71,103,136,0.04)] space-y-3">
            <div className="flex items-center gap-2 border-b border-[#d4e0ed] pb-3">
              <Box className="h-4 w-4 text-[#006bff]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b3558]">
                Uji Model 3D Baru
              </h3>
            </div>

            <GLBUploader
              projectId={projects.find(p => p.model_url === selectedModelUrl)?.id || ""}
              currentModelUrl={selectedModelUrl}
              onModelUploaded={(url) => {
                setSelectedModelUrl(url);
                setSelectedTitle("Model Baru (Pratinjau)");
                toast.success("File .glb berhasil diunggah dan siap dikalibrasi!");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
