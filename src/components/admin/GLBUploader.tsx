"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, UploadCloud, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { CompressRequest, CompressResult, CompressError } from "@/lib/workers/gltfCompress.worker";

interface GLBUploaderProps {
  projectId?: string | null;
  currentModelUrl: string;
  onModelUploaded: (url: string) => void;
}

const MAX_RAW_SIZE = 100 * 1024 * 1024; // 100 MB untuk upload mentah
const MAX_COMPRESSABLE_SIZE = 400 * 1024 * 1024; // 400 MB untuk upload + kompresi

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function GLBUploader({
  projectId,
  currentModelUrl,
  onModelUploaded,
}: GLBUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileInfo, setFileInfo] = useState<{ original: number; compressed?: number; ratio?: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [rawMode, setRawMode] = useState(false);
  const supabase = createClient();
  const workerRef = useRef<Worker | null>(null);

  const persistModelUrl = async (uploadedUrl: string) => {
    if (projectId) {
      const { error: updateError } = await supabase
        .from("ar_projects")
        .update({ model_url: uploadedUrl })
        .eq("id", projectId);
      if (updateError) {
        console.warn("Update project model_url error:", updateError);
      }
    }
    onModelUploaded(uploadedUrl);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(30);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "ar-models");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Gagal mengunggah model ke server.");
      }

      setProgress(85);
      const uploadedUrl = result.publicUrl;
      await persistModelUrl(uploadedUrl);
      setProgress(100);
      toast.success(
        fileInfo?.compressed !== undefined
          ? `Model terkompresi ${formatBytes(fileInfo.original)} → ${formatBytes(fileInfo.compressed)} berhasil disimpan!`
          : "File .glb berhasil disimpan ke Supabase Storage!"
      );
    } catch (err: unknown) {
      console.error("Upload GLB error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengunggah ke Supabase Storage.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const compressAndUpload = (original: File) => {
    setErrorMsg("");

    // Dynamic worker: hanya admin route yang butuh gltf-transform
    const worker = new Worker(
      new URL("../../lib/workers/gltfCompress.worker", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;

    setCompressing(true);
    worker.onmessage = (e: MessageEvent<CompressResult | CompressError>) => {
      workerRef.current = null;
      worker.terminate();
      setCompressing(false);
      if (e.data.type === "error") {
        setErrorMsg(`Kompresi gagal: ${e.data.message}. Gunakan "upload tanpa kompresi".`);
        toast.error("Kompresi GLB gagal.");
        return;
      }
      const { compressedFile, ratio } = e.data;
      setFileInfo({ original: original.size, compressed: compressedFile.size, ratio });
      setFileName(compressedFile.name);
      toast.success(`Kompresi selesai: ${formatBytes(original.size)} → ${formatBytes(compressedFile.size)} (-${ratio}%)`);
      onModelUploaded(URL.createObjectURL(compressedFile));
      void uploadFile(compressedFile);
    };
    worker.onerror = (e) => {
      worker.terminate();
      setCompressing(false);
      const msg = "Kompresi GLB gagal di browser. Gunakan \"upload tanpa kompresi\" atau kompresi offline (gltfpack).";
      setErrorMsg(msg);
      toast.error(msg);
      console.error("GLB compress worker error:", e);
    };

    worker.postMessage({ type: "compress", file: original } satisfies CompressRequest);
  };

  const cancelCompression = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setCompressing(false);
    setErrorMsg("Kompresi dibatalkan.");
    toast.info("Kompresi dibatalkan. File belum diunggah.");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.name.toLowerCase().endsWith(".glb")) {
      setErrorMsg("File harus berformat .glb (glTF binary)");
      return;
    }

    if (rawMode) {
      if (file.size > MAX_RAW_SIZE) {
        setErrorMsg(`Ukuran upload mentah maksimal ${MAX_RAW_SIZE / 1024 / 1024} MB. Nonaktifkan mode mentah atau gunakan kompresi.`);
        return;
      }
      setErrorMsg("");
      setFileName(file.name);
      setFileInfo({ original: file.size });
      onModelUploaded(URL.createObjectURL(file));
      await uploadFile(file);
      return;
    }

    if (file.size > MAX_COMPRESSABLE_SIZE) {
      setErrorMsg(
        `File terlalu besar (${formatBytes(file.size)}). Kompresi di browser dibatasi ${MAX_COMPRESSABLE_SIZE / 1024 / 1024} MB. Kompresikan offline dulu: npx @gltf-transform/cli optimize <file.glb> out.glb --compress draco --textureCompress ktx2`
      );
      return;
    }

    if (file.size > MAX_RAW_SIZE) {
      // Besar → wajib kompresi
      compressAndUpload(file);
      return;
    }

    // Kecil → tawarkan kompresi cepat, tetap lanjut kompresi (murah)
    compressAndUpload(file);
  };

  return (
    <div className="space-y-2.5">
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition ${
          compressing ? "border-amber-400 bg-amber-50/40" : "border-slate-300 bg-slate-50/50 hover:border-teal-600 hover:bg-teal-50/30"
        }`}
      >
        <input
          type="file"
          accept=".glb"
          onChange={handleFileChange}
          disabled={uploading || compressing}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-teal-50 text-teal-700 border-teal-200">
          {uploading || compressing ? (
            <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
        </div>

        <div className="mt-2.5">
          <p className="text-xs font-semibold text-slate-800">
            {compressing
              ? "Mengkompres model di browser..."
              : uploading
                ? "Mengunggah Model 3D..."
                : "Pilih File .glb atau Tarik ke Sini"}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {rawMode
              ? `Mode mentah: maksimal ${MAX_RAW_SIZE / 1024 / 1024} MB`
              : `Otomatis terkompresi (Draco + resize texture) · maks mentah ${MAX_COMPRESSABLE_SIZE / 1024 / 1024} MB`}
          </p>
        </div>

        {(uploading || compressing) && (
          <div className="mt-3 w-full max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all duration-300 ${compressing ? "w-1/3 animate-pulse bg-amber-500" : "bg-teal-600"}`}
                style={compressing ? undefined : { width: `${progress}%` }}
              />
            </div>
            <span className="mt-1 block text-[10px] text-slate-500">
              {compressing ? "Mengompres (bisa beberapa menit untuk file besar)..." : `${progress}%`}
            </span>
            {compressing && (
              <button
                type="button"
                onClick={cancelCompression}
                className="mt-2 inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
              >
                <X className="h-3 w-3" /> Batalkan
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mode toggle */}
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50">
        <input
          type="checkbox"
          checked={rawMode}
          onChange={(ev) => setRawMode(ev.target.checked)}
          className="accent-teal-600"
        />
        Upload tanpa kompresi (mentah, maks {MAX_RAW_SIZE / 1024 / 1024} MB — hemat untuk file kecil / fidelity penuh)
      </label>

      {/* Selected File Badge */}
      {fileName && (
        <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs text-teal-900">
          <span className="flex items-center gap-2 truncate">
            <FileUp className="h-4 w-4 shrink-0 text-teal-700" />
            <span className="truncate font-medium">{fileName}</span>
            {fileInfo?.compressed !== undefined && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-700">
                <Zap className="h-3.5 w-3.5" />
                {formatBytes(fileInfo.original)} → {formatBytes(fileInfo.compressed)} (-{fileInfo.ratio}%)
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Siap
          </span>
        </div>
      )}

      {/* Current Active Model URL */}
      {currentModelUrl && (
        <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
          <span className="block font-semibold text-slate-700">URL Model Aktif:</span>
          <span className="break-all font-mono text-[11px] text-slate-500">
            {currentModelUrl}
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="shrink-0 text-rose-400 hover:text-rose-600"
            aria-label="Tutup pesan error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
