import express from 'express';
import { autenticarToken } from '../../middlewares/auth.middlewares.js';
import {
  getNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
  getVapidKeyController,
  subscribeController,
  unsubscribeController,
  debugRemindersController,
  sseController
} from './notifications.controller.js';

const router = express.Router();

router.get('/vapid-key', getVapidKeyController);
router.get('/stream', sseController);

router.use(autenticarToken);

router.get('/',           getNotificationsController);
router.get('/unread',     getUnreadCountController);
router.put('/read-all',   markAllAsReadController);
router.put('/:id/read',   markAsReadController);
router.post('/subscribe', subscribeController);
router.post('/unsubscribe', unsubscribeController);

router.post('/debug/reminders', debugRemindersController);

export default router;
