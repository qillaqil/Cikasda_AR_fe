"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useProjects, useMindARBundle } from "@/lib/hooks/useProjects";

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

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Record<TranslationKey, string>;
  models: ARModelData[];
  mindarTargetUrl: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("id");
  const { activeProjects } = useProjects();
  const { bundleUrl } = useMindARBundle();

  const models = useMemo<ARModelData[]>(() => {
    return (activeProjects || []).map((item) => ({
      id: item.target_index,
      title: language === "id" ? item.title_id : (item.title_en || item.title_id),
      category: language === "id" ? item.category_id : (item.category_en || item.category_id),
      description: language === "id" ? item.description_id : (item.description_en || item.description_id),
      modelUrl: item.model_url,
      scale: item.model_scale || "0.1 0.1 0.1",
      cards: (item.cards || [])
        .sort((a, b) => a.slot_index - b.slot_index)
        .map((c) => ({
          label: language === "id" ? c.label_id : (c.label_en || c.label_id),
          value: language === "id" ? c.value_id : (c.value_en || c.value_id),
          detail: language === "id" ? c.detail_id : (c.detail_en || c.detail_id),
        })),
    }));
  }, [activeProjects, language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        models,
        mindarTargetUrl: bundleUrl,
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

