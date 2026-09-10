"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Building2,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanLine,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(!isLoginPage);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          setUserEmail(session.user.email ?? "Admin CIKASDA");
          setCheckingAuth(false);
          if (isLoginPage) {
            router.replace("/admin/dashboard");
          }
        } else {
          setUserEmail(null);
          setCheckingAuth(false);
          if (!isLoginPage) {
            router.replace("/admin/login");
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
        if (isMounted) {
          setCheckingAuth(false);
          if (!isLoginPage) {
            router.replace("/admin/login");
          }
        }
      }
    }

    verifyAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;
      if (session?.user) {
        setUserEmail(session.user.email ?? "Admin CIKASDA");
        setCheckingAuth(false);
        if (isLoginPage) {
          router.replace("/admin/dashboard");
        }
      } else {
        setUserEmail(null);
        setCheckingAuth(false);
        if (!isLoginPage) {
          router.replace("/admin/login");
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb] text-[#0b3558]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#006bff] border-t-transparent" />
          <p className="text-xs font-semibold text-[#476788]">Memverifikasi sesi admin...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: "Dashboard Overview",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Proyek Infrastruktur",
      href: "/admin/projects",
      icon: Building2,
    },
    {
      name: "MindAR Marker Studio",
      href: "/admin/markers",
      icon: ScanLine,
    },
    {
      name: "3D GLB Studio",
      href: "/admin/models",
      icon: Box,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fb] text-[#0b3558] font-sans antialiased">
      {/* Sidebar Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0b3558]/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#d4e0ed] bg-white transition-transform duration-300 ease-out lg:static lg:w-64 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#d4e0ed] px-5 bg-white">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-cikasda-v2.webp"
              alt="CIKASDA"
              width={124}
              height={34}
              className="h-7 w-auto object-contain"
            />
            <span className="rounded-full bg-[#e6f0ff] px-2.5 py-0.5 text-[10px] font-bold text-[#004eba] uppercase tracking-wider border border-[#d4e0ed]">
              Admin
            </span>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-[#476788] hover:bg-[#f0f3f8] hover:text-[#0b3558] lg:hidden transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-5">
          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#a6bbd1]">
            Menu Utama
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#006bff] text-white shadow-[0_4px_12px_rgba(0,107,255,0.25)]"
                    : "text-[#0b3558] hover:bg-[#f0f3f8] hover:text-[#006bff]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#476788]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-6">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#a6bbd1]">
              Aplikasi Pengunjung
            </p>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-semibold text-[#0b3558] hover:bg-[#f0f3f8] hover:text-[#006bff] transition-colors"
            >
              <span className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 shrink-0 text-[#476788]" />
                Buka WebAR Publik
              </span>
            </Link>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="border-t border-[#d4e0ed] p-3.5 bg-white">
          <div className="flex items-center justify-between rounded-xl bg-[#f0f3f8] p-3 border border-[#d4e0ed]">
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs font-bold text-[#0b3558]">
                {userEmail || "Admin CIKASDA"}
              </p>
              <p className="text-[10px] text-[#476788] font-medium">Pengelola Konten</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d4e0ed] bg-white text-[#476788] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors shadow-xs"
              title="Keluar"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#d4e0ed] bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] text-[#0b3558] hover:bg-white lg:hidden transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-[#0b3558] sm:text-base tracking-tight">
                CIKASDA AR Control Panel
              </h1>
              <p className="hidden text-[11px] text-[#476788] sm:block">
                Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4e0ed] bg-[#f0f3f8] px-3.5 py-1.5 text-xs font-semibold text-[#0b3558] hover:bg-white hover:border-[#006bff] hover:text-[#006bff] transition-all shadow-xs"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#476788]" />
              <span className="hidden sm:inline">Buka WebAR</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="w-full min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
