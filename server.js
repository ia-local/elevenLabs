// server.js (Réintégration de la route Groq Three.js)

const express = require('express');
const path = require('path');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const Groq = require('groq-sdk'); 
const { Readable } = require('stream');

const app = express();
const port = 3000;

// --- Initialisation des Clients SDK ---

// 1. Client Groq (pour le texte et la 3D)
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});
const GROQ_MODEL = 'llama-3.1-8b-instant';

// 2. Client ElevenLabs (pour la voix)
const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_LABS_API_KEY, 
});
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; 

// --- Middlewares & Fichiers Statiques ---
app.use(express.json()); 
app.use(express.static('docs')); 

// --- Fonctions Algorithmiques ---

async function generateTextWithGroq(prompt) {
    console.log(`[Groq] Génération de texte en cours pour : ${prompt}`);
    const systemInstruction = "Vous êtes un rédacteur professionnel et concis. Rédigez un court paragraphe (max 50 mots) sur le sujet fourni, destiné à être lu à haute voix.";
    
    const response = await groq.chat.completions.create({
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: 150
    });
    
    return response.choices[0]?.message?.content || "Désolé, Groq n'a pas pu générer de contenu pour ce prompt.";
}

/**
 * Fonction pour générer un JSON de paramètres de forme 3D avec Groq.
 */
async function generateThreeJsJson(prompt) {
    console.log(`[Groq ThreeJs] Génération des paramètres 3D pour : ${prompt}`);
    
    // Instruction système pour forcer le formatage JSON
    const systemInstruction = `Vous êtes un expert en modélisation 3D simple pour Three.js. Votre tâche est de générer un objet JSON STRICTEMENT pour les paramètres d'une forme 3D. Le JSON doit avoir la structure suivante: { "type": "FormeThreeJS", "parameters": [nombre1, nombre2, ...], "color": "#HEXADECIMAL" }. Les formes doivent être BoxGeometry, SphereGeometry ou CylinderGeometry. Basez votre choix et les paramètres sur le prompt de l'utilisateur.`;
    
    const userPrompt = `Génère une forme 3D pertinente pour le concept suivant : "${prompt}"`;
    
    const response = await groq.chat.completions.create({
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
        ],
        model: GROQ_MODEL,
        temperature: 0.8,
        response_format: { type: "json_object" } 
    });

    const jsonString = response.choices[0]?.message?.content;

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Erreur de parsing JSON Groq (raw):", jsonString);
        throw new Error("Erreur de formatage JSON reçu de Groq.");
    }
}


// --- Routes API ---

// 1. Route POST pour la génération de texte (via Groq)
app.post('/generate-text', async (req, res) => {
    const userPrompt = req.body.prompt;
    if (!userPrompt) {
        return res.status(400).send('Le prompt est requis pour la génération de texte.');
    }
    try {
        const generatedText = await generateTextWithGroq(userPrompt);
        res.json({ text: generatedText });
    } catch (error) {
        console.error('[Groq] Erreur lors de la génération de texte:', error.message);
        res.status(500).send(`Erreur lors de la génération de texte Groq: ${error.message}`);
    }
});

// 2. Route POST pour la génération de forme 3D (via Groq Three.js)
// C'est la route qui était manquante !
app.post('/groqThreeJs', async (req, res) => {
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
        return res.status(400).send('Le prompt est requis pour la génération 3D.');
    }

    try {
        const generatedJson = await generateThreeJsJson(userPrompt);
        res.json(generatedJson);

    } catch (error) {
        console.error('[Groq ThreeJs] Erreur lors de la génération 3D:', error.message);
        res.status(500).send(`Erreur lors de la génération 3D Groq: ${error.message}`);
    }
});


// 3. Route POST pour la génération de la voix (ElevenLabs)
app.post('/generate-audio', async (req, res) => {
    const textToSpeak = req.body.text;

    if (!textToSpeak) {
        return res.status(400).send('Le champ texte est requis.');
    }

    try {
        const audio = await elevenlabs.textToSpeech.convert(
            VOICE_ID,
            {
                text: textToSpeak,
                modelId: 'eleven_multilingual_v2',
                outputFormat: 'mp3_44100_128', 
            }
        );
        
        // Conversion rigoureuse du Web Stream en Node.js Readable Stream
        const reader = audio.getReader();
        const nodeStream = new Readable({
            async read() {
                const { done, value } = await reader.read();
                if (done) {
                    this.push(null);
                } else {
                    this.push(value);
                }
            },
        });

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'inline; filename="generated_audio.mp3"');
        nodeStream.pipe(res);
        console.log('[ElevenLabs] Audio streamé avec succès au client (via conversion Stream).');

    } catch (error) {
        console.error('[ElevenLabs] Erreur lors de la génération de l\'audio:', error);
        res.status(500).send(`Erreur serveur ElevenLabs: ${error.message}`);
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server démarré sur http://localhost:${port}`);
});