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
import { toast } from "sonner";
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
    if (!compilerReady || !window.MINDAR?.IMAGE?.Compiler) {
      toast.warning("Compiler MindAR sedang diunduh di browser, silakan tunggu beberapa detik...");
      return;
    }

    setCompiling(true);
    setProgress(0);
    toast.info(`Memulai kompilasi ${projects.length} gambar marker target...`);

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
          // Hapus file marker lama jika ada
          const { data: files } = await supabase.storage.from("ar-markers").list();
          if (files) {
            const oldFiles = files
              .filter((file: { name: string }) => file.name !== bundleFileName)
              .map((file: { name: string }) => file.name);

            if (oldFiles.length > 0) {
              await supabase.storage.from("ar-markers").remove(oldFiles);
            }
          }

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

      toast.success(`Berhasil mengompilasi ${projects.length} target ke file targets.mind!`);
      mutateProjects();
    } catch (err: unknown) {
      console.error("Compilation error:", err);
      toast.error(
        "Terjadi kendala saat kompilasi marker: " +
          (err instanceof Error ? err.message : "Gagal memproses file gambar")
      );
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0b3558] sm:text-3xl">
          MindAR Marker Studio & Compiler
        </h2>
        <p className="text-xs sm:text-sm text-[#476788] mt-1">
          Kompilasi kumpulan gambar target marker menjadi satu file binary targets.mind secara langsung di browser
        </p>
      </div>

      {/* Compiler Action Card with Calendly styling */}
      <div className="relative overflow-hidden rounded-3xl border border-[#d4e0ed] bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(71,103,136,0.06)] space-y-4">
        {/* Soft Decorative Accent Blob */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#006bff]/5 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-[#d4e0ed]/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e6f0ff] px-3 py-1 text-[11px] font-bold text-[#004eba] border border-[#d4e0ed] mb-2">
              <Cpu className="h-3.5 w-3.5 text-[#006bff]" />
              In-Browser Feature Point Extraction
            </div>
            <h3 className="text-lg font-bold text-[#0b3558] tracking-tight">
              Kompilasi Seluruh Marker Aktif ({projects.length} Target)
            </h3>
            <p className="mt-1 text-xs text-[#476788] max-w-2xl leading-relaxed">
              Ekstraksi feature points seluruh gambar target aktif menjadi satu file binary targets.mind untuk pelacakan kamera AR pengunjung.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            <button
              type="button"
              onClick={handleCompileMarkers}
              disabled={compiling || projects.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-[#006bff] hover:bg-[#0058d6] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(0,107,255,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4e0ed] bg-white hover:bg-[#f0f3f8] px-3.5 py-2.5 text-xs font-semibold text-[#0b3558] shadow-xs transition-all"
              >
                <Download className="h-3.5 w-3.5 text-[#006bff]" />
                Unduh targets.mind
              </a>
            )}
          </div>
        </div>

        {compiling && (
          <div className="relative z-10 space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold text-[#0b3558]">
              <span>Mengekstrak Feature Points MindAR...</span>
              <span className="font-mono text-[#006bff]">{progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f0f3f8] border border-[#d4e0ed]">
              <div
                className="h-full bg-[#006bff] transition-all duration-300 rounded-full shadow-xs"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Target Marker List */}
      <div className="w-full rounded-3xl border border-[#d4e0ed] bg-white p-6 sm:p-8 shadow-[0_4px_16px_rgba(71,103,136,0.04)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#d4e0ed]/80 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#006bff]" />
            <h3 className="text-sm font-bold text-[#0b3558]">
              Daftar Marker Berdasarkan Urutan Indeks Kamera
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              mutateProjects();
              toast.info("Memperbarui daftar marker...");
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#476788] hover:text-[#0b3558] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Segarkan
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl border border-[#d4e0ed] bg-[#f8f9fb] p-4 space-y-3 hover:border-[#006bff]/50 hover:bg-white transition-all shadow-[0_2px_8px_rgba(71,103,136,0.04)]"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-6 px-2.5 items-center justify-center rounded-full bg-[#e6f0ff] font-mono text-xs font-bold text-[#004eba] border border-[#d4e0ed]">
                  Index #{proj.target_index}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] rounded-full px-2 py-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Siap Lacak
                </span>
              </div>

              <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#d4e0ed] bg-white flex items-center justify-center shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proj.marker_image_url || "/contohAR.png"}
                  alt={proj.title_id}
                  className="h-full w-full object-contain p-2"
                />
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#0b3558] truncate">
                  {proj.title_id}
                </h4>
                <p className="text-[11px] text-[#476788] truncate mt-0.5">
                  Model: {proj.model_url.split("/").pop()}
                </p>
              </div>
            </div>
          ))}

          {/* Add New Target Slot Card */}
          <Link
            href="/admin/projects/new"
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d4e0ed] bg-[#f8f9fb] hover:border-[#006bff] hover:bg-[#e6f0ff]/30 p-6 text-center transition-all min-h-[280px] group"
          >
            <div className="rounded-full bg-white p-3.5 shadow-xs border border-[#d4e0ed] group-hover:border-[#006bff] group-hover:scale-105 transition-all">
              <Plus className="h-5 w-5 text-[#a6bbd1] group-hover:text-[#006bff]" />
            </div>
            <p className="mt-3 text-xs font-bold text-[#0b3558] group-hover:text-[#006bff]">
              Tambah Target #{projects.length}
            </p>
            <p className="mt-1 text-[11px] text-[#476788] max-w-[180px]">
              Daftarkan objek AR baru untuk index tracking kamera berikutnya
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
