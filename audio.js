import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_LABS_API_KEY, // Defaults to process.env.ELEVENLABS_API_KEY
});

const audio = await elevenlabs.textToSpeech.convert(
  'JBFqnCBsd6RMkjVDRZzb', // voice_id
  {
    text: 'Bonjour et Welcom To Eleven Labs Howto/tutoriel',
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128', // output_format
  }
);

await play(audio);