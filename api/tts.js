// ═══════════════════════════════════════════════════════
// FONCTION SERVEUR VERCEL — /api/tts
// Proxy Eleven Labs : la clé API reste SECRÈTE ici (jamais
// envoyée au navigateur). Le front-end n'appelle QUE cette
// route, jamais api.elevenlabs.io directement.
// ═══════════════════════════════════════════════════════

const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel - Natural, warm, calm

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { text } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Texte requis' });
  }

  // Garde-fou basique : évite d'envoyer des payloads démesurés à l'API
  if (text.length > 20000) {
    return res.status(400).json({ error: 'Texte trop long' });
  }

  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    console.error('[Solco] ELEVEN_LABS_API_KEY manquante côté serveur.');
    return res.status(500).json({ error: 'Voix Pro indisponible pour le moment' });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.85,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Eleven Labs error:', response.status, errText);
      return res.status(502).json({ error: 'Erreur du service de synthèse vocale' });
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (error) {
    console.error('Error calling Eleven Labs:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
