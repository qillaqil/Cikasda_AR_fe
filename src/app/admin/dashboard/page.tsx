"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Box,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Layers,
  Plus,
  RotateCcw,
  ScanLine,
} from "lucide-react";
import { useProjects } from "@/lib/hooks/useProjects";

export default function AdminDashboardPage() {
  const { projects, activeProjects, isLoading: loading, mutateProjects } = useProjects();

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Banner / Header Card */}
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Dashboard Kontrol WebAR
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Pengelolaan model 3D, target marker kamera, dan spesifikasi infrastruktur publik CIKASDA Sulawesi Tengah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition-colors shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Tambah Proyek
            </Link>
            <Link
              href="/admin/markers"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ScanLine className="h-4 w-4 text-teal-700" />
              Marker Studio
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ExternalLink className="h-4 w-4 text-slate-500" />
              Buka WebAR
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Proyek
            </span>
            <span className="rounded-md bg-teal-50 p-2 text-teal-700">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? "-" : projects.length}
            </span>
            <p className="mt-1 text-[11px] text-slate-500">
              Infrastruktur terdaftar
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Marker Aktif
            </span>
            <span className="rounded-md bg-sky-50 p-2 text-sky-700">
              <ScanLine className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? "-" : activeProjects.length}
            </span>
            <p className="mt-1 text-[11px] text-slate-500">
              Target siap lacak
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Model 3D
            </span>
            <span className="rounded-md bg-indigo-50 p-2 text-indigo-700">
              <Box className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? "-" : activeProjects.length}
            </span>
            <p className="mt-1 text-[11px] text-slate-500">
              Model terkalibrasi
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bahasa
            </span>
            <span className="rounded-md bg-amber-50 p-2 text-amber-700">
              <Globe2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              ID / EN
            </span>
            <p className="mt-1 text-[11px] text-slate-500">
              Indonesia & English
            </p>
          </div>
        </div>
      </div>

      {/* Projects Table Overview */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Objek AR Infrastruktur
            </h3>
            <p className="text-xs text-slate-500">
              Data yang saat ini aktif ditangkap oleh kamera WebAR pengunjung
            </p>
          </div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            Buka Tabel Lengkap
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Index</th>
                <th className="py-3 px-4">Nama Proyek</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Model 3D (Scale)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat data proyek...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada data proyek.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-100 font-mono text-xs font-bold text-slate-700 border border-slate-200">
                        #{proj.target_index}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{proj.title_id}</div>
                      <div className="text-[11px] text-slate-500">{proj.title_en}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
                        {proj.category_id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-700">
                        {proj.model_url.split("/").pop()}
                      </span>
                      <span className="ml-2 text-slate-400">({proj.model_scale})</span>
                    </td>
                    <td className="py-3 px-4">
                      {proj.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/projects/${proj.id}/edit`}
                        className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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
