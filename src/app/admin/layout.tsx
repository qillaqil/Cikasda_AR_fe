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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Memverifikasi sesi admin...</p>
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
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-cikasda-v2.webp"
              alt="CIKASDA"
              width={130}
              height={36}
              className="h-7 w-auto object-contain"
            />
            <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 uppercase tracking-wide border border-teal-200">
              Admin
            </span>
          </div>
          <button
            type="button"
            className="rounded p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-teal-700 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-5">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Aplikasi Pengunjung
            </p>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-500" />
                Buka WebAR Publik
              </span>
            </Link>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-200">
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs font-bold text-slate-800">
                {userEmail || "Admin CIKASDA"}
              </p>
              <p className="text-[10px] text-slate-500">Pengelola Konten</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900 sm:text-base">
                CIKASDA AR Control Panel
              </h1>
              <p className="hidden text-[11px] text-slate-500 sm:block">
                Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Buka WebAR</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="w-full min-w-0 flex-1 p-5 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
