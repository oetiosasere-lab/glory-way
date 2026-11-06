import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://voljkpxdcjotkbdbwyvk.supabase.co";

// Read anon key from environment or fallback
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGprcHhkY2pvdGtiZGJ3eXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MTkwMjksImV4cCI6MjEwNzk5NTAyOX0.7YJfftE49MJDsuci52Z9bKUATlU6OGPIqjs3I3ncoZA";

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
  packaging?: string | null;
  quantity: string;
  delivery_address?: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string | null;
  completed_at?: string | null;
};

export type Product = {
  id: string;
  created_at?: string;
  updated_at?: string;
  slug: string;
  name: string;
  category: string;
  package_types: string[];
  brewer: string;
  size: string;
  price?: string | null;
  note?: string | null;
  image_url?: string | null;
  in_stock: boolean;
};

export type Enquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
};

export type SiteSettings = {
  phone: string;
  email: string;
  address: string;
  operating_hours: string;
  announcement: string;
};

export const defaultSiteSettings: SiteSettings = {
  phone: "0705 165 6621",
  email: "gloryomosigho@gmail.com",
  address: "Imasabor Number 19 along olobo , Saple Road, Junction, ossiomo Industrial park junction by kpoba Okha, Edo State, Nigeria",
  operating_hours: "Open 11 hours a day, 6 days a week, 365 days a year",
  announcement: "Chilled drinks ready for bulk delivery across Benin City. Order today!",
};

// Image upload helper
export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  if (!isSupabaseConfigured()) {
    // Return data URL as fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, { cacheControl: "3600", upsert: true });

  if (uploadError) {
    console.warn("Storage upload failed, fallback to base64:", uploadError);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
  return data.publicUrl;
}
