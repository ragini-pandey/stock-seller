/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications
 *
 * IMPORTANT: This file must be placed in the /public directory
 * and must be accessible at the root URL: /firebase-messaging-sw.js
 *
 * VERSION: 2.0.0 - Fixed icon paths and notification persistence
 */

// Import Firebase scripts for service worker
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Initialize Firebase in service worker
// IMPORTANT: These values are injected from environment variables at build time
// and must match your client-side config in src/lib/firebase-config.ts
firebase.initializeApp({
  apiKey: "undefined",
  authDomain: "undefined",
  projectId: "undefined",
  storageBucket: "undefined",
  messagingSenderId: "undefined",
  appId: "undefined",
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

console.log("[firebase-messaging-sw.js] ✅ Firebase Messaging initialized");

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] 📨 Received background message:", payload);
  console.log("[firebase-messaging-sw.js] 📋 Notification data:", {
    title: payload.notification?.title,
    body: payload.notification?.body,
    data: payload.data,
  });

  // Customize notification
  const notificationTitle = payload.notification?.title || "Stock Alert";
  const notificationOptions = {
    body: payload.notification?.body || "New notification from Stock AI",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: payload.data?.symbol || "stock-alert",
    data: payload.data,
    requireInteraction: true, // Keep notification visible until user interacts
    vibrate: [200, 100, 200], // Vibration pattern for mobile devices
    silent: false, // Play notification sound
    actions: [
      {
        action: "view",
        title: "View Details",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  // Show notification
  console.log("[firebase-messaging-sw.js] Showing notification:", notificationTitle);
  return self.registration
    .showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log("[firebase-messaging-sw.js] ✅ Notification shown successfully");
    })
    .catch((error) => {
      console.error("[firebase-messaging-sw.js] ❌ Failed to show notification:", error);
    });
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked:", event.notification.tag);

  event.notification.close();

  if (event.action === "view") {
    // Open the app and navigate to relevant page
    const urlToOpen = event.notification.data?.symbol
      ? `/dashboard?symbol=${event.notification.data.symbol}`
      : "/dashboard";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url.includes("/dashboard") && "focus" in client) {
              return client.focus();
            }
          }
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("[firebase-messaging-sw.js] Notification closed:", event.notification.tag);
});

// Service worker lifecycle events
self.addEventListener("install", (event) => {
  console.log("[firebase-messaging-sw.js] 🔧 Installing service worker...");
  self.skipWaiting(); // Activate immediately
});

self.addEventListener("activate", (event) => {
  console.log("[firebase-messaging-sw.js] ✅ Service worker activated!");
  event.waitUntil(clients.claim()); // Take control of all pages immediately
});

// Listen for push events (this is what FCM triggers)
self.addEventListener("push", (event) => {
  console.log("[firebase-messaging-sw.js] 🔔 PUSH EVENT RECEIVED!");
  console.log("[firebase-messaging-sw.js] Push data:", event.data ? event.data.text() : "no data");

  // Let Firebase Messaging handle it
  // But log that we received it
});

console.log("[firebase-messaging-sw.js] Service Worker loaded");
