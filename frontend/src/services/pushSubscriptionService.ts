import { apiFetch } from "../lib/apiClient";

// Public VAPID key used by the browser when creating
// a Web Push subscription for this application.
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export type PushNotificationStatus =
  | "enabled"
  | "disabled"
  | "blocked"
  | "unsupported";

// Converts the URL-safe Base64 VAPID key into an ArrayBuffer,
// which is the format required by the browser Push API.
function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return buffer;
}

// Checks whether push notifications are supported, permitted,
// and currently subscribed on this browser.
export async function getPushNotificationStatus(): Promise<PushNotificationStatus> {
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return "unsupported";
  }

  if (Notification.permission === "denied") {
    return "blocked";
  }

  if (Notification.permission !== "granted") {
    return "disabled";
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration) {
    return "disabled";
  }

  const subscription = await registration.pushManager.getSubscription();

  return subscription ? "enabled" : "disabled";
}

// Registers the service worker, creates a browser push subscription,
// and stores the subscription through the FastAPI backend.
export async function enablePushNotifications() {
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    throw new Error("Push notifications are not supported");
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VITE_VAPID_PUBLIC_KEY is missing");
  }

  if (Notification.permission === "denied") {
    throw new Error("Notification permission is blocked");
  }

  // Request permission only when the user has not already granted it.
  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted");
  }

  // Register the service worker responsible for receiving
  // push messages when the application is not in the foreground.
  const registration = await navigator.serviceWorker.register("/sw.js");

  await navigator.serviceWorker.ready;

  // Reuse the existing browser subscription when possible
  // instead of creating duplicate subscriptions.
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToArrayBuffer(VAPID_PUBLIC_KEY),
    });
  }

  // Convert the browser subscription into serializable values
  // that can be stored by the backend.
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Invalid push subscription");
  }

  // Store the subscription on the backend so reminder notifications
  // can later be sent to this browser.
  const response = await apiFetch("/api/push-subscriptions", {
    method: "POST",
    body: JSON.stringify({
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save push subscription");
  }

  return subscription;
}

// Removes the saved subscription from the backend and unsubscribes this browser.
export async function disablePushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported");
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration) {
    return;
  }

  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  // Remove the stored endpoint first so the backend no longer
  // attempts to send notifications to this browser.
  const response = await apiFetch(
    `/api/push-subscriptions?endpoint=${encodeURIComponent(
      subscription.endpoint,
    )}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete push subscription");
  }

  // Finally remove the browser-side Web Push subscription.
  await subscription.unsubscribe();
}
