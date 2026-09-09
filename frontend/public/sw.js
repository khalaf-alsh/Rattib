self.addEventListener("push", (event) => {
  // Use safe defaults in case a push arrives without a complete JSON payload.
  let data = {
    title: "Ratteb",
    body: "You have a reminder.",
    url: "/schedule?tab=daily",
  };

  if (event.data) {
    try {
      data = {
        ...data,
        ...event.data.json(),
      };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/ratteb-notification-icon.png",
      badge: "/ratteb-notification-icon.png",
      data: {
        url: data.url,
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/schedule?tab=daily";

  // Reuse an existing Ratteb window when possible. Otherwise open a new one.
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        return clients.openWindow(url);
      }),
  );
});
