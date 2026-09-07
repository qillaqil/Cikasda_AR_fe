"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export type Language = "id" | "en";

export interface ModelCard {
  label: string;
  value: string;
  detail: string;
}

export interface ARModelData {
  id: number;
  title: string;
  category: string;
  description: string;
  modelUrl: string;
  scale: string;
  cards: ModelCard[];
}

type TranslationKey =
  | "cameraPermission"
  | "check"
  | "cameraStatusNotChecked"
  | "cameraStatusNotSupported"
  | "cameraStatusActive"
  | "cameraStatusDenied"
  | "modelQuality"
  | "low"
  | "medium"
  | "high"
  | "language"
  | "indonesian"
  | "english"
  | "resetView"
  | "resetViewModelPosition"
  | "resetViewSuccess"
  | "appInfo"
  | "spatialViewer"
  | "settings"
  | "closeSettings"
  | "cikasda"
  | "spatialObjectViewer"
  | "markerBasedWebAR"
  | "rotateGesture"
  | "zoomGesture"
  | "projectInfrastructure"
  | "copyright"
  | "version"
  | "building"
  | "description"
  | "year"
  | "area"
  | "centralSulawesi"
  | "chatAssistant"
  | "chatPlaceholder"
  | "chatInputLabel"
  | "sendMessage"
  | "closeDetail"
  | "aiAssistant"
  | "aiAssistantWelcome"
  | "aiAssistantFallback"
  | "aiAssistantError"
  | "quickQuestionFunction"
  | "quickQuestionYear"
  | "quickQuestionLocation";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  id: {
    cameraPermission: "Izin Kamera",
    check: "Periksa",
    cameraStatusNotChecked: "Belum diperiksa",
    cameraStatusNotSupported: "Tidak didukung browser",
    cameraStatusActive: "Izin kamera aktif",
    cameraStatusDenied: "Izin kamera ditolak",
    modelQuality: "Kualitas Model",
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
    language: "Bahasa",
    indonesian: "Indonesia",
    english: "English",
    resetView: "Reset Tampilan",
    resetViewModelPosition: "Kembalikan posisi model",
    resetViewSuccess: "Tampilan berhasil direset",
    appInfo: "Informasi Aplikasi",
    spatialViewer: "Spatial Viewer",
    settings: "Pengaturan",
    closeSettings: "Tutup pengaturan",
    cikasda: "CIKASDA",
    spatialObjectViewer: "Spatial Object Viewer",
    markerBasedWebAR: "Marker-based WebAR",
    rotateGesture: "Geser satu jari untuk rotate",
    zoomGesture: "Cubit dua jari untuk zoom",
    projectInfrastructure: "Proyek Infrastruktur Publik",
    copyright: "© 2026 CIKASDA AR · Spatial Object Viewer",
    version: "Versi 1.0",
    building: "Bangunan",
    description: "Keterangan",
    year: "Tahun",
    area: "Kawasan",
    centralSulawesi: "Sulawesi Tengah",
    chatAssistant: "CHAT ASSISTANT",
    chatPlaceholder: "Ketik pertanyaan Anda...",
    chatInputLabel: "Ketik pertanyaan Anda",
    sendMessage: "Kirim pesan",
    closeDetail: "Tutup detail informasi",
    aiAssistant: "AI Assistant",
    aiAssistantWelcome:
      "Halo! Ada yang ingin Anda ketahui tentang proyek infrastruktur ini?",
    aiAssistantFallback:
      "Maaf, terjadi kesalahan saat memproses permintaan Anda.",
    aiAssistantError: "Maaf, terjadi kesalahan saat menghubungi asisten AI.",
    quickQuestionFunction: "Apa fungsi infrastruktur ini?",
    quickQuestionYear: "Kapan proyek ini dibuat?",
    quickQuestionLocation: "Di mana lokasinya?",
  },
  en: {
    cameraPermission: "Camera Permission",
    check: "Check",
    cameraStatusNotChecked: "Not checked",
    cameraStatusNotSupported: "Browser not supported",
    cameraStatusActive: "Camera permission active",
    cameraStatusDenied: "Camera permission denied",
    modelQuality: "Model Quality",
    low: "Low",
    medium: "Medium",
    high: "High",
    language: "Language",
    indonesian: "Indonesia",
    english: "English",
    resetView: "Reset View",
    resetViewModelPosition: "Reset model position",
    resetViewSuccess: "View reset successfully",
    appInfo: "Application Info",
    spatialViewer: "Spatial Viewer",
    settings: "Settings",
    closeSettings: "Close settings",
    cikasda: "CIKASDA",
    spatialObjectViewer: "Spatial Object Viewer",
    markerBasedWebAR: "Marker-based WebAR",
    rotateGesture: "Swipe one finger to rotate",
    zoomGesture: "Pinch two fingers to zoom",
    projectInfrastructure: "Public Infrastructure Project",
    copyright: "© 2026 CIKASDA AR · Spatial Object Viewer",
    version: "Version 1.0",
    building: "Building",
    description: "Description",
    year: "Year",
    area: "Area",
    centralSulawesi: "Central Sulawesi",
    chatAssistant: "CHAT ASSISTANT",
    chatPlaceholder: "Type your question...",
    chatInputLabel: "Type your question",
    sendMessage: "Send message",
    closeDetail: "Close information detail",
    aiAssistant: "AI Assistant",
    aiAssistantWelcome:
      "Hello! Is there anything you'd like to know about this infrastructure project?",
    aiAssistantFallback:
      "Sorry, an error occurred while processing your request.",
    aiAssistantError:
      "Sorry, an error occurred while contacting the AI assistant.",
    quickQuestionFunction: "What is this infrastructure used for?",
    quickQuestionYear: "When was this project created?",
    quickQuestionLocation: "Where is it located?",
  },
};

export const arModels: Record<Language, ARModelData[]> = {
  id: [
    {
      id: 0,
      title: "Masjid Raya Baitul Khairaat",
      category: "Bangunan Gedung & Religi",
      description:
        "Tempat ibadah umat Islam terbesar di Sulawesi Tengah berkonsep modern-kontemporer tahan gempa.",
      modelUrl: "/models/mosque.glb",
      scale: "0.1 0.1 0.1",
      cards: [
        {
          label: "Bangunan Utama",
          value: "Masjid Raya Baitul Khairaat",
          detail:
            "Masjid Raya Baitul Khairaat (dahulu kawasan Masjid Agung Darussalam) merupakan tempat ibadah umat Islam terbesar di Sulawesi Tengah di atas lahan 4 hektare. Desain modern-kontemporer dengan simbolisme numerik Al-Qur'an (tinggi 30m melambangkan 30 juz) dan struktur tahan gempa SNI didukung 483 tiang pancang.",
        },
        {
          label: "Fungsi & Ibadah",
          value: "Fungsi Sosial & Ibadah",
          detail:
            "Fungsi Ibadah: Sarana utama salat fardu berjemaah, salat Jumat, Id, iktikaf, dan pengajian rutin berkapasitas 10.000 - 15.000 jemaah.\n\nFungsi Sosial: Pusat pemberdayaan umat, pengelolaan ZIS, serta ruang silaturahmi warga (Hablum minannas).",
        },
        {
          label: "Tahun Peresmian",
          value: "2025 (4 Desember)",
          detail:
            "Tahun Pendataan & Peresmian: 2025. Diresmikan pada 4 Desember 2025 setelah proses pembangunan kembali pascabencana gempa bumi guna memenuhi standar struktur tahan gempa.",
        },
        {
          label: "Kawasan & Lokasi",
          value: "Palu, Sulawesi Tengah",
          detail:
            "Alamat: Jl. Jaelangkara / Jl. WR Supratman, Kelurahan Baru, Kecamatan Palu Barat, Kota Palu, Sulawesi Tengah.\n\nKoordinat Peta: Berada strategis di pusat kota Palu, tidak jauh dari pesisir Teluk Palu.",
        },
      ],
    },
    {
      id: 1,
      title: "Bendungan Irigasi CIKASDA",
      category: "Sumber Daya Air (SDA)",
      description:
        "Infrastruktur penampungan dan pengelolaan air strategis untuk mendukung irigasi pertanian daerah.",
      modelUrl: "/models/bendungan.glb",
      scale: "0.05 0.05 0.05",
      cards: [
        {
          label: "Tipe Struktur",
          value: "Urugan Batu Inti Kedap",
          detail:
            "Bendungan berstruktur urugan batu dengan inti kedap air. Didesain menahan debit air berskala besar, dilengkapi pintu pelimpah (spillway) serta sistem monitoring tekanan air otomatis.",
        },
        {
          label: "Kapasitas Tampung",
          value: "15 Juta m³ Air",
          detail:
            "Memiliki kapasitas tampungan efektif hingga 15 Juta m³ air untuk menjaga ketersediaan pasokan air baku dan mengendalikan risiko banjir di wilayah hilir saat curah hujan tinggi.",
        },
        {
          label: "Tinggi Elevasi",
          value: "45 Meter",
          detail:
            "Struktur bendungan berdiri setinggi 45 meter dari dasar pondasi untuk memastikan stabilitas tekanan air dan distribusi aliran irigasi yang optimal.",
        },
        {
          label: "Cakupan Irigasi",
          value: "1.500 Hektar Sawah",
          detail:
            "Mengalirkan air secara konsisten ke jaringan irigasi primer dan sekunder untuk mengairi lebih dari 1.500 hektar lahan pertanian di Sulawesi Tengah.",
        },
      ],
    },
    {
      id: 2,
      title: "Jaringan SPAM Regional",
      category: "Cipta Karya & Air Minum",
      description:
        "Sistem Penyediaan Air Minum terpadu untuk menjamin ketersediaan air bersih pemukiman warga.",
      modelUrl: "/models/cikasda.glb",
      scale: "0.2 0.2 0.2",
      cards: [
        {
          label: "Kapasitas Debit",
          value: "300 Liter / Detik",
          detail:
            "Infrastruktur pengolahan air minum modern ini menyalurkan air bersih steril dengan debit kapasitas mencapai 300 liter per detik.",
        },
        {
          label: "Panjang Jaringan",
          value: "18.5 Kilometer",
          detail:
            "Konstruksi pipa transmisi bertekanan tinggi membentang sepanjang 18.5 kilometer menggunakan material HDPE standar industri yang tahan korosi dan guncangan tanah.",
        },
        {
          label: "Target Layanan",
          value: "25.000 Sambungan (SR)",
          detail:
            "Dirancang untuk memberikan akses air bersih layak minum secara langsung kepada lebih dari 25.000 Sambungan Rumah (SR) pemukiman warga.",
        },
        {
          label: "Tahun Pembangunan",
          value: "2025 - 2026",
          detail:
            "Masuk dalam program prioritas pemerintah daerah untuk memperluas pencapaian sanitasi dan air bersih berkualitas di Sulawesi Tengah.",
        },
      ],
    },
  ],
  en: [
    {
      id: 0,
      title: "Baitul Khairaat Grand Mosque",
      category: "Building & Religious Infrastructure",
      description:
        "The largest Islamic place of worship in Central Sulawesi featuring modern earthquake-resistant architecture.",
      modelUrl: "/models/mosque.glb",
      scale: "0.1 0.1 0.1",
      cards: [
        {
          label: "Main Building",
          value: "Baitul Khairaat Grand Mosque",
          detail:
            "Baitul Khairaat Grand Mosque is the largest Islamic place of worship in Central Sulawesi standing on 4 hectares. Features modern-contemporary design rich in Qur'anic symbolism (30m height symbolizing 30 juz) and earthquake-resistant structures.",
        },
        {
          label: "Functions & Worship",
          value: "Social & Worship Functions",
          detail:
            "Worship Function: Main facility for congregational prayers and gatherings with a capacity of 10,000 - 15,000 worshippers.\n\nSocial Function: Community empowerment center, ZIS management, and public gathering space.",
        },
        {
          label: "Inauguration Year",
          value: "2025 (December 4)",
          detail:
            "Inaugurated on December 4, 2025 after reconstruction following post-earthquake recovery programs to meet national earthquake-resistant building standards.",
        },
        {
          label: "Area & Location",
          value: "Palu, Central Sulawesi",
          detail:
            "Address: Jl. Jaelangkara / Jl. WR Supratman, West Palu, Palu City, Central Sulawesi.\n\nStrategically located near the Palu Bay coastline.",
        },
      ],
    },
    {
      id: 1,
      title: "CIKASDA Irrigation Dam",
      category: "Water Resources Infrastructure",
      description:
        "Strategic water storage and management infrastructure to support regional agricultural irrigation.",
      modelUrl: "/models/bendungan.glb",
      scale: "0.05 0.05 0.05",
      cards: [
        {
          label: "Structure Type",
          value: "Rock-fill Core Dam",
          detail:
            "A rock-fill dam structure with an impervious clay core. Equipped with spillway gates and automated water pressure monitoring systems.",
        },
        {
          label: "Storage Capacity",
          value: "15 Million m³ Water",
          detail:
            "Holds an effective storage capacity of up to 15 Million m³ of water reserves to control regional flood risks during high rainfall seasons.",
        },
        {
          label: "Elevation Height",
          value: "45 Meters",
          detail:
            "Standing 45 meters high from foundation levels to ensure structural stability and optimal irrigation flow pressure.",
        },
        {
          label: "Irrigation Coverage",
          value: "1,500 Hectares Farmland",
          detail:
            "Consistently delivers water through primary and secondary irrigation networks to over 1,500 hectares of agricultural land.",
        },
      ],
    },
    {
      id: 2,
      title: "Regional Water Supply System",
      category: "Human Settlements & Water Supply",
      description:
        "Integrated Water Supply Provision System to guarantee clean water availability for residential areas.",
      modelUrl: "/models/cikasda.glb",
      scale: "0.2 0.2 0.2",
      cards: [
        {
          label: "Flow Rate Capacity",
          value: "300 Liters / Second",
          detail:
            "Modern water treatment plant system delivering clean potable water at flow rates reaching 300 Liters per Second.",
        },
        {
          label: "Network Length",
          value: "18.5 Kilometers",
          detail:
            "High-pressure pipeline network spanning 18.5 kilometers constructed with industrial HDPE corrosion-resistant materials.",
        },
        {
          label: "Service Target",
          value: "25,000 House Connections",
          detail:
            "Designed to supply direct potable water connections to over 25,000 residential households.",
        },
        {
          label: "Construction Year",
          value: "2025 - 2026",
          detail:
            "Part of priority public works programs expanding regional clean water coverage in Central Sulawesi.",
        },
      ],
    },
  ],
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Record<TranslationKey, string>;
  models: ARModelData[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("id");

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        models: arModels[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
