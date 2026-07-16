import { envoyerPush } from './push-utils.js';

export default async function handler(req, res) {
  const MESSAGES = [
    "Comment s'est passée ta journée ? Ton carnet t'écoute 🌙",
    "Ce soir, prends 5 minutes pour toi. Solco est là.",
    "Une session Yoga Nidra ce soir ? Le moment idéal 🧘",
    "Avant de dormir : pose ce qui reste dans ton carnet.",
    "Bonne soirée. Quelques lignes dans Solco avant de te coucher ? 🌿",
  ];
  const corps = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  const result = await envoyerPush('Solco — Bonsoir 🌙', corps);

  if (result.ok) {
    res.status(200).json({ sent: true });
  } else {
    res.status(200).json({ sent: false, raison: result.raison });
  }
}
