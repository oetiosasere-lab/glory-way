import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";

class AuthModule {}

Module({
  providers: [AuthService],
  exports: [AuthService],
})(AuthModule);

export { AuthModule };
