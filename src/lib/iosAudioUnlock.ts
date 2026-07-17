/**
 * Débloque la lecture audio sur iOS/Safari.
 *
 * iOS Safari refuse de jouer un son si `.play()` est appelé après un
 * `await` (fetch réseau, génération de script IA, conversion voix...),
 * même si l'appel initial vient bien d'un clic utilisateur — dès qu'un
 * délai réseau s'intercale, iOS ne considère plus l'action comme "geste
 * utilisateur" et bloque silencieusement (aucune erreur visible, juste
 * rien qui se joue).
 *
 * La parade standard : créer l'élément <audio> et appeler `.play()`
 * dessus de façon SYNCHRONE, dans le tick du clic, avant tout `await`.
 * Cette lecture initiale échoue silencieusement (il n'y a rien à jouer
 * pour l'instant), mais elle "active" l'élément — on peut ensuite lui
 * donner une vraie source après le chargement réseau et rappeler
 * `.play()}, ce qui fonctionnera sur iOS car c'est le MÊME élément audio
 * qui a été activé pendant le geste.
 *
 * Usage : appeler ceci en tout premier, avant tout `await`, dans le
 * gestionnaire de clic qui démarre une session audio.
 */
export function debloquerAudio(): HTMLAudioElement {
  const audio = new Audio();
  audio.play().catch(() => {
    // Échec attendu : il n'y a rien à jouer pour l'instant. C'est normal.
  });
  return audio;
}
