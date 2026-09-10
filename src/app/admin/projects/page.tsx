"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Edit,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { DatabaseProject } from "@/lib/supabase/types";
import { useProjects } from "@/lib/hooks/useProjects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminProjectsPage() {
  const { projects, isLoading: loading, mutateProjects } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<DatabaseProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    const targetId = projectToDelete.id;
    const targetTitle = projectToDelete.title_id;

    // Optimistic update
    mutateProjects(
      projects.filter((p) => p.id !== targetId),
      false
    );

    try {
      const { error } = await supabase.from("ar_projects").delete().eq("id", targetId);
      if (error) throw error;
      toast.success(`Proyek "${targetTitle}" berhasil dihapus.`);
    } catch (err: unknown) {
      console.error("Delete error:", err);
      toast.error("Gagal menghapus proyek dari database.");
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
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
      const { error } = await supabase
        .from("ar_projects")
        .update({ is_active: newStatus })
        .eq("id", project.id);

      if (error) throw error;
      toast.success(
        `Status ${project.title_id} diubah menjadi ${newStatus ? "Aktif" : "Draft"}.`
      );
    } catch (err: unknown) {
      console.error("Status toggle error:", err);
      toast.error("Gagal mengubah status proyek.");
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
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0b3558] sm:text-3xl">
            Katalog Proyek Infrastruktur
          </h2>
          <p className="text-xs sm:text-sm text-[#476788] mt-1">
            Kelola data proyek, rasio skala 3D glTF, dan keterkaitan target MindAR kamera
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#006bff] hover:bg-[#0058d6] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(0,107,255,0.25)] transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Proyek Baru
          </Link>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#d4e0ed] bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-[0_4px_16px_rgba(71,103,136,0.04)]">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a6bbd1]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama proyek atau kategori..."
            className="h-10 w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] pl-10 pr-3.5 text-xs text-[#0b3558] placeholder:text-[#a6bbd1] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            mutateProjects();
            toast.info("Memperbarui data proyek terbaru...");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d4e0ed] bg-white hover:bg-[#f0f3f8] px-4 py-2 text-xs font-semibold text-[#0b3558] transition-all shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5 text-[#476788]" />
          Segarkan Data
        </button>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-2xl border border-[#d4e0ed] bg-white shadow-[0_4px_16px_rgba(71,103,136,0.04)]">
        {/* Mobile Swipe Hint */}
        <div className="flex items-center justify-between bg-[#f8f9fb] px-4 py-2 border-b border-[#d4e0ed] text-[11px] text-[#476788] sm:hidden">
          <span>Geser tabel untuk melihat opsi aksi →</span>
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
                      <span className="text-xs font-medium">Memuat daftar proyek...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#a6bbd1]">
                    Tidak ditemukan data proyek infrastruktur.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f0f3f8]/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="inline-flex h-6 w-8 items-center justify-center rounded-md bg-[#f0f3f8] font-mono text-xs font-bold text-[#0b3558] border border-[#d4e0ed]">
                        #{item.target_index}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#0b3558] text-sm">{item.title_id}</div>
                      <div className="text-[11px] text-[#476788]">{item.title_en}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="rounded-full bg-[#e6f0ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#004eba] border border-[#d4e0ed]">
                        {item.category_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-xs text-[#0b3558]">
                        {item.model_url.split("/").pop()}
                      </span>
                      <span className="ml-2 text-[11px] text-[#a6bbd1]">({item.model_scale})</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all border ${
                          item.is_active
                            ? "bg-[#ecfdf5] text-[#059669] border-[#a7f3d0] hover:bg-[#d1fae5]"
                            : "bg-[#f0f3f8] text-[#476788] border-[#d4e0ed] hover:bg-[#e2e8f0]"
                        }`}
                        title="Klik untuk mengubah status"
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
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/projects/${item.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d4e0ed] bg-white text-[#476788] hover:text-[#006bff] hover:border-[#006bff] hover:bg-[#f0f3f8] transition-all shadow-xs"
                          title="Edit Proyek"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setProjectToDelete(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d4e0ed] bg-white text-[#476788] hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-all shadow-xs"
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

      {/* Confirmation Modal (Shadcn Dialog) */}
      <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <DialogContent className="rounded-3xl border border-[#d4e0ed] bg-white p-6 shadow-[0_10px_40px_rgba(71,103,136,0.15)] sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100 mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-[#0b3558]">
              Hapus Proyek AR Ini?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-[#476788] leading-relaxed pt-1">
              Apakah Anda yakin ingin menghapus proyek{" "}
              <strong className="text-[#0b3558] font-bold">
                &ldquo;{projectToDelete?.title_id}&rdquo;
              </strong>
              ? Data ini akan dihapus permanen dan tidak akan lagi dikenali oleh kamera WebAR.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setProjectToDelete(null)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[#d4e0ed] bg-white px-4 text-xs font-semibold text-[#0b3558] hover:bg-[#f0f3f8] transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus Proyek"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
