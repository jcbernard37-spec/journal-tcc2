// ═══════════════════════════════════════════════════════
// TOUT LE CONTENU TCC — émotions, distorsions, schémas, feuilles
// ═══════════════════════════════════════════════════════

export const EMOTIONS: { categorie: string; couleur: string; liste: string[] }[] = [
  {
    categorie: 'Peur / Alarme', couleur: '#B5544D',
    liste: ['Panique', 'Terreur', 'Effroi', 'Épouvante', 'Frayeur', 'Angoisse', 'Appréhension sombre', 'Crainte', 'Inquiétude intense', 'Nervosité', 'Stress', 'Alarme', 'Vigilance extrême', 'Peur diffuse', 'Frousse'],
  },
  {
    categorie: 'Anxiété / Appréhension', couleur: '#C9835A',
    liste: ['Anxiété', 'Appréhension', 'Inquiétude', 'Préoccupation', 'Tension', 'Agitation', 'Malaise', 'Doute', 'Incertitude anxieuse', 'Tension nerveuse', 'Agitation interne', 'Fébrilité', 'Anticipation anxieuse', 'Sentiment d\'urgence', 'Nervosité sourde'],
  },
  {
    categorie: 'Tristesse / Déception', couleur: '#46607A',
    liste: ['Tristesse', 'Mélancolie', 'Déprime', 'Morosité', 'Déception', 'Amertume', 'Chagrin', 'Perte de sens', 'Apathie', 'Désespoir', 'Abattement', 'Découragement', 'Nostalgie douloureuse', 'Peine', 'Vague à l\'âme'],
  },
  {
    categorie: 'Frustration / Irritabilité', couleur: '#A0522D',
    liste: ['Irritabilité', 'Colère', 'Rage', 'Agacement', 'Exaspération', 'Impatience', 'Ressentiment', 'Contrariété', 'Agression intérieure', 'Énervement', 'Fureur contenue', 'Hostilité', 'Indignation', 'Rancune'],
  },
  {
    categorie: 'Culpabilité / Honte', couleur: '#7A5C46',
    liste: ['Culpabilité', 'Honte', 'Embarras', 'Humiliation', 'Regret', 'Remords', 'Indignité', 'Auto-reproche', 'Sentiment de défaillance', 'Autodépréciation', 'Gêne', 'Sentiment d\'imposture', 'Mortification'],
  },
  {
    categorie: 'Impuissance / Désespoir', couleur: '#5C5470',
    liste: ['Impuissance', 'Désespoir', 'Résignation', 'Abandon', 'Absence d\'espoir', 'Fatalisme', 'Perte de contrôle', 'Vide', 'Néant intérieur', 'Épuisement moral', 'Accablement', 'Découragement profond'],
  },
  {
    categorie: 'Confusion / Dissonance', couleur: '#6B7A8A',
    liste: ['Confusion', 'Perplexité', 'Doute cognitif', 'Dissonance', 'Ambivalence', 'Indécision', 'Perte de repères', 'Désorientation', 'Brouillard mental', 'Tiraillement', 'Hésitation paralysante'],
  },
  {
    categorie: 'Sensations physiques', couleur: '#4A7A6F',
    liste: ['Boule au ventre', 'Oppression thoracique', 'Tension musculaire', 'Palpitations', 'Faiblesse', 'Tremblements', 'Sueurs', 'Vertiges', 'Étourdissements', 'Fourmillements', 'Engourdissement', 'Lourdeur', 'Gorge serrée', 'Nausée', 'Souffle court', 'Mâchoire crispée'],
  },
  {
    categorie: 'Émotions positives (à noter aussi !)', couleur: '#5B8C5A',
    liste: ['Soulagement', 'Calme', 'Fierté', 'Joie', 'Gratitude', 'Espoir', 'Sérénité', 'Confiance', 'Curiosité', 'Enthousiasme', 'Tendresse', 'Apaisement', 'Satisfaction', 'Légèreté'],
  },
];

export const DISTORSIONS = [
  { nom: 'Catastrophisation', def: 'Sauter au pire scénario possible sans preuve.', ex: '« J\'ai mal à la tête → et si c\'était une tumeur ? »', questions: ['Quel est le risque RÉEL vs le pire scénario ?', 'Y a-t-il une explication plus banale et plus probable ?', 'Si ça arrivait, comment pourrais-je y faire face ?'] },
  { nom: 'Généralisation excessive', def: 'Un événement isolé devient « toujours » ou « jamais ».', ex: '« J\'ai raté cet entretien → je rate toujours tout. »', questions: ['C\'est vraiment TOUS les cas ? Aucune exception ?', 'Quelles preuves du contraire est-ce que j\'ignore ?'] },
  { nom: 'Pensée tout-ou-rien', def: 'Pas de nuances : soit parfait, soit nul.', ex: '« Si ce n\'est pas parfait, c\'est un échec total. »', questions: ['Où suis-je RÉELLEMENT entre ces deux extrêmes ?', 'Sur une échelle de 0 à 10, ça vaut combien vraiment ?'] },
  { nom: 'Filtre mental', def: 'Ne garder que le négatif et filtrer tout le positif.', ex: '« 9 retours positifs, 1 critique → je ne pense qu\'à la critique. »', questions: ['Qu\'est-ce que j\'ignore ou minimise en ce moment ?', 'Que dirais-je à un ami dans la même situation ?'] },
  { nom: 'Lecture de pensée', def: 'Être certain de ce que les autres pensent (en négatif).', ex: '« Il n\'a pas répondu → il est fâché contre moi. »', questions: ['Comment est-ce que je SAIS ce qu\'il pense ?', 'Quelles autres explications sont possibles ?'] },
  { nom: 'Prédiction négative', def: 'Prédire l\'avenir en noir, sans preuve.', ex: '« Ça va forcément mal se passer demain. »', questions: ['Sur quoi je base cette certitude ?', 'Mes prédictions passées se sont réalisées combien de fois ?'] },
  { nom: 'Amplification', def: 'Exagérer l\'importance ou l\'impact d\'un événement.', ex: '« Cette erreur au travail est une catastrophe absolue. »', questions: ['Sur une échelle de 0 à 100, où c\'est VRAIMENT ?', 'Dans 1 mois, dans 1 an, j\'y penserai encore ?'] },
  { nom: 'Minimisation', def: 'Réduire l\'importance de ses réussites et qualités.', ex: '« J\'ai réussi, mais c\'était facile, ça ne compte pas. »', questions: ['Pourquoi je réduis mes accomplissements ?', 'Si un ami avait fait ça, je dirais quoi ?'] },
  { nom: 'Responsabilisation excessive', def: 'Se tenir responsable de choses hors de son contrôle.', ex: '« S\'il est de mauvaise humeur, c\'est forcément ma faute. »', questions: ['Quels facteurs je contrôle VRAIMENT ici ?', 'Était-ce raisonnablement prévisible ?'] },
  { nom: 'Étiquetage', def: 'Se réduire à une étiquette au lieu de décrire un comportement.', ex: '« Je suis un raté » au lieu de « j\'ai échoué à cette tâche ».', questions: ['Est-ce QUI JE SUIS ou ce que j\'AI FAIT une fois ?', 'Comment reformuler avec « j\'ai... » plutôt que « je suis... » ?'] },
  { nom: 'Devoir / obligation rigide', def: 'Des « je dois » et « il faut » écrasants et non questionnés.', ex: '« Je DOIS tout prévoir, sinon je suis irresponsable. »', questions: ['Qu\'arrive-t-il VRAIMENT si je ne le fais pas ?', 'Obligation réelle... ou choix déguisé en obligation ?'] },
  { nom: 'Personnalisation', def: 'Tout ramener à soi, même ce qui ne nous concerne pas.', ex: '« Ils rient là-bas → c\'est sûrement de moi. »', questions: ['Quels autres facteurs existent dans LEUR vie ?', 'Quelle preuve ai-je que ça me concerne ?'] },
];

// Les 18 schémas de Young, regroupés en 5 familles.
// `famille` sert à les organiser visuellement dans l'app.
export const FAMILLES_SCHEMAS = [
  { id: 'rejet', nom: 'Séparation & rejet', besoin: 'Le besoin de sécurité affective, de lien stable et d\'acceptation.' },
  { id: 'autonomie', nom: 'Manque d\'autonomie', besoin: 'Le besoin de se sentir capable, autonome et en sécurité dans le monde.' },
  { id: 'limites', nom: 'Manque de limites', besoin: 'Le besoin de limites réalistes et de responsabilité envers les autres.' },
  { id: 'autres', nom: 'Orientation vers les autres', besoin: 'Le besoin de tenir compte de ses propres besoins, pas seulement de ceux des autres.' },
  { id: 'survigilance', nom: 'Survigilance & inhibition', besoin: 'Le besoin de spontanéité, de jeu et d\'expression de ses émotions.' },
];

export const SCHEMAS = [
  // ── 1. Séparation & rejet ──
  { id: 'abandon', famille: 'rejet', nom: 'Abandon / instabilité', croyance: '« Les gens que j\'aime vont finir par partir. »', signes: 'Peur du rejet, besoin de réassurance affective, angoisse quand un proche s\'éloigne.' },
  { id: 'mefiance', famille: 'rejet', nom: 'Méfiance / abus', croyance: '« On va finir par me trahir ou me faire du mal. »', signes: 'Difficulté à faire confiance, vigilance envers les intentions des autres, sentiment d\'avoir été trahi.' },
  { id: 'manque_affectif', famille: 'rejet', nom: 'Manque affectif (carence)', croyance: '« Mes besoins d\'affection ne seront jamais vraiment comblés. »', signes: 'Sentiment de vide, impression que personne ne comprend, difficulté à recevoir de la tendresse.' },
  { id: 'imperfection', famille: 'rejet', nom: 'Imperfection / honte', croyance: '« Il y a quelque chose qui cloche en moi, je ne suis pas assez bien. »', signes: 'Honte, critique interne sévère, peur d\'être découvert « tel qu\'on est vraiment ».' },
  { id: 'isolement', famille: 'rejet', nom: 'Isolement social', croyance: '« Je suis différent, à l\'écart, je n\'appartiens à aucun groupe. »', signes: 'Sentiment de ne pas être à sa place, retrait, impression d\'être un étranger partout.' },

  // ── 2. Manque d'autonomie ──
  { id: 'dependance', famille: 'autonomie', nom: 'Dépendance / incompétence', croyance: '« Je ne peux pas faire face seul, j\'ai besoin des autres pour y arriver. »', signes: 'Besoin constant de validation, difficulté à décider seul, sentiment d\'être dépassé.' },
  { id: 'vulnerabilite', famille: 'autonomie', nom: 'Vulnérabilité au danger', croyance: '« Le monde est dangereux, une catastrophe peut arriver à tout moment. »', signes: 'Vigilance excessive, catastrophisation, surprotection de soi et des proches.' },
  { id: 'fusion', famille: 'autonomie', nom: 'Fusion / personnalité atrophiée', croyance: '« Je n\'existe pas vraiment sans l\'autre, nos vies sont fondues. »', signes: 'Difficulté à se définir seul, sentiment de vide loin de l\'autre, identité mêlée à celle d\'un proche.' },
  { id: 'echec', famille: 'autonomie', nom: 'Échec', croyance: '« Je vais échouer, je suis moins capable que les autres. »', signes: 'Anticipation de l\'échec, comparaison défavorable, sabotage, procrastination.' },

  // ── 3. Manque de limites ──
  { id: 'grandiosite', famille: 'limites', nom: 'Droits personnels exagérés', croyance: '« Les règles ordinaires ne devraient pas s\'appliquer à moi. »', signes: 'Impatience, difficulté avec les contraintes, sentiment d\'être spécial ou au-dessus.' },
  { id: 'autocontrole', famille: 'limites', nom: 'Manque d\'autocontrôle', croyance: '« Je n\'arrive pas à me contenir ou à tenir mes engagements. »', signes: 'Impulsivité, difficulté à supporter la frustration, abandon des efforts qui demandent de la discipline.' },

  // ── 4. Orientation vers les autres ──
  { id: 'assujettissement', famille: 'autres', nom: 'Assujettissement', croyance: '« Je dois faire ce que les autres attendent, sinon il y aura un conflit ou un rejet. »', signes: 'Difficulté à dire non, à exprimer ses désirs, soumission pour éviter les tensions.' },
  { id: 'sacrifice', famille: 'autres', nom: 'Sacrifice de soi', croyance: '« Mes besoins passent après ceux des autres ; je dois aider, soutenir, réparer. »', signes: 'Se dévouer au point de s\'épuiser, se sentir responsable du bien-être d\'autrui, ressentiment silencieux. C\'est le schéma du « sauveur ».' },
  { id: 'approbation', famille: 'autres', nom: 'Recherche d\'approbation', croyance: '« Ma valeur dépend du regard et de la reconnaissance des autres. »', signes: 'Besoin de plaire, décisions guidées par l\'image renvoyée, sensibilité extrême à la critique.' },

  // ── 5. Survigilance & inhibition ──
  { id: 'negativite', famille: 'survigilance', nom: 'Négativité / pessimisme', croyance: '« Ça va forcément mal tourner, autant m\'y préparer. »', signes: 'Focalisation sur le négatif, inquiétude chronique, difficulté à savourer le positif.' },
  { id: 'surcontrole', famille: 'survigilance', nom: 'Surcontrôle émotionnel', croyance: '« Je dois garder le contrôle, ne pas montrer ce que je ressens. »', signes: 'Émotions retenues, spontanéité bridée, peur de « lâcher » ou de perdre la maîtrise.' },
  { id: 'ideaux', famille: 'survigilance', nom: 'Idéaux exigeants / perfectionnisme', croyance: '« Je dois être parfait et performant, sinon je ne vaux rien. »', signes: 'Perfectionnisme, autocritique, pression permanente, difficulté à se sentir « assez ».' },
  { id: 'punition', famille: 'survigilance', nom: 'Punition', croyance: '« Les erreurs méritent d\'être punies — les miennes comme celles des autres. »', signes: 'Intolérance à l\'erreur, dureté envers soi, difficulté à pardonner et à nuancer.' },
];

export const COMPORTEMENTS_SECURITE = [
  'Vérifier plusieurs fois (portes, mails, symptômes...)',
  'Demander de la réassurance à un proche',
  'Chercher mes symptômes sur Internet',
  'Éviter une situation qui m\'angoisse',
  'Sur-préparer / sur-planifier',
  'Ruminer « pour trouver la solution »',
  'Procrastiner une décision',
  'Relire mes messages plusieurs fois avant d\'envoyer',
  'Garder mon téléphone toujours à portée « au cas où »',
  'Annuler un engagement au dernier moment',
  'Consommer du contenu anxiogène en boucle',
];

export const GAD7_QUESTIONS = [
  'Se sentir nerveux·se, anxieux·se ou à bout',
  'Ne pas réussir à arrêter de s\'inquiéter ou à contrôler ses inquiétudes',
  'S\'inquiéter trop à propos de différentes choses',
  'Avoir du mal à se détendre',
  'Être si agité·e qu\'il est difficile de rester en place',
  'Être facilement contrarié·e ou irritable',
  'Avoir peur que quelque chose de terrible arrive',
];

export function interpretationGAD7(score: number): { niveau: string; conseil: string } {
  if (score <= 4) return { niveau: 'Anxiété minimale', conseil: 'Continue à observer tes ressentis, c\'est déjà un excellent réflexe.' };
  if (score <= 9) return { niveau: 'Anxiété légère', conseil: 'Les outils de ce journal peuvent t\'aider à consolider ton équilibre.' };
  if (score <= 14) return { niveau: 'Anxiété modérée', conseil: 'Un travail régulier avec ces outils et un suivi professionnel est recommandé.' };
  return { niveau: 'Anxiété sévère', conseil: 'Parle de ce score à un professionnel de santé : tu mérites un vrai accompagnement.' };
}

// ═══════════════════════════════════════════════════════
// LES 10 FEUILLES — définies en données, rendues par un moteur générique
// ═══════════════════════════════════════════════════════

export type ChampFeuille =
  | { type: 'texte'; id: string; label: string; aide?: string; placeholder?: string }
  | { type: 'zone'; id: string; label: string; aide?: string; placeholder?: string }
  | { type: 'curseur'; id: string; label: string; aide?: string }
  | { type: 'emotions'; id: string; label: string; aide?: string }
  | { type: 'distorsions'; id: string; label: string; aide?: string }
  | { type: 'choix'; id: string; label: string; options: string[]; aide?: string };

export interface Feuille {
  slug: string;
  titre: string;
  icone: string;
  couleur: string;
  accroche: string;
  pourquoi: string;
  exemple?: string;
  champs: ChampFeuille[];
}

export const FEUILLES: Feuille[] = [
  {
    slug: 'bec',
    titre: 'Tableau BEC — le journal de pensées',
    icone: '📋', couleur: '#4A7A6F',
    accroche: 'L\'outil central de la TCC : relier situation, émotion et pensée pour reprendre du recul.',
    pourquoi: 'Quand une émotion forte surgit, elle est déclenchée par une pensée automatique, souvent invisible. En l\'écrivant noir sur blanc, tu la rends visible — et tu peux enfin la questionner au lieu de la subir.',
    exemple: 'Situation : « Mon chef m\'a demandé de passer le voir demain. » → Émotion : anxiété (75/100) → Pensée automatique : « Je vais me faire licencier. » → Pensée alternative : « Il me convoque régulièrement pour des points d\'organisation. Aucun élément concret n\'indique un problème. »',
    champs: [
      { type: 'zone', id: 'situation', label: '1. La situation', aide: 'Décris les faits objectivement : quoi, où, quand, avec qui. Comme une caméra qui filme, sans interprétation.', placeholder: 'Ex. : hier soir à 21h, ma fille a toussé plusieurs fois...' },
      { type: 'emotions', id: 'emotions', label: '2. Mes émotions', aide: 'Clique sur toutes celles qui correspondent. Nommer précisément une émotion réduit déjà son intensité.' },
      { type: 'curseur', id: 'intensite', label: '3. Intensité globale (0-100)' },
      { type: 'zone', id: 'pensee_auto', label: '4. Ma pensée automatique', aide: 'Qu\'est-ce qui a traversé ton esprit à ce moment-là ? Souvent une phrase en « et si... » ou « je suis... ».', placeholder: 'Ex. : et si c\'était grave et que je ne m\'en rendais pas compte ?' },
      { type: 'distorsions', id: 'distorsions', label: '5. Les pièges de pensée que je repère', aide: 'Coche les distorsions présentes dans ta pensée automatique. Les reconnaître, c\'est déjà les désamorcer.' },
      { type: 'zone', id: 'pensee_alternative', label: '6. Ma pensée alternative', aide: 'Pas une pensée « positive forcée » : une pensée plus juste, plus complète. Que dirais-tu à ton meilleur ami ?', placeholder: 'Ex. : une toux chez un enfant est banale ; je surveille, et je consulte si ça persiste...' },
      { type: 'curseur', id: 'intensite_apres', label: '7. Intensité après (0-100)', aide: 'Réévalue ton émotion maintenant. Même une baisse de 10 points est une victoire.' },
    ],
  },
  {
    slug: 'actionnable',
    titre: 'Arbre « Actionnable ou pas ? »',
    icone: '🌳', couleur: '#5B8C5A',
    accroche: 'Le tri décisif : cette inquiétude appelle-t-elle une action... ou une acceptation ?',
    pourquoi: 'L\'anxiété généralisée mélange tout : les vrais problèmes (qui ont une solution) et les inquiétudes hypothétiques (qui n\'en ont pas). Cet arbre les sépare. Actionnable → un petit pas concret. Pas actionnable → lâcher-prise assumé.',
    exemple: '« Je dois rendre un dossier vendredi » → actionnable → premier pas : bloquer 1h demain matin. « Et si mes filles tombaient malades cet hiver ? » → pas actionnable maintenant → je note, je respire, je reviens au présent.',
    champs: [
      { type: 'zone', id: 'inquietude', label: 'Mon inquiétude', placeholder: 'Écris-la telle qu\'elle tourne dans ta tête...' },
      { type: 'choix', id: 'verdict', label: 'Est-ce que je peux agir dessus, concrètement, maintenant ou bientôt ?', options: ['✅ Oui, c\'est actionnable', '⏳ Oui, mais pas maintenant (je planifie)', '🍃 Non, c\'est hors de mon contrôle'] },
      { type: 'zone', id: 'action', label: 'Si actionnable : mon premier petit pas', aide: 'Un pas si petit qu\'il est impossible de ne pas le faire. Avec un quand.', placeholder: 'Ex. : demain 9h, j\'appelle pour prendre le rendez-vous.' },
      { type: 'zone', id: 'lacher', label: 'Si non actionnable : ma phrase de lâcher-prise', aide: 'Formule ce que tu choisis d\'accepter, sans t\'obliger à « ne plus y penser ».', placeholder: 'Ex. : je ne peux pas contrôler ça. Je choisis de revenir à ce que je fais maintenant.' },
    ],
  },
  {
    slug: 'parking',
    titre: 'Parking à inquiétudes',
    icone: '🅿️', couleur: '#46607A',
    accroche: 'Note ton inquiétude, gare-la, et donne-lui rendez-vous plus tard — à TON heure.',
    pourquoi: 'La rumination adore l\'urgence : « il faut y penser MAINTENANT ». En réalité, reporter une inquiétude à un créneau fixe (15 min/jour) casse ce réflexe. La plupart des inquiétudes garées ont perdu leur force quand le rendez-vous arrive.',
    exemple: 'Il est 23h, une pensée surgit : « et le budget du déménagement ? ». Au lieu d\'y passer la nuit → je la gare, rendez-vous demain 18h30. Demain 18h30 : soit elle est devenue un vrai sujet (→ arbre actionnable), soit elle s\'est dégonflée toute seule.',
    champs: [
      { type: 'texte', id: 'creneau', label: 'Mon créneau d\'inquiétude quotidien', aide: '15-20 minutes, toujours à la même heure, jamais juste avant le coucher.', placeholder: 'Ex. : 18h30' },
      { type: 'zone', id: 'inquietude', label: 'L\'inquiétude que je gare maintenant', placeholder: 'En quelques mots suffit...' },
      { type: 'choix', id: 'bilan', label: 'Au moment du rendez-vous, cette inquiétude était...', options: ['💨 Dégonflée : elle ne me préoccupe plus', '📌 Toujours là : je la passe à l\'arbre actionnable', '🔁 Transformée en autre chose'] },
    ],
  },
  {
    slug: 'predictions',
    titre: 'Labo de prédictions',
    icone: '🔬', couleur: '#7A5C8A',
    accroche: 'Ton anxiété fait des prédictions. Vérifions ensemble son taux de réussite réel.',
    pourquoi: 'L\'anxiété se présente comme une voyante fiable. Ce labo la met à l\'épreuve : tu écris la prédiction précise AVANT, puis ce qui s\'est VRAIMENT passé. Au fil des semaines, tu accumules des preuves chiffrées que ton anxiété exagère massivement.',
    exemple: 'Prédiction (lundi) : « À la réunion de jeudi, je vais perdre mes moyens et tout le monde le verra (certitude : 80%). » Réalité (jeudi) : « J\'étais tendu 5 minutes, personne n\'a rien remarqué, deux collègues ont approuvé ma proposition. » Verdict : prédiction fausse.',
    champs: [
      { type: 'zone', id: 'prediction', label: 'Ma prédiction anxieuse (précise et datée)', aide: 'Que crains-tu qu\'il arrive exactement ? Quand ? Sois précis pour pouvoir vérifier.', placeholder: 'Ex. : demain, mon message va être mal pris et on va me le reprocher.' },
      { type: 'curseur', id: 'certitude', label: 'Ma certitude que ça va arriver (0-100)' },
      { type: 'zone', id: 'realite', label: 'Ce qui s\'est réellement passé (à remplir après)', placeholder: 'Reviens ici une fois l\'événement passé, et décris les faits.' },
      { type: 'choix', id: 'verdict', label: 'Verdict', options: ['❌ Prédiction fausse : rien de tout ça n\'est arrivé', '🌗 Partiellement vraie, mais bien moins grave que prévu', '✔️ Vraie... et j\'y ai survécu / fait face'] },
      { type: 'zone', id: 'lecon', label: 'Ce que ce test m\'apprend', placeholder: 'Ex. : mon anxiété annonce des catastrophes qui n\'arrivent presque jamais...' },
    ],
  },
  {
    slug: 'emotions',
    titre: 'Guide des émotions',
    icone: '🎨', couleur: '#C9835A',
    accroche: 'Plus de 100 émotions à explorer. Nommer avec précision, c\'est déjà apaiser.',
    pourquoi: 'La recherche montre que mettre un mot précis sur une émotion (« affect labeling ») diminue l\'activation de l\'amygdale. « Je me sens mal » entretient le flou anxieux ; « je ressens de l\'appréhension mêlée de culpabilité » redonne prise. Utilise ce guide chaque fois que tu remplis une feuille.',
    champs: [
      { type: 'emotions', id: 'ressenti', label: 'Ce que je ressens en ce moment', aide: 'Prends 2 minutes. Parcours les familles, clique sur tout ce qui résonne, même faiblement.' },
      { type: 'curseur', id: 'intensite', label: 'Intensité globale (0-100)' },
      { type: 'zone', id: 'corps', label: 'Où est-ce que ça se loge dans mon corps ?', placeholder: 'Ex. : gorge serrée, épaules crispées, ventre noué...' },
      { type: 'zone', id: 'besoin', label: 'De quoi cette émotion essaie-t-elle de me parler ?', aide: 'Chaque émotion signale un besoin : sécurité, repos, lien, reconnaissance...', placeholder: 'Ex. : j\'ai besoin d\'être rassuré sur..., de faire une pause...' },
    ],
  },
  {
    slug: 'distorsions',
    titre: 'Guide des distorsions cognitives',
    icone: '🔀', couleur: '#8A5C46',
    accroche: 'Les 12 pièges classiques du cerveau anxieux — apprends à les reconnaître au vol.',
    pourquoi: 'Les distorsions sont des raccourcis mentaux qui déforment la réalité, toujours dans le même sens : le pire. Elles sont normales — tout le monde en a. Mais l\'anxiété généralisée les utilise en boucle. Les repérer par leur nom leur enlève 50% de leur pouvoir.',
    champs: [
      { type: 'zone', id: 'pensee', label: 'La pensée que je veux analyser', placeholder: 'Recopie ta pensée automatique ici...' },
      { type: 'distorsions', id: 'reperees', label: 'Les distorsions que j\'y repère', aide: 'Ouvre chaque distorsion ci-dessous pour lire sa définition, son exemple et ses questions-antidotes.' },
      { type: 'zone', id: 'reponse', label: 'Ma réponse aux questions-antidotes', placeholder: 'Réponds honnêtement aux questions des distorsions cochées...' },
    ],
  },
  {
    slug: 'schemas',
    titre: 'Mes schémas profonds',
    icone: '🧠', couleur: '#5C5470',
    accroche: 'Les croyances de fond qui alimentent l\'anxiété — celles que ta thérapeute t\'aide à identifier.',
    pourquoi: 'Sous les pensées automatiques se cachent des schémas : des croyances anciennes sur soi et le monde (« je suis vulnérable », « je dois tout contrôler »). Cette feuille relie ton travail quotidien à celui fait avec ta thérapeute. Note ici les schémas qu\'elle a identifiés, et observe quand ils s\'activent.',
    champs: [
      { type: 'choix', id: 'schema_actif', label: 'Le schéma qui s\'est activé', options: SCHEMAS.map(s => `${s.nom} — ${s.croyance}`) },
      { type: 'zone', id: 'declencheur', label: 'Ce qui l\'a réveillé', placeholder: 'La situation, la phrase, le contexte...' },
      { type: 'zone', id: 'reaction', label: 'Comment j\'ai réagi sous son influence', placeholder: 'Pensées, émotions, comportements...' },
      { type: 'zone', id: 'reponse_adulte', label: 'Ce que ma partie adulte et lucide répond à ce schéma', aide: 'Le schéma date souvent d\'une époque où tu avais moins de ressources. Aujourd\'hui, que sais-tu de plus ?', placeholder: 'Ex. : ce schéma me dit que je suis démuni. Or, j\'ai déjà traversé... et j\'ai su...' },
    ],
  },
  {
    slug: 'securite',
    titre: 'Comportements de sécurité',
    icone: '🛡️', couleur: '#6B7A8A',
    accroche: 'Ces gestes qui soulagent sur le moment... et nourrissent l\'anxiété sur la durée.',
    pourquoi: 'Vérifier, se rassurer, éviter : ça calme 10 minutes, mais ça confirme au cerveau que le danger était réel. Résultat : l\'anxiété revient plus forte. L\'objectif n\'est pas de tout supprimer d\'un coup, mais de repérer, puis réduire progressivement, en tolérant un peu d\'inconfort.',
    exemple: 'Comportement repéré : « je demande à ma compagne si elle pense que ce mail était bien, 3 fois par semaine ». Réduction choisie : « cette semaine, je relis moi-même une fois, j\'envoie, et je note mon anxiété avant/après ».',
    champs: [
      { type: 'choix', id: 'comportement', label: 'Le comportement de sécurité que j\'ai remarqué aujourd\'hui', options: COMPORTEMENTS_SECURITE },
      { type: 'zone', id: 'contexte', label: 'Dans quelle situation ?', placeholder: 'Ex. : avant d\'envoyer un mail important...' },
      { type: 'curseur', id: 'anxiete_avant', label: 'Anxiété AVANT le comportement (0-100)' },
      { type: 'curseur', id: 'anxiete_apres', label: 'Anxiété APRÈS (0-100)' },
      { type: 'zone', id: 'reduction', label: 'Mon petit défi de réduction pour la prochaine fois', aide: 'Réduire de moitié, retarder de 10 minutes, faire une fois au lieu de trois...', placeholder: 'Ex. : la prochaine fois, j\'attends 10 minutes avant de vérifier.' },
    ],
  },
  {
    slug: 'crise',
    titre: 'Mon plan de crise',
    icone: '🆘', couleur: '#B5544D',
    accroche: 'À remplir au calme, pour les moments où ça déborde. Ton filet de sécurité personnel.',
    pourquoi: 'Dans un pic d\'anxiété, le cerveau rationnel est débordé : impossible de réfléchir à quoi faire. Ce plan pense à ta place. Tu le remplis maintenant, à froid, et il sera là, prêt, dans les moments difficiles. Imprime-le et garde-le sur toi.',
    champs: [
      { type: 'zone', id: 'signaux', label: 'Mes signaux d\'alerte personnels', aide: 'Comment je reconnais que ça monte ? (pensées, sensations, comportements)', placeholder: 'Ex. : je rumine en boucle, ma mâchoire se serre, je vérifie mon téléphone sans arrêt...' },
      { type: 'zone', id: 'outils', label: 'Mes 3 gestes qui m\'apaisent vraiment', aide: 'Des choses simples et testées : respirer, marcher, appeler, prendre une douche...', placeholder: '1. ...\n2. ...\n3. ...' },
      { type: 'texte', id: 'contact1', label: 'Personne de confiance n°1 (nom + téléphone)', placeholder: 'Ex. : Marie — 06...' },
      { type: 'texte', id: 'contact2', label: 'Personne de confiance n°2', placeholder: '...' },
      { type: 'texte', id: 'pro', label: 'Mon professionnel de santé (thérapeute, médecin)', placeholder: 'Nom, téléphone, jours de consultation...' },
      { type: 'zone', id: 'phrase', label: 'Ma phrase-ancre', aide: 'Une phrase courte, à toi, qui te ramène. Écris-la comme tu voudras la lire dans le creux de la vague.', placeholder: 'Ex. : j\'ai déjà traversé des moments comme ça. Ça monte, ça passe. Je respire.' },
    ],
  },
  {
    slug: 'decatastrophisation',
    titre: 'Décatastrophisation',
    icone: '⚖️', couleur: '#9A7A46',
    accroche: 'Trois questions pour dégonfler le pire scénario et retrouver tes ressources.',
    pourquoi: 'La catastrophisation fonctionne parce qu\'elle reste vague : « ce serait terrible ». Cette feuille force le scénario à se préciser — et un scénario précis devient gérable. Tu découvres presque toujours que (1) le pire est improbable, (2) le probable est gérable, (3) tu as des ressources.',
    exemple: 'Peur : « rater mon examen TSSR ». Pire scénario : je rate → je repasse dans 6 mois → inconfortable mais survivable. Probabilité honnête : 20%. Scénario probable : je réussis une partie, je consolide le reste. Mes ressources : j\'ai déjà réussi des formations, je sais m\'organiser, je peux demander de l\'aide.',
    champs: [
      { type: 'zone', id: 'peur', label: 'Ce qui me fait peur', placeholder: 'Ex. : rater mon examen, décevoir, tomber malade...' },
      { type: 'zone', id: 'pire', label: '1. Concrètement, quel est le PIRE scénario réaliste ?', aide: 'Décris-le jusqu\'au bout. Et ensuite ? Et ensuite ? Jusqu\'à ce que le scénario se stabilise.', placeholder: 'Si ça arrivait vraiment, voilà ce qui se passerait...' },
      { type: 'curseur', id: 'probabilite', label: '2. Probabilité honnête que ce pire scénario arrive (0-100)' },
      { type: 'zone', id: 'probable', label: '3. Le scénario le plus PROBABLE, en fait ?', placeholder: 'Ni le pire, ni le parfait : le plausible...' },
      { type: 'zone', id: 'ressources', label: '4. Mes ressources si le pire arrivait quand même', aide: 'Compétences, personnes, expériences passées où tu as fait face.', placeholder: 'Ex. : j\'ai déjà surmonté..., je pourrais compter sur..., je saurais...' },
    ],
  },
  {
    slug: 'relations',
    titre: 'Communication & limites relationnelles',
    icone: '💬', couleur: '#D9876B',
    accroche: 'Démêler ce qui se passe entre toi et l\'autre. Communiquer clairement, poser des limites.',
    pourquoi: 'Beaucoup d\'anxiété relationnelle naît d\'une mauvaise communication ou de limites floues. Cette feuille t\'aide à décrire la situation précisément, à identifier tes besoins, et à formuler une réaction ou une conversation claire — sans agressivité, sans sacrifice de soi.',
    exemple: 'Situation : mon ami me demande de l\'aide constamment, je me sens vidé. Au lieu de dire oui/non de façon vague, tu écris : ce qui me pèse (sentiment de devoir), ton besoin (préserver mon énergie), la limite à poser (je peux l\'aider 1h/semaine max), et comment le dire.',
    champs: [
      { type: 'zone', id: 'situation', label: '1. La situation relationnelle', aide: 'Qui est impliqué ? Qu\'est-ce qui crée du tension ?', placeholder: 'Ex. : mon collègue met du poids sur moi pour ses dossiers...' },
      { type: 'emotions', id: 'emotions', label: '2. Ce que je ressens' },
      { type: 'zone', id: 'ce_qui_pese', label: '3. Ce qui me pèse précisément', aide: 'Pas « il/elle est chiiant » : ce fait concret qui pose problème ?', placeholder: 'Ex. : je dois revoir ses travaux sans que ce soit demandé d\'avance...' },
      { type: 'zone', id: 'besoin', label: '4. Mon besoin (pas mon reproche)', aide: 'Je veux être écouté·e, respecté·e, autonome... ?', placeholder: 'Ex. : avoir mes limites respectées...' },
      { type: 'zone', id: 'limite', label: '5. La limite que je veux poser', aide: 'Concrète et possible. Pas parfaite, juste claire.', placeholder: 'Ex. : à partir de maintenant, je dis oui/non explicitement...' },
      { type: 'zone', id: 'comment_dire', label: '6. Comment je vais le/la dire (ou l\'écrire)', aide: 'Formule la phrase. Ça doit être honnête sans être méchant.', placeholder: 'Ex. : « J\'apprécie, mais j\'ai besoin d\'être libre sur mes priorités. »' },
      { type: 'curseur', id: 'difficulte', label: '7. À quel point c\'est difficile de poser cette limite (0-100)' },
    ],
  },
  {
    slug: 'coparentalite',
    titre: 'Coparentalité & harmonisation',
    icone: '👨‍👩‍👧‍👦', couleur: '#8B9FBD',
    accroche: 'Naviguer les différences d\'approche avec ton co-parent. Trouver de l\'harmonie pour les enfants.',
    pourquoi: 'La coparentalité après séparation (ou même en couple) crée souvent du stress : approches différentes, gestion des limites divergente, conflits sur le style éducatif. Cette feuille t\'aide à identifier ce qui crée de la friction, ce que tu risques si tu ne fais rien, et un petit pas vers l\'harmonie.',
    exemple: 'Tension : vous avez des approches différentes sur l\'utilisation d\'écran. Au lieu de ruminer, tu notes : la situation (différence d\'approche), ton inquiétude (confuse pour les enfants ?), et un petit accord testable (2 règles consensuelles pour cette semaine).',
    champs: [
      { type: 'zone', id: 'situation', label: '1. La situation de coparentalité', aide: 'Qui est impliqué, type d\'arrangement (alterné, quotidien, contact supervisé…) ?', placeholder: 'Ex. : nous alternons les semaines pour les jumelles...' },
      { type: 'zone', id: 'difference', label: '2. La différence d\'approche qui crée du stress', aide: 'Discipline ? Limites ? Temps d\'écran ? Vocabulaire sur l\'émotion ?', placeholder: 'Ex. : mon ex est beaucoup plus permissif sur les écrans...' },
      { type: 'zone', id: 'inquietude', label: '3. Mon inquiétude concrète', aide: 'Pas « c\'est pas bon » : qu\'est-ce qui me préoccupe vraiment pour les enfants ?', placeholder: 'Ex. : peur qu\'ils soient confus, ou qu\'un style enferme de mauvaises habitudes...' },
      { type: 'zone', id: 'non_negotiable', label: '4. Sur quoi je suis intraitable (et pourquoi)', aide: 'Où tracer la ligne ?', placeholder: 'Ex. : sécurité physique, c\'est non-négociable. Mais le temps d\'écran, on peut trouver un compromis.' },
      { type: 'zone', id: 'compromis', label: '5. Où peux-tu bouger / où est-ce acceptable de plier ?', placeholder: 'Ex. : je peux accepter plus d\'écran chez l\'autre parent si les routines du coucher sont similaires...' },
      { type: 'zone', id: 'petit_accord', label: '6. Un petit accord testable à proposer cette semaine', aide: '1-2 règles claires, temporaires (« on essaie 2 semaines »).', placeholder: '...' },
    ],
  },
  {
    slug: 'estime',
    titre: 'Estime de soi & valeur personnelle',
    icone: '✨', couleur: '#D4A574',
    accroche: 'Démêler ce que tu crois de toi de ce que les autres (ou toi-même en mode critique) te racontent.',
    pourquoi: 'L\'estime de soi s\'effrite lentement quand on croit ses pensées critiques sans les tester. « Je suis nul·le », « je ne suis pas capable », « je ne vaux pas cher » — ces croyances alimentent l\'anxiété ET empêchent d\'agir. Cette feuille force le test : c\'est vrai ? Vrai à 100% ? Et mes preuves du contraire ?',
    exemple: 'Croyance : « je ne suis pas une bonne mère ». Preuves du contraire : je suis là tous les jours, je pose des limites aimantes, les jumelles me parlent de leurs peurs, mes gestes comptent. Nuance : parfois je suis fatiguée et moins patiente — c\'est humain, pas une preuve que je suis mauvaise.',
    champs: [
      { type: 'zone', id: 'croyance', label: '1. La croyance sur moi que je traîne (ou qui me torture)', aide: '« Je ne suis pas... »,  « Je ne peux jamais... », « On ne peut pas m\'aimer si... »', placeholder: 'Ex. : je ne suis pas capable...' },
      { type: 'curseur', id: 'intensite_croyance', label: '2. À quel point y crois-tu vraiment (0-100)' },
      { type: 'zone', id: 'preuves_pour', label: '3. Les « preuves » que tu utilises pour la croire', aide: 'Un échec passé ? Une remarque ? Un sentiment vague ?', placeholder: 'Ex. : j\'ai échoué à... une fois il m\'a dit...' },
      { type: 'zone', id: 'preuves_contre', label: '4. Les preuves DU CONTRAIRE (c\'est le gros travail)', aide: 'Petit moment où tu as réussi, une compétence, un geste d\'une personne qui te voit autrement...', placeholder: 'Ex. : j\'ai déjà réussi à..., mes enfants me disent que..., dernièrement j\'ai...' },
      { type: 'zone', id: 'nuance', label: '5. La vérité nuancée', aide: 'Ni totalement vrai, ni totalement faux. Comment c\'est vraiment ?', placeholder: 'Ex. : je ne suis pas toujours patiente, mais je fais mon mieux et ça suffit.' },
      { type: 'zone', id: 'affirmation', label: '6. Une affirmation plus vraie pour moi (courte, personnelle)', aide: 'Pas du positif forcé : une vérité que tu peux défendre.', placeholder: 'Ex. : j\'ai des limites, et c\'est correct. Je apprends.' },
    ],
  },
];

export const SOS_ETAPES = [
  { titre: 'Respire — 1 minute', texte: 'Inspire 4 secondes par le nez, expire 6 secondes par la bouche. L\'expiration longue active ton frein physiologique. Suis le cercle.' },
  { titre: 'Ancre-toi — 5 sens', texte: 'Nomme à voix basse : 5 choses que tu VOIS, 4 que tu ENTENDS, 3 que tu peux TOUCHER, 2 que tu SENS, 1 que tu GOÛTES. Tu ramènes ton cerveau ici et maintenant.' },
  { titre: 'Nomme ce qui se passe', texte: '« Je remarque que je suis en train de ruminer. C\'est mon anxiété qui parle, pas les faits. » Mettre des mots dessus, c\'est reprendre le volant.' },
  { titre: 'Bouge ton corps', texte: 'Lève-toi, marche 2 minutes, secoue les bras, bois un verre d\'eau fraîche. La rumination adore l\'immobilité — prive-la de son terrain.' },
  { titre: 'Choisis la suite', texte: 'Soit l\'inquiétude est actionnable → note UN petit pas. Soit elle ne l\'est pas → gare-la au parking à inquiétudes, rendez-vous à ton créneau.' },
];
