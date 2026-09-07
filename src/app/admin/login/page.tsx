"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan pada sistem autentikasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Image
                src="/logo-cikasda-v2.webp"
                alt="CIKASDA"
                width={160}
                height={48}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>

            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Portal Admin WebAR
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Pengelola
              </label>
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cikasda.sultengprov.go.id"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                "Memverifikasi..."
              ) : (
                <>
                  Masuk ke Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          © 2026 Dinas CIKASDA Provinsi Sulawesi Tengah
        </p>
      </div>
    </div>
  );
}
