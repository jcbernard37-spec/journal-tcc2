// ═══════════════════════════════════════════════════════
// STOCKAGE — localStorage + Google Drive auto-sync
// ═══════════════════════════════════════════════════════

import { saveToDrive, loadFromDrive, isConnected } from './google-drive';

export interface Profil {
  prenom: string;
  gad7: number[];
  schemas: string[];
  creeLe: string;
}

export interface Entree {
  id: string;
  feuille: string;
  date: string;
  valeurs: Record<string, unknown>;
}

const CLE_PROFIL = 'tcc_profil';
const CLE_ENTREES = 'tcc_entrees';

export const stockage = {
  getProfil(): Profil | null {
    try { const p = localStorage.getItem(CLE_PROFIL); return p ? JSON.parse(p) : null; }
    catch { return null; }
  },
  setProfil(p: Profil) {
    localStorage.setItem(CLE_PROFIL, JSON.stringify(p));
    if (isConnected()) {
      // Sync en fichier unique pour éviter la confusion import/export
      stockage._syncDrive();
    }
  },
  getEntrees(feuille?: string): Entree[] {
    try {
      const e: Entree[] = JSON.parse(localStorage.getItem(CLE_ENTREES) || '[]');
      return feuille ? e.filter(x => x.feuille === feuille) : e;
    } catch { return []; }
  },
  ajouterEntree(feuille: string, valeurs: Record<string, unknown>) {
    const entrees = stockage.getEntrees();
    entrees.unshift({
      id: Date.now().toString(),
      feuille,
      date: new Date().toISOString(),
      valeurs,
    });
    localStorage.setItem(CLE_ENTREES, JSON.stringify(entrees));
    if (isConnected()) stockage._syncDrive();
  },
  supprimerEntree(id: string) {
    const entrees = stockage.getEntrees().filter(e => e.id !== id);
    localStorage.setItem(CLE_ENTREES, JSON.stringify(entrees));
    if (isConnected()) stockage._syncDrive();
  },

  /** Sync Drive en UN SEUL fichier combiné (évite la confusion 2 fichiers) */
  _syncDrive() {
    const donnees = {
      app: 'Solco',
      version: 2,
      exporteLe: new Date().toISOString(),
      profil: stockage.getProfil(),
      entrees: stockage.getEntrees(),
    };
    saveToDrive('solco-sauvegarde.json', JSON.stringify(donnees)).catch(() => {});
  },

  // ── Export manuel : télécharge un fichier JSON ──
  exporterTout() {
    const donnees = {
      app: 'Solco',
      version: 2,
      exporteLe: new Date().toISOString(),
      profil: stockage.getProfil(),
      entrees: stockage.getEntrees(),
    };
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    a.href = url;
    a.download = `solco-sauvegarde-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ── Import : restaure depuis n'importe quel format de fichier Solco ──
  importer(fichier: File): Promise<{ ok: boolean; profil: boolean; entrees: boolean; erreur?: string }> {
    return new Promise((resolve) => {
      const lecteur = new FileReader();
      lecteur.onload = () => {
        try {
          const donnees = JSON.parse(lecteur.result as string);
          let profil = null;
          let entrees: Entree[] | null = null;

          // Format 1 — fichier combiné (exporterTout ou sync Drive v2)
          // { app: "Solco", version: 2, profil: {...}, entrees: [...] }
          if (donnees.app === 'Solco' || donnees.app === 'Journal TCC') {
            profil  = donnees.profil  || null;
            entrees = Array.isArray(donnees.entrees) ? donnees.entrees : null;
          }
          // Format 2 — tableau direct d'entrées (ancien entrees.json de Drive)
          // [{id, feuille, date, valeurs}, ...]
          else if (Array.isArray(donnees) && donnees.length > 0 && donnees[0]?.feuille !== undefined) {
            entrees = donnees;
          }
          // Format 3 — objet profil seul (ancien profil.json de Drive)
          // {prenom, gad7, schemas, creeLe}
          else if (!Array.isArray(donnees) && (donnees.prenom !== undefined || donnees.schemas !== undefined)) {
            profil = donnees;
          }
          // Aucun format reconnu — ne pas retourner true silencieusement !
          else {
            resolve({ ok: false, profil: false, entrees: false, erreur: 'format_inconnu' });
            return;
          }

          let importeProfil  = false;
          let importeEntrees = false;

          if (profil) {
            localStorage.setItem(CLE_PROFIL, JSON.stringify(profil));
            importeProfil = true;
          }
          if (entrees && Array.isArray(entrees)) {
            localStorage.setItem(CLE_ENTREES, JSON.stringify(entrees));
            importeEntrees = true;
          }

          // Rien n'a réellement été importé → faux positif à éviter
          if (!importeProfil && !importeEntrees) {
            resolve({ ok: false, profil: false, entrees: false, erreur: 'donnees_vides' });
            return;
          }

          resolve({ ok: true, profil: importeProfil, entrees: importeEntrees });
        } catch (e) {
          resolve({ ok: false, profil: false, entrees: false, erreur: 'json_invalide' });
        }
      };
      lecteur.onerror = () => resolve({ ok: false, profil: false, entrees: false, erreur: 'lecture_impossible' });
      lecteur.readAsText(fichier);
    });
  },
};

export function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });
}
