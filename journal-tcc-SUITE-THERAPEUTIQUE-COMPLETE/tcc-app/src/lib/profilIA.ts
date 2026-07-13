// ═══════════════════════════════════════════════════════════════════════════
// PROFIL IA — Synthèse dynamique de l'utilisateur
// Analyse l'historique pour créer un profil contextuel que l'IA utilise
// ═══════════════════════════════════════════════════════════════════════════

import { stockage } from './storage';
import { SCHEMAS } from '../data/tcc';

export interface ProfilIA {
  schemasActifs: { nom: string; frequence: number }[];
  emotionsDominantes: string[];
  distorsionsFréquentes: string[];
  momentsCritiques: string[];
  decodeurs: string;
  conseils: string;
}

/**
 * Synthétise un profil IA basé sur l'anamnèse et l'historique récent
 * Utilisé pour contextualiser CHAQUE conversation avec l'IA
 */
export function genererProfilIA(): ProfilIA {
  // Récupère l'anamnèse si disponible
  const anamneseJson = localStorage.getItem('tcc_anamnese');
  const anamnese = anamneseJson ? JSON.parse(anamneseJson) : null;

  const entrees = stockage.getEntrees();
  const maintenant = Date.now();
  const trentJours = 30 * 24 * 60 * 60 * 1000;

  // Filtre les entrées des 30 derniers jours
  const entreesRecentes = entrees.filter(e => {
    const dateEntree = new Date(e.date).getTime();
    return maintenant - dateEntree <= trentJours;
  });

  if (!entreesRecentes.length && !anamnese) {
    return {
      schemasActifs: [],
      emotionsDominantes: [],
      distorsionsFréquentes: [],
      momentsCritiques: [],
      decodeurs: 'Aucune donnée pour le moment. Remplis quelques feuilles et ton histoire pour créer ton profil.',
      conseils: '',
    };
  }

  const profil: ProfilIA = {
    schemasActifs: [],
    emotionsDominantes: [],
    distorsionsFréquentes: [],
    momentsCritiques: [],
    decodeurs: '',
    conseils: '',
  };

  // ─ 1. Schémas actifs ─
  const schemasCounts: Record<string, number> = {};
  entreesRecentes.forEach(e => {
    const schemas = (e.valeurs.schemas as string[]) || [];
    schemas.forEach(schemaId => {
      schemasCounts[schemaId] = (schemasCounts[schemaId] || 0) + 1;
    });
  });

  profil.schemasActifs = Object.entries(schemasCounts)
    .map(([schemaId, count]) => {
      const schema = SCHEMAS.find(s => s.id === schemaId);
      return {
        nom: schema?.nom || schemaId,
        frequence: count,
      };
    })
    .sort((a, b) => b.frequence - a.frequence)
    .slice(0, 5);

  // ─ 2. Émotions dominantes ─
  const emotionsCounts: Record<string, number> = {};
  entreesRecentes.forEach(e => {
    const emotion = (e.valeurs.emotion as string) || '';
    if (emotion) emotionsCounts[emotion] = (emotionsCounts[emotion] || 0) + 1;
  });

  profil.emotionsDominantes = Object.entries(emotionsCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion]) => emotion);

  // ─ 3. Distorsions fréquentes ─
  const distorsionsCounts: Record<string, number> = {};
  entreesRecentes.forEach(e => {
    const distorsions = (e.valeurs.distorsions as string[]) || [];
    distorsions.forEach(d => {
      distorsionsCounts[d] = (distorsionsCounts[d] || 0) + 1;
    });
  });

  profil.distorsionsFréquentes = Object.entries(distorsionsCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([dist]) => dist);

  // ─ 4. Moments critiques ─
  const situationsCritiques = entreesRecentes
    .filter(e => {
      const intensite = (e.valeurs.intensite as number) || 0;
      return intensite > 70;
    })
    .slice(0, 3)
    .map(e => (e.valeurs.situation as string) || '');

  profil.momentsCritiques = situationsCritiques.filter(s => s);

  // ─ 5. Générer le texte "décodeurs" pour l'IA ─
  const decodeursParts: string[] = [];

  // ANAMNÈSE EN PREMIER (contexte profond)
  if (anamnese) {
    if (anamnese.situationDeclenchante) {
      decodeursParts.push(`📍 Situation actuelle : ${anamnese.situationDeclenchante}`);
    }
    if (anamnese.enfance) {
      decodeursParts.push(`👶 Enfance : ${anamnese.enfance.substring(0, 150)}...`);
    }
    if (anamnese.momentBasculement) {
      decodeursParts.push(`⚠️ Moment de basculement : ${anamnese.momentBasculement.substring(0, 150)}...`);
    }
    if (anamnese.croyanceSurToi) {
      decodeursParts.push(`💭 Croyance sur elle-même : "${anamnese.croyanceSurToi}"`);
    }
  }

  // PATTERNS RÉCENTS
  if (profil.schemasActifs.length > 0) {
    const schemasTexte = profil.schemasActifs
      .map(s => `${s.nom} (${s.frequence}x)`)
      .join(', ');
    decodeursParts.push(`🎯 Schémas dominants (30j) : ${schemasTexte}`);
  }

  if (profil.emotionsDominantes.length > 0) {
    decodeursParts.push(`💔 Émotions récurrentes : ${profil.emotionsDominantes.join(', ')}`);
  }

  if (profil.distorsionsFréquentes.length > 0) {
    decodeursParts.push(`🧠 Distorsions cognitives actives : ${profil.distorsionsFréquentes.join(', ')}`);
  }

  if (profil.momentsCritiques.length > 0) {
    decodeursParts.push(`Moments critiques identifiés : ${profil.momentsCritiques.slice(0, 2).join(' ; ')}`);
  }

  profil.decodeurs = decodeursParts.join('. ');

  // ─ 6. Générer les conseils personnalisés ─
  const conseilsParts: string[] = [];

  // Conseils basés sur l'anamnèse
  if (anamnese) {
    if (anamnese.croyanceSurToi) {
      conseilsParts.push(`🎯 Focus : elle croit "${anamnese.croyanceSurToi}" — c'est une croyance profonde à explorer.`);
    }
    if (anamnese.objetifsTherapeutiques) {
      conseilsParts.push(`🌟 Objectif : "${anamnese.objectifsTherapeutiques}"`);
    }
  }

  if (profil.schemasActifs.length > 0) {
    const schemaPrincipal = profil.schemasActifs[0];
    if (!conseilsParts.length) {
      conseilsParts.push(`🎯 Focus : explorer davantage le schéma de "${schemaPrincipal.nom}" qui revient souvent.`);
    }
  }

  if (profil.distorsionsFréquentes.length > 0) {
    conseilsParts.push(`🧠 Vigilance : la distorsion "${profil.distorsionsFréquentes[0]}" est très active en ce moment.`);
  }

  if (profil.emotionsDominantes.includes('anxiété') || profil.emotionsDominantes.includes('peur')) {
    conseilsParts.push(`💚 Pratique : continue la cohérence cardiaque (SOS) et note les prédictions pour en vérifier la réalité.`);
  }

  profil.conseils = conseilsParts.join(' ');

  return profil;
}

/**
 * Formate le profil en texte pour l'injecter dans les prompts IA
 */
export function formaterProfilPourIA(profil: ProfilIA): string {
  if (!profil.decodeurs) {
    return '';
  }

  return `
PROFIL DE LA PERSONNE (basé sur ses 30 derniers jours) :
${profil.decodeurs}

${profil.conseils ? `CONSEIL PRIORITAIRE : ${profil.conseils}` : ''}

Utilise ce contexte pour personnaliser ton écoute et tes suggestions. Évite les réponses génériques.
`;
}
