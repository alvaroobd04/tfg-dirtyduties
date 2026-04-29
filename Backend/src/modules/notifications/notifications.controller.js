import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import {
  getNotificationsService,
  getUnreadCountService,
  markAsReadService,
  markAllAsReadService,
  subscribePushService,
  unsubscribePushService,
  sendDailyReminders,
  registerSSEClient,
  unregisterSSEClient
} from './notifications.service.js';

export async function getNotificationsController(req, res, next) {
  try {
    const houseId = Number(req.query.houseId);
    const notifications = await getNotificationsService(req.user.userId, houseId);
    return res.json({ notifications });
  } catch (err) { next(err); }
}

export async function getUnreadCountController(req, res, next) {
  try {
    const houseId = Number(req.query.houseId);
    const count = await getUnreadCountService(req.user.userId, houseId);
    return res.json({ count });
  } catch (err) { next(err); }
}

export async function markAsReadController(req, res, next) {
  try {
    await markAsReadService(Number(req.params.id), req.user.userId);
    return res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function markAllAsReadController(req, res, next) {
  try {
    await markAllAsReadService(req.user.userId);
    return res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function getVapidKeyController(_req, res) {
  return res.json({ publicKey: env.vapidPublic });
}

export async function subscribeController(req, res, next) {
  try {
    const { endpoint, keys } = req.body;
    await subscribePushService(req.user.userId, endpoint, keys.p256dh, keys.auth);
    return res.status(201).json({ ok: true });
  } catch (err) { next(err); }
}

export async function unsubscribeController(req, res, next) {
  try {
    const { endpoint } = req.body;
    await unsubscribePushService(endpoint);
    return res.json({ ok: true });
  } catch (err) { next(err); }
}

export function sseController(req, res) {
  const token = req.query.token;
  let userId;
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    userId = payload.userId;
  } catch {
    return res.status(401).end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write('data: connected\n\n');
  registerSSEClient(userId, res);

  req.on('close', () => unregisterSSEClient(userId));
}

// Endpoint de debug — dispara los recordatorios manualmente sin esperar al cron
export async function debugRemindersController(_req, res, next) {
  try {
    await sendDailyReminders();
    return res.json({ ok: true, message: 'Recordatorios enviados' });
  } catch (err) { next(err); }
}
