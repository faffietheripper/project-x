// lib/auth-utils.ts
import { AppUser } from "@/util/types";

export function isPlatformAdmin(user?: AppUser | null) {
  return user?.role === "platform_admin";
}

export function isOrgUser(user?: AppUser | null) {
  return user?.role === "employee" || user?.role === "seniorManagement";
}

export function isOrgAdmin(user?: AppUser | null) {
  return user?.role === "seniorManagement";
}

export function requireUser(user?: AppUser | null) {
  if (!user) {
    throw new Error("User not authenticated");
  }

  return user;
}
