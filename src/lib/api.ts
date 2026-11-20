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

import {
  nestOrders,
  nestProducts,
  nestEnquiries,
  nestSettings,
  nestSupabase,
} from "@/nestjs";

export {
  supabase,
  isSupabaseConfigured,
  uploadProductImage,
  type Order,
  type Product,
  type Enquiry,
  type SiteSettings,
  defaultSiteSettings,
  nestOrders,
  nestProducts,
  nestEnquiries,
  nestSettings,
  nestSupabase,
};

// ---------- Orders (powered by NestJS + Supabase) ----------
export const getOrders = async (): Promise<Order[]> => {
  return nestOrders.findAll();
};

export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  return nestOrders.create(orderData);
};

export const updateOrderStatus = async (
  id: string,
  status: Order["status"],
  notes?: string
): Promise<void> => {
  return nestOrders.updateStatus(id, status, notes);
};

export const deleteOrder = async (id: string): Promise<void> => {
  return nestOrders.remove(id);
};

// ---------- Products (powered by NestJS + Supabase) ----------
export const getProducts = async (): Promise<Product[]> => {
  return nestProducts.findAll();
};

export const saveProduct = async (
  product: Omit<Product, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<Product> => {
  return nestProducts.save(product);
};

export const deleteProduct = async (id: string): Promise<void> => {
  return nestProducts.remove(id);
};

// ---------- Enquiries (powered by NestJS + Supabase) ----------
export const getEnquiries = async (): Promise<Enquiry[]> => {
  return nestEnquiries.findAll();
};

export const createEnquiry = async (enquiry: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<void> => {
  return nestEnquiries.create(enquiry);
};

export const updateEnquiryStatus = async (
  id: string,
  status: Enquiry["status"]
): Promise<void> => {
  return nestEnquiries.updateStatus(id, status);
};

export const deleteEnquiry = async (id: string): Promise<void> => {
  return nestEnquiries.remove(id);
};

// ---------- Site Settings (powered by NestJS + Supabase) ----------
export const getSiteSettings = async (): Promise<SiteSettings> => {
  return nestSettings.getSettings();
};

export const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
  return nestSettings.updateSettings(settings);
};
