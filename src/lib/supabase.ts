import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://voljkpxdcjotkbdbwyvk.supabase.co";

// Read anon key from environment or fallback
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () =>
  Boolean(supabaseAnonKey && supabaseAnonKey !== "" && !supabaseAnonKey.includes("YOUR_"));

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || "anon-key-placeholder",
);

export type Order = {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  phone: string;
  email: string;
  drink_slug: string;
  drink_name: string;
  quantity: string;
  message: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string | null;
  completed_at?: string | null;
};
