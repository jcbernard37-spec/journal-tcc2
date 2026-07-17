/**
 * IA Personnalisée Sophistiquée
 * 
 * Génère du contenu thérapeutique UNIQUE basé sur:
 * - Anamnèse complète (histoire de JC)
 * - Patterns 7 derniers jours
 * - Croyances limitantes identifiées
 * - Ressources de résilience
 * - Métaphores qui résonnent
 */

interface UserProfile {
  anamnese?: any;
  derniersSessions?: any[];
  croyancesLimitantes?: string[];
  ressources?: string[];
  metaphoresPreferees?: string[];
  schemasDominants?: string[];
}

interface PersonalizationContext {
  profile: UserProfile;
  tool: 'yoga' | 'hypnose' | 'visualization' | 'emdr';
  type?: string;
  targetBelief?: string;
  targetResource?: string;
}

/**
 * Charge le profil complet de l'utilisateur
 */
export function loadUserProfile(): UserProfile {
  const anamnese = localStorage.getItem('tcc_anamnese');
  const sessions = localStorage.getItem('tcc_sessions_therapie');

  // Parse l'anamnèse
  let anamneseData = {};
  if (anamnese) {
    try {
      anamneseData = JSON.parse(anamnese);
    } catch (e) {
      console.error('Error parsing anamnese:', e);
    }
  }

  // Parse les sessions
  let sessionsData: any[] = [];
  if (sessions) {
    try {
      sessionsData = JSON.parse(sessions).slice(-7); // Derniers 7 jours
    } catch (e) {
      console.error('Error parsing sessions:', e);
    }
  }

  // Extraire patterns des dernières sessions
  const croyancesDetectees = extractBeliefs(anamneseData);
  const ressourcesDetectees = extractResources(anamneseData);
  const schemasDetectes = extractSchemas(sessionsData);

  return {
    anamnese: anamneseData,
    derniersSessions: sessionsData,
    croyancesLimitantes: croyancesDetectees,
    ressources: ressourcesDetectees,
    metaphoresPreferees: identifyMetaphors(anamneseData),
    schemasDominants: schemasDetectes,
  };
}

/**
 * Extrait les croyances limitantes de l'anamnèse
 */
function extractBeliefs(anamnese: any): string[] {
  const beliefs: string[] = [];

  // Chercher dans chaque section
  if (anamnese.croyanceSurSoi) {
    beliefs.push(anamnese.croyanceSurSoi);
  }
  if (anamnese.croyanceSurLesAutres) {
    beliefs.push(anamnese.croyanceSurLesAutres);
  }
  if (anamnese.croyanceSurLaVie) {
    beliefs.push(anamnese.croyanceSurLaVie);
  }

  return beliefs.filter((b) => b && b.length > 0);
}

/**
 * Extrait les ressources de résilience
 */
function extractResources(anamnese: any): string[] {
  const resources: string[] = [];

  if (anamnese.ressources) {
    resources.push(anamnese.ressources);
  }
  if (anamnese.momentDePuissance) {
    resources.push(anamnese.momentDePuissance);
  }

  return resources.filter((r) => r && r.length > 0);
}

/**
 * Identifie les métaphores qui résonnent avec la personne
 */
function identifyMetaphors(anamnese: any): string[] {
  const metaphors: string[] = [];

  // Si elle a identifié sa "zone de confort"
  if (anamnese.lieuSûr) {
    metaphors.push(`ton lieu sûr: ${anamnese.lieuSûr}`);
  }

  // Patterns dans son histoire
  if (anamnese.contexteActuel?.includes('travail')) {
    metaphors.push('métaphores de croissance professionnelle');
  }
  if (anamnese.contexteActuel?.includes('relation')) {
    metaphors.push('métaphores de connexion et d\'amour');
  }
  if (anamnese.contexteActuel?.includes('santé')) {
    metaphors.push('métaphores de guérison et de force');
  }

  return metaphors;
}

/**
 * Extrait les schémas dominants des dernières sessions
 */
function extractSchemas(sessions: any[]): string[] {
  const schemaCount: Record<string, number> = {};

  sessions.forEach((session) => {
    const schema = session.type || 'general';
    schemaCount[schema] = (schemaCount[schema] || 0) + 1;
  });

  return Object.entries(schemaCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([schema]) => schema);
}

/**
 * Génère un script Yoga Nidra PERSONNALISÉ
 */
export async function generatePersonalizedYogaNidra(
  duration: 'court' | 'moyen' | 'long',
  profile: UserProfile
): Promise<string> {
  const sankalpa = buildPersonalSankalpa(profile);
  const metaphors = profile.metaphoresPreferees || [];
  const resources = profile.ressources || [];

  const prompt = `
Tu es un guide Yoga Nidra expert, doux et bienveillant.

Crée une session Yoga Nidra de ${duration === 'court' ? '15' : duration === 'moyen' ? '30' : '60'} minutes pour cette personne:

Contexte personnel:
- Elle a identifié ces ressources: ${resources.join(', ')}
- Ses métaphores qui parlent: ${metaphors.join(', ')}
- Son intention (Sankalpa) pour cette session: "${sankalpa}"

Structure requise:
1. Introduction bienveillante (30 sec)
2. Sankalpa installation (1 min) - utilise son intention personnelle
3. Scan corporel détaillé (3-5 min) 
4. Opposites (polarités) (2 min)
5. Visualisation guidée (basée ses ressources et métaphores) (3-5 min)
6. Retour progressif (1-2 min)
7. Conclusion avec Sankalpa répétée (30 sec)

Ton:
- Doux, bienveillant, professionnel
- Personnalisé pour elle
- Incorpore ses ressources et métaphores
- Espace pour sa propre expérience

Écris le script complet, prêt pour synthèse vocale.
  `;

  // Appelle Claude pour générer
  return callClaudeAPI(prompt);
}

/**
 * Génère une Hypnose PERSONNALISÉE basée sur croyance limitante
 */
export async function generatePersonalizedHypnosis(
  type: 'relaxation' | 'croyance' | 'ressource',
  targetBelief: string,
  profile: UserProfile
): Promise<string> {
  const metaphors = profile.metaphoresPreferees || [];
  const resources = profile.ressources || [];
  const success = profile.derniersSessions?.filter((s) => s.efficacite > 7).length || 0;

  const prompt =
    type === 'relaxation'
      ? `
Tu es un hypnothérapeute Ericksonien expert.

Crée une induction hypnotique de relaxation profonde (20 min) pour cette personne:

Contexte:
- Ressources: ${resources.join(', ')}
- Métaphores qui parlent: ${metaphors.join(', ')}

Utilise:
- Langage indirect (suggestions permissives)
- Métaphores naturelles intégrées à son histoire
- Ancrage de sécurité basé ses ressources

Écris une induction hypnotique professionnelle et personnalisée.
      `
      : `
Tu es un hypnothérapeute Ericksonien expert en changement de croyances.

Crée une session d'hypnose pour changer cette croyance limitante: "${targetBelief}"

Contexte personnel:
- Croyance à changer: "${targetBelief}"
- Ses ressources (preuves du contraire): ${resources.join(', ')}
- Métaphores qui résonnent: ${metaphors.join(', ')}
- Succès passés: ${success} sessions efficaces
- Histoire: ${profile.anamnese?.contexteActuel || ''}

Structure (40 min):
1. Induction progressive (5 min)
2. Deepening (5 min)
3. Présentation du problème (indirect) (5 min)
4. Métaphore puissante qui contient la solution (15 min)
   - Utilise ses ressources comme preuves
   - Utilise ses métaphores préférées
   - Weave sa propre histoire dans la métaphore
5. Suggestions post-hypnotiques (5 min)
   - Suggestions ancrées dans ses objectifs
   - Basées sur ses succès passés
6. Emergence (5 min)

Ton: Professionnel, indirect, Ericksonien, riche de métaphores

Écris le script complet, prêt pour synthèse vocale.
      `;

  return callClaudeAPI(prompt);
}

/**
 * Génère une introduction vocale PERSONNALISÉE pour une session EMDR
 * (courte induction avant la phase silencieuse de stimulation bilatérale —
 * en EMDR, on ne parle pas pendant les passages de stimulation eux-mêmes)
 */
export async function generatePersonalizedEMDRIntro(
  sudsAvant: number,
  ressource: string,
  profile: UserProfile
): Promise<string> {
  const prompt = `
Tu es un praticien EMDR expert, doux et rassurant.

Crée une courte introduction parlée (1 à 2 minutes maximum) pour préparer cette personne
à une session de stimulation bilatérale EMDR (mouvements oculaires gauche-droite).

Contexte:
- Son niveau de détresse actuel (SUDS): ${sudsAvant}/10
- Sa ressource de sécurité choisie: "${ressource || 'sa propre force intérieure'}"

Structure requise:
1. Accueil bienveillant, rappel que ceci n'est pas un substitut à un suivi avec un
   thérapeute EMDR certifié, mais un outil d'auto-régulation
2. Installation de la ressource de sécurité ("${ressource || 'sa force intérieure'}") :
   invite-la à se connecter à cette ressource maintenant
3. Explique simplement ce qui va suivre : elle va suivre du regard une stimulation
   visuelle bilatérale, en pensant simplement à sa ressource ou en laissant venir
   ce qui vient, sans jugement
4. Rappelle qu'elle peut s'arrêter à tout moment si c'est trop intense, et que le
   bouton SOS est toujours disponible
5. Termine en indiquant que la stimulation silencieuse va commencer

Ton: Calme, professionnel, rassurant, jamais pressé.
Écris UNIQUEMENT le texte à voix haute, prêt pour synthèse vocale, sans titre ni note.
  `;

  return callClaudeAPI(prompt);
}

/**
 * Génère une Visualisation PERSONNALISÉE
 */
export async function generatePersonalizedVisualization(
  type: string,
  profile: UserProfile
): Promise<string> {
  const metaphors = profile.metaphoresPreferees || [];
  const resources = profile.ressources || [];

  const prompts: Record<string, string> = {
    abondance: `
Tu es un guide de visualisation créatrice.

Crée une visualisation de manifestation d'abondance (30 min) pour cette personne:

Contexte:
- Ses ressources (pour se rappeler elle est capable): ${resources.join(', ')}
- Métaphores qui parlent: ${metaphors.join(', ')}

Utilise les 5 sens de façon détaillée. Incorpore ses métaphores.

Écris le script complet.
    `,
    guerison: `
Tu es un guide de guérison émotionnelle.

Crée une visualisation de pardon et guérison (40 min).

Incorpore:
- Ses ressources comme force de guérison
- Ses métaphores préférées
- Dialogue compassionnel avec elle-même

Écris le script complet.
    `,
    enfant: `
Tu es un guide de reconnexion enfant intérieur.

Crée une visualisation de rencontre avec l'enfant intérieur (45 min).

Utilise:
- Ses ressources pour offrir à l'enfant
- Ses métaphores pour créer sécurité
- Dialogue aimant et protecteur

Écris le script complet.
    `,
  };

  const prompt = prompts[type] || prompts['abondance'];
  return callClaudeAPI(prompt);
}

/**
 * Construit une Sankalpa personnalisée
 */
function buildPersonalSankalpa(profile: UserProfile): string {
  const objectif = profile.anamnese?.objectifsTherapeutiques || '';
  const ressources = profile.ressources?.[0] || '';

  if (objectif) {
    return `Je me reconnecte à ${objectif}`;
  }
  if (ressources) {
    return `Je suis aussi forte et courageuse que dans ${ressources}`;
  }
  return 'Je suis en paix avec moi-même';
}

/**
 * Détecte les patterns et recommande un combo optimal
 */
export function analyzeAndRecommend(profile: UserProfile): string {
  const sessions = profile.derniersSessions || [];

  if (sessions.length < 2) {
    return 'Fais au moins 2-3 sessions pour que je détecte tes patterns.';
  }

  // Calcul l'efficacité par type
  const effectivenessByType: Record<string, number[]> = {};

  sessions.forEach((session) => {
    const type = session.type || 'general';
    if (!effectivenessByType[type]) {
      effectivenessByType[type] = [];
    }
    effectivenessByType[type].push(session.efficacite || 0);
  });

  // Moyenne par type
  const averageByType: Record<string, number> = {};
  Object.entries(effectivenessByType).forEach(([type, scores]) => {
    averageByType[type] = scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  // Top 3
  const top3 = Object.entries(averageByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type, score]) => `${type} (${score.toFixed(1)}/10)`);

  // Recommandation combo
  const topTool = Object.entries(averageByType).sort(([, a], [, b]) => b - a)[0]?.[0];
  const secondTool = Object.entries(averageByType).sort(([, a], [, b]) => b - a)[1]?.[0];

  let recommendation = `
🎯 Tes outils top 3: ${top3.join(', ')}

💡 Combo recommandé pour MAX impact:
${topTool} suivi de ${secondTool} (synergie puissante)

📈 Progression: Tes sessions deviennent plus efficaces. Continue!

Fais le combo 2x par semaine pour des résultats exponentiels.
  `;

  return recommendation;
}

/**
 * Appelle Claude API pour générer contenu
 * (NOTE: À connecter avec ta vraie API Key dans Vercel)
 */
async function callClaudeAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      console.error('Error calling Claude:', response.statusText);
      return 'Contenu par défaut - API error';
    }

    const data = await response.json();
    return data.content || 'Contenu généré';
  } catch (error) {
    console.error('Error in callClaudeAPI:', error);
    return 'Contenu par défaut';
  }
}

export default {
  loadUserProfile,
  generatePersonalizedYogaNidra,
  generatePersonalizedHypnosis,
  generatePersonalizedVisualization,
  analyzeAndRecommend,
};
