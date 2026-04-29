self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'DirtyDuties';
  const options = {
    body: data.body || '',
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'NEW_NOTIFICATION' }));
      })
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const client = list.find((c) => c.url.includes(self.location.origin));
      if (client) return client.focus();
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});
