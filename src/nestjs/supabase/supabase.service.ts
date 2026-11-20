import { Injectable, Logger } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Order, Product, Enquiry, SiteSettings } from "@/lib/supabase";
import { defaultSiteSettings } from "@/lib/supabase";

class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private isConfigured = false;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "https://voljkpxdcjotkbdbwyvk.supabase.co";

    const supabaseKey =
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGprcHhkY2pvdGtiZGJ3eXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MTkwMjksImV4cCI6MjEwNzk5NTAyOX0.7YJfftE49MJDsuci52Z9bKUATlU6OGPIqjs3I3ncoZA";

    if (supabaseUrl && supabaseKey && !supabaseKey.includes("YOUR_")) {
      this.client = createClient(supabaseUrl, supabaseKey);
      this.isConfigured = true;
      this.logger.log("NestJS Supabase client initialized successfully.");
    } else {
      this.logger.warn("Supabase credentials not configured in NestJS service. Using fallback mode.");
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public hasValidConfig(): boolean {
    return this.isConfigured && this.client !== null;
  }

  // --- Orders ---
  async getOrders(): Promise<Order[]> {
    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("glory_way_orders");
        return local ? JSON.parse(local) : [];
      }
      return [];
    }
    const { data, error } = await this.client
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error(`Error fetching orders: ${error.message}`);
      throw error;
    }
    return (data as Order[]) || [];
  }

  async createOrder(payload: Partial<Order>): Promise<Order> {
    if (!this.hasValidConfig() || !this.client) {
      const newOrder: Order = {
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer_name: payload.customer_name || "Customer",
        phone: payload.phone || "",
        email: payload.email || "",
        drink_slug: payload.drink_slug || "",
        drink_name: payload.drink_name || "",
        packaging: payload.packaging || "Bottle",
        quantity: payload.quantity || "1 crate",
        delivery_address: payload.delivery_address || "",
        message: payload.message || null,
        status: "pending",
      };
      if (typeof window !== "undefined") {
        const local = JSON.parse(localStorage.getItem("glory_way_orders") || "[]");
        local.unshift(newOrder);
        localStorage.setItem("glory_way_orders", JSON.stringify(local));
      }
      return newOrder;
    }

    const { data, error } = await this.client
      .from("orders")
      .insert([payload])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating order: ${error.message}`);
      throw error;
    }
    return data as Order;
  }

  async updateOrderStatus(id: string, status: Order["status"], notes?: string): Promise<void> {
    const updates: Record<string, any> = {
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    };
    if (notes !== undefined) updates.notes = notes;

    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        const local = JSON.parse(localStorage.getItem("glory_way_orders") || "[]");
        const next = local.map((o: Order) => (o.id === id ? { ...o, ...updates } : o));
        localStorage.setItem("glory_way_orders", JSON.stringify(next));
      }
      return;
    }

    const { error } = await this.client.from("orders").update(updates).eq("id", id);
    if (error) {
      this.logger.error(`Error updating order status: ${error.message}`);
      throw error;
    }
  }

  async deleteOrder(id: string): Promise<void> {
    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        const local = JSON.parse(localStorage.getItem("glory_way_orders") || "[]");
        localStorage.setItem(
          "glory_way_orders",
          JSON.stringify(local.filter((o: Order) => o.id !== id))
        );
      }
      return;
    }

    const { error } = await this.client.from("orders").delete().eq("id", id);
    if (error) {
      this.logger.error(`Error deleting order: ${error.message}`);
      throw error;
    }
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("glory_way_custom_products");
        return local ? JSON.parse(local) : [];
      }
      return [];
    }

    const { data, error } = await this.client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error(`Error fetching products: ${error.message}`);
      throw error;
    }
    return (data as Product[]) || [];
  }

  async saveProduct(product: Omit<Product, "id" | "created_at" | "updated_at"> & { id?: string }): Promise<Product> {
    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        const list: Product[] = JSON.parse(localStorage.getItem("glory_way_custom_products") || "[]");
        if (product.id) {
          const updated = list.map((p) =>
            p.id === product.id ? ({ ...p, ...product, updated_at: new Date().toISOString() } as Product) : p
          );
          localStorage.setItem("glory_way_custom_products", JSON.stringify(updated));
          return updated.find((p) => p.id === product.id)!;
        } else {
          const created: Product = {
            ...product,
            id: `prod-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Product;
          list.unshift(created);
          localStorage.setItem("glory_way_custom_products", JSON.stringify(list));
          return created;
        }
      }
      return product as Product;
    }

    if (product.id) {
      const { data, error } = await this.client
        .from("products")
        .update({
          name: product.name,
          slug: product.slug,
          category: product.category,
          package_types: product.package_types,
          brewer: product.brewer,
          size: product.size,
          price: product.price,
          note: product.note,
          image_url: product.image_url,
          in_stock: product.in_stock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    } else {
      const { data, error } = await this.client
        .from("products")
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        const list: Product[] = JSON.parse(localStorage.getItem("glory_way_custom_products") || "[]");
        localStorage.setItem(
          "glory_way_custom_products",
          JSON.stringify(list.filter((p) => p.id !== id))
        );
      }
      return;
    }

    const { error } = await this.client.from("products").delete().eq("id", id);
    if (error) throw error;
  }

  // --- Enquiries ---
  async getEnquiries(): Promise<Enquiry[]> {
    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("glory_way_enquiries");
        return local ? JSON.parse(local) : [];
      }
      return [];
    }

    const { data, error } = await this.client
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as Enquiry[]) || [];
  }

  async updateEnquiryStatus(id: string, status: Enquiry["status"]): Promise<void> {
    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        const local = JSON.parse(localStorage.getItem("glory_way_enquiries") || "[]");
        const next = local.map((e: Enquiry) => (e.id === id ? { ...e, status } : e));
        localStorage.setItem("glory_way_enquiries", JSON.stringify(next));
      }
      return;
    }

    const { error } = await this.client.from("enquiries").update({ status }).eq("id", id);
    if (error) throw error;
  }

  async deleteEnquiry(id: string): Promise<void> {
    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        const local = JSON.parse(localStorage.getItem("glory_way_enquiries") || "[]");
        localStorage.setItem(
          "glory_way_enquiries",
          JSON.stringify(local.filter((e: Enquiry) => e.id !== id))
        );
      }
      return;
    }

    const { error } = await this.client.from("enquiries").delete().eq("id", id);
    if (error) throw error;
  }

  // --- Settings ---
  async getSiteSettings(): Promise<SiteSettings> {
    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("glory_way_site_settings");
        return local ? JSON.parse(local) : defaultSiteSettings;
      }
      return defaultSiteSettings;
    }

    try {
      const { data, error } = await this.client
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return defaultSiteSettings;
      }
      return {
        phone: data.phone || defaultSiteSettings.phone,
        email: data.email || defaultSiteSettings.email,
        address: data.address || defaultSiteSettings.address,
        operating_hours: data.operating_hours || defaultSiteSettings.operating_hours,
        announcement: data.announcement || defaultSiteSettings.announcement,
      };
    } catch {
      return defaultSiteSettings;
    }
  }

  async saveSiteSettings(settings: SiteSettings): Promise<void> {
    if (!this.hasValidConfig() || !this.client) {
      if (typeof window !== "undefined") {
        localStorage.setItem("glory_way_site_settings", JSON.stringify(settings));
      }
      return;
    }

    const { error } = await this.client
      .from("site_settings")
      .upsert({
        id: "main_config",
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        operating_hours: settings.operating_hours,
        announcement: settings.announcement,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }
}

Injectable()(SupabaseService);
export { SupabaseService };
