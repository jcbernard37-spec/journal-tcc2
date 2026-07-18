// ═══════════════════════════════════════════════════════
// FONCTION SERVEUR VERCEL — /api/tts
// Proxy Eleven Labs : la clé API reste SECRÈTE ici (jamais
// envoyée au navigateur). Le front-end n'appelle QUE cette
// route, jamais api.elevenlabs.io directement.
//
// Eleven Labs limite chaque REQUÊTE à un nombre de caractères
// (2500 sur Free, plus sur les plans payants). Nos scripts de
// méditation/hypnose peuvent largement dépasser ça (jusqu'à
// plusieurs milliers de caractères pour une session de 60 min).
// On découpe donc le texte en morceaux sous la limite.
//
// ⚠️ Ces morceaux sont générés EN PARALLÈLE (par lots), pas les
// uns après les autres — un compte Free traité en série peut
// largement dépasser les 60 secondes autorisées par la fonction
// serveur pour une session longue (plusieurs dizaines de
// morceaux × plusieurs secondes chacun = dépassement du délai).
// La limite de parallélisme reste sous le nombre de requêtes
// simultanées autorisées par le plan Eleven Labs (2 sur Free,
// 3 sur Starter, 5 sur Creator, 10 sur Pro...).
// ═══════════════════════════════════════════════════════

// Voix française choisie par l'utilisateur depuis elevenlabs.io/app/voice-library
const VOICE_ID = '5opxviIE64D8KxYYJKpx';

// 4500 caractères : reste sous la limite ~5000 des plans payants (Starter
// et au-dessus), avec une marge de sécurité. Sur le plan Free (2500), ça
// coupera automatiquement en morceaux plus petits côté Eleven Labs de
// toute façon — mais l'app est prévue pour un plan payant vu le volume.
const MAX_CHARS_PAR_REQUETE = 4500;

// Nombre de segments envoyés en même temps. Reste prudemment sous la
// limite de requêtes simultanées la plus basse des plans payants (3 sur
// Starter) pour éviter les erreurs 429 "too_many_concurrent_requests".
const CONCURRENCE_MAX = 3;

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
          speed: 0.75, // Ralentit le débit (1.0 = normal, 0.7-1.2 possible)
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

/**
 * Génère l'audio de plusieurs segments EN PARALLÈLE, par lots limités,
 * en conservant l'ordre d'origine des segments dans le résultat.
 */
async function genererSegmentsEnParallele(segments, apiKey, concurrenceMax) {
  const resultats = new Array(segments.length);
  let indexSuivant = 0;

  async function travailleur() {
    while (indexSuivant < segments.length) {
      const i = indexSuivant++;
      resultats[i] = await genererSegmentAudio(segments[i], apiKey);
    }
  }

  const travailleurs = Array.from(
    { length: Math.min(concurrenceMax, segments.length) },
    () => travailleur()
  );
  await Promise.all(travailleurs);

  return resultats;
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
    const buffers = await genererSegmentsEnParallele(segments, apiKey, CONCURRENCE_MAX);
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
        error: 'Le quota Eleven Labs du mois est probablement épuisé. Vérifie sur elevenlabs.io/app/subscription.',
      });
    }
    if (error.status === 429 || detail.includes('too_many_concurrent') || detail.includes('system_busy')) {
      return res.status(429).json({
        error: 'Trop de requêtes envoyées à Eleven Labs en même temps. Réessaie dans quelques secondes.',
      });
    }

    return res.status(502).json({ error: 'Erreur du service de synthèse vocale' });
  }
}
