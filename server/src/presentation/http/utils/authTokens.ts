import crypto from "crypto";
import { prisma } from "../../../infrastructure/database/prisma/client";

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function randomToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function refreshExpiresAt(): Date {
  const d = new Date();
  const days = Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? "30");
  d.setDate(d.getDate() + (Number.isFinite(days) && days > 0 ? days : 30));
  return d;
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const raw = randomToken();
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      expiresAt: refreshExpiresAt(),
    },
  });
  return raw;
}

export async function revokeRefreshToken(raw: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(raw) },
  });
}

export async function validateRefreshToken(raw: string): Promise<{ userId: string } | null> {
  const row = await prisma.refreshToken.findFirst({
    where: { tokenHash: hashToken(raw), expiresAt: { gt: new Date() } },
  });
  return row ? { userId: row.userId } : null;
}
