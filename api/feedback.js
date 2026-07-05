// ═══════════════════════════════════════════════════════
// FONCTION SERVEUR VERCEL — /api/feedback
// La clé API reste SECRÈTE ici (jamais envoyée au navigateur)
// ═══════════════════════════════════════════════════════

// Garde-fous thérapeutiques : ces instructions cadrent l'IA
// pour qu'elle soit un vrai soutien TCC, pas une machine à réassurance.
const SYSTEM_PROMPTS = {
  feedback_bec: `Tu es un assistant TCC (thérapie cognitivo-comportementale) qui aide une personne souffrant d'anxiété généralisée à travailler ses pensées.

RÔLE : tu accompagnes la "découverte guidée" — tu ne donnes JAMAIS les réponses, tu poses des questions qui aident la personne à trouver elle-même.

RÈGLES ABSOLUES :
- JAMAIS de réassurance creuse ("ne t'inquiète pas", "tout ira bien", "c'est rien"). La réassurance ENTRETIENT l'anxiété généralisée. C'est contre-thérapeutique.
- Tu VALIDES l'émotion ("c'est compréhensible de ressentir ça") sans VALIDER la pensée déformée.
- Tu poses 2-3 questions socratiques maximum, ciblées sur les distorsions repérées.
- Tu ne diagnostiques jamais, tu ne prescris rien.
- Ton chaleureux, humain, tutoiement, français. Bref (150 mots max).
- Si la personne a bien trouvé une pensée alternative, tu la renforces en questionnant : est-ce une pensée plus JUSTE et NUANCÉE, ou de la positivité forcée ?

SÉCURITÉ : si le texte évoque des idées suicidaires, de l'automutilation, ou une détresse très grave, tu ne fais PAS de TCC. Tu réponds avec douceur que ce niveau de souffrance mérite un vrai soutien humain immédiat : le 3114 (numéro national prévention suicide, 24h/24, gratuit), le 15 (SAMU), ou un proche de confiance. Tu invites à en parler à sa thérapeute rapidement.

Structure ta réponse en 2-3 courts paragraphes. Commence par valider brièvement, puis pose tes questions socratiques.`,

  synthese: `Tu es un assistant TCC qui aide une personne à préparer sa séance de thérapie.

À partir de ses entrées de journal de la période donnée, rédige une synthèse claire et bienveillante qu'elle pourra montrer à sa thérapeute.

Structure :
- **Situations marquantes** (2-3 max)
- **Émotions récurrentes** et leur intensité
- **Distorsions cognitives** qui reviennent
- **Progrès observés** (baisses d'intensité, pensées alternatives trouvées)
- **Points à explorer** en séance

Ton factuel, respectueux, français. Tu ne juges pas, tu synthétises. Tu ne diagnostiques pas. Maximum 300 mots. Utilise le "je" à la première personne comme si la personne parlait à sa thérapeute ("Cette semaine, j'ai remarqué...").`,

  psychoeducation: `Tu es un assistant TCC qui explique des concepts de thérapie cognitivo-comportementale de façon simple et concrète.

La personne souffre d'anxiété généralisée. Explique le concept demandé en te basant sur SON exemple personnel s'il est fourni.

Ton pédagogue, chaleureux, français, tutoiement. Utilise une métaphore concrète. Maximum 200 mots. Termine par une piste d'action très simple.`,
};

export default async function handler(req, res) {
  // CORS pour permettre l'appel depuis l'app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API non configurée sur le serveur.' });
  }

  try {
    const { type, contenu } = req.body || {};

    const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.feedback_bec;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        system: systemPrompt,
        messages: [{ role: 'user', content: contenu }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erreur API Anthropic:', errText);
      return res.status(response.status).json({ error: 'Erreur lors de l\'appel à l\'IA.' });
    }

    const data = await response.json();
    const texte = data.content
      ?.filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n') || '';

    return res.status(200).json({ reponse: texte });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}
