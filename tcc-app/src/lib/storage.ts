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
    // Sync Google Drive
    if (isConnected()) {
      saveToDrive('profil.json', JSON.stringify(p)).catch(() => {});
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
    // Sync Google Drive
    if (isConnected()) {
      saveToDrive('entrees.json', JSON.stringify(entrees)).catch(() => {});
    }
  },
  supprimerEntree(id: string) {
    const entrees = stockage.getEntrees().filter(e => e.id !== id);
    localStorage.setItem(CLE_ENTREES, JSON.stringify(entrees));
    // Sync Google Drive
    if (isConnected()) {
      saveToDrive('entrees.json', JSON.stringify(entrees)).catch(() => {});
    }
  },

  // ── Export : télécharge un fichier JSON à déposer dans Google Drive ──
  exporterTout() {
    const donnees = {
      app: 'Journal TCC',
      version: 1,
      exporteLe: new Date().toISOString(),
      profil: stockage.getProfil(),
      entrees: stockage.getEntrees(),
    };
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    a.href = url;
    a.download = `journal-tcc-sauvegarde-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ── Import : restaure depuis un fichier de sauvegarde ──
  importer(fichier: File): Promise<boolean> {
    return new Promise((resolve) => {
      const lecteur = new FileReader();
      lecteur.onload = () => {
        try {
          const donnees = JSON.parse(lecteur.result as string);
          if (donnees.profil) localStorage.setItem(CLE_PROFIL, JSON.stringify(donnees.profil));
          if (donnees.entrees) localStorage.setItem(CLE_ENTREES, JSON.stringify(donnees.entrees));
          resolve(true);
        } catch { resolve(false); }
      };
      lecteur.onerror = () => resolve(false);
      lecteur.readAsText(fichier);
    });
  },
};

export function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });
}
