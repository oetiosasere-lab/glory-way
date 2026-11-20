import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import type { SiteSettings } from "@/lib/supabase";

class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getSettings(): Promise<SiteSettings> {
    this.logger.log("Retrieving site settings via NestJS");
    return this.supabaseService.getSiteSettings();
  }

  async updateSettings(settings: SiteSettings): Promise<void> {
    this.logger.log("Updating site settings via NestJS");
    return this.supabaseService.saveSiteSettings(settings);
  }
}

Injectable()(SettingsService);
export { SettingsService };
