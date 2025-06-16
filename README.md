# o2CloudSCAN-Officiel 📄

Une application Electron moderne pour la numérisation de documents, offrant une interface utilisateur intuitive et des fonctionnalités avancées de gestion de scans.

## ✨ Fonctionnalités

- **Interface graphique moderne** : Application desktop Electron avec design responsive
- **Numérisation multi-format** : Support des formats PNG, JPG, PDF, TIFF et BMP
- **Gestion intelligente des scanners** : Détection automatique et sélection des scanners WIA
- **Historique complet** : Suivi de tous vos documents numérisés avec métadonnées
- **Organisation automatique** : Génération de noms de fichiers personnalisables
- **Gestion des dossiers** : Sélection et création automatique des dossiers de destination
- **Conversion PDF** : Conversion automatique d'images vers PDF via Microsoft Word
- **Interface native** : Intégration complète avec l'explorateur de fichiers Windows

## 🚀 Installation

### Prérequis
- Windows 10/11
- Node.js 16.x ou supérieur
- npm ou yarn
- Un scanner compatible WIA (Windows Image Acquisition)
- Microsoft Word (optionnel, pour la conversion PDF)

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/o2Cloud-fr/o2CloudSCAN-Officiel.git
cd o2CloudSCAN-Officiel
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer l'application en mode développement**
```bash
npm run dev
```

4. **Construire l'application**
```bash
npm run build
```

## 📁 Structure du projet

```
o2CloudSCAN-Officiel/
├── main.js                 # Processus principal Electron
├── preload.js             # Script de préchargement
├── index.html             # Interface utilisateur
├── assets/
│   └── icon.png          # Icône de l'application
├── package.json          # Configuration du projet
└── README.md             # Documentation
```

## 📋 Utilisation

### Interface principale

L'application se compose de plusieurs sections :

#### 🔧 Configuration du Scan
- **Nom du fichier** : Nom personnalisé pour votre document
- **Format** : Sélection du format de sortie (PNG, JPG, PDF, TIFF, BMP)
- **Destination** : Chemin de sauvegarde personnalisable
- **Scanner** : Sélection du scanner à utiliser parmi ceux détectés

#### 📚 Historique des Scans
- Liste chronologique des 100 derniers scans
- Informations détaillées (nom, date, taille, scanner utilisé)
- Actions : ouvrir le fichier, localiser dans l'explorateur, supprimer

#### 🎯 Workflow de numérisation

1. **Démarrer** l'application
2. **Sélectionner** votre scanner dans la liste
3. **Configurer** le nom de fichier et le format
4. **Choisir** le dossier de destination
5. **Cliquer** sur "Démarrer la numérisation"
6. **Suivre** les instructions de l'interface scanner Windows
7. **Vérifier** le résultat dans l'historique

## 🛠️ Fonctionnalités techniques

### Gestion des scanners
- Détection automatique via PowerShell et WIA
- Support des scanners USB et réseau
- Fallback vers la sélection manuelle

### Formats supportés
- **PNG** : Qualité optimale pour documents
- **JPG** : Compression équilibrée
- **PDF** : Format universel (conversion automatique)
- **TIFF** : Format professionnel
- **BMP** : Format non compressé

### Stockage des données
- **Historique** : `~/Documents/ScannerApp/scan_history.json`
- **Scans par défaut** : `~/Documents/Scans/`
- **Configuration** : Sauvegarde automatique des préférences

## 📦 Construction et distribution

### Construire pour Windows

```bash
# Version portable
npm run pack

# Installeur Windows
npm run build
```

## 🔧 Dépannage

### Problèmes courants

#### Scanner non détecté
```bash
# Vérifier PowerShell
powershell -Command "Get-WmiObject -Class Win32_PnPSignedDriver | Where-Object {$_.DeviceName -like '*scan*'}"
```

#### Erreur de permissions
- Exécuter en tant qu'administrateur
- Vérifier les politiques d'exécution PowerShell

#### Problème de construction
```bash
# Nettoyer les modules
rm -rf node_modules package-lock.json
npm install
```

### Logs et debug

L'application affiche les erreurs dans la console de développement :
```bash
# Ouvrir les outils de développement
Ctrl + Shift + I
```

## 🎨 Personnalisation

### Modifier l'interface
- Éditer `index.html` pour la structure
- Ajouter des styles CSS personnalisés
- Modifier les scripts JavaScript côté renderer

### Ajouter des fonctionnalités
- Étendre `main.js` pour de nouveaux IPC handlers
- Ajouter des modules dans `preload.js`
- Implémenter de nouvelles API dans le processus principal

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Standards de développement
- Utiliser ESLint pour la qualité du code
- Tester sur Windows 10/11
- Documenter les nouvelles fonctionnalités
- Respecter l'architecture Electron

## 👤 Auteur

**Votre Nom**
- GitHub: [@o2Cloud-fr](https://github.com/o2Cloud-fr)
- Email: github@o2cloud.fr

## 🔗 Liens utiles

[![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)

## 🙏 Remerciements

- Équipe Electron pour le framework
- Communauté Node.js pour les outils et bibliothèques
- Microsoft pour les APIs WIA
- Contributeurs et testeurs

---

⭐ **N'hésitez pas à donner une étoile si ce projet vous aide !**