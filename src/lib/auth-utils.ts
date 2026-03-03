// lib/auth-utils.ts

import { AppUser } from "@/util/types";

export function isPlatformAdmin(user: AppUser) {
  return user.role === "platform_admin";
}
