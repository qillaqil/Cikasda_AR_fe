import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://cikasda.sultengprov.go.id"),
  title: {
    default: "CIKASDA WebAR - Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah",
    template: "%s | CIKASDA WebAR Sulteng",
  },
  description:
    "Aplikasi Web Augmented Reality (WebAR) resmi Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah. Eksplorasi 3D interaktif objek infrastruktur publik strategis.",
  keywords: [
    "CIKASDA",
    "Sulawesi Tengah",
    "WebAR",
    "Augmented Reality",
    "Infrastruktur Publik",
    "Cipta Karya",
    "Sumber Daya Air",
    "Masjid Raya Baitul Khairaat",
    "Palu",
  ],
  authors: [{ name: "Dinas CIKASDA Provinsi Sulawesi Tengah" }],
  icons: {
    icon: "/logo-sulteng.webp",
    shortcut: "/logo-sulteng.webp",
    apple: "/logo-sulteng.webp",
  },
  openGraph: {
    title: "CIKASDA WebAR - Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah",
    description:
      "Aplikasi Web Augmented Reality (WebAR) interaktif untuk visualisasi 3D proyek infrastruktur strategis Sulawesi Tengah.",
    images: [
      {
        url: "/logo-cikasda-v2.webp",
        width: 1200,
        height: 630,
        alt: "Logo CIKASDA Provinsi Sulawesi Tengah",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/logo-sulteng.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/logo-sulteng.webp" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
