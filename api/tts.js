// ═══════════════════════════════════════════════════════
// FONCTION SERVEUR VERCEL — /api/tts
// Proxy Eleven Labs : la clé API reste SECRÈTE ici (jamais
// envoyée au navigateur). Le front-end n'appelle QUE cette
// route, jamais api.elevenlabs.io directement.
//
// Eleven Labs limite chaque REQUÊTE à 2500 caractères sur le
// plan Free (5000 sur les plans payants). Nos scripts de
// méditation/hypnose peuvent largement dépasser ça (jusqu'à
// plusieurs milliers de caractères pour une session de 60 min).
// On découpe donc le texte en morceaux sous la limite, on
// génère l'audio de chaque morceau séparément, puis on les
// recolle en un seul fichier avant de le renvoyer.
// ═══════════════════════════════════════════════════════

// Voix par défaut : Rachel (voix anglaise, d'où l'accent en français).
// 👉 Pour une voix nativement française, remplace cet ID par celui d'une
// voix trouvée sur elevenlabs.io/app/voice-library (filtrer par langue
// "French"), copiable via le bouton "..." → "Copy Voice ID" sur la voix
// choisie, ou via l'onglet "Voix" du compte.
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel - Natural, warm, calm

// Reste sous la limite de 2500 caractères du plan Free, avec une bonne
// marge de sécurité (certains caractères spéciaux/accents comptent parfois
// double selon l'encodage facturé).
const MAX_CHARS_PAR_REQUETE = 2200;

/**
 * Découpe un texte en morceaux sous la limite, en coupant proprement à la
 * fin d'une phrase (point, retour à la ligne) plutôt qu'en plein milieu
 * d'un mot, pour que chaque morceau reste audible naturellement.
 */
function decouperTexte(texte, maxLen) {
  const segments = [];
  let reste = texte.trim();

  while (reste.length > maxLen) {
    const zoneCoupe = reste.slice(0, maxLen);
    let coupure = Math.max(
      zoneCoupe.lastIndexOf('. '),
      zoneCoupe.lastIndexOf('.\n'),
      zoneCoupe.lastIndexOf('\n\n')
    );
    // Si aucune coupure naturelle trouvée assez loin, coupe au dernier espace
    if (coupure < maxLen * 0.4) {
      coupure = zoneCoupe.lastIndexOf(' ');
    }
    // Dernier recours : coupe brute
    if (coupure < 1) {
      coupure = maxLen;
    } else {
      coupure += 1; // inclut le point/espace dans le segment
    }

    segments.push(reste.slice(0, coupure).trim());
    reste = reste.slice(coupure).trim();
  }

  if (reste) segments.push(reste);
  return segments;
}

async function genererSegmentAudio(texte, apiKey) {
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
        text: texte,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.85,
          style: 0.5,
          use_speaker_boost: true,
          speed: 0.85, // Ralentit le débit (1.0 = normal, 0.7-1.2 possible)
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    const err = new Error(`Eleven Labs error ${response.status}: ${errText}`);
    err.status = response.status;
    err.detail = errText;
    throw err;
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { text } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Texte requis' });
  }

  // Garde-fou : évite d'envoyer des payloads totalement démesurés
  if (text.length > 30000) {
    return res.status(400).json({ error: 'Texte trop long' });
  }

  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    console.error('[Solco] ELEVEN_LABS_API_KEY manquante côté serveur.');
    return res.status(500).json({ error: 'Voix Pro indisponible pour le moment' });
  }

  const segments = decouperTexte(text, MAX_CHARS_PAR_REQUETE);

  try {
    const buffers = [];
    for (const segment of segments) {
      const buffer = await genererSegmentAudio(segment, apiKey);
      buffers.push(buffer);
    }

    const audioComplet = Buffer.concat(buffers);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioComplet);
  } catch (error) {
    console.error('Eleven Labs error:', error.status || '', error.detail || error.message);

    // Message plus parlant si c'est un souci de quota/crédits épuisés
    const detail = (error.detail || '').toLowerCase();
    if (error.status === 401 || detail.includes('quota') || detail.includes('credit')) {
      return res.status(402).json({
        error: 'Le quota Eleven Labs du mois est probablement épuisé (plan Free = 10 000 caractères/mois). Vérifie sur elevenlabs.io/app/subscription.',
      });
    }

    return res.status(502).json({ error: 'Erreur du service de synthèse vocale' });
  }
}
