import { createBrowserClient } from "@supabase/ssr";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nfuxsxpgoakwpbdgdmdo.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdXhzeHBnb2Frd3BiZGdkbWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NTk2ODcsImV4cCI6MjEwNDMzNTY4N30.tNTNLl2k75NHEcDeWx_fAXaGU9SEDenwPsfRbwkB1Zo";

export const SUPABASE_STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public`;

export function getPublicStorageUrl(bucket: string, path: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${SUPABASE_STORAGE_BASE_URL}/${bucket}/${cleanPath}`;
}

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
