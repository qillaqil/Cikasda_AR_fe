import useSWR, { mutate as globalMutate } from "swr";
import { createClient } from "@/lib/supabase/client";
import { DatabaseProject } from "@/lib/supabase/types";
import { arModels } from "@/context/LanguageContext";

const supabase = createClient();
export const PROJECTS_CACHE_KEY = "cikasda_ar_projects";

// Fetcher for all projects with cards
async function fetchProjects(): Promise<DatabaseProject[]> {
  try {
    const { data, error } = await supabase
      .from("ar_projects")
      .select("*, cards:ar_project_cards(*)")
      .order("target_index", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as DatabaseProject[];
    }
  } catch (err) {
    console.warn("Supabase fetch error, using fallback data:", err);
  }

  // Fallback to local default data
  return arModels.id.map((item) => ({
    id: String(item.id),
    target_index: item.id,
    slug: item.title.toLowerCase().replace(/\s+/g, "-"),
    category_id: item.category,
    category_en: item.category,
    title_id: item.title,
    title_en: item.title,
    description_id: item.description,
    description_en: item.description,
    model_url: item.modelUrl,
    model_scale: item.scale,
    marker_image_url: "/contohAR.png",
    is_active: true,
    cards: item.cards.map((c, idx) => ({
      slot_index: idx,
      icon_name: idx === 0 ? "Building2" : idx === 1 ? "Users" : idx === 2 ? "CalendarDays" : "MapPin",
      label_id: c.label,
      label_en: c.label,
      value_id: c.value,
      value_en: c.value,
      detail_id: c.detail,
      detail_en: c.detail,
    })),
  }));
}

// Hook for fetching all projects with SWR caching
export function useProjects() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<DatabaseProject[]>(
    PROJECTS_CACHE_KEY,
    fetchProjects,
    {
      revalidateOnFocus: false, // Don't constantly refetch on window focus
      revalidateIfStale: false,
      dedupingInterval: 30000, // Cache for 30s before refetching
    }
  );

  return {
    projects: data ?? [],
    activeProjects: (data ?? []).filter((p) => p.is_active),
    isLoading,
    isValidating,
    isError: error,
    mutateProjects: mutate,
  };
}

// Hook for single project fetch from SWR cache
export function useProject(id: string | null) {
  const { projects, isLoading, isError, mutateProjects } = useProjects();
  const project = projects.find((p) => String(p.id) === String(id)) ?? null;

  return {
    project,
    isLoading,
    isError,
    mutateProjects,
  };
}

export function invalidateProjectsCache() {
  return globalMutate(PROJECTS_CACHE_KEY);
}
