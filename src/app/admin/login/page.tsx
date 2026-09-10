"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Lock, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
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
      toast.error("Email dan kata sandi wajib diisi.");
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
          const msg = "Terlalu banyak percobaan gagal (5x). Portal dikunci sementara 30 detik.";
          setErrorMsg(msg);
          toast.error(msg);
        } else {
          const remaining = MAX_FAILED_ATTEMPTS - nextAttempts;
          const msg = `Kombinasi login tidak valid. Sisa percobaan: ${remaining} kali.`;
          setErrorMsg(msg);
          toast.error(msg);
        }
      } else {
        // Reset attempts on successful login
        try {
          sessionStorage.removeItem("cikasda_login_lockout_until");
          sessionStorage.removeItem("cikasda_login_failed_attempts");
        } catch {}
        toast.success("Autentikasi berhasil! Mengalihkan ke dashboard...");
        router.replace("/admin/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan pada sistem autentikasi.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f8f9fb] px-4 py-12 text-[#0b3558] overflow-hidden font-sans">
      {/* Calendly Soft Gradient Atmosphere Blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#0099ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#e55cff]/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-[#d4e0ed] bg-white p-7 sm:p-10 shadow-[0_8px_30px_rgba(71,103,136,0.08)]">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Image
                src="/logo-cikasda-v2.webp"
                alt="CIKASDA"
                width={150}
                height={42}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-[#0b3558] sm:text-2xl">
              Portal Admin WebAR
            </h2>
            <p className="mt-1 text-xs text-[#476788]">
              Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah
            </p>
          </div>

          {/* Lockout Warning Banner */}
          {lockoutCountdown > 0 ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-amber-950">
                  Portal Terkunci Sementara ({lockoutCountdown} detik)
                </p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Terdeteksi 5 kali kegagalan login berturut-turut. Akses otentikasi ditangguhkan sementara.
                </p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-medium leading-relaxed">
              {errorMsg}
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0b3558] mb-1.5">
                Email / Username Pengelola
              </label>
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#a6bbd1]" />
                <input
                  type="text"
                  required
                  maxLength={100}
                  disabled={loading || lockoutCountdown > 0}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email atau username"
                  className="h-11 w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] pl-10 pr-3.5 text-xs text-[#0b3558] placeholder:text-[#a6bbd1] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all disabled:bg-[#f0f3f8] disabled:text-[#a6bbd1] disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b3558] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#a6bbd1]" />
                <input
                  type="password"
                  required
                  maxLength={128}
                  disabled={loading || lockoutCountdown > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-11 w-full rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] pl-10 pr-3.5 text-xs text-[#0b3558] placeholder:text-[#a6bbd1] outline-none focus:border-[#006bff] focus:bg-white focus:ring-1 focus:ring-[#006bff] transition-all disabled:bg-[#f0f3f8] disabled:text-[#a6bbd1] disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutCountdown > 0}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#006bff] hover:bg-[#0058d6] text-xs font-semibold text-white shadow-[0_4px_14px_rgba(0,107,255,0.25)] hover:shadow-[0_6px_18px_rgba(0,107,255,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {lockoutCountdown > 0 ? (
                `Terkunci (${lockoutCountdown}d)`
              ) : loading ? (
                "Memverifikasi Sesi..."
              ) : (
                <>
                  Masuk ke Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-[#a6bbd1]">
          © 2026 Dinas CIKASDA Provinsi Sulawesi Tengah
        </p>
      </div>
    </div>
  );
}
