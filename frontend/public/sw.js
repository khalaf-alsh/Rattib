self.addEventListener("push", (event) => {
  let data = {
    title: "Ratteb",
    body: "You have a reminder.",
    url: "/schedule",
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
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: {
        url: data.url,
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/schedule";

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
