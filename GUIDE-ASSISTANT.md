# 🌿 Journal TCC — Mise à jour « Assistant + 18 schémas »

Cette mise à jour ajoute **deux grandes choses** :

1. **Les 18 schémas de Young** (au lieu de 7), rangés par famille dans l'onboarding — dont ton « sauveur » (Sacrifice de soi).
2. **Une page « Parler à l'assistant »** : tu écris ce que tu ressens, l'IA t'accueille et t'oriente vers le bon outil, avec un bouton raccourci qui t'y emmène directement.

---

## Installation (simple cette fois — on ne vide rien)

Ton `node_modules` et ton `.env` sont déjà en place, donc :

### 1. Décompresse par-dessus
- Clic droit sur `journal-tcc-ASSISTANT.zip` → **Extraire tout**
- Destination : `C:\Users\jc\journal-tcc\`
- Quand Windows demande **remplacer les fichiers ?** → **Oui, tout remplacer**

### 2. Pousse sur GitHub
Terminal (barre d'adresse du dossier → `cmd`) :
```cmd
git add .
git commit -m "Assistant IA + 18 schemas"
git push
```

Vercel redéploie tout seul (1-2 min).

### 3. Teste
Sur **https://journal-tcc2.vercel.app** (Ctrl+Shift+R pour rafraîchir) :
- Nouvel onglet **Assistant** dans le menu du haut
- Une carte **« Parler à l'assistant »** sur le tableau de bord
- Écris « je rumine et je n'arrive pas à m'arrêter » → il te répond et te propose un outil

---

## Ce que fait l'assistant

- Il **accueille** ce que tu ressens maintenant
- Il **oriente** vers le bon outil (Journal BEC, Parking à inquiétudes, Schémas…)
- Un **bouton raccourci** apparaît pour ouvrir l'outil suggéré
- Il **ne te rassure pas à vide** (c'est voulu) et te renvoie au 3114 + ta thérapeute si ça déborde

---

## Les 18 schémas

Dans l'onboarding (étape 3), ils sont regroupés en 5 familles dépliables :
- Séparation & rejet
- Manque d'autonomie
- Manque de limites
- **Orientation vers les autres** ← ton « sauveur » (Sacrifice de soi) est ici
- Survigilance & inhibition

⚠️ Si tu as déjà créé ton profil, tu peux refaire l'onboarding pour cocher tes nouveaux schémas (ou on ajoutera un bouton « modifier mes schémas » à la prochaine étape).

---

## La suite (quand tu veux)

- **B2** : le bilan qui génère un parcours personnalisé selon tes schémas
- **B3** : l'IA sur toutes les feuilles
- **B4** : les observations de suivi

Dis-moi quand c'est déployé et testé. 💚
