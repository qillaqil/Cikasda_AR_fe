"use client";

import { useState } from "react";
import { CheckCircle2, FileUp, Loader2, UploadCloud, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GLBUploaderProps {
  projectId?: string | null;
  currentModelUrl: string;
  onModelUploaded: (url: string) => void;
}

export default function GLBUploader({
  projectId,
  currentModelUrl,
  onModelUploaded,
}: GLBUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".glb")) {
      setErrorMsg("File harus berformat .glb (glTF binary)");
      return;
    }

    if (file.size > 35 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal 35 MB agar lancar dimuat di HP pengunjung");
      return;
    }

    setErrorMsg("");
    setFileName(file.name);

    // Buat instant local preview URL langsung agar 3D viewer bisa render seketika
    const localPreviewUrl = URL.createObjectURL(file);
    onModelUploaded(localPreviewUrl);

    // Upload permanen ke Supabase Storage (bucket: ar-models)

    // Upload ke Supabase Storage (bucket: ar-models)
    try {
      setUploading(true);
      setProgress(20);

      const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { data, error } = await supabase.storage
        .from("ar-models")
        .upload(cleanName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      setProgress(80);

      // Ambil Public URL
      const { data: publicData } = supabase.storage
        .from("ar-models")
        .getPublicUrl(data.path);

      if (publicData?.publicUrl) {
        // Update database hanya jika projectId tersedia
        if (projectId) {
          const { error: updateError } = await supabase
            .from("ar_projects")
            .update({ model_url: publicData.publicUrl })
            .eq("id", projectId);

          if (updateError) throw updateError;
        }

        onModelUploaded(publicData.publicUrl);
        setProgress(100);
      }
    } catch (err: unknown) {
      console.error("Upload GLB error:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Gagal mengunggah ke Supabase Storage. Menggunakan pratinjau lokal."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition hover:border-teal-600 hover:bg-teal-50/30">
        <input
          type="file"
          accept=".glb"
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
        </div>

        <div className="mt-2.5">
          <p className="text-xs font-semibold text-slate-800">
            {uploading ? "Mengunggah Model 3D..." : "Pilih File .glb atau Tarik ke Sini"}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Format glTF Binary (.glb) · Disarankan maksimal 25 MB
          </p>
        </div>

        {uploading && (
          <div className="mt-3 w-full max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="mt-1 block text-[10px] text-slate-500">{progress}%</span>
          </div>
        )}
      </div>

      {/* Selected File Badge */}
      {fileName && (
        <div className="flex items-center justify-between rounded-lg bg-teal-50 border border-teal-200 px-3 py-1.5 text-xs text-teal-900">
          <span className="flex items-center gap-2 truncate">
            <FileUp className="h-4 w-4 shrink-0 text-teal-700" />
            <span className="truncate font-medium">{fileName}</span>
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
          <span className="font-mono text-[11px] text-slate-500 break-all">
            {currentModelUrl}
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
