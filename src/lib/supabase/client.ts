import { createBrowserClient } from "@supabase/ssr";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nfuxsxpgoakwpbdgdmdo.supabase.co";

export const SUPABASE_STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public`;

export function getPublicStorageUrl(bucket: string, path: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${SUPABASE_STORAGE_BASE_URL}/${bucket}/${cleanPath}`;
}

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return dummy/fallback client to prevent build or client crashes if env is not yet set
    return createBrowserClient(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key"
    );
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
