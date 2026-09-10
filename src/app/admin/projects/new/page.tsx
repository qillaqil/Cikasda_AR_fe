"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { createClient, getPublicStorageUrl } from "@/lib/supabase/client";
import { useProjects } from "@/lib/hooks/useProjects";
import GLBUploader from "@/components/admin/GLBUploader";
import ModelViewer3D from "@/components/admin/ModelViewer3D";

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const { mutateProjects } = useProjects();
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translateNotice, setTranslateNotice] = useState("");
  const [activeLangTab, setActiveLangTab] = useState<"id" | "en">("id");

  // Project Info
  const [targetIndex, setTargetIndex] = useState<number>(3);
  const [slug, setSlug] = useState("");
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [categoryId, setCategoryId] = useState("Cipta Karya & SDA");
  const [categoryEn, setCategoryEn] = useState("Human Settlements & Water Resources");
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

  const handleCardChange = (index: number, field: string, value: string) => {
    setCards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // AI Automatic Translation using Groq API
  const handleAITranslate = async () => {
    if (!titleId && !descId) {
      alert("Silakan isi minimal Nama Proyek dan Deskripsi dalam Bahasa Indonesia terlebih dahulu.");
      return;
    }

    setTranslating(true);
    setTranslateNotice("");

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

      // Switch to English tab so user can review the result
      setActiveLangTab("en");
      setTranslateNotice("Berhasil diterjemahkan oleh AI (Groq Llama 3.3)! Anda sedang melihat tab English.");
    } catch (err: unknown) {
      console.error("Translation error:", err);
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses terjemahan AI.");
    } finally {
      setTranslating(false);
    }
  };

  const handleMarkerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File marker harus berupa gambar (PNG, JPG, JPEG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file gambar marker maksimal 10MB.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setMarkerImageUrl(localUrl);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes("placeholder-project")) {
      try {
        const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const { data, error } = await supabase.storage
          .from("ar-markers")
          .upload(cleanName, file, { upsert: false });

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from("ar-markers")
            .getPublicUrl(data.path);
          if (publicData?.publicUrl) {
            setMarkerImageUrl(publicData.publicUrl);
          }
        }
      } catch (err) {
        console.error("Marker upload err:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const generatedSlug =
      slug.trim() ||
      titleId.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
      `project-${targetIndex}`;

    try {
      const { data: projectData, error: projectError } = await supabase
        .from("ar_projects")
        .insert({
          target_index: targetIndex,
          slug: generatedSlug,
          category_id: categoryId,
          category_en: categoryEn,
          title_id: titleId,
          title_en: titleEn || titleId,
          description_id: descId,
          description_en: descEn || descId,
          model_url: modelUrl,
          model_scale: modelScale,
          marker_image_url: markerImageUrl,
          is_active: true,
        })
        .select()
        .single();

      if (projectData?.id) {
        const cardsToInsert = cards.map((c) => ({
          project_id: projectData.id,
          slot_index: c.slot_index,
          icon_name: c.icon_name,
          label_id: c.label_id,
          label_en: c.label_en || c.label_id,
          value_id: c.value_id || "-",
          value_en: c.value_en || c.value_id || "-",
          detail_id: c.detail_id || "-",
          detail_en: c.detail_en || c.detail_id || "-",
        }));

        await supabase.from("ar_project_cards").insert(cardsToInsert);
      }

      mutateProjects();
      alert("Proyek baru berhasil disimpan ke database!");
    } catch (err: unknown) {
      console.error("Save project error:", err);
      alert(err instanceof Error ? `Gagal menyimpan proyek: ${err.message}` : "Gagal menyimpan proyek ke database. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full pb-16">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-200 pb-5">
        <div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Proyek
          </Link>
          <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            Tambah Proyek Infrastruktur AR
          </h2>
          <p className="text-xs text-slate-500">
            Isi data teknis, upload model 3D, dan generate terjemahan bahasa Inggris otomatis dengan AI
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Menyimpan..." : "Simpan Proyek"}
          </button>
        </div>
      </div>

      {/* SECTION 1: INFORMASI BILINGUAL + AI TRANSLATION */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-teal-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Informasi Proyek (Bilingual)
              </h3>
              <p className="text-xs text-slate-500">
                Isi Bahasa Indonesia, lalu klik tombol AI untuk menerjemahkan ke English seketika
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* AI Translate Button */}
            <button
              type="button"
              onClick={handleAITranslate}
              disabled={translating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              {translating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-700" />
                  Menerjemahkan dengan AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  Terjemahkan ke English
                </>
              )}
            </button>

            {/* Language Tab Switcher */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveLangTab("id")}
                className={`rounded-md px-3 py-1 transition-colors ${
                  activeLangTab === "id"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Bahasa Indonesia
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab("en")}
                className={`rounded-md px-3 py-1 transition-colors ${
                  activeLangTab === "en"
                    ? "bg-white text-teal-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {translateNotice && (
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800 flex items-center justify-between">
            <span>{translateNotice}</span>
            <button
              type="button"
              onClick={() => setTranslateNotice("")}
              className="text-teal-600 font-bold hover:underline ml-2"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Index Kamera
            </label>
            <input
              type="number"
              min={0}
              required
              value={targetIndex}
              onChange={(e) => setTargetIndex(parseInt(e.target.value) || 0)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-xs font-bold text-slate-900 outline-none focus:border-teal-600 focus:bg-white"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Indeks target pelacakan MindAR (0, 1, 2, 3...)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Slug (Opsional)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. bendungan-gumbasa"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-900 outline-none focus:border-teal-600 focus:bg-white"
            />
          </div>

          {activeLangTab === "id" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Proyek (Indonesia) *
                </label>
                <input
                  type="text"
                  required
                  value={titleId}
                  onChange={(e) => setTitleId(e.target.value)}
                  placeholder="e.g. Bendungan Irigasi Gumbasa"
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Infrastruktur (Indonesia) *
                </label>
                <input
                  type="text"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  placeholder="e.g. Sumber Daya Air (SDA)"
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat (Indonesia) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={descId}
                  onChange={(e) => setDescId(e.target.value)}
                  placeholder="Ringkasan proyek infrastruktur..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title (English)
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Gumbasa Irrigation Dam"
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category (English)
                </label>
                <input
                  type="text"
                  value={categoryEn}
                  onChange={(e) => setCategoryEn(e.target.value)}
                  placeholder="e.g. Water Resources Management"
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description (English)
                </label>
                <textarea
                  rows={3}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  placeholder="Summary in English..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECTION 2: 3D GLB MODEL & SCALER */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              2. Model 3D GLB & Kalibrasi Ukuran
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah file .glb dan sesuaikan skala objek secara visual
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              File Model (.glb)
            </label>
            <GLBUploader
              projectId={null}
              currentModelUrl={modelUrl}
              onModelUploaded={(url) => setModelUrl(url)}
            />

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <span className="block font-semibold text-slate-700 mb-2">
                Atau gunakan model yang sudah ada di sistem:
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
                    }}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                      modelUrl === m.url
                        ? "border-teal-700 bg-teal-50 text-teal-800"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Pratinjau Interaktif 360°
            </label>
            <ModelViewer3D
              modelUrl={modelUrl}
              initialScale={modelScale}
              onScaleChange={(scaleStr) => setModelScale(scaleStr)}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: TARGET MARKER IMAGE */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              3. Gambar Target Marker
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gambar fisik yang discan oleh pengunjung untuk memunculkan model di layar AR
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={markerImageUrl}
              alt="Marker"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Pilih Foto Marker (JPG / PNG)
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleMarkerUpload}
              className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className="text-[11px] text-slate-400">
              Gunakan foto yang memiliki tekstur berpola dan kontras tajam.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: 4 KARTU INFORMASI PUBLIK */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-teal-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                4. Konfigurasi 4 Kartu Spesifikasi Publik
              </h3>
              <p className="text-xs text-slate-500">
                Kartu informasi yang tampil di bawah tampilan AR saat objek terdeteksi
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded px-2 py-0.5">
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
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-teal-50 p-1 text-teal-700 border border-teal-200">
                      <IconComp className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {currentPreset.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {activeLangTab === "id" ? "🇮🇩 ID" : "🇬🇧 EN"}
                  </span>
                </div>

                {activeLangTab === "id" ? (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Label Singkat (ID)
                        </label>
                        <input
                          type="text"
                          required
                          value={card.label_id}
                          onChange={(e) => handleCardChange(idx, "label_id", e.target.value)}
                          className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-teal-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Nilai Utama (ID)
                        </label>
                        <input
                          type="text"
                          required
                          value={card.value_id}
                          onChange={(e) => handleCardChange(idx, "value_id", e.target.value)}
                          placeholder="e.g. 15 Juta m³"
                          className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Deskripsi Detail (ID)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={card.detail_id}
                        onChange={(e) => handleCardChange(idx, "detail_id", e.target.value)}
                        placeholder="Penjelasan detail teknis..."
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-900 outline-none focus:border-teal-600"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Card Label (EN)
                        </label>
                        <input
                          type="text"
                          value={card.label_en}
                          onChange={(e) => handleCardChange(idx, "label_en", e.target.value)}
                          placeholder="e.g. Main Structure"
                          className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-teal-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Key Value (EN)
                        </label>
                        <input
                          type="text"
                          value={card.value_en}
                          onChange={(e) => handleCardChange(idx, "value_en", e.target.value)}
                          placeholder="e.g. 15 Million m³"
                          className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Detailed Description (EN)
                      </label>
                      <textarea
                        rows={3}
                        value={card.detail_en}
                        onChange={(e) => handleCardChange(idx, "detail_en", e.target.value)}
                        placeholder="Technical explanation in English..."
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-900 outline-none focus:border-teal-600"
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {submitting ? "Menyimpan Proyek..." : "Simpan Proyek CIKASDA"}
        </button>
      </div>
    </form>
  );
}
