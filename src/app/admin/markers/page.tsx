"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Cpu,
  Download,
  Layers,
  Loader2,
  Play,
  Plus,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useProjects } from "@/lib/hooks/useProjects";

declare global {
  interface Window {
    MINDAR?: {
      IMAGE?: {
        Compiler: new () => {
          compileImageTargets: (
            images: HTMLImageElement[],
            progressCallback: (progress: number) => void
          ) => Promise<void>;
          exportData: () => Promise<Uint8Array>;
        };
      };
    };
  }
}

export default function MindARMarkersPage() {
  const { activeProjects: projects, isLoading: loading, mutateProjects } = useProjects();
  const [compiling, setCompiling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compilerReady, setCompilerReady] = useState(false);
  const [bundleUrl, setBundleUrl] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const SCRIPT_ID = "mindar-compiler-script";
    if (document.getElementById(SCRIPT_ID)) {
      setCompilerReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js";
    script.async = true;
    script.onload = () => {
      setCompilerReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const handleCompileMarkers = async () => {
    if (!window.MINDAR?.IMAGE?.Compiler) {
      alert("Compiler MindAR sedang dimuat, silakan coba beberapa saat lagi...");
      return;
    }

    setCompiling(true);
    setProgress(0);
    setSuccessMsg("");

    try {
      const compiler = new window.MINDAR.IMAGE.Compiler();

      const imageElements: HTMLImageElement[] = [];
      for (const proj of projects) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = proj.marker_image_url || "/contohAR.png";
        await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        });
        imageElements.push(img);
      }

      await compiler.compileImageTargets(imageElements, (p) => {
        setProgress(Math.round(p * 100));
      });

      const exportedBuffer = await compiler.exportData();
      const blob = new Blob([exportedBuffer.buffer as ArrayBuffer], { type: "application/octet-stream" });
      const localDownloadUrl = URL.createObjectURL(blob);
      setBundleUrl(localDownloadUrl);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes("placeholder-project")) {
        const bundleFileName = `targets-v${Date.now()}.mind`;
        const { data, error } = await supabase.storage
          .from("ar-markers")
          .upload(bundleFileName, blob, {
            contentType: "application/octet-stream",
            upsert: true,
          });

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from("ar-markers")
            .getPublicUrl(data.path);

          if (publicData?.publicUrl) {
            await supabase.from("mindar_bundles").insert({
              bundle_url: publicData.publicUrl,
              total_targets: projects.length,
              is_active: true,
            });
            setBundleUrl(publicData.publicUrl);
          }
        }
      }

      setSuccessMsg(`Berhasil mengompilasi ${projects.length} marker target ke file targets.mind!`);
      mutateProjects();
    } catch (err: unknown) {
      console.error("Compilation error:", err);
      alert("Terjadi kendala saat kompilasi marker: " + (err instanceof Error ? err.message : "Gagal memproses file gambar"));
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          MindAR Marker Studio & Compiler
        </h2>
        <p className="text-xs text-slate-500">
          Kompilasi kumpulan gambar target marker menjadi satu file binary targets.mind secara langsung di browser
        </p>
      </div>

      {/* Compiler Action Card */}
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kompilasi Seluruh Marker Aktif ({projects.length} Target)
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Kompilasi seluruh gambar target aktif menjadi satu file binary targets.mind untuk pelacakan kamera AR pengunjung.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCompileMarkers}
              disabled={compiling || projects.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              {compiling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengompilasi ({progress}%)
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-white" />
                  Kompilasi & Publikasikan .mind
                </>
              )}
            </button>

            {bundleUrl && (
              <a
                href={bundleUrl}
                download="targets.mind"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-teal-700" />
                Unduh targets.mind
              </a>
            )}
          </div>
        </div>

        {compiling && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Mengekstrak Feature Points...</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Target Marker List */}
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Marker Berdasarkan Urutan Indeks Kamera
            </h3>
          </div>
          <button
            type="button"
            onClick={() => mutateProjects()}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            <RotateCcw className="h-3 w-3" />
            Segarkan
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-6 px-2 items-center justify-center rounded bg-slate-100 font-mono text-xs font-bold text-slate-700 border border-slate-200">
                  Target Index #{proj.target_index}
                </span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                  Siap Lacak
                </span>
              </div>

              <div className="relative h-44 w-full overflow-hidden rounded-md border border-slate-200 bg-white flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proj.marker_image_url || "/contohAR.png"}
                  alt={proj.title_id}
                  className="h-full w-full object-contain p-2"
                />
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 truncate">
                  {proj.title_id}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  Model: {proj.model_url.split("/").pop()}
                </p>
              </div>
            </div>
          ))}

          {/* Add New Target Slot Card */}
          <Link
            href="/admin/projects/new"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:border-teal-400 hover:bg-teal-50/30 transition-all min-h-[280px] group"
          >
            <div className="rounded-full bg-white p-3 shadow-xs border border-slate-200 group-hover:border-teal-300 group-hover:scale-105 transition-all">
              <Plus className="h-5 w-5 text-slate-400 group-hover:text-teal-700" />
            </div>
            <p className="mt-3 text-xs font-bold text-slate-700 group-hover:text-teal-900">
              Tambah Target #{projects.length}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 max-w-[180px]">
              Daftarkan objek AR baru untuk index tracking kamera berikutnya
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
