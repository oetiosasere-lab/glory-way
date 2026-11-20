import { Module } from "@nestjs/common";
import { SupabaseModule } from "./supabase/supabase.module";
import { OrdersModule } from "./orders/orders.module";
import { ProductsModule } from "./products/products.module";
import { EnquiriesModule } from "./enquiries/enquiries.module";
import { SettingsModule } from "./settings/settings.module";
import { AuthModule } from "./auth/auth.module";

class AppModule {}

Module({
  imports: [
    SupabaseModule,
    OrdersModule,
    ProductsModule,
    EnquiriesModule,
    SettingsModule,
    AuthModule,
  ],
})(AppModule);

export { AppModule };
