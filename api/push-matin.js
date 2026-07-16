import { envoyerPush } from './push-utils.js';

export default async function handler(req, res) {
  const MESSAGES = [
    "Commence bien ta journée 🌱 Ton carnet t'attend.",
    "Quelques minutes pour toi ce matin ? Ouvre Solco.",
    "Bonne journée. Un moment pour ton carnet avant que ça commence ?",
    "Le matin est le meilleur moment pour déposer ce qui pèse 🌿",
    "Ton carnet Solco est là, ce matin comme tous les matins.",
  ];
  const corps = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  const result = await envoyerPush('Solco — Bonjour 🌅', corps);

  if (result.ok) {
    res.status(200).json({ sent: true });
  } else {
    res.status(200).json({ sent: false, raison: result.raison });
  }
}
