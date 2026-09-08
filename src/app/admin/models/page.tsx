"use client";

import { useEffect, useState } from "react";
import {
  Box,
  CheckCircle2,
  Copy,
  Download,
  FileBox,
} from "lucide-react";
import { useProjects } from "@/lib/hooks/useProjects";
import ModelViewer3D from "@/components/admin/ModelViewer3D";
import GLBUploader from "@/components/admin/GLBUploader";

export default function AdminModelsPage() {
  const { projects } = useProjects();
  const [selectedModelUrl, setSelectedModelUrl] = useState("/models/mosque.glb");
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
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          3D GLB Studio & Kalibrator
        </h2>
        <p className="text-xs text-slate-500">
          Inspeksi visual model 3D glTF dan kalibrasi rasio skala agar pas saat ditangkap kamera AR
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 w-full">
        {/* Left Column: 3D Canvas Viewport (8 cols on wide screens) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Model 3D Aktif
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedTitle}
                </h3>
              </div>
              <span className="font-mono text-xs text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-semibold">
                Scale: {selectedModelScale}
              </span>
            </div>

            <ModelViewer3D
              modelUrl={selectedModelUrl}
              initialScale={selectedModelScale}
              onScaleChange={(newScale) => setSelectedModelScale(newScale)}
            />
          </div>

          {/* Model Details & Links */}
          <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="min-w-0 pr-2">
              <span className="block font-semibold text-slate-700">URL File Model:</span>
              <span className="block font-mono text-[11px] text-slate-500 truncate">
                {selectedModelUrl}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Tersalin!" : "Salin URL"}
              </button>
              <a
                href={selectedModelUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 font-semibold text-white hover:bg-teal-800 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh .glb
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Model Selector & Quick Upload (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FileBox className="h-4 w-4 text-teal-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilih Model untuk Diinspeksi
              </h3>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left transition-colors ${
                      isSelected
                        ? "border-teal-600 bg-teal-50/50 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {p.title_id}
                      </p>
                      <p className="truncate font-mono text-[10px] text-slate-400">
                        {p.model_url.split("/").pop()}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-700" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Box className="h-4 w-4 text-teal-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Uji Model 3D Baru
              </h3>
            </div>

            <GLBUploader
              projectId={projects.find(p => p.model_url === selectedModelUrl)?.id || ""}
              currentModelUrl={selectedModelUrl}
              onModelUploaded={(url) => {
                setSelectedModelUrl(url);
                setSelectedTitle("Model Baru (Pratinjau)");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
