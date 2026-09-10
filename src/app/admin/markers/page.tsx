"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Layers,
  Loader2,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  useProjects,
  useMindARBundle,
  invalidateBundleCache,
} from "@/lib/hooks/useProjects";

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
  const { bundleUrl: activeStorageBundle, mutateBundle } = useMindARBundle();

  const [compiling, setCompiling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [compilerReady, setCompilerReady] = useState(false);
  const [bundleUrl, setBundleUrl] = useState<string | null>(null);

  // Load MindAR compiler ES module from CDN
  useEffect(() => {
    let isMounted = true;

    async function initCompiler() {
      // 1. Cek jika sudah terpasang di window
      if (window.MINDAR?.IMAGE?.Compiler) {
        if (isMounted) setCompilerReady(true);
        return;
      }

      // 2. Gunakan native dynamic import browser untuk memuat ES Module
      try {
        const loadModule = (url: string) =>
          new Function("url", "return import(url)")(url);
        const mod = await loadModule(
          "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js"
        );
        if (mod && isMounted) {
          setCompilerReady(true);
          return;
        }
      } catch (err) {
        console.warn(
          "Dynamic import gagal, mencoba script tag module fallback:",
          err
        );
      }

      // 3. Fallback: script tag dengan type="module"
      const SCRIPT_ID = "mindar-compiler-script";
      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.type = "module";
        script.src =
          "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js";
        script.onload = () => {
          if (isMounted) setCompilerReady(true);
        };
        script.onerror = (e) => {
          console.error("Gagal memuat script MindAR:", e);
        };
        document.head.appendChild(script);
      }
    }

    initCompiler();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCompileMarkers = async () => {
    // 1. Validasi ketersediaan Compiler
    let CompilerClass = window.MINDAR?.IMAGE?.Compiler;
    if (!CompilerClass) {
      try {
        const loadModule = (url: string) =>
          new Function("url", "return import(url)")(url);
        const mod = await loadModule(
          "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js"
        );
        CompilerClass = mod?.Compiler || window.MINDAR?.IMAGE?.Compiler;
      } catch (e) {
        console.error("Tidak dapat memuat class Compiler MindAR:", e);
      }
    }

    if (!CompilerClass) {
      toast.warning(
        "Compiler MindAR sedang dimuat di browser. Silakan tunggu beberapa detik atau segarkan halaman."
      );
      return;
    }

    if (!projects || projects.length === 0) {
      toast.warning("Tidak ada target marker aktif untuk dikompilasi.");
      return;
    }

    setCompiling(true);
    setProgress(0);
    const toastId = toast.loading(
      `Memulai kompilasi ${projects.length} target marker...`
    );

    const createdBlobUrls: string[] = [];

    try {
      // 2. Muat seluruh gambar marker ke dalam HTMLImageElement menggunakan Blob lokal
      // Menggunakan local Blob URL menjamin tidak ada CORS canvas tainting saat compiler membaca pixel
      const imageElements: HTMLImageElement[] = [];

      for (let i = 0; i < projects.length; i++) {
        const proj = projects[i];
        const rawUrl = proj.marker_image_url || "/contohAR.png";
        const msg = `Memuat gambar target #${proj.target_index}: ${proj.title_id}...`;
        setStatusText(msg);
        toast.loading(msg, { id: toastId });

        const res = await fetch(rawUrl);
        if (!res.ok) {
          throw new Error(
            `Gagal mengunduh gambar marker untuk ${proj.title_id} (Status: ${res.status})`
          );
        }

        const imgBlob = await res.blob();
        const objectUrl = URL.createObjectURL(imgBlob);
        createdBlobUrls.push(objectUrl);

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () =>
            reject(
              new Error(
                `Format gambar tidak valid atau korup untuk: ${proj.title_id}`
              )
            );
          img.src = objectUrl;
        });

        imageElements.push(img);
      }

      // 3. Ekstraksi feature points dengan MindAR compiler
      setStatusText("Mengekstrak feature points MindAR (0%)...");
      toast.loading("Mengekstrak feature points MindAR (0%)...", {
        id: toastId,
      });

      const compiler = new CompilerClass();

      await compiler.compileImageTargets(imageElements, (p: number) => {
        const percent = Math.round(p * 100);
        setProgress(percent);
        const progressMsg = `Mengekstrak feature points MindAR (${percent}%)...`;
        setStatusText(progressMsg);
        toast.loading(progressMsg, { id: toastId });
      });

      // 4. Ekspor data binary .mind
      setStatusText("Mengekspor binary targets.mind...");
      toast.loading("Mengekspor binary targets.mind...", { id: toastId });

      const exportedBuffer = await compiler.exportData();
      const mindBlob = new Blob([exportedBuffer.buffer as ArrayBuffer], {
        type: "application/octet-stream",
      });

      // Simpan local object URL untuk instant download di browser
      const localDownloadUrl = URL.createObjectURL(mindBlob);
      setBundleUrl(localDownloadUrl);

      // 5. Unggah binary targets.mind ke Supabase Storage melalui Server API (Service Role)
      setStatusText("Mengunggah targets.mind ke Supabase Storage...");
      toast.loading("Mengunggah targets.mind ke Supabase Storage...", {
        id: toastId,
      });

      const formData = new FormData();
      formData.append("file", mindBlob, "targets.mind");
      formData.append("totalTargets", String(projects.length));

      const apiRes = await fetch("/api/markers/compile", {
        method: "POST",
        body: formData,
      });

      const apiResult = await apiRes.json();
      if (!apiRes.ok || !apiResult.success) {
        throw new Error(
          apiResult.error || "Gagal menyimpan binary targets.mind ke Supabase."
        );
      }

      setBundleUrl(apiResult.bundleUrl);

      // 6. Invalidate SWR Cache agar WebAR viewer & admin langsung memakai bundle terbaru
      invalidateBundleCache();
      await mutateBundle();
      await mutateProjects();

      toast.success(
        `Sukses! ${projects.length} target marker berhasil dikompilasi & dipublikasikan ke Supabase Storage!`,
        { id: toastId, duration: 6000 }
      );
    } catch (err: unknown) {
      console.error("Compilation error:", err);
      const errMsg =
        err instanceof Error
          ? err.message
          : "Terjadi kendala teknis saat mengompilasi file marker.";
      toast.error(`Gagal kompilasi: ${errMsg}`, {
        id: toastId,
        duration: 8000,
      });
    } finally {
      // Bersihkan memory local blob URL gambar
      createdBlobUrls.forEach((url) => URL.revokeObjectURL(url));
      setCompiling(false);
      setStatusText("");
    }
  };

  const displayBundleUrl = bundleUrl || activeStorageBundle;

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0b3558] sm:text-3xl">
          MindAR Marker Studio & Compiler
        </h2>
        <p className="text-xs sm:text-sm text-[#476788] mt-1">
          Kompilasi kumpulan gambar target marker menjadi satu file binary targets.mind dan simpan otomatis ke Supabase Storage
        </p>
      </div>

      {/* Compiler Action Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#d4e0ed] bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(71,103,136,0.06)] space-y-5">
        {/* Soft Decorative Accent Blob */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#006bff]/5 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-[#d4e0ed]/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e6f0ff] px-3 py-1 text-[11px] font-bold text-[#004eba] border border-[#d4e0ed] mb-2">
              <Cpu className="h-3.5 w-3.5 text-[#006bff]" />
              {compilerReady
                ? "Compiler Siap (In-Browser WebAssembly)"
                : "Menyiapkan Engine Compiler..."}
            </div>
            <h3 className="text-lg font-bold text-[#0b3558] tracking-tight">
              Kompilasi Seluruh Marker Aktif ({projects.length} Target)
            </h3>
            <p className="mt-1 text-xs text-[#476788] max-w-2xl leading-relaxed">
              Ekstraksi feature points seluruh gambar target aktif menjadi satu file binary targets.mind untuk pelacakan kamera AR pengunjung secara real-time.
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

            {displayBundleUrl && (
              <a
                href={displayBundleUrl}
                download="targets.mind"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4e0ed] bg-white hover:bg-[#f0f3f8] px-3.5 py-2.5 text-xs font-semibold text-[#0b3558] shadow-xs transition-all"
              >
                <Download className="h-3.5 w-3.5 text-[#006bff]" />
                Unduh targets.mind
              </a>
            )}
          </div>
        </div>

        {/* Progress Bar saat Kompilasi Aktif */}
        {compiling && (
          <div className="relative z-10 space-y-2 pt-1">
            <div className="flex justify-between text-xs font-semibold text-[#0b3558]">
              <span>{statusText || "Mengekstrak Feature Points MindAR..."}</span>
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

        {/* Info Box Status Storage Supabase */}
        {displayBundleUrl && (
          <div className="relative z-10 flex flex-col gap-2 rounded-2xl border border-[#d4e0ed] bg-[#f8f9fb] p-3.5 sm:flex-row sm:items-center sm:justify-between text-xs">
            <div className="flex items-center gap-2 text-[#0b3558] truncate">
              <Database className="h-4 w-4 text-[#006bff] shrink-0" />
              <span className="font-bold">Bundle Aktif di Storage:</span>
              <span className="font-mono text-[#476788] truncate text-[11px]">
                {displayBundleUrl}
              </span>
            </div>
            <a
              href={displayBundleUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006bff] hover:underline shrink-0"
            >
              Lihat File <ExternalLink className="h-3 w-3" />
            </a>
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
              mutateBundle();
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
                  Model: {proj.model_url ? proj.model_url.split("/").pop() : "Standard"}
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
