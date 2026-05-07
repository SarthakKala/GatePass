import webpush from "web-push";

const { VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;

if (VAPID_EMAIL && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export const isWebPushConfigured = Boolean(
  VAPID_EMAIL && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY
);

export const sendPushNotification = async (
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string }
) => {
  if (!isWebPushConfigured) {
    return { skipped: true };
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { sent: true };
  } catch (err: any) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      return { expired: true };
    }

    console.error("Push notification failed:", err.message);
    return { failed: true };
  }
};

export type { PushSubscription } from "web-push";
