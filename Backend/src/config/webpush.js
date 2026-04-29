import webpush from 'web-push';
import { env } from './env.js';

if (!env.vapidPublic || !env.vapidPrivate) {
  console.warn('[webpush] VAPID keys no configuradas — las push notifications no funcionarán');
} else {
  webpush.setVapidDetails(
    env.vapidEmail || 'mailto:admin@dirtyduties.com',
    env.vapidPublic,
    env.vapidPrivate
  );
}

export default webpush;
