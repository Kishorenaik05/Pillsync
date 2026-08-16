// PillSync Service Worker
// Handles browser notifications (Chrome requires showNotification via SW)

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// ── Receive SHOW_NOTIFICATION messages from the app page ──
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        event.waitUntil(
            self.registration.showNotification(title, options || {})
        );
    }
});

// ── Handle server-sent Push events (future use) ──
self.addEventListener('push', (event) => {
    let data = { title: '💊 PillSync', body: 'You have a medication reminder.' };
    try { data = event.data.json(); } catch (e) { /* ignore */ }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: data.tag || 'pillsync-reminder',
            requireInteraction: true,
        })
    );
});

// ── Focus app window when user clicks a notification ──
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if (client.url.includes('/app') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow('/app/reminders');
            }
        })
    );
});
