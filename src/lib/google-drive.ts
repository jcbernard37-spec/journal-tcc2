// ═══════════════════════════════════════════════════════
// GOOGLE DRIVE — Google Identity Services (GIS) - API moderne 2024
// ═══════════════════════════════════════════════════════

declare global {
  interface Window {
    google: any;
  }
}

// @ts-ignore
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let accessToken = '';
let tokenClient: any = null;
let driveFolderId: string | null = null;
let userEmail = '';

// ── Charger le script Google Identity Services ──
function chargerScriptGoogle(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Déjà chargé ?
    if (window.google && window.google.accounts) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Impossible de charger Google'));
    document.head.appendChild(script);
  });
}

// ── Initialiser (appelé au démarrage) ──
export async function initializeGoogleAuth(): Promise<boolean> {
  if (!CLIENT_ID) {
    console.warn('Pas de Client ID Google configuré');
    return false;
  }
  try {
    await chargerScriptGoogle();

    // Restaurer un token existant s'il est encore valide
    // ⚠️ localStorage, pas sessionStorage — sessionStorage est effacé à
    // chaque fermeture d'onglet, ce qui forçait une reconnexion en
    // permanence même sur le MÊME appareil.
    const savedToken = localStorage.getItem('googleAccessToken');
    const savedEmail = localStorage.getItem('googleUserEmail');
    const savedFolder = localStorage.getItem('driveFolderId');
    if (savedToken) {
      accessToken = savedToken;
      if (savedEmail) userEmail = savedEmail;
      if (savedFolder) driveFolderId = savedFolder;
    }

    // Créer le client de token
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: () => {}, // remplacé dynamiquement à la connexion
    });

    return true;
  } catch (error) {
    console.error('Erreur init Google:', error);
    return false;
  }
}

// ── Connexion : ouvre le popup Google ──
export async function connectGoogle(): Promise<boolean> {
  if (!tokenClient) {
    const ok = await initializeGoogleAuth();
    if (!ok || !tokenClient) return false;
  }

  return new Promise((resolve) => {
    tokenClient.callback = async (response: any) => {
      if (response.error) {
        console.error('Erreur token Google:', response.error);
        resolve(false);
        return;
      }
      accessToken = response.access_token;
      localStorage.setItem('googleAccessToken', accessToken);

      // Récupérer l'email de l'utilisateur
      try {
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const info = await infoRes.json();
        userEmail = info.email || '';
        localStorage.setItem('googleUserEmail', userEmail);
      } catch { /* pas grave */ }

      await setupDriveFolder();
      resolve(true);
    };

    // Déclenche le popup de consentement
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

// ── Déconnexion ──
export async function disconnectGoogle(): Promise<void> {
  if (accessToken && window.google) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = '';
  userEmail = '';
  driveFolderId = null;
  localStorage.removeItem('googleAccessToken');
  localStorage.removeItem('googleUserEmail');
  localStorage.removeItem('driveFolderId');
}

// ── Créer/récupérer le dossier "Journal TCC" ──
async function setupDriveFolder(): Promise<void> {
  if (driveFolderId) return;

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("name='Journal TCC' and mimeType='application/vnd.google-apps.folder' and trashed=false")}&spaces=drive&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const result = await response.json();

    if (result.files && result.files.length > 0) {
      driveFolderId = result.files[0].id;
    } else {
      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Journal TCC',
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });
      const newFolder = await createResponse.json();
      driveFolderId = newFolder.id || null;
    }

    if (driveFolderId) {
      localStorage.setItem('driveFolderId', driveFolderId);
    }
  } catch (error) {
    console.error('Erreur setup dossier Google Drive:', error);
  }
}

// ── Sauvegarder un fichier ──
export async function saveToDrive(fileName: string, content: string): Promise<boolean> {
  if (!accessToken || !driveFolderId) return false;

  try {
    // Chercher si le fichier existe déjà
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name='${fileName}' and '${driveFolderId}' in parents and trashed=false`)}&spaces=drive&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchResult = await searchResponse.json();

    if (searchResult.files && searchResult.files.length > 0) {
      // Mettre à jour
      const fileId = searchResult.files[0].id;
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: content,
      });
    } else {
      // Créer (métadonnées + contenu en une requête multipart)
      const boundary = 'foo_bar_baz';
      const metadata = { name: fileName, parents: [driveFolderId], mimeType: 'application/json' };
      const body =
        `--${boundary}\r\n` +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) + '\r\n' +
        `--${boundary}\r\n` +
        'Content-Type: application/json\r\n\r\n' +
        content + '\r\n' +
        `--${boundary}--`;

      await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      });
    }
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde Google Drive:', error);
    return false;
  }
}

// ── Charger un fichier ──
export async function loadFromDrive(fileName: string): Promise<string | null> {
  if (!accessToken || !driveFolderId) return null;

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name='${fileName}' and '${driveFolderId}' in parents and trashed=false`)}&spaces=drive&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const result = await response.json();
    if (!result.files || result.files.length === 0) return null;

    const fileId = result.files[0].id;
    const contentResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return await contentResponse.text();
  } catch (error) {
    console.error('Erreur chargement Google Drive:', error);
    return null;
  }
}

// ── État ──
export function isConnected(): boolean {
  return !!accessToken;
}

export function getUser(): any {
  return userEmail ? { getBasicProfile: () => ({ getEmail: () => userEmail }) } : null;
}

export function getUserEmail(): string {
  return userEmail;
}
