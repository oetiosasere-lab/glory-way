import "reflect-metadata";
import { SupabaseService } from "./supabase/supabase.service";
import { OrdersService } from "./orders/orders.service";
import { ProductsService } from "./products/products.service";
import { EnquiriesService } from "./enquiries/enquiries.service";
import { SettingsService } from "./settings/settings.service";
import { AuthService } from "./auth/auth.service";

// Export all NestJS Modules and Services
export * from "./supabase/supabase.module";
export * from "./supabase/supabase.service";
export * from "./orders/orders.module";
export * from "./orders/orders.service";
export * from "./products/products.module";
export * from "./products/products.service";
export * from "./enquiries/enquiries.module";
export * from "./enquiries/enquiries.service";
export * from "./settings/settings.module";
export * from "./settings/settings.service";
export * from "./auth/auth.module";
export * from "./auth/auth.service";
export * from "./app.module";

// Singleton container holding instantiated NestJS service layer
class NestJsContainer {
  private static instance: NestJsContainer;
  public readonly supabaseService: SupabaseService;
  public readonly ordersService: OrdersService;
  public readonly productsService: ProductsService;
  public readonly enquiriesService: EnquiriesService;
  public readonly settingsService: SettingsService;
  public readonly authService: AuthService;

  private constructor() {
    this.supabaseService = new SupabaseService();
    this.ordersService = new OrdersService(this.supabaseService);
    this.productsService = new ProductsService(this.supabaseService);
    this.enquiriesService = new EnquiriesService(this.supabaseService);
    this.settingsService = new SettingsService(this.supabaseService);
    this.authService = new AuthService();
  }

  public static getInstance(): NestJsContainer {
    if (!NestJsContainer.instance) {
      NestJsContainer.instance = new NestJsContainer();
    }
    return NestJsContainer.instance;
  }
}

export const nestContainer = NestJsContainer.getInstance();
export const nestSupabase = nestContainer.supabaseService;
export const nestOrders = nestContainer.ordersService;
export const nestProducts = nestContainer.productsService;
export const nestEnquiries = nestContainer.enquiriesService;
export const nestSettings = nestContainer.settingsService;
export const nestAuth = nestContainer.authService;
