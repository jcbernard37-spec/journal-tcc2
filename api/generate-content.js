/**
 * API: Génère du contenu thérapeutique personnalisé
 * Utilise Claude API pour créer scripts uniques
 */

export default async function handler(req, res) {
  const { prompt, tool } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requis' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key manquante' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        system: `Tu es un thérapeute expert en:
- Yoga Nidra et relaxation guidée
- Hypnose Ericksonienne
- Visualisations créatrices
- EMDR guidée
- Méditations et affirmations

Génère des scripts thérapeutiques professionnels, personnalisés, et prêts pour synthèse vocale.
Les scripts doivent être:
- Chaleureux et bienveillants
- Basés sur la science
- Adaptés à la personne
- Prêts à lire à haute voix (pas de descriptions techniques)

Écris UNIQUEMENT le script, sans preamble.`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error:', error);
      return res.status(response.status).json({ error: error.error || 'API error' });
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    // 🔍 Log diagnostic temporaire : à retirer une fois le souci identifié
    if (!content) {
      console.error('[DEBUG] Réponse Claude vide. Réponse brute complète:', JSON.stringify(data));
    }

    // Cache le contenu généré
    const cacheKey = `generated_${tool}_${Date.now()}`;
    // NOTE: En production, stocker dans une DB (Redis, Firestore, etc)

    res.status(200).json({
      content,
      cached: false,
      tool,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in generate-content:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
