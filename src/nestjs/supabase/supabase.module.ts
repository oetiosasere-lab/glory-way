import { Module, Global } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";

class SupabaseModule {}

Global()(SupabaseModule);
Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})(SupabaseModule);

export { SupabaseModule };
