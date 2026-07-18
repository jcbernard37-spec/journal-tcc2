/**
 * BIBLIOTHÈQUE DE SÉANCES — stockage persistant local des séances déjà
 * générées (script + audio complet), pour pouvoir les relancer INSTANTANÉMENT
 * sans re-générer (ni Claude, ni Eleven Labs, donc pas d'attente ET pas de
 * consommation de quota supplémentaire).
 *
 * Utilise IndexedDB plutôt que localStorage : un fichier audio complet fait
 * facilement plusieurs centaines de Ko à quelques Mo, largement au-dessus de
 * la limite de ~5-10 Mo de localStorage tous outils confondus. IndexedDB n'a
 * pas cette limite pratique et est fait pour stocker des données binaires.
 */

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

/**
 * Sauvegarde une séance complète (script + audio) dans la bibliothèque.
 * Appelé automatiquement après chaque génération réussie — best-effort,
 * n'interrompt jamais la lecture en cours si ça échoue.
 */
export async function sauvegarderDansBibliotheque(
  outil: string,
  titre: string,
  dureeMinutes: number,
  script: string,
  audioBlob: Blob
): Promise<void> {
  try {
    const db = await ouvrirDB();
    const id = `${outil}_${Date.now()}`;
    const meta: SeanceBibliotheque = {
      id,
      outil,
      titre,
      dureeMinutes,
      dateCreation: new Date().toISOString(),
      script,
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_META, STORE_AUDIO], 'readwrite');
      tx.objectStore(STORE_META).put(meta);
      tx.objectStore(STORE_AUDIO).put(audioBlob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();
  } catch (e) {
    console.error('Erreur sauvegarde bibliothèque:', e);
    // Silencieux : ne doit jamais bloquer l'expérience principale.
  }
}

/** Liste les séances sauvegardées, éventuellement filtrées par outil. */
export async function listerBibliotheque(outil?: string): Promise<SeanceBibliotheque[]> {
  try {
    const db = await ouvrirDB();
    const seances = await new Promise<SeanceBibliotheque[]>((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readonly');
      const requete = tx.objectStore(STORE_META).getAll();
      requete.onsuccess = () => resolve(requete.result || []);
      requete.onerror = () => reject(requete.error);
    });
    db.close();
    const triees = seances.sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
    return outil ? triees.filter(s => s.outil === outil) : triees;
  } catch (e) {
    console.error('Erreur lecture bibliothèque:', e);
    return [];
  }
}

/** Récupère l'audio (sous forme d'URL jouable) d'une séance sauvegardée. */
export async function chargerAudioBibliotheque(id: string): Promise<string | null> {
  try {
    const db = await ouvrirDB();
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIO, 'readonly');
      const requete = tx.objectStore(STORE_AUDIO).get(id);
      requete.onsuccess = () => resolve(requete.result || null);
      requete.onerror = () => reject(requete.error);
    });
    db.close();
    return blob ? URL.createObjectURL(blob) : null;
  } catch (e) {
    console.error('Erreur chargement audio bibliothèque:', e);
    return null;
  }
}

/** Supprime une séance de la bibliothèque. */
export async function supprimerDeBibliotheque(id: string): Promise<void> {
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
    console.error('Erreur suppression bibliothèque:', e);
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
