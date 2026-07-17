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
// ⚠️ Ces deux clés vivaient jusqu'ici hors du système de sauvegarde : ni
// l'export manuel, ni la sync Google Drive ne les incluaient. C'est pour
// ça que "Mon histoire" ne suivait jamais d'un appareil à l'autre.
const CLE_ANAMNESE = 'tcc_anamnese';
const CLE_PROFIL_PERSO = 'solco_profil_perso';

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

  getAnamnese(): Record<string, unknown> | null {
    try { const a = localStorage.getItem(CLE_ANAMNESE); return a ? JSON.parse(a) : null; }
    catch { return null; }
  },
  getProfilPerso(): Record<string, unknown> | null {
    try { const p = localStorage.getItem(CLE_PROFIL_PERSO); return p ? JSON.parse(p) : null; }
    catch { return null; }
  },

  /**
   * À appeler après avoir écrit directement dans tcc_anamnese ou
   * solco_profil_perso (ces deux-là ne passent pas par stockage.setProfil
   * / ajouterEntree), pour déclencher la sync Drive si connecté.
   */
  declencherSync() {
    if (isConnected()) stockage._syncDrive();
  },

  /** Sync Drive en UN SEUL fichier combiné (évite la confusion 2 fichiers) */
  _syncDrive() {
    const donnees = {
      app: 'Solco',
      version: 3,
      exporteLe: new Date().toISOString(),
      profil: stockage.getProfil(),
      entrees: stockage.getEntrees(),
      anamnese: stockage.getAnamnese(),
      profilPerso: stockage.getProfilPerso(),
    };
    saveToDrive('solco-sauvegarde.json', JSON.stringify(donnees)).catch(() => {});
  },

  // ── Export manuel : télécharge un fichier JSON ──
  exporterTout() {
    const donnees = {
      app: 'Solco',
      version: 3,
      exporteLe: new Date().toISOString(),
      profil: stockage.getProfil(),
      entrees: stockage.getEntrees(),
      anamnese: stockage.getAnamnese(),
      profilPerso: stockage.getProfilPerso(),
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

  // ── Applique des données déjà parsées (partagé par importer() et
  // restaurerDepuisDrive()) ──
  _appliquerDonnees(donnees: any): { ok: boolean; profil: boolean; entrees: boolean; anamnese: boolean; profilPerso: boolean; erreur?: string } {
    let profil = null;
    let entrees: Entree[] | null = null;
    let anamnese: Record<string, unknown> | null = null;
    let profilPerso: Record<string, unknown> | null = null;

    // Format combiné (exporterTout ou sync Drive, v2 ou v3)
    if (donnees.app === 'Solco' || donnees.app === 'Journal TCC') {
      profil = donnees.profil || null;
      entrees = Array.isArray(donnees.entrees) ? donnees.entrees : null;
      anamnese = donnees.anamnese || null;
      profilPerso = donnees.profilPerso || null;
    }
    // Format 2 — tableau direct d'entrées (ancien entrees.json de Drive)
    else if (Array.isArray(donnees) && donnees.length > 0 && donnees[0]?.feuille !== undefined) {
      entrees = donnees;
    }
    // Format 3 — objet profil seul (ancien profil.json de Drive)
    else if (!Array.isArray(donnees) && (donnees.prenom !== undefined || donnees.schemas !== undefined)) {
      profil = donnees;
    }
    else {
      return { ok: false, profil: false, entrees: false, anamnese: false, profilPerso: false, erreur: 'format_inconnu' };
    }

    let importeProfil = false;
    let importeEntrees = false;
    let importeAnamnese = false;
    let importeProfilPerso = false;

    if (profil) {
      localStorage.setItem(CLE_PROFIL, JSON.stringify(profil));
      importeProfil = true;
    }
    if (entrees && Array.isArray(entrees)) {
      localStorage.setItem(CLE_ENTREES, JSON.stringify(entrees));
      importeEntrees = true;
    }
    if (anamnese) {
      localStorage.setItem(CLE_ANAMNESE, JSON.stringify(anamnese));
      importeAnamnese = true;
    }
    if (profilPerso) {
      localStorage.setItem(CLE_PROFIL_PERSO, JSON.stringify(profilPerso));
      importeProfilPerso = true;
    }

    if (!importeProfil && !importeEntrees && !importeAnamnese && !importeProfilPerso) {
      return { ok: false, profil: false, entrees: false, anamnese: false, profilPerso: false, erreur: 'donnees_vides' };
    }

    return { ok: true, profil: importeProfil, entrees: importeEntrees, anamnese: importeAnamnese, profilPerso: importeProfilPerso };
  },

  // ── Import : restaure depuis n'importe quel format de fichier Solco ──
  importer(fichier: File): Promise<{ ok: boolean; profil: boolean; entrees: boolean; anamnese: boolean; profilPerso: boolean; erreur?: string }> {
    return new Promise((resolve) => {
      const lecteur = new FileReader();
      lecteur.onload = () => {
        try {
          const donnees = JSON.parse(lecteur.result as string);
          resolve(stockage._appliquerDonnees(donnees));
        } catch (e) {
          resolve({ ok: false, profil: false, entrees: false, anamnese: false, profilPerso: false, erreur: 'json_invalide' });
        }
      };
      lecteur.onerror = () => resolve({ ok: false, profil: false, entrees: false, anamnese: false, profilPerso: false, erreur: 'lecture_impossible' });
      lecteur.readAsText(fichier);
    });
  },

  // ── Restaure directement depuis le fichier de sauvegarde présent sur
  // Google Drive (sans passer par un fichier local) — c'est ce qui manquait
  // pour vraiment "reprendre sur un autre appareil" : se connecter à Drive
  // ne faisait jusqu'ici que préparer les sync futures, jamais récupérer
  // ce qui existait déjà là-bas.
  async restaurerDepuisDrive(): Promise<{ ok: boolean; profil: boolean; entrees: boolean; anamnese: boolean; profilPerso: boolean; erreur?: string }> {
    try {
      const contenu = await loadFromDrive('solco-sauvegarde.json');
      if (!contenu) {
        return { ok: false, profil: false, entrees: false, anamnese: false, profilPerso: false, erreur: 'aucune_sauvegarde_drive' };
      }
      const donnees = JSON.parse(contenu);
      return stockage._appliquerDonnees(donnees);
    } catch (e) {
      return { ok: false, profil: false, entrees: false, anamnese: false, profilPerso: false, erreur: 'json_invalide' };
    }
  },
};

export function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });
}
