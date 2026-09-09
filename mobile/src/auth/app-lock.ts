import * as LocalAuthentication from "expo-local-authentication";

/*
  A short background grace period avoids repeatedly challenging a Driver
  when they briefly switch apps during field work.

  This state is intentionally NOT persisted:
  a genuine app/process restart requires local device authentication again.
*/
export const MOBILE_APP_BACKGROUND_GRACE_MS = 60 * 1000;

let appUnlocked = false;

export function isMobileAppUnlocked() {
  return appUnlocked;
}

export function markMobileAppUnlocked() {
  appUnlocked = true;
}

export function lockMobileApp() {
  appUnlocked = false;
}

export async function unlockMobileApp() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock Waste X",
    promptSubtitle: "Authorised field access",
    fallbackLabel: "Use Passcode",
    disableDeviceFallback: false,
    biometricsSecurityLevel: "strong",
  });

  if (!result.success) {
    throw new Error("Device authentication was not completed.");
  }

  markMobileAppUnlocked();
}
