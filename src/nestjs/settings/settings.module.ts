import { Module } from "@nestjs/common";
import { SettingsService } from "./settings.service";

class SettingsModule {}

Module({
  providers: [SettingsService],
  exports: [SettingsService],
})(SettingsModule);

export { SettingsModule };
