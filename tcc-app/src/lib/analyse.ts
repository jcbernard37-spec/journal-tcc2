// ═══════════════════════════════════════════════════════
// ANALYSE DES PATTERNS — B4 Observations de suivi
// Analyse les 7 derniers jours pour repérer les tendances
// ═══════════════════════════════════════════════════════

import { stockage } from './storage';
import { SCHEMAS, DISTORSIONS } from '../data/tcc';

export interface PatternAnalyse {
  emotions: { emotion: string; count: number; pourcentage: number }[];
  distorsions: { nom: string; count: number; pourcentage: number }[];
  schemas: { nom: string; count: number; contextes: string[] }[];
  predictions: { total: number; realisees: number; tauxReussite: number };
  heuresPicPanic: string[];
  observations: string[];
}

export function analyserDernier7Jours(): PatternAnalyse {
  const entrees = stockage.getEntrees();
  const maintenant = Date.now();
  const septJours = 7 * 24 * 60 * 60 * 1000;

  // Filtre les entrées des 7 derniers jours
  const entreesRecentes = entrees.filter(e => {
    const dateEntree = new Date(e.date).getTime();
    return maintenant - dateEntree <= septJours;
  });

  if (entreesRecentes.length === 0) {
    return {
      emotions: [],
      distorsions: [],
      schemas: [],
      predictions: { total: 0, realisees: 0, tauxReussite: 0 },
      heuresPicPanic: [],
      observations: ['Pas assez de données sur 7 jours. Remplis quelques feuilles pour voir les tendances.'],
    };
  }

  const analyse: PatternAnalyse = {
    emotions: [],
    distorsions: [],
    schemas: [],
    predictions: { total: 0, realisees: 0, tauxReussite: 0 },
    heuresPicPanic: [],
    observations: [],
  };

  // ─ 1. Émotions récurrentes ─
  const emotionsCounts: Record<string, number> = {};
  entreesRecentes.forEach(e => {
    const emotion = (e.valeurs.emotion as string) || '';
    if (emotion) emotionsCounts[emotion] = (emotionsCounts[emotion] || 0) + 1;
  });

  analyse.emotions = Object.entries(emotionsCounts)
    .map(([emotion, count]) => ({
      emotion,
      count,
      pourcentage: Math.round((count / entreesRecentes.length) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ─ 2. Distorsions cognitives fréquentes ─
  const distorsionsCounts: Record<string, number> = {};
  entreesRecentes.forEach(e => {
    const distorsions = (e.valeurs.distorsions as string[]) || [];
    distorsions.forEach(nomDist => {
      distorsionsCounts[nomDist] = (distorsionsCounts[nomDist] || 0) + 1;
    });
  });

  analyse.distorsions = Object.entries(distorsionsCounts)
    .map(([nomDist, count]) => ({
      nom: nomDist,
      count,
      pourcentage: Math.round((count / entreesRecentes.length) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ─ 3. Schémas activés ─
  const schemasCounts: Record<string, { count: number; contextes: string[] }> = {};
  entreesRecentes.forEach(e => {
    const schemas = (e.valeurs.schemas as string[]) || [];
    const contexte = (e.valeurs.situation as string) || 'contexte non spécifié';
    schemas.forEach(schemaId => {
      if (!schemasCounts[schemaId]) schemasCounts[schemaId] = { count: 0, contextes: [] };
      schemasCounts[schemaId].count += 1;
      if (schemasCounts[schemaId].contextes.length < 2) {
        schemasCounts[schemaId].contextes.push(contexte.substring(0, 50));
      }
    });
  });

  analyse.schemas = Object.entries(schemasCounts)
    .map(([schemaId, { count, contextes }]) => {
      const schema = SCHEMAS.find(s => s.id === schemaId);
      return {
        nom: schema?.nom || schemaId,
        count,
        contextes,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ─ 4. Taux de réussite des prédictions ─
  const entreesLabo = entreesRecentes.filter(e => e.feuille === 'predictions');
  if (entreesLabo.length > 0) {
    let predictionsTotales = 0;
    let predictionsRealisees = 0;

    entreesLabo.forEach(e => {
      const predictions = (e.valeurs.predictions as string) || '';
      const resultat = (e.valeurs.resultat as string) || '';

      // Compte les prédictions
      const nbPredictions = predictions.split('\n').filter(p => p.trim()).length;
      predictionsTotales += nbPredictions;

      // Compte celles qui se sont réalisées
      if (resultat.toLowerCase().includes('oui') || resultat.toLowerCase().includes('réalisé')) {
        predictionsRealisees += nbPredictions * 0.5; // Heuristique
      }
    });

    analyse.predictions = {
      total: predictionsTotales,
      realisees: Math.round(predictionsRealisees),
      tauxReussite: predictionsTotales > 0 ? Math.round((predictionsRealisees / predictionsTotales) * 100) : 0,
    };
  }

  // ─ 5. Heures de pic (si données disponibles) ─
  const heuresCounts: Record<string, number> = {};
  entreesRecentes.forEach(e => {
    const date = new Date(e.date);
    const heure = date.getHours().toString().padStart(2, '0');
    heuresCounts[heure] = (heuresCounts[heure] || 0) + 1;
  });

  const heuresTriees = Object.entries(heuresCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([heure]) => `${heure}h`);

  analyse.heuresPicPanic = heuresTriees;

  // ─ 6. Observations synthétiques ─
  const obs: string[] = [];

  if (analyse.emotions.length > 0) {
    obs.push(`🎭 Ton émotion dominante : ${analyse.emotions[0].emotion} (${analyse.emotions[0].pourcentage}% du temps)`);
  }

  if (analyse.distorsions.length > 0) {
    obs.push(`🧠 Distorsion la plus fréquente : ${analyse.distorsions[0].nom} (${analyse.distorsions[0].pourcentage}% des entrées)`);
  }

  if (analyse.heuresPicPanic.length > 0) {
    obs.push(`⏰ Tes pics d'anxiété : généralement vers ${analyse.heuresPicPanic.join(', ')}`);
  }

  if (analyse.predictions.total > 0) {
    const msg = analyse.predictions.tauxReussite < 30
      ? `📊 Bonne nouvelle : tes prédictions négatives ne se concrétisent que ${analyse.predictions.tauxReussite}% du temps. Tes peurs dépassent la réalité.`
      : `📊 Sur ${analyse.predictions.total} prédictions, ${analyse.predictions.realisees} se sont réalisées (${analyse.predictions.tauxReussite}%). À observer.`;
    obs.push(msg);
  }

  if (analyse.schemas.length > 0) {
    const schemaTop = analyse.schemas[0];
    obs.push(`💫 Schéma dominant : ${schemaTop.nom}. À explorer en séance.`);
  }

  if (entreesRecentes.length < 3) {
    obs.push('📝 Poursuis tes entrées pour avoir une meilleure vue d\'ensemble.');
  }

  analyse.observations = obs;

  return analyse;
}
