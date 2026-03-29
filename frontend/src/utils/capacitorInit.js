/**
 * Capacitor native bootstrap: push registration, preferences, app URL open.
 * Fully safe on emulators / devices without Google Play (push is best-effort).
 */

import { Capacitor } from "@capacitor/core";

export async function initCapacitor() {
  if (!Capacitor.isNativePlatform()) return;

  /* ── App URL open (deep links) ── */
  try {
    const { App: CapApp } = await import("@capacitor/app");
    await CapApp.addListener("appUrlOpen", ({ url }) => {
      if (url && typeof url === "string" && url.includes("://")) {
        try {
          const u = new URL(url);
          const path = `${u.pathname || ""}${u.search || ""}` || "/login";
          window.history.replaceState({}, "", path);
          window.dispatchEvent(new PopStateEvent("popstate"));
        } catch {
          /* ignore malformed deep links */
        }
      }
    });
  } catch {
    /* @capacitor/app not available – non-fatal */
  }

  /* ── Push Notifications (optional – skip if unavailable / no Google Play) ── */
  /*
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const { Preferences } = await import("@capacitor/preferences");

    const FCM_TOKEN_KEY = "fcm_device_token";

    let perm;
    try {
      perm = await PushNotifications.checkPermissions();
    } catch {
      return; // plugin not available on this device/emulator
    }

    if (perm.receive !== "granted") {
      try {
        perm = await PushNotifications.requestPermissions();
      } catch {
        return;
      }
    }

    if (perm.receive !== "granted") return;

    // FATAL CRASH: register() crashes native Android Runtime if Firebase/google-services.json is missing!
    // try {
    //  await PushNotifications.register();
    // } catch {
    //  return; 
    // }

    await PushNotifications.addListener("registration", async (token) => {
      const value = token?.value;
      if (value) {
        try { await Preferences.set({ key: FCM_TOKEN_KEY, value }); } catch { }
        try { localStorage.setItem(FCM_TOKEN_KEY, value); } catch { }
      }
    }).catch(() => { });

    await PushNotifications.addListener("registrationError", () => {
    }).catch(() => { });

    await PushNotifications.addListener("pushNotificationReceived", () => {
    }).catch(() => { });

  } catch {
    // PushNotifications plugin unavailable
  }
  */
}

export function getStoredFcmTokenSync() {
  try {
    return localStorage.getItem("fcm_device_token");
  } catch {
    return null;
  }
}
