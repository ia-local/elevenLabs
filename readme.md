# 🤖 Full-Stack AI Content Studio (Groq & ElevenLabs)

Ce projet est une application Full-Stack conçue pour démontrer la création de contenu multimédia dynamique en temps réel, intégrant des modèles d'IA pour le texte, la 3D et la voix.

## 🚀 Architecture

| Composant | Technologie | Rôle |
| :--- | :--- | :--- |
| **Backend** | Node.js (Express) | API Gateway sécurisée. Gère l'authentification et le streaming. |
| **IA Texte/3D** | `groq-sdk` (Modèle: `llama-3.1-8b-instant`) | Génération de scripts narratifs et de paramètres JSON pour les formes 3D. |
| **IA Voix** | `@elevenlabs/elevenlabs-js` | Synthèse vocale en streaming direct (MP3). |
| **Frontend** | HTML5, CSS (Flexbox), JavaScript, **Three.js** | Interface utilisateur pour les contrôles IA et visualisation de l'objet 3D. |

## 🛠️ Prérequis

Pour exécuter ce projet, vous devez disposer des éléments suivants :

1.  **Node.js** (version récente)
2.  **Clé API Groq**
3.  **Clé API ElevenLabs**

### Configuration des Variables d'Environnement

Créez un fichier `.env` à la racine du projet pour stocker vos clés API.

```.env
# Fichier .env
GROQ_API_KEY="votre_clé_api_groq_ici"
# Note: Le SDK ElevenLabs utilise par défaut ELEVENLABS_API_KEY. 
# Si vous utilisez la variable spécifique ELEVEN_LABS_API_KEY dans le code :
ELEVEN_LABS_API_KEY="votre_clé_api_elevenlabs_ici"