"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileImage,
  Globe2,
  Layers,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { createClient, getPublicStorageUrl } from "@/lib/supabase/client";
import { useProjects } from "@/lib/hooks/useProjects";
import GLBUploader from "@/components/admin/GLBUploader";
import ModelViewer3D from "@/components/admin/ModelViewer3D";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { mutateProjects } = useProjects();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState<"id" | "en">("id");

  // Project Info
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [slug, setSlug] = useState("");
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryEn, setCategoryEn] = useState("");
  const [descId, setDescId] = useState("");
  const [descEn, setDescEn] = useState("");

  // 3D Model & Marker
  const [modelUrl, setModelUrl] = useState(
    getPublicStorageUrl("ar-models", "mosque.glb")
  );
  const [modelScale, setModelScale] = useState("0.1 0.1 0.1");
  const [markerImageUrl, setMarkerImageUrl] = useState("/contohAR.png");

  // 4 Slot Cards
  const [cards, setCards] = useState([
    {
      slot_index: 0,
      icon_name: "Building2",
      label_id: "Bangunan Utama",
      label_en: "Main Building",
      value_id: "",
      value_en: "",
      detail_id: "",
      detail_en: "",
    },
    {
      slot_index: 1,
      icon_name: "Users",
      label_id: "Fungsi & Manfaat",
      label_en: "Functions & Benefit",
      value_id: "",
      value_en: "",
      detail_id: "",
      detail_en: "",
    },
    {
      slot_index: 2,
      icon_name: "CalendarDays",
      label_id: "Tahun Pembangunan",
      label_en: "Construction Year",
      value_id: "",
      value_en: "",
      detail_id: "",
      detail_en: "",
    },
    {
      slot_index: 3,
      icon_name: "MapPin",
      label_id: "Kawasan & Lokasi",
      label_en: "Area & Location",
      value_id: "",
      value_en: "",
      detail_id: "",
      detail_en: "",
    },
  ]);

  const CARD_ICONS = [
    { icon: Building2, label: "Slot 1: Struktur & Fisik" },
    { icon: Users, label: "Slot 2: Fungsi & Kapasitas" },
    { icon: CalendarDays, label: "Slot 3: Waktu & Dimensi" },
    { icon: MapPin, label: "Slot 4: Lokasi & Kawasan" },
  ];

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("ar_projects")
          .select("*, cards:ar_project_cards(*)")
          .eq("id", projectId)
          .single();

        if (!error && data) {
          setTargetIndex(data.target_index);
          setSlug(data.slug);
          setTitleId(data.title_id);
          setTitleEn(data.title_en || data.title_id);
          setCategoryId(data.category_id);
          setCategoryEn(data.category_en || data.category_id);
          setDescId(data.description_id);
          setDescEn(data.description_en || data.description_id);
          setModelUrl(data.model_url);
          setModelScale(data.model_scale || "0.1 0.1 0.1");
          setMarkerImageUrl(data.marker_image_url || "/contohAR.png");

          if (data.cards && data.cards.length > 0) {
            setCards(
              data.cards.sort(
                (a: { slot_index: number }, b: { slot_index: number }) =>
                  a.slot_index - b.slot_index
              )
            );
          }
        } else {
          toast.error("Proyek tidak ditemukan di database.");
          router.push("/admin/projects");
        }
      } catch {
        toast.error("Gagal memuat detail proyek dari database.");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId, supabase]);

  const handleCardChange = (index: number, field: string, value: string) => {
    setCards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // AI Auto-Translation using Groq API
  const handleAITranslate = async () => {
    if (!titleId && !descId) {
      toast.warning("Silakan isi minimal Nama Proyek dan Deskripsi dalam Bahasa Indonesia terlebih dahulu.");
      return;
    }

    setTranslating(true);
    toast.info("Sedang menerjemahkan konten dengan AI Llama 3.3...");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleId,
          category: categoryId,
          description: descId,
          cards: cards,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal menerjemahkan via AI");
      }

      const result = await response.json();

      if (result.title_en) setTitleEn(result.title_en);
      if (result.category_en) setCategoryEn(result.category_en);
      if (result.description_en) setDescEn(result.description_en);

      if (result.cards && Array.isArray(result.cards)) {
        setCards((prev) =>
          prev.map((card, idx) => {
            const translatedCard = result.cards[idx];
            return {
              ...card,
              label_en: translatedCard?.label_en || card.label_en || card.label_id,
              value_en: translatedCard?.value_en || card.value_en || card.value_id,
              detail_en: translatedCard?.detail_en || card.detail_en || card.detail_id,
            };
          })
        );
      }

      setActiveLangTab("en");
      toast.success("Berhasil diperbarui oleh AI! Anda dialihkan ke tab English.");
    } catch (err: unknown) {
      console.error("Translation error:", err);
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses terjemahan AI.");
    } finally {
      setTranslating(false);
    }
  };

  const handleMarkerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File marker harus berupa gambar (PNG, JPG, JPEG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file gambar marker maksimal 10MB.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setMarkerImageUrl(localUrl);

    const toastId = toast.loading("Mengunggah gambar marker ke Supabase Storage...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "ar-markers");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Gagal mengunggah marker ke server.");
      }

      setMarkerImageUrl(result.publicUrl);
      toast.success("Gambar marker berhasil diunggah ke Supabase Storage!", { id: toastId });
    } catch (err) {
      console.error("Marker upload error:", err);
      toast.error(
        "Gagal mengunggah foto marker: " + (err instanceof Error ? err.message : "Terjadi kesalahan"),
        { id: toastId }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error: projectError } = await supabase
        .from("ar_projects")
        .update({
          target_index: targetIndex,
          slug,
          category_id: categoryId,
          category_en: categoryEn,
          title_id: titleId,
          title_en: titleEn || titleId,
          description_id: descId,
          description_en: descEn || descId,
          model_url: modelUrl,
          model_scale: modelScale,
          marker_image_url: markerImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (projectError) throw projectError;

      for (const card of cards) {
        await supabase
          .from("ar_project_cards")
          .upsert(
            {
              project_id: projectId,
              slot_index: card.slot_index,
              icon_name: card.icon_name,
              label_id: card.label_id,
              label_en: card.label_en || card.label_id,
              value_id: card.value_id || "-",
              value_en: card.value_en || card.value_id || "-",
              detail_id: card.detail_id || "-",
              detail_en: card.detail_en || card.detail_id || "-",
            },
            { onConflict: "project_id, slot_index" }
          );
      }

      mutateProjects();
      toast.success("Perubahan proyek berhasil disimpan!");
      router.push("/admin/projects");
    } catch (err: unknown) {
      console.error("Save edit error:", err);
      toast.error(
        err instanceof Error
          ? `Gagal menyimpan perubahan: ${err.message}`
          : "Gagal menyimpan perubahan ke database. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#006bff]" />
        <p className="text-xs font-semibold text-[#476788]">Memuat detail proyek...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full pb-16 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#d4e0ed] pb-5">
        <div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#476788] hover:text-[#006bff] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Proyek
          </Link>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0b3558] sm:text-3xl">
            Edit Proyek: {titleId || "Infrastruktur"}
          </h2>
          <p className="text-xs sm:text-sm text-[#476788] mt-1">
            Perbarui data teknis atau perbaiki terjemahan bahasa Inggris dengan AI
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#006bff] hover:bg-[#0058d6] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(0,107,255,0.25)] transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* SECTION 1: INFORMASI UMUM (BILINGUAL) + AI TRANSLATION */}
      <div className="rounded-3xl border border-[#d4e0ed] bg-white p-6 sm:p-8 shadow-[0_4px_16px_rgba(71,103,136,0.04)] space-y-5">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d4e0ed] pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Globe2 className="h-5 w-5 text-[#006bff]" />
            <div>
              <h3 className="text-base font-bold text-[#0b3558] tracking-tight">
                1. Informasi Proyek (Bilingual)
              </h3>
              <p className="text-xs text-[#476788] mt-0.5">
                Edit Bahasa Indonesia dan generate otomatis bahasa Inggris dengan AI
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={handleAITranslate}
              disabled={translating}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#006bff] to-[#0099ff] hover:opacity-95 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all disabled:opacity-50"
            >
              {translating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menerjemahkan dengan AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Perbarui Terjemahan ke English
                </>
              )}
            </button>

            <div className="flex rounded-full bg-[#f0f3f8] p-1 text-xs font-semibold border border-[#d4e0ed]">
              <button
                type="button"
                onClick={() => setActiveLangTab("id")}
                className={`rounded-full px-3.5 py-1 transition-all ${
                  activeLangTab === "id"
                    ? "bg-[#006bff] text-white shadow-xs"
                    : "text-[#476788] hover:text-[#0b3558]"
                }`}
              >
                Indonesia
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab("en")}
                className={`rounded-full px-3.5 py-1 transition-all ${
                  activeLangTab === "en"
                    ? "bg-[#006bff] text-white shadow-xs"
                    : "text-[#476788] hover:text-[#0b3558]"
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#0b3558] mb-1.5">
              MindAR Target Index
            </label>
            <input
              type="number"
              min={0}
              required
              value={targetIndex}
              onChange={(e) => setTargetIndex(parseInt(e.target.value) || 0)}
              className="h-10 w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] px-3.5 font-mono text-xs font-bold text-[#0b3558] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b3558] mb-1.5">
              URL Slug
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] px-3.5 font-mono text-xs text-[#0b3558] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all"
            />
          </div>

          {activeLangTab === "id" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#0b3558] mb-1.5">
                  Nama Proyek (Indonesia) *
                </label>
                <input
                  type="text"
                  required
                  value={titleId}
                  onChange={(e) => setTitleId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] px-3.5 text-xs text-[#0b3558] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b3558] mb-1.5">
                  Kategori Infrastruktur (Indonesia) *
                </label>
                <input
                  type="text"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] px-3.5 text-xs text-[#0b3558] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0b3558] mb-1.5">
                  Deskripsi Singkat (Indonesia) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={descId}
                  onChange={(e) => setDescId(e.target.value)}
                  className="w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] p-3 text-xs text-[#0b3558] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#0b3558] mb-1.5">
                  Project Title (English)
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] px-3.5 text-xs text-[#0b3558] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b3558] mb-1.5">
                  Category (English)
                </label>
                <input
                  type="text"
                  value={categoryEn}
                  onChange={(e) => setCategoryEn(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] px-3.5 text-xs text-[#0b3558] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0b3558] mb-1.5">
                  Short Description (English)
                </label>
                <textarea
                  rows={3}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] p-3 text-xs text-[#0b3558] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECTION 2: 3D GLB MODEL & SCALER */}
      <div className="rounded-3xl border border-[#d4e0ed] bg-white p-6 sm:p-8 shadow-[0_4px_16px_rgba(71,103,136,0.04)] space-y-4">
        <div className="border-b border-[#d4e0ed] pb-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-[#006bff]" />
            <h3 className="text-base font-bold text-[#0b3558] tracking-tight">
              2. Model 3D GLB & Kalibrasi Ukuran
            </h3>
          </div>
          <p className="text-xs text-[#476788] mt-0.5">
            Unggah file .glb dan sesuaikan skala objek secara visual
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#0b3558] mb-2">
              Ganti File Model (.glb)
            </label>
            <GLBUploader
              currentModelUrl={modelUrl}
              onModelUploaded={(url) => {
                setModelUrl(url);
                toast.success("Model 3D berhasil diperbarui!");
              }}
            />

            <div className="mt-4 rounded-xl border border-[#d4e0ed] bg-[#f8f9fb] p-3.5 text-xs">
              <span className="block font-bold text-[#0b3558] mb-2">
                Atau pilih model preset:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    name: "Masjid Raya",
                    url: getPublicStorageUrl("ar-models", "mosque.glb"),
                    scale: "0.1 0.1 0.1",
                  },
                  {
                    name: "Bendungan",
                    url: getPublicStorageUrl("ar-models", "bendungan.glb"),
                    scale: "0.05 0.05 0.05",
                  },
                  {
                    name: "Gedung",
                    url: getPublicStorageUrl("ar-models", "cikasda.glb"),
                    scale: "0.2 0.2 0.2",
                  },
                ].map((m) => (
                  <button
                    key={m.url}
                    type="button"
                    onClick={() => {
                      setModelUrl(m.url);
                      setModelScale(m.scale);
                      toast.info(`Memilih preset: ${m.name}`);
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                      modelUrl === m.url
                        ? "border-[#006bff] bg-[#e6f0ff] text-[#004eba] shadow-xs"
                        : "border-[#d4e0ed] bg-white text-[#0b3558] hover:bg-[#f0f3f8]"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b3558] mb-2">
              Pratinjau 3D & Kalibrasi Skala
            </label>
            <div className="relative rounded-2xl overflow-hidden border border-[#d4e0ed] bg-[#f8f9fb]">
              <ModelViewer3D
                modelUrl={modelUrl}
                initialScale={modelScale}
                onScaleChange={(scaleStr) => setModelScale(scaleStr)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: GAMBAR TARGET MARKER */}
      <div className="rounded-3xl border border-[#d4e0ed] bg-white p-6 sm:p-8 shadow-[0_4px_16px_rgba(71,103,136,0.04)] space-y-4">
        <div className="border-b border-[#d4e0ed] pb-3">
          <div className="flex items-center gap-2.5">
            <FileImage className="h-5 w-5 text-[#006bff]" />
            <h3 className="text-base font-bold text-[#0b3558] tracking-tight">
              3. Gambar Target Marker
            </h3>
          </div>
          <p className="text-xs text-[#476788] mt-0.5">
            Gambar fisik yang discan oleh pengunjung untuk memunculkan model di layar AR
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-[#d4e0ed] bg-[#f8f9fb] flex items-center justify-center shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={markerImageUrl}
              alt="Marker"
              className="h-full w-full object-contain p-2"
            />
          </div>

          <div className="flex-1 space-y-2">
            <label className="block text-xs font-semibold text-[#0b3558]">
              Ganti Foto Marker (JPG / PNG)
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleMarkerUpload}
              className="block w-full text-xs text-[#476788] file:mr-3 file:rounded-lg file:border-0 file:bg-[#e6f0ff] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#004eba] hover:file:bg-[#d4e0ed] transition-colors"
            />
            <p className="text-[11px] text-[#a6bbd1]">
              Gunakan foto dengan kontras tajam, tekstur detail, dan tanpa pantulan silau.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: 4 KARTU INFORMASI PUBLIK */}
      <div className="rounded-3xl border border-[#d4e0ed] bg-white p-6 sm:p-8 shadow-[0_4px_16px_rgba(71,103,136,0.04)] space-y-4">
        <div className="flex flex-col justify-between gap-2 border-b border-[#d4e0ed] pb-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-[#006bff]" />
            <div>
              <h3 className="text-base font-bold text-[#0b3558] tracking-tight">
                4. Konfigurasi 4 Kartu Spesifikasi Publik
              </h3>
              <p className="text-xs text-[#476788] mt-0.5">
                Data spesifikasi yang muncul saat objek discan kamera AR
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#004eba] bg-[#e6f0ff] border border-[#d4e0ed] rounded-full px-3 py-1 w-fit">
            Mendukung Terjemahan Otomatis
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card, idx) => {
            const currentPreset = CARD_ICONS[idx];
            const IconComp = currentPreset.icon;

            return (
              <div
                key={card.slot_index}
                className="rounded-2xl border border-[#d4e0ed] bg-[#f8f9fb] p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-[#d4e0ed]/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f0ff] text-[#004eba] border border-[#d4e0ed]">
                      <IconComp className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-bold text-[#0b3558]">
                      {currentPreset.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#a6bbd1]">
                    Slot #{card.slot_index + 1}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#476788] mb-1">
                      Label / Judul Kartu ({activeLangTab === "id" ? "ID" : "EN"})
                    </label>
                    <input
                      type="text"
                      value={activeLangTab === "id" ? card.label_id : card.label_en}
                      onChange={(e) =>
                        handleCardChange(
                          idx,
                          activeLangTab === "id" ? "label_id" : "label_en",
                          e.target.value
                        )
                      }
                      className="h-8.5 w-full rounded-lg border border-[#d4e0ed] bg-white px-3 text-xs text-[#0b3558] outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#476788] mb-1">
                      Nilai Utama / Angka Kunci ({activeLangTab === "id" ? "ID" : "EN"})
                    </label>
                    <input
                      type="text"
                      value={activeLangTab === "id" ? card.value_id : card.value_en}
                      onChange={(e) =>
                        handleCardChange(
                          idx,
                          activeLangTab === "id" ? "value_id" : "value_en",
                          e.target.value
                        )
                      }
                      className="h-8.5 w-full rounded-lg border border-[#d4e0ed] bg-white px-3 text-xs text-[#0b3558] outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#476788] mb-1">
                      Keterangan Lengkap ({activeLangTab === "id" ? "ID" : "EN"})
                    </label>
                    <textarea
                      rows={2}
                      value={activeLangTab === "id" ? card.detail_id : card.detail_en}
                      onChange={(e) =>
                        handleCardChange(
                          idx,
                          activeLangTab === "id" ? "detail_id" : "detail_en",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-[#d4e0ed] bg-white p-2.5 text-xs text-[#0b3558] outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#006bff] hover:bg-[#0058d6] px-6 py-2.5 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(0,107,255,0.25)] transition-all disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {submitting ? "Menyimpan Perubahan..." : "Simpan Perubahan Proyek"}
        </button>
      </div>
    </form>
  );
}
