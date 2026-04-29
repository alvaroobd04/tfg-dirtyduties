import { pool } from '../../database/connection.js';
import { ConecctionError } from '../../erorrs/authError.js';

export async function createNotification(userId, ejecucionId, tipo, mensaje, intercambioId = null) {
  const [result] = await pool.query(
    `INSERT INTO notificaciones (usuario_id, ejecucion_id, tipo, mensaje, intercambio_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, ejecucionId ?? null, tipo, mensaje, intercambioId ?? null]
  );
  return result.insertId;
}

export async function getNotificationsByUser(userId, houseId) {
  const [rows] = await pool.query(
    `SELECT n.id, n.ejecucion_id, n.intercambio_id, n.tipo, n.mensaje, n.leida, n.created_at
     FROM notificaciones n
     LEFT JOIN ejecucion e ON e.id = n.ejecucion_id
     LEFT JOIN tarea t ON t.id = e.tarea_id
     LEFT JOIN intercambios i ON i.id = n.intercambio_id
     WHERE n.usuario_id = ?
       AND (t.casa_id = ? OR i.casa_id = ? OR (n.ejecucion_id IS NULL AND n.intercambio_id IS NULL))
     ORDER BY n.created_at DESC
     LIMIT 50`,
    [userId, houseId, houseId]
  );
  return rows;
}

export async function getUnreadCount(userId, houseId) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM notificaciones n
     LEFT JOIN ejecucion e ON e.id = n.ejecucion_id
     LEFT JOIN tarea t ON t.id = e.tarea_id
     LEFT JOIN intercambios i ON i.id = n.intercambio_id
     WHERE n.usuario_id = ?
       AND n.leida = FALSE
       AND (t.casa_id = ? OR i.casa_id = ? OR (n.ejecucion_id IS NULL AND n.intercambio_id IS NULL))`,
    [userId, houseId, houseId]
  );
  return row.total;
}

export async function markAsRead(notifId, userId) {
  await pool.query(
    `UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_id = ?`,
    [notifId, userId]
  );
}

export async function markAllAsRead(userId) {
  await pool.query(
    `UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ?`,
    [userId]
  );
}

export async function savePushSubscription(userId, endpoint, p256dh, auth) {
  await pool.query(
    `INSERT INTO push_subscriptions (usuario_id, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE usuario_id = VALUES(usuario_id), p256dh = VALUES(p256dh), auth = VALUES(auth)`,
    [userId, endpoint, p256dh, auth]
  );
}

export async function getPushSubscriptionsByUser(userId) {
  const [rows] = await pool.query(
    `SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE usuario_id = ?`,
    [userId]
  );
  return rows;
}

export async function deletePushSubscription(endpoint) {
  await pool.query(
    `DELETE FROM push_subscriptions WHERE endpoint = ?`,
    [endpoint]
  );
}

export async function getTomorrowExecutions() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toLocaleDateString('en-CA');

  const [rows] = await pool.query(
    `SELECT e.id, e.usuario_id, t.nombre AS taskName, u.nombre AS userName
     FROM ejecucion e
     JOIN tarea t ON e.tarea_id = t.id
     JOIN usuarios u ON u.user_id = e.usuario_id
     WHERE e.fecha = ?
       AND e.estado = 'pendiente'
       AND (e.tipo IS NULL OR e.tipo != 'castigo')`,
    [date]
  );
  return rows;
}
