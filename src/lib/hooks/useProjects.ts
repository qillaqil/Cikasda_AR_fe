import useSWR, { mutate as globalMutate } from "swr";
import { createClient, getPublicStorageUrl } from "@/lib/supabase/client";
import { DatabaseProject } from "@/lib/supabase/types";

const supabase = createClient();
export const PROJECTS_CACHE_KEY = "cikasda_ar_projects";
export const BUNDLE_CACHE_KEY = "cikasda_mindar_bundle";

// Fetcher for all projects with cards from Supabase (Pure database source, no hardcoded models)
async function fetchProjects(): Promise<DatabaseProject[]> {
  try {
    const { data, error } = await supabase
      .from("ar_projects")
      .select("*, cards:ar_project_cards(*)")
      .order("target_index", { ascending: true });

    if (!error && data) {
      return data as DatabaseProject[];
    }
  } catch (err) {
    console.warn("Supabase fetch error:", err);
  }

  return [];
}

// Hook for fetching all projects with SWR in-memory caching & deduplication
export function useProjects() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<DatabaseProject[]>(
    PROJECTS_CACHE_KEY,
    fetchProjects,
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateIfStale: false,
      dedupingInterval: 30000, // In-memory SWR cache for 30 seconds
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

// Fetcher for active MindAR compiled bundle (.mind)
async function fetchActiveBundle(): Promise<string> {
  const defaultBundle = getPublicStorageUrl("ar-markers", "targets.mind");
  try {
    const { data: bundleData, error } = await supabase
      .from("mindar_bundles")
      .select("bundle_url")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && bundleData?.bundle_url) {
      return bundleData.bundle_url;
    }
  } catch (err) {
    console.warn("Bundle fetch error, using fallback targets.mind:", err);
  }
  return defaultBundle;
}

// Hook for fetching active MindAR bundle with SWR caching
export function useMindARBundle() {
  const { data, isLoading, mutate } = useSWR<string>(
    BUNDLE_CACHE_KEY,
    fetchActiveBundle,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000, // Cache for 60s
    }
  );

  return {
    bundleUrl: data ?? getPublicStorageUrl("ar-markers", "targets.mind"),
    isLoading,
    mutateBundle: mutate,
  };
}

export function invalidateBundleCache() {
  return globalMutate(BUNDLE_CACHE_KEY);
}
