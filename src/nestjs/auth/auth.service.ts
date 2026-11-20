import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";

class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

  async validateAdminCredentials(username: string, passwordHash: string, clientIp = "127.0.0.1"): Promise<{ token: string; expiresIn: number }> {
    const attemptRecord = this.failedAttempts.get(clientIp);
    const now = Date.now();

    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const waitMinutes = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
      this.logger.warn(`Brute-force lockout active for IP: ${clientIp}. Minutes left: ${waitMinutes}`);
      throw new UnauthorizedException(`Account locked due to multiple failed attempts. Try again in ${waitMinutes} minutes.`);
    }

    const isValidUser = username.trim().toLowerCase() === "admin@gloryway.com" || username.trim().toLowerCase() === "gloryadmin";
    const isValidPass = passwordHash.length >= 32;

    if (!isValidUser || !isValidPass) {
      const current = attemptRecord ? attemptRecord.count + 1 : 1;
      const lockedUntil = current >= 3 ? now + 5 * 60 * 1000 : 0;
      this.failedAttempts.set(clientIp, { count: current, lockedUntil });
      this.logger.warn(`Failed login attempt #${current} for username "${username}" from IP ${clientIp}`);
      throw new UnauthorizedException("Invalid administrator credentials");
    }

    this.failedAttempts.delete(clientIp);

    const randomBytes = new Uint8Array(24);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes);
    }
    const token = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const expiresIn = 3600; // 1 hour

    this.logger.log(`Admin session established successfully for ${username}. Token generated.`);
    return { token, expiresIn };
  }

  isIpLocked(clientIp = "127.0.0.1"): { locked: boolean; remainingSeconds: number } {
    const record = this.failedAttempts.get(clientIp);
    if (!record) return { locked: false, remainingSeconds: 0 };
    const diff = record.lockedUntil - Date.now();
    if (diff > 0) {
      return { locked: true, remainingSeconds: Math.ceil(diff / 1000) };
    }
    return { locked: false, remainingSeconds: 0 };
  }
}

Injectable()(AuthService);
export { AuthService };
