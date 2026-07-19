/**
 * BIBLIOTHÈQUE DE SÉANCES — stockage persistant local (IndexedDB) + sync
 * Google Drive, pour pouvoir relancer INSTANTANÉMENT une séance déjà
 * générée sans re-générer (ni Claude, ni Eleven Labs), ET la retrouver sur
 * n'importe quel appareil connecté au même compte Google.
 *
 * Fonctionnement :
 * - Chaque séance est TOUJOURS sauvegardée localement (IndexedDB), pour un
 *   accès instantané et hors-ligne sur CET appareil.
 * - Si Google Drive est connecté, la séance est AUSSI envoyée vers Drive
 *   (audio + métadonnées), en arrière-plan, best-effort.
 * - Au chargement de la bibliothèque, on fusionne la liste locale et
 *   l'index Drive. Une séance créée sur un autre appareil apparaît donc
 *   ici — son audio n'est téléchargé que lorsqu'on clique "Lancer" (pour
 *   éviter de tout télécharger d'un coup), puis mis en cache localement
 *   pour les fois suivantes.
 */

import { isConnected, saveBinaryToDrive, loadBinaryFromDrive, saveToDrive, loadFromDrive, supprimerFichierDrive } from './google-drive';

export interface SeanceBibliotheque {
  id: string;
  outil: string; // slug : 'yoga_nidra_pro', 'hypnose_pro', 'tapping', etc.
  titre: string;
  dureeMinutes: number;
  dateCreation: string;
  script: string;
}

const DB_NOM = 'solco_bibliotheque';
const DB_VERSION = 1;
const STORE_META = 'seances';
const STORE_AUDIO = 'audio';
const INDEX_DRIVE_NOM = 'bibliotheque-index.json';

function ouvrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const requete = indexedDB.open(DB_NOM, DB_VERSION);

    requete.onupgradeneeded = () => {
      const db = requete.result;
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO); // clé = id de la séance
      }
    };

    requete.onsuccess = () => resolve(requete.result);
    requete.onerror = () => reject(requete.error);
  });
}

// ── Stockage local (IndexedDB) ──

async function sauvegarderLocalement(meta: SeanceBibliotheque, audioBlob: Blob): Promise<void> {
  const db = await ouvrirDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_META, STORE_AUDIO], 'readwrite');
    tx.objectStore(STORE_META).put(meta);
    tx.objectStore(STORE_AUDIO).put(audioBlob, meta.id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function listerLocal(): Promise<SeanceBibliotheque[]> {
  try {
    const db = await ouvrirDB();
    const seances = await new Promise<SeanceBibliotheque[]>((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readonly');
      const requete = tx.objectStore(STORE_META).getAll();
      requete.onsuccess = () => resolve(requete.result || []);
      requete.onerror = () => reject(requete.error);
    });
    db.close();
    return seances;
  } catch {
    return [];
  }
}

async function chargerAudioLocal(id: string): Promise<Blob | null> {
  try {
    const db = await ouvrirDB();
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIO, 'readonly');
      const requete = tx.objectStore(STORE_AUDIO).get(id);
      requete.onsuccess = () => resolve(requete.result || null);
      requete.onerror = () => reject(requete.error);
    });
    db.close();
    return blob;
  } catch {
    return null;
  }
}

async function supprimerLocal(id: string): Promise<void> {
  try {
    const db = await ouvrirDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_META, STORE_AUDIO], 'readwrite');
      tx.objectStore(STORE_META).delete(id);
      tx.objectStore(STORE_AUDIO).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.error('Erreur suppression locale bibliothèque:', e);
  }
}

// ── Synchronisation Google Drive ──

async function chargerIndexDrive(): Promise<SeanceBibliotheque[]> {
  if (!isConnected()) return [];
  try {
    const contenu = await loadFromDrive(INDEX_DRIVE_NOM);
    if (!contenu) return [];
    const donnees = JSON.parse(contenu);
    return Array.isArray(donnees) ? donnees : [];
  } catch {
    return [];
  }
}

async function synchroniserVersDrive(meta: SeanceBibliotheque, audioBlob: Blob): Promise<void> {
  if (!isConnected()) return;
  try {
    // 1) Upload de l'audio sous un nom unique
    await saveBinaryToDrive(`biblio-${meta.id}.mp3`, audioBlob, 'audio/mpeg');

    // 2) Met à jour l'index (fusionne avec ce qui existe déjà sur Drive,
    //    au cas où un autre appareil aurait ajouté des séances entretemps)
    const indexActuel = await chargerIndexDrive();
    const sansDoublon = indexActuel.filter(s => s.id !== meta.id);
    const nouvelIndex = [meta, ...sansDoublon];
    await saveToDrive(INDEX_DRIVE_NOM, JSON.stringify(nouvelIndex));
  } catch (e) {
    console.error('Erreur sync Drive bibliothèque:', e);
    // Best-effort : la séance reste disponible localement même si la sync échoue.
  }
}

// ── API publique ──

/**
 * Sauvegarde une séance complète (script + audio) dans la bibliothèque.
 * Toujours en local. Envoyée aussi vers Drive si connecté (arrière-plan).
 */
export async function sauvegarderDansBibliotheque(
  outil: string,
  titre: string,
  dureeMinutes: number,
  script: string,
  audioBlob: Blob
): Promise<void> {
  const meta: SeanceBibliotheque = {
    id: `${outil}_${Date.now()}`,
    outil,
    titre,
    dureeMinutes,
    dateCreation: new Date().toISOString(),
    script,
  };

  // Le stockage local doit réussir pour que la fonction ne lève pas
  // d'erreur (sinon les pages appelantes afficheraient "échec" à tort).
  await sauvegarderLocalement(meta, audioBlob);

  // La sync Drive est un bonus best-effort, ne bloque pas et n'échoue
  // jamais bruyamment côté appelant.
  synchroniserVersDrive(meta, audioBlob).catch(() => {});
}

/**
 * Liste les séances disponibles — fusion de la bibliothèque locale et de
 * l'index Drive (une séance créée sur un autre appareil apparaît donc ici).
 */
export async function listerBibliotheque(outil?: string): Promise<SeanceBibliotheque[]> {
  const [local, drive] = await Promise.all([listerLocal(), chargerIndexDrive()]);

  const parId = new Map<string, SeanceBibliotheque>();
  for (const s of drive) parId.set(s.id, s);
  for (const s of local) parId.set(s.id, s); // le local prime (plus probable d'être à jour ici)

  const fusion = Array.from(parId.values()).sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  return outil ? fusion.filter(s => s.outil === outil) : fusion;
}

/**
 * Récupère l'audio (sous forme d'URL jouable) d'une séance.
 * Cherche d'abord en local (instantané) ; si absent (séance créée sur un
 * autre appareil), le télécharge depuis Drive puis le met en cache local
 * pour que ce soit instantané la prochaine fois.
 */
export async function chargerAudioBibliotheque(id: string): Promise<string | null> {
  const blobLocal = await chargerAudioLocal(id);
  if (blobLocal) return URL.createObjectURL(blobLocal);

  if (!isConnected()) return null;

  const blobDrive = await loadBinaryFromDrive(`biblio-${id}.mp3`);
  if (!blobDrive) return null;

  // Met en cache localement pour la prochaine fois sur CET appareil.
  const index = await chargerIndexDrive();
  const meta = index.find(s => s.id === id);
  if (meta) {
    sauvegarderLocalement(meta, blobDrive).catch(() => {});
  }

  return URL.createObjectURL(blobDrive);
}

/** Supprime une séance de la bibliothèque (local + Drive si connecté). */
export async function supprimerDeBibliotheque(id: string): Promise<void> {
  await supprimerLocal(id);

  if (!isConnected()) return;
  try {
    await supprimerFichierDrive(`biblio-${id}.mp3`);
    const index = await chargerIndexDrive();
    const nouvelIndex = index.filter(s => s.id !== id);
    await saveToDrive(INDEX_DRIVE_NOM, JSON.stringify(nouvelIndex));
  } catch (e) {
    console.error('Erreur suppression Drive bibliothèque:', e);
  }
}

/**
 * Convertit une URL blob (renvoyée par textToSpeech) en Blob réel,
 * pour pouvoir la sauvegarder dans la bibliothèque.
 */
export async function urlVersBlob(url: string): Promise<Blob> {
  const reponse = await fetch(url);
  return reponse.blob();
}
