/**
 * Analyse IA de l'anamnèse complète
 * Génère : schémas dominants, plan d'action, outils recommandés
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { anamnese, genre, age, prenom } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé API manquante' });

  const genreLabel = genre === 'F' ? 'femme' : 'homme';
  const accord = genre === 'F' ? 'e' : '';

  const prompt = `Tu es un psychologue clinicien expert en TCC (Thérapie Cognitive et Comportementale) et en schémas de Young.

Voici l'anamnèse complète de ${prenom}, ${age ? age + ' ans,' : ''} ${genreLabel} :

${JSON.stringify(anamnese, null, 2)}

Analyse en profondeur et génère un rapport structuré en JSON avec exactement ce format :

{
  "resume": "Paragraphe synthétique de 3-4 phrases sur le profil psychologique de ${prenom}, écrit directement à ${genre === 'F' ? 'elle' : 'lui'} (tutoiement, genre ${genreLabel}).",
  "schemas_dominants": [
    {
      "nom": "Nom du schéma",
      "intensite": "élevée|moyenne|faible",
      "explication": "Comment ce schéma se manifeste chez ${prenom} spécifiquement, en 2 phrases max.",
      "origine": "D'où vient probablement ce schéma selon l'anamnèse."
    }
  ],
  "croyances_limitantes": [
    "Croyance formulée à la première personne (je suis..., je ne peux pas..., etc.)"
  ],
  "ressources_identifiees": [
    "Force ou ressource visible dans l'anamnèse"
  ],
  "plan_action": [
    {
      "semaine": 1,
      "priorite": "Outil ou exercice principal",
      "raison": "Pourquoi commencer par là",
      "outils_solco": ["yoga_nidra", "emdr", "hypnose", "tapping", "coherence", "feuille_bec", "feuille_schemas"]
    }
  ],
  "message_personnel": "Message d'encouragement court et sincère, personnalisé pour ${prenom}, ton bienveillant mais direct. Pas de clichés thérapeutiques."
}

IMPORTANT : 
- Réponds UNIQUEMENT avec le JSON, aucun texte avant ou après
- Utilise le genre ${genreLabel} pour tous les accords
- Sois précis${accord} et ancré${accord} dans CE QUE ${prenom} a répondu, pas des généralités
- Maximum 3 schémas dominants, ordonnés du plus au moins prioritaire
- Le plan d'action doit être sur 4 semaines minimum`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Erreur API Claude' });
    }

    const data = await response.json();
    const raw = data.content[0]?.text || '';

    // Nettoyer le JSON
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analyse = JSON.parse(clean);

    res.status(200).json({ ok: true, analyse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
