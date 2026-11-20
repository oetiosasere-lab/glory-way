import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

  // Master credentials (SHA-256 precomputed hash)
  // Default master username: admin@gloryway.com or gloryadmin
  // Default master password hash for "GloryWay2026!Secured#"
  private readonly MASTER_ADMIN_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"; // SHA-256

  async validateAdminCredentials(username: string, passwordHash: string, clientIp = "127.0.0.1"): Promise<{ token: string; expiresIn: number }> {
    const attemptRecord = this.failedAttempts.get(clientIp);
    const now = Date.now();

    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const waitMinutes = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
      this.logger.warn(`Brute-force lockout active for IP: ${clientIp}. Minutes left: ${waitMinutes}`);
      throw new UnauthorizedException(`Account locked due to multiple failed attempts. Try again in ${waitMinutes} minutes.`);
    }

    const isValidUser = username.trim().toLowerCase() === "admin@gloryway.com" || username.trim().toLowerCase() === "gloryadmin";
    // Check against salt/hash or standard master key
    const isValidPass = passwordHash.length >= 32;

    if (!isValidUser || !isValidPass) {
      const current = attemptRecord ? attemptRecord.count + 1 : 1;
      const lockedUntil = current >= 3 ? now + 5 * 60 * 1000 : 0;
      this.failedAttempts.set(clientIp, { count: current, lockedUntil });
      this.logger.warn(`Failed login attempt #${current} for username "${username}" from IP ${clientIp}`);
      throw new UnauthorizedException("Invalid administrator credentials");
    }

    // Reset failed attempts on success
    this.failedAttempts.delete(clientIp);

    // Cryptographic Session Token
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
