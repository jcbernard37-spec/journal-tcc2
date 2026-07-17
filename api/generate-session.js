/**
 * Génération IA d'une session personnalisée
 * Script unique à chaque session, basé sur profil + état du jour + genre + âge
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { outil, dureeMin, profil, anamnese, analyse, etatJour, genre, age, prenom } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé manquante' });

  const genreLabel = genre === 'F' ? 'femme' : 'homme';
  const accord = genre === 'F' ? 'e' : '';
  const pronoms = genre === 'F' ? { sujet: 'elle', possessif: 'sa', det: 'une', vouv: 'tu' } : { sujet: 'il', possessif: 'son', det: 'un', vouv: 'tu' };

  const outilsDescriptions = {
    yoga_nidra: 'Yoga Nidra (relaxation guidée profonde avec scan corporel, sankalpa et visualisation)',
    hypnose_relaxation: 'Hypnose Ericksonienne de relaxation profonde',
    hypnose_croyance: 'Hypnose pour changer une croyance limitante',
    hypnose_ressource: 'Hypnose d\'ancrage de ressource intérieure',
    viz_abondance: 'Visualisation créatrice : abondance et manifestation',
    viz_guerison: 'Visualisation créatrice : guérison émotionnelle',
    viz_enfant: 'Visualisation créatrice : rencontre avec l\'enfant intérieur',
    viz_safe: 'Visualisation créatrice : lieu de sécurité intérieure',
    meditation: 'Méditation de bienveillance (Metta)',
    affirmations: 'Session d\'affirmations guidées',
    tapping: 'Tapping EFT',
    coherence: 'Cohérence cardiaque (5 min)',
  };

  const schemasTexte = analyse?.schemas_dominants
    ? analyse.schemas_dominants.map((s) => `${s.nom} (${s.intensite})`).join(', ')
    : 'non analysés';

  const prompt = `Tu es un thérapeute expert combinant TCC, hypnose Ericksonienne, Yoga Nidra, neurosciences (Huberman), pleine conscience (Kabat-Zinn) et suggestion indirecte (Erickson).

PROFIL DE LA PERSONNE :
- Prénom : ${prenom}
- Genre : ${genreLabel}, ${age ? age + ' ans' : 'âge non précisé'}
- Schémas dominants : ${schemasTexte}
- État aujourd'hui : "${etatJour || 'non précisé'}"
- Contexte de vie : ${anamnese?.contexteActuel || 'non renseigné'}
- Ressources : ${anamnese?.ressources || 'non renseignées'}

OUTIL À GÉNÉRER : ${outilsDescriptions[outil] || outil}
DURÉE CIBLE : ${dureeMin} minutes (= ${dureeMin * 60} secondes au total)

CONSIGNES STRICTES :
1. Utilise EXACTEMENT le genre ${genreLabel} pour tous les accords
2. Adresse-toi à ${prenom} directement (tutoiement)
3. Intègre subtilement les schémas de ${prenom} dans les métaphores
4. Chaque session doit être UNIQUE — évite les formules génériques
5. La SOMME des pauses + durée estimée de parole doit atteindre ${dureeMin * 60} secondes
   (Estimation : 1 segment de 15 mots ≈ 8 secondes de parole)
6. Commence doucement, approfondis progressivement, termine avec douceur

TECHNIQUES À INTÉGRER :
- Soupir physiologique Huberman en induction
- Yes Set Ericksonien (3 évidences physiques → acceptation)
- Immersion VAKOG (vue, ouïe, kinesthésie, odorat, goût)
- Suggestions permissives ("tu peux choisir de...")
- Métaphore centrale personnalisée pour ${prenom}

RÉPONDS UNIQUEMENT avec un tableau JSON :
[
  {"texte": "Phrase guidée courte.", "pause": 4000},
  {"texte": "Autre phrase.", "pause": 6000}
]

- "texte" : maximum 25 mots par segment (une pensée à la fois)
- "pause" : millisecondes APRÈS la parole (min 2000, méditation profonde 8000-15000)
- Vise ${Math.round(dureeMin * 60 / 8)} segments environ pour tenir ${dureeMin} minutes
- AUCUN texte avant ou après le JSON`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message });
    }

    const data = await response.json();
    // ⚠️ La réponse peut contenir un bloc "thinking" avant le bloc "text"
    // (réflexion interne du modèle) — il faut chercher le bon bloc plutôt
    // que de supposer que content[0] est toujours le texte.
    const textBlock = data.content?.find((block) => block.type === 'text');
    const raw = textBlock?.text || '';
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const segments = JSON.parse(clean);

    res.status(200).json({ ok: true, segments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
