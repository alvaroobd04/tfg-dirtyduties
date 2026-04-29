import webpush from '../../config/webpush.js';
import {
  createNotification,
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  savePushSubscription,
  getPushSubscriptionsByUser,
  deletePushSubscription,
  getTomorrowExecutions
} from './notifications.repository.js';

const sseClients = new Map();

export function registerSSEClient(userId, res) {
  sseClients.set(userId, res);
}

export function unregisterSSEClient(userId) {
  sseClients.delete(userId);
}

async function sendPush(userId, title, body) {
  const subscriptions = await getPushSubscriptionsByUser(userId);

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, icon: '/favicon.ico' })
      );
    } catch (err) {
      // suscripción expirada o revocada → eliminar
      if (err.statusCode === 410 || err.statusCode === 404) {
        await deletePushSubscription(sub.endpoint);
      }
    }
  }
}

export async function notifyUser(userId, tipo, mensaje, ejecucionId = null, intercambioId = null) {
  await createNotification(userId, ejecucionId, tipo, mensaje, intercambioId);
  await sendPush(userId, 'DirtyDuties', mensaje);

  const client = sseClients.get(userId);
  if (client) client.write('data: new\n\n');
}

export async function getNotificationsService(userId, houseId) {
  return await getNotificationsByUser(userId, houseId);
}

export async function getUnreadCountService(userId, houseId) {
  return await getUnreadCount(userId, houseId);
}

export async function markAsReadService(notifId, userId) {
  await markAsRead(notifId, userId);
}

export async function markAllAsReadService(userId) {
  await markAllAsRead(userId);
}

export async function subscribePushService(userId, endpoint, p256dh, auth) {
  await savePushSubscription(userId, endpoint, p256dh, auth);
}

export async function unsubscribePushService(endpoint) {
  await deletePushSubscription(endpoint);
}

export async function sendDailyReminders() {
  const executions = await getTomorrowExecutions();

  for (const e of executions) {
    const mensaje = `${e.userName}, mañana tienes que hacer "${e.taskName}"`;
    await notifyUser(e.usuario_id, 'recordatorio', mensaje, e.id);
  }
}
