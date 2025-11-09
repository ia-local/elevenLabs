// example.mts
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_LABS_API_KEY, // Defaults to process.env.ELEVENLABS_API_KEY
});

const track = await elevenlabs.music.compose({
  prompt: "Create an intense, fast-paced electronic track for a high-adrenaline video game scene. Use driving synth arpeggios, punchy drums, distorted bass, glitch effects, and aggressive rhythmic textures. The tempo should be fast, 130–150 bpm, with rising tension, quick transitions, and dynamic energy bursts.",
  musicLengthMs: 10000,
});

await play(track);


const compositionPlan = await elevenlabs.music.compositionPlan.create({
  prompt: "Create an intense, fast-paced electronic track for a high-adrenaline video game scene. Use driving synth arpeggios, punchy drums, distorted bass, glitch effects, and aggressive rhythmic textures. The tempo should be fast, 130–150 bpm, with rising tension, quick transitions, and dynamic energy bursts.",
  musicLengthMs: 10000,
});
console.log(JSON.stringify(compositionPlan, null, 2));