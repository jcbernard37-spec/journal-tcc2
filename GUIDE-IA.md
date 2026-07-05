# 🌿 Journal TCC — Version avec Assistant IA

Cette version ajoute le **retour de l'assistant TCC** (le feedback qui te manquait) + une **synthèse pour ta thérapeute**.

---

## ⚠️ IMPORTANT — Ne perds pas ta clé Google

Avant de vider le dossier, **ouvre ton fichier `.env` actuel et garde une copie** de la ligne :
```
VITE_GOOGLE_CLIENT_ID=42777038872-....apps.googleusercontent.com
```
Tu devras la remettre (le `.env` n'est pas dans le ZIP, exprès, pour la sécurité).

---

## ÉTAPE 1 — Remplace le code

1. Vide `C:\Users\jc\journal-tcc\` (garde juste une copie de ta ligne `.env`)
2. Décompresse `journal-tcc-AVEC-IA.zip` dedans
3. Recrée ton fichier `.env` avec ta ligne Google :
   ```
   VITE_GOOGLE_CLIENT_ID=42777038872-....apps.googleusercontent.com
   ```

## ÉTAPE 2 — Ajoute ta clé Anthropic dans Vercel

C'est ici, et **seulement ici**, que va ta clé `sk-ant-...` (jamais dans le code).

1. Va sur **vercel.com** → ton projet **journal-tcc2**
2. Onglet **Settings** → **Environment Variables**
3. Ajoute :
   - **Key** : `ANTHROPIC_API_KEY`
   - **Value** : ta clé `sk-ant-...` (de ton fichier texte)
   - Environnements : laisse **Production + Preview + Development** cochés
4. **Save**

## ÉTAPE 3 — Pousse sur GitHub

Dans le terminal (`cd C:\Users\jc\journal-tcc`) :
```cmd
git add .
git commit -m "Ajout assistant IA TCC"
git push
```

Vercel redéploie tout seul (1-2 min).

---

## ✅ Comment utiliser l'IA

Une fois déployé, sur **https://journal-tcc2.vercel.app** :

**Retour de l'assistant** — Feuille « Journal de pensées (BEC) » → remplis-la → bouton ambre **« Demander un retour à l'assistant TCC »** → il te pose des questions pour creuser (il ne te rassure pas bêtement, c'est voulu : la réassurance entretient l'anxiété).

**Synthèse thérapeute** — Page « Mon suivi » → bouton **« Générer ma synthèse »** → un résumé de tes 14 derniers jours à copier et apporter en séance.

---

## Notes

- L'IA marche **uniquement en ligne** (Vercel), pas en local — c'est normal, la fonction serveur n'existe que sur Vercel. En local, un message te le rappellera.
- Chaque feedback coûte une fraction de centime (modèle Haiku). Avec tes ~5 $ de crédit, tu as des centaines d'utilisations.
- Les garde-fous : l'IA ne diagnostique jamais, ne rassure pas à vide, et si tu écris une détresse grave, elle te renvoie vers le 3114 et ta thérapeute.

---

Un souci ? Dis-moi où ça bloque. 💚
