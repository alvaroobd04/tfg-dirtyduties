import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/services/api.js';

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([]);
  const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  const unreadCount = computed(() =>
    notifications.value.filter((n) => !n.leida).length
  );

  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.leida)
  );

  const currentHouseId = ref(null);

  async function load(houseId) {
    if (houseId !== undefined) currentHouseId.value = houseId;
    if (!currentHouseId.value) return;
    try {
      const res = await api.get('/notifications', { params: { houseId: currentHouseId.value } });
      notifications.value = res.data.notifications;
    } catch { /* silencioso */ }
  }

  async function markRead(id) {
    await api.put(`/notifications/${id}/read`);
    const n = notifications.value.find((n) => n.id === id);
    if (n) n.leida = true;
  }

  async function markAllRead() {
    await api.put('/notifications/read-all');
    notifications.value.forEach((n) => (n.leida = true));
  }

  let _eventSource = null;
  let _reconnectTimer = null;

  function startSSE() {
    if (_eventSource) return;
    _connectSSE();
  }

  function _connectSSE() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    _eventSource = new EventSource(`http://localhost:3000/notifications/stream?token=${token}`);
    _eventSource.onmessage = () => load();
    _eventSource.onerror = () => {
      _eventSource?.close();
      _eventSource = null;
      // reconectar con nuevo token tras 3s
      _reconnectTimer = setTimeout(() => _connectSSE(), 3000);
    };
  }

  function stopSSE() {
    clearTimeout(_reconnectTimer);
    _eventSource?.close();
    _eventSource = null;
  }

  async function subscribeToPush() {
    if (!pushSupported) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const reg = await navigator.serviceWorker.ready;

    const { data } = await api.get('/notifications/vapid-key');
    const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    await api.post('/notifications/subscribe', sub.toJSON());
    return true;
  }

  async function isPushSubscribed() {
    if (!pushSupported) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      return !!sub;
    } catch { return false; }
  }

  return { notifications, unreadCount, unreadNotifications, pushSupported, load, markRead, markAllRead, startSSE, stopSSE, subscribeToPush, isPushSubscribed };
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
