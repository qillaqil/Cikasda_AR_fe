"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Lock, Mail, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 detik

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const supabase = createClient();

  // Restore lockout state from sessionStorage if user reloads page
  useEffect(() => {
    try {
      const storedUntil = sessionStorage.getItem("cikasda_login_lockout_until");
      const storedAttempts = sessionStorage.getItem("cikasda_login_failed_attempts");
      if (storedAttempts) {
        setFailedAttempts(parseInt(storedAttempts, 10) || 0);
      }
      if (storedUntil) {
        const remainingMs = parseInt(storedUntil, 10) - Date.now();
        if (remainingMs > 0) {
          setLockoutCountdown(Math.ceil(remainingMs / 1000));
        } else {
          sessionStorage.removeItem("cikasda_login_lockout_until");
          sessionStorage.removeItem("cikasda_login_failed_attempts");
          setFailedAttempts(0);
        }
      }
    } catch {
      // sessionStorage might not be available
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutCountdown <= 0) return;
    const interval = setInterval(() => {
      setLockoutCountdown((prev) => {
        if (prev <= 1) {
          try {
            sessionStorage.removeItem("cikasda_login_lockout_until");
            sessionStorage.removeItem("cikasda_login_failed_attempts");
          } catch {}
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutCountdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutCountdown > 0) return;

    setLoading(true);
    setErrorMsg("");

    const cleanInput = email.trim().toLowerCase();
    if (!cleanInput || !password) {
      setErrorMsg("Email / username dan kata sandi wajib diisi.");
      setLoading(false);
      return;
    }

    // Normalisasi input username ke email Supabase yang sah
    let targetEmail = cleanInput;
    if (!targetEmail.includes("@")) {
      if (
        targetEmail === "admin" ||
        targetEmail === "admincikasda" ||
        targetEmail === "admincikasdaar" ||
        targetEmail === "cikasda"
      ) {
        targetEmail = "admincikasdaar@cikasda.go.id";
      } else if (targetEmail === "fadil" || targetEmail === "ppid") {
        targetEmail = "fadil@ppid.com";
      } else {
        targetEmail = `${targetEmail}@cikasda.go.id`;
      }
    } else if (
      targetEmail === "admin@cikasda.sultengprov.go.id" ||
      targetEmail === "admin@cikasda.go.id"
    ) {
      targetEmail = "admincikasdaar@cikasda.go.id";
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        try {
          sessionStorage.setItem("cikasda_login_failed_attempts", nextAttempts.toString());
        } catch {}

        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
          try {
            sessionStorage.setItem("cikasda_login_lockout_until", lockoutUntil.toString());
          } catch {}
          setLockoutCountdown(Math.ceil(LOCKOUT_DURATION_MS / 1000));
          setErrorMsg(
            "Terlalu banyak percobaan gagal (5x berturut-turut). Portal dikunci sementara demi keamanan."
          );
        } else {
          const remaining = MAX_FAILED_ATTEMPTS - nextAttempts;
          setErrorMsg(
            `Kombinasi email atau kata sandi tidak valid. Sisa percobaan: ${remaining} kali sebelum portal dikunci sementara.`
          );
        }
      } else {
        // Reset attempts on successful login
        try {
          sessionStorage.removeItem("cikasda_login_lockout_until");
          sessionStorage.removeItem("cikasda_login_failed_attempts");
        } catch {}
        router.replace("/admin/dashboard");
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

          {/* Lockout Warning Banner */}
          {lockoutCountdown > 0 ? (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-amber-950">
                  Portal Terkunci Sementara ({lockoutCountdown} detik)
                </p>
                <p className="mt-0.5 text-amber-800">
                  Terdeteksi 5 kali kegagalan login berturut-turut. Demi keamanan sistem, akses verifikasi ditangguhkan sementara.
                </p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {errorMsg}
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email / Username Pengelola
              </label>
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={100}
                  disabled={loading || lockoutCountdown > 0}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email atau username"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                  maxLength={128}
                  disabled={loading || lockoutCountdown > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutCountdown > 0}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {lockoutCountdown > 0 ? (
                `Terkunci (${lockoutCountdown}d)`
              ) : loading ? (
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
