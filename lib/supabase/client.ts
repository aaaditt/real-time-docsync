import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

export const createBrowserClient = () =>
  createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Legacy export for any existing code still using it
export const supabase = createSupabaseBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);