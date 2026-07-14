/**
 * Eleven Labs Integration
 * Transforme les scripts en voix naturelle professionnelle
 * Voix: Rachel (féminin doux, bienveillant, thérapeute-style)
 */

// Note: VITE_ELEVEN_LABS_KEY doit être défini dans .env ou Vercel env
let ELEVEN_LABS_API_KEY = '';
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel - Natural, warm, calm

interface AudioCacheEntry {
  text: string;
  audioUrl: string;
  timestamp: number;
  duration?: number;
}

// Cache local pour éviter appels répétés
const audioCache = new Map<string, AudioCacheEntry>();

/**
 * Convertit un texte en audio professionnelle
 * @param text Texte à convertir
 * @param useCache Utilise le cache si disponible
 * @returns URL audio ou null si erreur
 */
export async function textToSpeech(
  text: string,
  useCache = true
): Promise<string | null> {
  // Vérifier le cache
  if (useCache && audioCache.has(text)) {
    const cached = audioCache.get(text)!;
    // Cache valide si moins de 30 jours
    if (Date.now() - cached.timestamp < 30 * 24 * 60 * 60 * 1000) {
      return cached.audioUrl;
    }
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY || '',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5, // Un peu de variation pour plus naturel
            similarity_boost: 0.85, // Très similaire à la voix
            style: 0.5, // Style neutre/thérapeute
            use_speaker_boost: true, // Meilleure qualité
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Eleven Labs error:', response.statusText);
      return null;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Cache l'URL
    audioCache.set(text, {
      text,
      audioUrl,
      timestamp: Date.now(),
    });

    return audioUrl;
  } catch (error) {
    console.error('Error calling Eleven Labs:', error);
    return null;
  }
}

/**
 * Génère l'audio pour une session Yoga Nidra complète
 * Inclut: intro, sankalpa, scan corporel, visualisation, retour
 */
export async function generateYogaNidraAudio(
  duration: 'court' | 'moyen' | 'long',
  personalization?: {
    sankalpa?: string;
    name?: string;
    themes?: string[];
  }
): Promise<string | null> {
  const script = buildYogaNidraScript(duration, personalization);
  return textToSpeech(script);
}

/**
 * Génère l'audio pour une session Hypnose personnalisée
 * Basée sur l'anamnèse et les croyances limitantes
 */
export async function generateHypnosisAudio(
  type: 'relaxation' | 'croyance' | 'ressource',
  context?: {
    croyanceLimitante?: string;
    objectif?: string;
    metaphores?: string[];
  }
): Promise<string | null> {
  const script = buildHypnosisScript(type, context);
  return textToSpeech(script);
}

/**
 * Génère l'audio pour une Visualisation créatrice
 */
export async function generateVisualizationAudio(
  type: string,
  context?: any
): Promise<string | null> {
  const script = buildVisualizationScript(type, context);
  return textToSpeech(script);
}

/**
 * Scripts complets Yoga Nidra
 */
function buildYogaNidraScript(
  duration: 'court' | 'moyen' | 'long',
  personalization?: any
): string {
  const sankalpa = personalization?.sankalpa || 'Je suis en paix';
  const name = personalization?.name || 'Chère amie';

  const shortScript = `
Bienvenue à cette session de Yoga Nidra. Je suis ${name}.

Installe-toi confortablement, allongée ou assise. Les yeux fermés.

Prends trois respirations profondes. Inhale par le nez. Exhale par la bouche. Doucement.

Ton intention pour cette session: "${sankalpa}". Répète-la mentalement trois fois.

Maintenant, observe ton corps. De la tête aux orteils. Sans juger. Juste observer.

Ton front se détend. Tes yeux sont lourds et fermés. Ton cœur bat calmement.

Ressens chaque partie. Ton ventre monte et descend. Tranquille. Paisible.

Une vague de lumière douce t'enveloppe. Tu es complètement en sécurité.

Reste ici. Dans ce silence. Dans cette paix. Quelques minutes.

Maintenant, réveille-toi doucement. Bouge tes orteils. Tes doigts.

Ramène ton attention au présent. Aux bruits autour de toi.

Ouvre les yeux lentement.

Tu reviens complètement ici. Rafraîchie. Énergisée. Portant ton intention avec toi.

Namaste.
  `;

  const mediumScript = `
Bienvenue à cette session Yoga Nidra de 30 minutes. Je suis ${name}.

Prépare-toi. Étends-toi complètement. Jambes légèrement écartées. Bras le long du corps. Paumes vers le haut.

Les yeux fermés naturellement.

Ton intention pour cette profonde détente: "${sankalpa}". Répète-la maintenant. Trois fois. Lentement.

Commençons par ton souffle. Observe l'air entrer par tes narines. Frais. Pur. 

L'air sort. Chaud. Paisible.

Continue à observer sans contrôler. C'est lui qui te respire.

Maintenant, scanne ton corps. De la tête aux pieds.

Ton front. Détend-toi. Tes sourcils se rapprochent puis s'écartent. Plus léger.

Tes yeux. Detendus derrière les paupières.

Ton nez. Ta bouche. Ta mâchoire. Tout se relâche.

Ton cou. Tes épaules descendent loin du crâne.

Ton poitrine. Ton cœur. Ton ventre.

Tes bras. Du bout des doigts jusqu'aux épaules.

Ton dos s'enfonce dans le sol. Lourd. Ancré.

Tes jambes. Tes pieds. Jusqu'au bout des orteils.

Tu es maintenant complètement détenue.

Imagine un paysage sûr. Un endroit où tu te sens absolument protégée.

Peut-être une plage. Une montagne. Une forêt. Ton propre lieu de sécurité.

Vois les couleurs. Entends les sons. Sens les textures.

Tu es ici. Sûre. Paisible.

Reste ici quelques minutes.

Ramène-toi doucement. Bouge tes doigts. Tes orteils.

Réaffirme ton intention: "${sankalpa}".

Ouvre les yeux. Reviens ici. Transformée. Paisible. Pleine d'énergie calme.

Namaste.
  `;

  const longScript = `
Bienvenue à cette profonde session Yoga Nidra de 60 minutes.

Allonge-toi complètement. Confortablement. Prépare-toi pour un voyage intérieur profond.

Ton intention pour cette session: "${sankalpa}". C'est ton Sankalpa. Répète-le mentalement. Trois fois. Lentement. Avec conviction.

Ton intention s'ancre maintenant dans ton subconscient.

Commençons par observer le souffle. Sans le forcer.

Inspire profondément. Exhale complètement. Encore. Et encore.

Maintenant laisse le souffle revenir à son rythme naturel.

Scanner corporel détaillé:

Tes orteils. Énergisés ou détendus? Observe.

La plante de tes pieds. Les talons. Les chevilles.

Tes mollets. Tes genoux. Tes cuisses.

Tes hanches. Ton bassin. Ton ventre.

Ton plexus solaire. Ton cœur. Ta poitrine.

Tes mains. Tes avant-bras. Tes coudes. Tes épaules.

Ton cou. Thy gorge. Ton menton.

Tes lèvres. Ton nez. Tes joues.

Tes yeux. Ton front. Le sommet de ta tête.

Tu as balayé ton corps entier. Chaque cellule se détend.

Maintenant, visualise les opposites:

Tu es légère comme une plume, lourde comme la montagne.

Tu es chaude comme le soleil, fraîche comme la lune.

Tu es joyeuse et triste. Accepte les deux.

Tu es puissante et douce. Les deux existent en toi.

Visualisation paysage:

Imagine maintenant ton lieu parfait de sécurité absolue.

Un endroit où personne ne peut te juger. Où tu es complètement libre.

Vois chaque détail. Les couleurs. La lumière.

Entends les sons. Un oiseau? L'eau? Le vent?

Sens les odeurs. Sens les textures sous ta peau.

Reste ici. Dans ce lieu sacré. Plusieurs minutes.

Tu portes ce sanctuaire toujours en toi.

Progressivement, ramène ton attention au présent.

Sens ton corps. Sur le sol. Complètement ancré.

Bouge doucement. Tes doigts. Tes orteils. Ton cou.

Étire-toi légèrement. Réveille-toi graduellement.

Ton Sankalpa t'accompagne maintenant: "${sankalpa}".

Ouvre tes yeux. Doucement.

Tu es ici. Transformée. Régénérée. Pleine d'énergie paisible.

Namaste. Tu es la paix.
  `;

  return duration === 'court' ? shortScript : duration === 'moyen' ? mediumScript : longScript;
}

/**
 * Scripts Hypnose Ericksonienne
 */
function buildHypnosisScript(type: 'relaxation' | 'croyance' | 'ressource', context?: any): string {
  const croyance = context?.croyanceLimitante || '';
  const objectif = context?.objectif || '';

  const relaxationScript = `
Bienvenue. Je suis heureuse de t'accompagner dans cette induction de relaxation profonde.

Installe-toi confortablement. Tu peux fermer les yeux maintenant ou garder un regard mou devant toi.

Nous allons passer les prochaines minutes à détendre chaque partie de ton corps.

Commence par te concentrer sur ta respiration. C'est la seule chose que tu dois faire.

Inspire lentement. Compte jusqu'à quatre. Un, deux, trois, quatre.

Retiens-le. Un, deux, trois, quatre.

Exhale lentement. Un, deux, trois, quatre.

Parfait. Continue ce rythme. Naturellement. Sans effort.

Avec chaque respiration, tu descends plus profondément dans la détente.

Visualise une lumière dorée qui entre par tes narines avec chaque inspiration.

Cette lumière remplit ton corps. Elle le réchauffe. Elle le détend.

Tes muscles se relâchent. Tes pensées deviennent douces et floues.

Tu peux entendre ma voix, mais elle vient de très loin. Comme un écho agréable.

Avec chaque expiration, tu laisses aller les tensions. La peur. Le stress.

Tout cela quitte ton corps maintenant.

Tu es en sécurité. Tu es aimée. Tu es complètement protégée.

Tu peux rester ici aussi longtemps que tu le souhaites.

Quelques minutes. Ou plus.

Quand tu es prête à revenir, tu comptes lentement de un à cinq.

A cinq, tu ouvres les yeux. Rafraîchie. Énergisée. Reconnaissante.

Merci. Namaste.
  `;

  const croyanceScript = `
Bienvenue. Nous allons voyager ensemble dans les profondeurs de ta conscience.

Aujourd'hui, nous changeons une croyance qui ne te sert plus.

"${croyance}"

Cette croyance vient d'un moment passé. Elle t'a protégée autrefois. Mais elle t'emprisonne maintenant.

Ferme les yeux. Et imagines une porte.

Cette porte est belle. Elle brille doucement.

De l'autre côté de cette porte, tu es libre. Tu es capable. Tu es digne.

Mais d'abord, nous devons dire au revoir à l'ancienne croyance.

Remercie-la. "Merci de m'avoir protégée. Je ne t'ai plus besoin maintenant."

Maintenant, ouvre la porte.

De l'autre côté, il y a un jardin magnifique.

Des fleurs blooming. Des arbres forts. De l'eau claire.

Tu marches dans ce jardin. Et tu réalises quelque chose.

Chaque défi que tu as surmonté t'a rendu plus forte.

Chaque moment difficile t'a enseigné une leçon.

Chaque échec apparent était un apprentissage.

Tu n'es pas incapable. Tu es compétente. Tu as toujours été capable.

Les preuves sont partout. Regarde autour de toi dans ce jardin.

Chaque fleur représente une victoire. Un moment où tu as réussi. Où tu étais assez bonne.

Il y a tellement de fleurs.

Tu commences à sentir une nouvelle croyance émerger.

"${objectif || 'Je suis capable. Je suis digne. Je suis assez.'}"

Répète cette nouvelle vérité. Plusieurs fois.

Sentis-la s'enraciner en toi. Comme les racines des arbres du jardin.

Tu es profondément ancrée dans cette nouvelle croyance maintenant.

Quand tu reviendras, tu l'emporteras avec toi.

Compte lentement de un à cinq. Et reviens.

À cinq, ouvre les yeux. Nouvelle. Transformée. Libérée.

Merci.
  `;

  const ressourceScript = `
Bienvenue. Aujourd'hui, nous allons accéder à tes ressources profondes.

Tes moments de puissance. Tes forces innées.

Ferme les yeux. Prends une respiration profonde.

Pense à un moment dans ta vie où tu te sentais absolument puissante.

Peut-être était-ce quand tu surmontas une peur.

Ou quand tu réussis quelque chose d'important.

Ou simplement un moment où tu te sentais complètement toi-même.

Ramène ce souvenir maintenant.

Vois chaque détail. Les couleurs. La lumière.

Entends les sons autour de toi.

Sens les textures. L'air sur ta peau.

Et surtout, ressens l'émotion. La puissance. La confiance. La fierté.

Approche-toi de ce moment. Entre dedans complètement.

Tu ES ce moment. Tu ES cette puissance.

Et maintenant, nous allons créer un trigger. Un signal que tu peux utiliser n'importe quand.

Peut-être un geste. Un mot. Une image mentale.

Quand tu utilises ce trigger, tu reviens instantanément à cette puissance.

Essaie maintenant. Utilise ton trigger. Et ressens la puissance revenir.

Oui. C'est ça. Tu l'as. Cette puissance est toujours en toi.

Tu peux la retrouver n'importe quand. Partout.

Elle est ton droit de naissance.

Compte lentement. Un, deux, trois, quatre, cinq.

Ouvre les yeux. Et porte cette puissance avec toi.

Elle t'appartient. Maintenant et toujours.

Merci.
  `;

  return type === 'relaxation' ? relaxationScript : type === 'croyance' ? croyanceScript : ressourceScript;
}

/**
 * Scripts Visualisations
 */
function buildVisualizationScript(type: string, context?: any): string {
  const scripts: Record<string, string> = {
    abondance: `
Ferme tes yeux. Respire profondément.

Imagine maintenant une vie d'abondance. Complète. Totale.

Tu vois ton rêve réalisé. C'est déjà là.

La carrière que tu voulais. La relation que tu mérites. La santé que tu cultives.

Ressens cette abondance. Dans chaque cellule.

Comment cela fait-il? Comment te sens-tu maintenant que c'est réalisé?

Gratitude. Paix. Complètude.

Reste ici. Dans cette vibration d'abondance.

Cet univers généreux. Qui donne. Qui honore ton intention.

Tu mérites cette abondance.

Accepte-la maintenant. Complètement.

C'est déjà tien.
    `,
    guerison: `
Ferme tes yeux. Respire lentement.

Visualise maintenant une personne ou une situation qui te fait mal.

Vois-la clairement. Sans peur.

Tu es maintenant prête à guérir cette blessure.

Une lumière dorée apparaît. Elle enveloppe cette personne. Cette situation.

Elle enveloppe aussi ton cœur.

Et tu dis: "Je te pardonne. Et je me pardonne."

"Je libère cette douleur maintenant."

Sens la légèreté. L'espace qui se crée.

Tu es libre. Enfin libre.

La guérison est complète.

Tu portes cette liberté avec toi.
    `,
    enfant: `
Ferme tes yeux. Respirations profondes.

Imagine maintenant une porte. Douce. Accueillante.

De l'autre côté, ton enfant intérieur t'attend.

Tu ouvres la porte.

Et tu la vois. Ou tu le vois. Petit. Innocent. Attendant.

Tu t'approches lentement. Avec beaucoup de douceur.

"Je suis venue te retrouver," tu dis.

"Je sais que tu as eu peur. Que tu as souffert."

"Mais maintenant, tu ne es pas seule."

"Je suis ici. Pour te protéger. Pour t'aimer."

Et tu la prends dans tes bras. Tendrement.

Tu sens sa chaleur. Son besoin d'être aimée.

Et tu lui dis tout ce qu'elle devait entendre:

"Tu es assez. Tu es digne. Tu es aimée."

Elle sourit. Ou elle pleure. Ou elle rit.

C'est du soulagement.

Vous restez ensemble quelques minutes.

Puis elle te dit quelque chose. Écoute.

C'est important pour toi.

Merci, dit-elle. Et elle devient une part de toi. Complètement intégrée.
    `,
  };

  return scripts[type] || scripts['abondance'];
}

export default textToSpeech;
