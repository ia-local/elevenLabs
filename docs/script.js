// docs/script.js (Logique du Frontend Complète : Groq + ElevenLabs + Three.js)

// --- VARIABLES GLOBALES THREE.JS et AUDIO ---
let scene, camera, renderer, listener, cube;
let currentMesh; // Objet 3D actuellement affiché (initialisé dans initThreeJs)
const audioPlayerHTML = document.getElementById('audioPlayer');

// Références aux éléments de statut (ajoutées pour éviter les erreurs de référence)
const statusThreeJsElement = document.getElementById('statusThreeJs');
const statusGroqElement = document.getElementById('statusGroq');
const statusElevenLabsElement = document.getElementById('statusElevenLabs');


// --- INITIALISATION DE LA SCÈNE THREE.JS ---
function initThreeJs() {
    const canvas = document.getElementById('threeJsContainer'); 
    
    // Scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // Caméra
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Rendu
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, // Utilisation de l'élément canvas existant
        antialias: true 
    });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Lumière
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1);
    scene.add(light);

    // Cube initial (Objet par défaut)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0xe74c3c });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    currentMesh = cube; // Définir l'objet initial

    // AudioListener (attaché à la caméra pour l'écoute)
    listener = new THREE.AudioListener();
    camera.add(listener); 

    // Gestion de la boucle de rendu
    animate();
}

/**
 * Boucle d'animation rigoureuse pour Three.js.
 * Gère la rotation de l'objet actif.
 */
function animate() {
    requestAnimationFrame(animate);

    if (currentMesh) {
        currentMesh.rotation.x += 0.005;
        currentMesh.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

// Lancer l'initialisation après le chargement du DOM
initThreeJs();


// --- GESTIONNAIRES D'ÉVÉNEMENTS ---

// 1. Génération de Forme 3D (Groq Three.js)
document.getElementById('threeJsForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const promptInput = document.getElementById('threeJsPrompt').value;
    statusThreeJsElement.textContent = '🧠 Groq génère la forme 3D...';

    try {
        const response = await fetch('/groqThreeJs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptInput })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur Groq 3D: ${errorText}`);
        }
        
        const data = await response.json();

        if (data.error) {
            statusThreeJsElement.textContent = `❌ Erreur de formatage : ${data.error}`;
            return;
        }

        // --- Logique d'application de la forme 3D ---
        const { type, parameters, color } = data;
        let geometry;

        // Déterminer le type de Géométrie et instancier
        switch (type) {
            case 'BoxGeometry':
                geometry = new THREE.BoxGeometry(...parameters);
                break;
            case 'SphereGeometry':
                geometry = new THREE.SphereGeometry(...parameters);
                break;
            case 'CylinderGeometry':
                geometry = new THREE.CylinderGeometry(...parameters);
                break;
            default:
                throw new Error(`Type de géométrie non supporté: ${type}`);
        }
        
        // Créer le Matériau et le Mesh
        const material = new THREE.MeshLambertMaterial({ color: new THREE.Color(color) });
        const newMesh = new THREE.Mesh(geometry, material);

        // Remplacer l'ancien Mesh
        if (currentMesh) {
            scene.remove(currentMesh);
            currentMesh.geometry.dispose();
            currentMesh.material.dispose();
        }
        
        // Ajouter le nouvel objet
        newMesh.position.set(0, 0, 0);
        scene.add(newMesh);
        currentMesh = newMesh;
        
        statusThreeJsElement.textContent = `✅ Forme 3D (${type}) générée et ajoutée à la scène.`;

    } catch (error) {
        console.error('Erreur Groq 3D:', error);
        statusThreeJsElement.textContent = `❌ Erreur 3D : ${error.message}`;
    }
});


// 2. Génération de Texte (Groq Llama)
document.getElementById('groqForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const promptInput = document.getElementById('promptInput').value;
    const textInput = document.getElementById('textInput'); 
    const outputTextInput = document.getElementById('outputTextInput'); 

    statusGroqElement.textContent = '🧠 Groq génère le texte...';
    textInput.value = ''; 
    outputTextInput.value = ''; 

    try {
        const response = await fetch('/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptInput })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur Groq: ${errorText}`);
        }
        
        const data = await response.json();
        
        textInput.value = data.text;
        outputTextInput.value = data.text; 
        statusGroqElement.textContent = '✅ Texte généré par Groq, prêt pour la voix.';

    } catch (error) {
        console.error('Erreur Groq:', error);
        statusGroqElement.textContent = `❌ Erreur lors de la génération Groq : ${error.message}`;
    }
});


// 3. Synthèse Vocale (ElevenLabs) et Intégration Three.js Audio
document.getElementById('ttsForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const textToSpeak = document.getElementById('textInput').value;
    
    if (!textToSpeak) {
        statusElevenLabsElement.textContent = 'Veuillez générer ou saisir du texte d\'abord.';
        return;
    }

    statusElevenLabsElement.textContent = '🎙️ ElevenLabs génère l\'audio pour la scène 3D...';
    audioPlayerHTML.src = ''; 

    try {
        const response = await fetch('/generate-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textToSpeak })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur ElevenLabs: ${errorText}`);
        }
        
        const audioBlob = await response.blob();
        
        // Charger le Blob Audio dans le Web Audio API de Three.js (méthode rigoureuse)
        const sound = new THREE.Audio(listener);
        const audioContext = listener.context;
        const fileReader = new FileReader();

        fileReader.onload = function(e) {
            audioContext.decodeAudioData(e.target.result, function(buffer) {
                sound.setBuffer(buffer);
                sound.setVolume(0.5); 
                
                // --- Action 3D liée à la Voix (Exemple d'animation de la caméra) ---
                const initialColor = currentMesh.material.color.getHex();
                
                // Mouvement et changement de couleur au début de la lecture
                if (currentMesh) {
                    currentMesh.material.color.setHex(0x3498db); // Couleur bleue active
                    camera.position.z = 4; // Zoom léger
                }

                sound.onEnded = function() {
                    // Rétablir les états après la lecture
                    if (currentMesh) {
                        currentMesh.material.color.setHex(initialColor);
                    }
                    camera.position.z = 5; 
                };
                
                sound.play(); 
                statusElevenLabsElement.textContent = '🔊 Audio prêt et en lecture dans la scène 3D.';

                // Optionnel: Lecture via le lecteur HTML aussi (pour le contrôle natif)
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayerHTML.src = audioUrl;

            }, function(e) {
                console.error('Erreur de décodage audio:', e);
                statusElevenLabsElement.textContent = '❌ Erreur : Décoding Audio Failed.';
            });
        };
        
        fileReader.readAsArrayBuffer(audioBlob);
        
    } catch (error) {
        console.error('Erreur ElevenLabs:', error);
        statusElevenLabsElement.textContent = `❌ Erreur lors de la synthèse vocale : ${error.message}`;
    }
});