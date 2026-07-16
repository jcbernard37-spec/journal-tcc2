/**
 * Gestion des notifications push côté client
 * VAPID public key fournie par ton copain développeur
 */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

/** Enregistre le service worker */
export async function enregistrerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (e) {
    console.error('[Solco SW]', e);
    return null;
  }
}

/** Demande la permission et crée l'abonnement push */
export async function activerPush(): Promise<PushSubscription | null> {
  if (!('Notification' in window) || !('PushManager' in window)) {
    alert('Les notifications push ne sont pas supportées sur ce navigateur.');
    return null;
  }
  if (!VAPID_PUBLIC_KEY) {
    alert('Clé VAPID manquante — configure VITE_VAPID_PUBLIC_KEY sur Vercel.');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    alert('Permission refusée. Tu peux la réactiver dans les réglages de ton navigateur.');
    return null;
  }

  const reg = await navigator.serviceWorker.ready;
  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
    });
    return sub;
  } catch (e) {
    console.error('[Solco Push]', e);
    return null;
  }
}

/** Retourne l'abonnement actuel s'il existe */
export async function getAbonnementActuel(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}
