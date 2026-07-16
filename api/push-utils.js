/**
 * Utilitaires d'envoi push — Solco
 * Utilise l'API Web Push avec les clés VAPID
 */
import webpush from 'web-push';

export function configurerWebPush() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;

  if (!pub || !priv) {
    throw new Error('VAPID_PUBLIC_KEY ou VAPID_PRIVATE_KEY manquante dans les variables Vercel');
  }

  webpush.setVapidDetails('mailto:jcbernard37@gmail.com', pub, priv);
}

export async function envoyerPush(titre, corps) {
  const subJson = process.env.PUSH_SUBSCRIPTION;
  if (!subJson) {
    console.warn('[Solco] PUSH_SUBSCRIPTION non configurée — aucune notif envoyée.');
    return { ok: false, raison: 'PUSH_SUBSCRIPTION absente' };
  }

  let subscription;
  try {
    subscription = JSON.parse(subJson);
  } catch {
    return { ok: false, raison: 'PUSH_SUBSCRIPTION invalide (JSON malformé)' };
  }

  const payload = JSON.stringify({
    title: titre,
    body: corps,
    url: '/',
  });

  try {
    configurerWebPush();
    await webpush.sendNotification(subscription, payload);
    return { ok: true };
  } catch (err) {
    console.error('[Solco Push]', err);
    return { ok: false, raison: err.message };
  }
}
