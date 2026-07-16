/**
 * Profil personnel de l'utilisateur
 * Stocké en localStorage — modifiable à tout moment
 */

export type Genre = 'F' | 'M' | 'N'; // Femme / Homme / Neutre

export interface ProfilPersonnel {
  prenom: string;
  genre: Genre;
  age: number | null;
  dateCreation: string;
  dateMiseAJour: string;
}

const CLE = 'solco_profil_perso';

export function getProfil(): ProfilPersonnel | null {
  try {
    const raw = localStorage.getItem(CLE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveProfil(data: Partial<ProfilPersonnel>): ProfilPersonnel {
  const existing = getProfil();
  const profil: ProfilPersonnel = {
    prenom: '',
    genre: 'N',
    age: null,
    dateCreation: new Date().toISOString(),
    ...existing,
    ...data,
    dateMiseAJour: new Date().toISOString(),
  };
  localStorage.setItem(CLE, JSON.stringify(profil));
  return profil;
}

/** Renvoie 'e' (féminin) ou '' (masculin/neutre) pour les accords */
export function suffixeE(genre: Genre): string {
  return genre === 'F' ? 'e' : '';
}

/** Pronom sujet */
export function pronom(genre: Genre): string {
  return genre === 'F' ? 'elle' : genre === 'M' ? 'il' : 'elle';
}

/** Déterminant défini */
export function determinantLe(genre: Genre): string {
  return genre === 'F' ? 'la' : 'le';
}

export function profilEstComplet(p: ProfilPersonnel | null): boolean {
  return !!(p && p.prenom && p.genre !== 'N' && p.age);
}
