import {
  supabase,
  isSupabaseConfigured,
  uploadProductImage,
  type Order,
  type Product,
  type Enquiry,
  type SiteSettings,
  defaultSiteSettings,
} from "./supabase";

export {
  supabase,
  isSupabaseConfigured,
  uploadProductImage,
  type Order,
  type Product,
  type Enquiry,
  type SiteSettings,
  defaultSiteSettings,
};

// ---------- Orders ----------
export const getOrders = async (): Promise<Order[]> => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_orders");
    return local ? JSON.parse(local) : [];
  }
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Order[]) || [];
};

export const updateOrderStatus = async (
  id: string,
  status: Order["status"],
  notes?: string
): Promise<void> => {
  const updates: Record<string, any> = {
    status,
    completed_at: status === "completed" ? new Date().toISOString() : null,
  };
  if (notes !== undefined) updates.notes = notes;

  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_orders");
    const list: Order[] = local ? JSON.parse(local) : [];
    const next = list.map((o) => (o.id === id ? { ...o, ...updates } : o));
    localStorage.setItem("glory_way_orders", JSON.stringify(next));
    return;
  }

  const { error } = await supabase.from("orders").update(updates).eq("id", id);
  if (error) throw error;
};

export const deleteOrder = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_orders");
    const list: Order[] = local ? JSON.parse(local) : [];
    localStorage.setItem("glory_way_orders", JSON.stringify(list.filter((o) => o.id !== id)));
    return;
  }
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
};

// ---------- Products ----------
export const getProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_custom_products");
    return local ? JSON.parse(local) : [];
  }
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Product[]) || [];
};

export const saveProduct = async (
  product: Omit<Product, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<Product> => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_custom_products");
    const list: Product[] = local ? JSON.parse(local) : [];
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
      };
      list.unshift(created);
      localStorage.setItem("glory_way_custom_products", JSON.stringify(list));
      return created;
    }
  }

  if (product.id) {
    const { data, error } = await supabase
      .from("products")
      .update(product)
      .eq("id", product.id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_custom_products");
    const list: Product[] = local ? JSON.parse(local) : [];
    localStorage.setItem("glory_way_custom_products", JSON.stringify(list.filter((p) => p.id !== id)));
    return;
  }
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};

// ---------- Enquiries ----------
export const getEnquiries = async (): Promise<Enquiry[]> => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_enquiries");
    return local ? JSON.parse(local) : [];
  }
  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Enquiry[]) || [];
};

export const createEnquiry = async (enquiry: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<void> => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_enquiries");
    const list: Enquiry[] = local ? JSON.parse(local) : [];
    list.unshift({
      ...enquiry,
      id: `enq-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: "unread",
    });
    localStorage.setItem("glory_way_enquiries", JSON.stringify(list));
    return;
  }
  const { error } = await supabase.from("enquiries").insert([enquiry]);
  if (error) throw error;
};

export const updateEnquiryStatus = async (
  id: string,
  status: Enquiry["status"]
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_enquiries");
    const list: Enquiry[] = local ? JSON.parse(local) : [];
    localStorage.setItem(
      "glory_way_enquiries",
      JSON.stringify(list.map((e) => (e.id === id ? { ...e, status } : e)))
    );
    return;
  }
  const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
  if (error) throw error;
};

export const deleteEnquiry = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_enquiries");
    const list: Enquiry[] = local ? JSON.parse(local) : [];
    localStorage.setItem("glory_way_enquiries", JSON.stringify(list.filter((e) => e.id !== id)));
    return;
  }
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) throw error;
};

// ---------- Website Settings ----------
export const getSiteSettings = async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem("glory_way_site_settings");
    return local ? { ...defaultSiteSettings, ...JSON.parse(local) } : defaultSiteSettings;
  }
  try {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error || !data || data.length === 0) {
      return defaultSiteSettings;
    }
    const map = data.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    return {
      phone: map.phone || defaultSiteSettings.phone,
      email: map.email || defaultSiteSettings.email,
      address: map.address || defaultSiteSettings.address,
      operating_hours: map.operating_hours || defaultSiteSettings.operating_hours,
      announcement: map.announcement || defaultSiteSettings.announcement,
    };
  } catch {
    return defaultSiteSettings;
  }
};

export const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
  localStorage.setItem("glory_way_site_settings", JSON.stringify(settings));
  if (!isSupabaseConfigured()) return;

  const entries = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  for (const item of entries) {
    await supabase
      .from("site_settings")
      .upsert(item, { onConflict: "key" });
  }
};
