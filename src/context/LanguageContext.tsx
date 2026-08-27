"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export type Language = "id" | "en";

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
  | "mosqueName"
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
  | "socialWorshipFunction"
  | "centralSulawesi"
  | "buildingDetail"
  | "descriptionDetail"
  | "yearDetail"
  | "areaDetail"
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
    mosqueName: "Masjid Raya Baitul Khairaat",
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
    socialWorshipFunction: "Fungsi Sosial & Ibadah",
    centralSulawesi: "Sulawesi Tengah",
    buildingDetail:
      "Masjid Raya Baitul Khairaat (dahulu dikenal sebagai kawasan Masjid Agung Darussalam) merupakan tempat ibadah umat Islam terbesar di Provinsi Sulawesi Tengah yang berdiri di atas lahan seluas 4 hektare. Bangunan ini mengusung konsep arsitektur modern-kontemporer dengan struktur horizontal ramah lingkungan dan ramah disabilitas. Desain bangunan sarat akan simbolisme numerik Al-Qur'an, seperti tinggi bangunan utama 30 meter (melambangkan 30 juz) dan menara kembar setinggi 66,66 meter (melambangkan 6.666 ayat). Masjid ini memegang dua rekor MURI sekaligus untuk kategori kubah terbesar di Indonesia (diameter 90 meter) dan jam dinding menara terbesar di Indonesia (diameter 19,3 meter).",
    descriptionDetail:
      "Masjid Raya Baitul Khairaat memiliki fungsi sosial, ibadah, dan aktivitas bangunan yang saling mendukung.\n\nFungsi Ibadah: Sebagai sarana utama ibadah salat fardu berjemaah, salat Jumat, salat Id, iktikaf, dan pengajian rutin dengan kapasitas daya tampung mencapai 10.000 hingga 15.000 jemaah.\n\nFungsi Sosial: Berperan sebagai pusat pemberdayaan umat, pengumpulan dan penyaluran zakat/infak/sedekah (ZIS), serta ruang silaturahmi yang mempererat hubungan antarwarga (Hablum minannas).\n\nAktivitas Bangunan: Menjadi pusat syiar Islam, pendidikan Al-Qur'an, kegiatan remas (remaja masjid), hari besar keagamaan, serta kawasan destinasi wisata religi edukatif bagi wisatawan lokal maupun luar daerah.",
    yearDetail:
      "Tahun Pendataan & Peresmian: 2025. Tepatnya diresmikan pada 4 Desember 2025 setelah melalui proses pembangunan kembali pascabencana gempa bumi guna memenuhi standar struktur tahan gempa SNI dengan dukungan 483 titik tiang pancang.",
    areaDetail:
      "Alamat: Jl. Jaelangkara / Jl. WR Supratman, Kelurahan Baru, Kecamatan Palu Barat, Kota Palu, Provinsi Sulawesi Tengah, Kode Pos 94221.\n\nKoordinat Peta: Berada strategis di kawasan pusat kota Palu, tidak jauh dari pesisir Teluk Palu, menjadikannya mudah diakses dari berbagai penjuru kota.",
    chatAssistant: "CHAT ASSISTANT",
    chatPlaceholder: "Ketik pertanyaan Anda...",
    chatInputLabel: "Ketik pertanyaan Anda",
    sendMessage: "Kirim pesan",
    closeDetail: "Tutup detail informasi",
    aiAssistant: "AI Assistant",
    aiAssistantWelcome:
      "Halo! Ada yang ingin Anda ketahui tentang Masjid Raya Baitul Khairaat?",
    aiAssistantFallback:
      "Maaf, terjadi kesalahan saat memproses permintaan Anda.",
    aiAssistantError:
      "Maaf, terjadi kesalahan saat menghubungi asisten AI.",
    quickQuestionFunction: "Apa fungsi bangunan ini?",
    quickQuestionYear: "Kapan proyek ini dibuat?",
    quickQuestionLocation: "Di mana lokasi Masjid Raya Baitul Khairaat?",
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
    mosqueName: "Baitul Khairaat Grand Mosque",
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
    socialWorshipFunction: "Social & Worship Functions",
    centralSulawesi: "Central Sulawesi",
    buildingDetail:
      "Baitul Khairaat Grand Mosque (formerly known as the Darussalam Grand Mosque area) is the largest Islamic place of worship in Central Sulawesi Province, standing on 4 hectares of land. The building carries a modern-contemporary architectural concept with an environmentally friendly and disability-friendly horizontal structure. Its design is rich with Qur'anic numerical symbolism, including the 30-meter height of the main building (symbolizing 30 juz) and twin minarets measuring 66.66 meters (symbolizing 6,666 verses). The mosque holds two MURI records: the largest dome in Indonesia (90 meters in diameter) and the largest tower wall clock in Indonesia (19.3 meters in diameter).",
    descriptionDetail:
      "Baitul Khairaat Grand Mosque has social, worship, and building activity functions that support one another.\n\nWorship Function: A main facility for congregational obligatory prayers, Friday prayers, Eid prayers, i'tikaf, and regular study gatherings, with a capacity of 10,000 to 15,000 worshippers.\n\nSocial Function: A center for community empowerment, collection and distribution of zakat/infaq/sadaqah (ZIS), and a gathering space that strengthens relationships among residents (Hablum minannas).\n\nBuilding Activities: A center for Islamic outreach, Qur'an education, mosque youth activities, major religious events, and an educational religious tourism destination for local and out-of-region visitors.",
    yearDetail:
      "Data Collection & Inauguration Year: 2025. It was officially inaugurated on December 4, 2025 after a post-earthquake reconstruction process to meet SNI earthquake-resistant structural standards, supported by 483 pile foundation points.",
    areaDetail:
      "Address: Jl. Jaelangkara / Jl. WR Supratman, Baru Village, West Palu District, Palu City, Central Sulawesi Province, Postal Code 94221.\n\nMap Coordinates: Strategically located in central Palu, not far from Palu Bay, making it easy to access from across the city.",
    chatAssistant: "CHAT ASSISTANT",
    chatPlaceholder: "Type your question...",
    chatInputLabel: "Type your question",
    sendMessage: "Send message",
    closeDetail: "Close information detail",
    aiAssistant: "AI Assistant",
    aiAssistantWelcome:
      "Hello! Is there anything you'd like to know about Baitul Khairaat Grand Mosque?",
    aiAssistantFallback:
      "Sorry, an error occurred while processing your request.",
    aiAssistantError:
      "Sorry, an error occurred while contacting the AI assistant.",
    quickQuestionFunction: "What is this building used for?",
    quickQuestionYear: "When was this project created?",
    quickQuestionLocation: "Where is Baitul Khairaat Grand Mosque located?",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Record<TranslationKey, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("id");

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
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
