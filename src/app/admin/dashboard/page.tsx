"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Box,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Plus,
  ScanLine,
} from "lucide-react";
import { useProjects } from "@/lib/hooks/useProjects";

export default function AdminDashboardPage() {
  const { projects, activeProjects, isLoading: loading } = useProjects();

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Top Banner / Hero Card with Calendly Soft Blobs */}
      <div className="relative overflow-hidden rounded-3xl border border-[#d4e0ed] bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(71,103,136,0.06)]">
        {/* Soft Decorative Accent Blobs (Calendly Cyan & Coral) */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#0099ff]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-24 -bottom-16 h-48 w-48 rounded-full bg-[#e55cff]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e6f0ff] px-3 py-1 text-[11px] font-bold text-[#004eba] border border-[#d4e0ed] mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#006bff] animate-pulse" />
              Portal Kontrol Resmi WebAR Sulteng
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0b3558] sm:text-3xl">
              Dashboard Manajemen Infrastruktur
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#476788] max-w-2xl leading-relaxed">
              Pusat kendali visualisasi 3D glTF, target pelacak MindAR kamera, dan data katalog proyek strategis Dinas CIKASDA Sulawesi Tengah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#006bff] hover:bg-[#0058d6] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(0,107,255,0.25)] hover:shadow-[0_6px_16px_rgba(0,107,255,0.35)] transition-all"
            >
              <Plus className="h-4 w-4" />
              Tambah Proyek
            </Link>
            <Link
              href="/admin/markers"
              className="inline-flex items-center gap-2 rounded-lg border border-[#d4e0ed] bg-white hover:bg-[#f0f3f8] px-4 py-2.5 text-xs font-semibold text-[#0b3558] shadow-xs transition-all"
            >
              <ScanLine className="h-4 w-4 text-[#006bff]" />
              Marker Studio
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] hover:bg-white hover:border-[#0b3558] px-4 py-2.5 text-xs font-semibold text-[#476788] hover:text-[#0b3558] shadow-xs transition-all"
            >
              <ExternalLink className="h-4 w-4 text-[#476788]" />
              Buka WebAR
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-[#d4e0ed] bg-white p-5 shadow-[0_4px_12px_rgba(71,103,136,0.04)] hover:shadow-[0_8px_24px_rgba(71,103,136,0.08)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#476788]">
              Total Proyek
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f3f8] text-[#006bff] border border-[#d4e0ed]/80 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#0b3558]">
              {loading ? "-" : projects.length}
            </span>
            <p className="mt-1 text-xs text-[#a6bbd1] font-medium">
              Infrastruktur terdaftar
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-[#d4e0ed] bg-white p-5 shadow-[0_4px_12px_rgba(71,103,136,0.04)] hover:shadow-[0_8px_24px_rgba(71,103,136,0.08)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#476788]">
              Marker Aktif
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f0ff] text-[#004eba] border border-[#d4e0ed]/80 group-hover:scale-105 transition-transform">
              <ScanLine className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#0b3558]">
              {loading ? "-" : activeProjects.length}
            </span>
            <p className="mt-1 text-xs text-[#a6bbd1] font-medium">
              Target siap kamera AR
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-[#d4e0ed] bg-white p-5 shadow-[0_4px_12px_rgba(71,103,136,0.04)] hover:shadow-[0_8px_24px_rgba(71,103,136,0.08)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#476788]">
              Model 3D
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f3f8] text-[#0b3558] border border-[#d4e0ed]/80 group-hover:scale-105 transition-transform">
              <Box className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#0b3558]">
              {loading ? "-" : activeProjects.length}
            </span>
            <p className="mt-1 text-xs text-[#a6bbd1] font-medium">
              glTF terkalibrasi
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-[#d4e0ed] bg-white p-5 shadow-[0_4px_12px_rgba(71,103,136,0.04)] hover:shadow-[0_8px_24px_rgba(71,103,136,0.08)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#476788]">
              Bahasa
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f3f8] text-[#006bff] border border-[#d4e0ed]/80 group-hover:scale-105 transition-transform">
              <Globe2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#0b3558]">
              ID / EN
            </span>
            <p className="mt-1 text-xs text-[#a6bbd1] font-medium">
              Bilingual didukung AI
            </p>
          </div>
        </div>
      </div>

      {/* Projects Table Overview */}
      <div className="rounded-2xl border border-[#d4e0ed] bg-white shadow-[0_4px_16px_rgba(71,103,136,0.04)] overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d4e0ed] p-5 sm:p-6 sm:flex-row sm:items-center bg-white">
          <div>
            <h3 className="text-base font-bold text-[#0b3558] tracking-tight">
              Katalog Objek AR Infrastruktur
            </h3>
            <p className="text-xs text-[#476788] mt-0.5">
              Data yang saat ini aktif ditangkap oleh kamera WebAR publik
            </p>
          </div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006bff] hover:text-[#0058d6] transition-colors"
          >
            Buka Tabel Lengkap
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex items-center justify-between bg-[#f8f9fb] px-4 py-2 border-b border-[#d4e0ed] text-[11px] text-[#476788] sm:hidden">
          <span>Geser tabel untuk melihat kolom aksi →</span>
          <span className="font-mono text-[10px] text-[#a6bbd1]">Scrollable</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#d4e0ed] bg-[#f8f9fb] text-[11px] font-bold uppercase tracking-wider text-[#476788]">
                <th className="py-3.5 px-5">Target</th>
                <th className="py-3.5 px-5">Nama Proyek</th>
                <th className="py-3.5 px-5">Kategori</th>
                <th className="py-3.5 px-5">Model 3D (Scale)</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4e0ed]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#a6bbd1]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#006bff] border-t-transparent" />
                      <span className="text-xs font-medium">Memuat data proyek...</span>
                    </div>
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#a6bbd1]">
                    Belum ada data proyek infrastruktur.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-[#f0f3f8]/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="inline-flex h-6 w-8 items-center justify-center rounded-md bg-[#f0f3f8] font-mono text-xs font-bold text-[#0b3558] border border-[#d4e0ed]">
                        #{proj.target_index}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#0b3558] text-sm">{proj.title_id}</div>
                      <div className="text-[11px] text-[#476788]">{proj.title_en}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="rounded-full bg-[#e6f0ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#004eba] border border-[#d4e0ed]">
                        {proj.category_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-xs text-[#0b3558]">
                        {proj.model_url.split("/").pop()}
                      </span>
                      <span className="ml-2 text-[11px] text-[#a6bbd1]">({proj.model_scale})</span>
                    </td>
                    <td className="py-3.5 px-5">
                      {proj.is_active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[11px] font-semibold text-[#059669] border border-[#a7f3d0]">
                          <CheckCircle2 className="h-3 w-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#f0f3f8] px-2.5 py-0.5 text-[11px] font-semibold text-[#476788] border border-[#d4e0ed]">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/admin/projects/${proj.id}/edit`}
                        className="rounded-lg border border-[#d4e0ed] bg-white px-3 py-1.5 text-xs font-semibold text-[#0b3558] hover:border-[#006bff] hover:text-[#006bff] hover:bg-[#f0f3f8] transition-all shadow-xs"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
