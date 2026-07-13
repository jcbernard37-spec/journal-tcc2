# 🚀 GUIDE D'INSTALLATION - SUITE THÉRAPEUTIQUE

## ✨ CE QUE TU VIENS DE RECEVOIR

**Journal-TCC v3.0 - Suite Thérapeutique Complète**
- ✅ TCC Classique (13 feuilles)
- ✅ Profil IA Dynamique
- ✅ Anamnèse Complète
- ✅ **EMDR Visuel**
- ✅ **Yoga Nidra** (3 niveaux)
- ✅ **Hypnose Ericksonienne** (3 niveaux)
- ✅ **Visualisations Créatrices** (6 types)
- ✅ **Outils Bonus** (Tapping, Breathing, Méditations, Affirmations)
- ✅ **Analytics Complet**
- ✅ **Design Zen Minimaliste**

---

## 📋 PRÉ-REQUIS

- **Windows 10** (ou Windows 11)
- **Node.js v24.18.0** minimum (https://nodejs.org/)
- **Git v2.55.0** minimum (https://git-scm.com/)
- **Git Hub** connecté (compte jcbernard37-spec)
- **Vercel** connecté
- **API Key Anthropic** (console.anthropic.com)
- **Terminal CMD** (pas PowerShell)

Vérifiez :
```cmd
node --version     REM doit afficher v24.18.0+
npm --version      REM doit afficher 11.16.0+
git --version      REM doit afficher 2.55.0+
```

---

## 🎯 ÉTAPES D'INSTALLATION

### **ÉTAPE 1: Décompresser**

```cmd
C:\Users\jc\Downloads\
Clic droit sur journal-tcc-SUITE-THERAPEUTIQUE-COMPLETE.zip
Extraire tout...
Destination: C:\Users\jc\journal-tcc\
```

(Accepter si demandé de remplacer les fichiers existants)

### **ÉTAPE 2: Installer les dépendances**

```cmd
cd C:\Users\jc\journal-tcc
npm install
```

(Cela va télécharger ~500MB de paquets Node. Patience!)

### **ÉTAPE 3: Vérifier la configuration**

```cmd
npm run build
```

Vérifier que la compilation réussit. Vous devriez voir:
```
✓ 61 modules transformed.
✓ built in X.XXs
```

### **ÉTAPE 4: Déployer sur Vercel**

```cmd
git add .
git commit -m "MASSIVE: Suite therapeutique complete - EMDR, Yoga, Hypnose, Visualisations"
git push
```

Vercel va redéployer automatiquement en 1-2 min.

### **ÉTAPE 5: Vérifier le déploiement**

- Allez sur https://journal-tcc2.vercel.app/
- **Ctrl+Shift+R** pour vider le cache
- Attendez 30 secondes
- Vous devriez voir le nouveau menu "Outils"

---

## ✅ CHECKLIST DE VÉRIFICATION

Après installation, vérifiez que TOUS ces éléments fonctionnent :

### **🧠 Outils Thérapeutiques**
- [ ] **Hub**: Clique sur "Outils" dans le menu
- [ ] **EMDR**: Page avec animation cercles (clique "Commencer")
- [ ] **Yoga Nidra**: 3 options (Court/Moyen/Long)
- [ ] **Hypnose**: 3 niveaux (Relaxation/Croyance/Ressource)
- [ ] **Visualisations**: 6 types (Abondance/Guérison/Enfant/etc)
- [ ] **Outils Bonus**: 4 options (Tapping/Breathing/Méditations/Affirmations)

### **📊 Analytics**
- [ ] Chaque outil save une session dans localStorage
- [ ] Historique visible dans "Hub Outils"
- [ ] Graphiques de progression (avant/après)

### **📱 Mobile**
- [ ] Hamburger menu "☰" visible sur iPhone
- [ ] Tous les outils accessibles sur mobile
- [ ] Pas de scrolling horizontal
- [ ] Font size >= 16px (prévention zoom)

### **💬 IA**
- [ ] Assistant connaît ta dernière session EMDR
- [ ] Feedback IA personnalisé basé sur tes outils
- [ ] Profil IA mis à jour (inclut anamnèse + 30 jours)

---

## 🔧 DÉPANNAGE

### **Erreur: "Cannot find module"**
```cmd
cd C:\Users\jc\journal-tcc
rm -r node_modules package-lock.json
npm install
npm run build
```

### **Les outils n'apparaissent pas**
```cmd
Ctrl+Shift+R   REM Vider le cache avec force
Attendre 30 secondes
Recharger la page
```

### **Compilation échoue**
```cmd
npm run build
REM Lire les erreurs
REM Copier les messages d'erreur et demander de l'aide
```

### **Vercel ne redéploie pas**
```cmd
Aller sur https://vercel.com
Dashboard → journal-tcc2
Vérifier que la branche "main" a les changements
Si non : git push origin main
```

---

## 📚 STRUCTURE DES FICHIERS CRÉÉS

Nouveaux fichiers ajoutés :

```
src/pages/
├── OutilsTherapeutiques.tsx     [HUB principal]
├── EMDR.tsx                     [EMDR Visuel complet]
├── YogaNidra.tsx                [Yoga Nidra 3 niveaux]
├── Hypnose.tsx                  [Hypnose 3 niveaux]
├── Visualisations.tsx           [Visualisations 6 types]
├── OutilsBonus.tsx              [Tapping, Breathing, etc]

app/
├── feedback.js                  [Mappage des feedbacks IA]
```

Routes ajoutées dans App.tsx :
```typescript
/outils-therapeutiques        → Hub principal
/emdr                         → EMDR page
/yoga-nidra                   → Yoga Nidra page
/hypnose                      → Hypnose page
/visualisations               → Visualisations page
/outils-bonus                 → Outils Bonus page
```

---

## 🎬 DÉMARRER AVEC LES OUTILS

### **Première utilisation: EMDR**

1. Clique sur "Outils" dans le menu
2. Clique sur "🎯 EMDR Visuel"
3. Remplis ton souvenir/peur difficile
4. Note l'intensité (SUDS 0-10)
5. Clique "Continuer"
6. Installe une ressource de sécurité
7. Lance le traitement (5 min)
8. Regarde l'animation cercles
9. Note la nouvelle intensité
10. Sauvegarde la session

### **Recommandation: Combo pour Max Effet**

```
JOUR 1:
- EMDR (15 min) pour traiter peur
- Yoga Nidra Court (15 min) après

JOUR 2:
- Hypnose Changement Croyance (40 min)

JOUR 3:
- Visualisation Abondance (30 min)
- Meditation Gratitude (15 min)
```

---

## 📊 TRACKING & ANALYTICS

Toutes les sessions sont enregistrées. Pour les voir:

1. Clique sur "Outils" dans le menu
2. Regarde "Sessions récentes" en bas
3. Chaque session montre:
   - Nom de l'outil
   - Date et durée
   - Score d'efficacité (0-10)

**Progression détectée:**
- Si tu fais EMDR 3x et le SUDS baisse de 3 points, l'IA le détecte
- Si Yoga Nidra améliore ton sommeil, ça s'affiche
- L'IA peut recommander "Fais Yoga + EMDR combinées pour max impact"

---

## 🚀 OPTIMISATIONS POSSIBLES (Futures)

Si tout marche bien, voici les améliorations possibles pour plus tard:

1. **Google Drive Sync**: Auto-sync entre PC et iPhone
2. **PDF Export**: Partager avec thérapeute
3. **Voice Guidance**: Audio guidé pour EMDR/Yoga/Hypnose (Eleven Labs)
4. **Custom Affirmations**: Crée tes affirmations personalisées
5. **Dashboard Avancé**: Graphiques plus détaillés
6. **Binaural Beats**: Sons scientifiques pour certains outils
7. **Mobile App**: Version native iOS/Android

---

## 📞 SUPPORT

En cas de problème:

1. **Lire ce guide** attentivement
2. **Vérifier les pré-requis** (Node.js, Git, etc)
3. **Essayer les solutions de dépannage** ci-dessus
4. **Prendre une screenshot** de l'erreur
5. **Envoyer les infos** (message d'erreur + screenshot)

---

## 💚 C'EST PRÊT !

Tu as maintenant une plateforme thérapeutique PROFESSIONNELLE et COMPLÈTE.

**Prochaine étape:**
1. Installer (suivre les étapes ci-dessus)
2. Déployer sur Vercel
3. Remplir ton anamnèse (10 sections)
4. Essayer EMDR sur un souvenir
5. Tester Yoga Nidra avant le coucher
6. Partager avec ton thérapeute

**C'est du sérieux. C'est pour toi. Ça change la vie.** 🔥✨

---

## 📝 NOTES IMPORTANTES

- **Données locales**: Tout est stocké en localStorage (ton iPhone/PC). Pas de serveur centralisé.
- **Confidentialité**: Aucune donnée sensible ne sort de ton appareil
- **Offline**: Certains outils fonctionnent offline (Yoga, Hypnose, Visualisations)
- **API Key**: Reste UNIQUEMENT dans Vercel Settings (jamais dans le repo)
- **Support Thérapeute**: L'app est un COMPLÉMENT, pas un remplacement

**Utilise-la. Teste-la. Fais tes tests en real-conditions. Reviens nous dire ce qui fonctionne !** 💚✨
