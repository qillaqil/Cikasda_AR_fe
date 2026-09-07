"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Edit,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DatabaseProject } from "@/lib/supabase/types";
import { useProjects } from "@/lib/hooks/useProjects";

export default function AdminProjectsPage() {
  const { projects, isLoading: loading, mutateProjects } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyek AR ini?")) return;

    // Optimistic update
    mutateProjects(
      projects.filter((p) => p.id !== id),
      false
    );

    try {
      await supabase.from("ar_projects").delete().eq("id", id);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      mutateProjects();
    }
  };

  const handleToggleStatus = async (project: DatabaseProject) => {
    const newStatus = !project.is_active;
    const updated = projects.map((p) =>
      p.id === project.id ? { ...p, is_active: newStatus } : p
    );

    // Optimistic update
    mutateProjects(updated, false);

    try {
      await supabase
        .from("ar_projects")
        .update({ is_active: newStatus })
        .eq("id", project.id);
    } catch (err) {
      console.error("Status toggle error:", err);
    } finally {
      mutateProjects();
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Daftar Proyek Infrastruktur AR
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data proyek, target pelacakan MindAR, dan file 3D glTF
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Proyek Baru
          </Link>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama proyek atau kategori..."
            className="h-8.5 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:bg-white"
          />
        </div>

        <button
          type="button"
          onClick={() => mutateProjects()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          Segarkan Data
        </button>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Index</th>
                <th className="py-3 px-4">Nama Proyek</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Model 3D</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat daftar proyek...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data proyek.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-100 font-mono text-xs font-bold text-slate-700 border border-slate-200">
                        #{item.target_index}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.title_id}</div>
                      <div className="text-[11px] text-slate-500">{item.title_en}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
                        {item.category_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-700">
                        {item.model_url.split("/").pop()}
                      </span>
                      <span className="ml-2 text-slate-400">({item.model_scale})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors border ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {item.is_active ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/projects/${item.id}/edit`}
                          className="rounded border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-50 transition-colors"
                          title="Edit Proyek"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded border border-slate-200 bg-white p-1.5 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                          title="Hapus Proyek"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
