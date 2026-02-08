#!/usr/bin/env node

/**
 * HAL Voice Server
 * Local voice interface backend for iPhone/web
 * Handles audio recording → transcription → response → TTS
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: '/tmp/voice-uploads/' });

// Configuration
const HOME = process.env.HOME || '/Users/randylust';
const CREDENTIALS_PATH = path.join(HOME, '.openclaw/workspace/.credentials');
const ELEVENLABS_PATH = path.join(HOME, '.openclaw/workspace/.credentials-elevenlabs');

// Load Keys
function loadKey(filePath, keyName) {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const line = content.split('\n').find(l => l.includes(keyName));
            if (line) return line.split('=')[1].trim();
        }
    } catch (e) {
        console.error(`Error loading ${keyName} from ${filePath}:`, e);
    }
    return process.env[keyName];
}

const OPENAI_API_KEY = loadKey(CREDENTIALS_PATH, 'OPENAI_API_KEY');
const ELEVENLABS_API_KEY = loadKey(ELEVENLABS_PATH, 'ELEVENLABS_API_KEY');
const ELEVENLABS_VOICE_ID = 'rachel'; // Female voice
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'HAL Voice Server' });
});

/**
 * API: /api/voice
 * Expects: 'audio' file (webm/mp3/wav)
 * Returns: JSON { transcript, response, audio }
 */
app.post('/api/voice', upload.single('audio'), async (req, res) => {
    try {
        const audioFile = req.file;
        if (!audioFile) return res.status(400).json({ error: 'No audio file provided' });

        console.log(`[VOICE] Received audio: ${audioFile.filename}`);

        // 1. Transcribe (Whisper)
        const transcript = await transcribeAudio(audioFile.path);
        console.log(`[VOICE] Transcribed: "${transcript}"`);

        // 2. Query HAL
        const responseText = await queryHAL(transcript);
        console.log(`[VOICE] HAL says: "${responseText}"`);

        // 3. TTS (ElevenLabs)
        const audioResponse = await synthesizeSpeech(responseText);
        
        // Cleanup
        fs.unlinkSync(audioFile.path);

        res.json({
            status: 'success',
            transcript: transcript,
            response: responseText,
            audio: audioResponse.url
        });

    } catch (error) {
        console.error('[VOICE] Error:', error.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

/**
 * API: /api/text
 * Expects: JSON { text: "..." }
 * Returns: JSON { response, audio }
 * Usage: Web interface typing, or Siri Shortcut (JSON mode)
 */
app.post('/api/text', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'No text provided' });

        console.log(`[TEXT] Received: "${text}"`);

        const responseText = await queryHAL(text);
        const audioResponse = await synthesizeSpeech(responseText);

        res.json({
            status: 'success',
            response: responseText,
            audio: audioResponse.url
        });
    } catch (error) {
        console.error('[TEXT] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * API: /api/siri
 * Expects: JSON { text: "..." }
 * Returns: Audio File (binary)
 * Usage: Siri Shortcut "Get Contents of URL" -> Play Sound
 */
app.post('/api/siri', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).send('No text');

        console.log(`[SIRI] Received: "${text}"`);

        const responseText = await queryHAL(text);
        // Note: queryHAL takes time. Siri might timeout if > 30s.
        
        const audioInfo = await synthesizeSpeech(responseText);
        const audioPath = path.join('/tmp/voice-responses/', audioInfo.filename);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.sendFile(audioPath);
    } catch (error) {
        console.error('[SIRI] Error:', error.message);
        res.status(500).send(error.message);
    }
});

// Serve audio responses
app.get('/audio/:filename', (req, res) => {
    const filepath = path.join('/tmp/voice-responses/', req.params.filename);
    if (fs.existsSync(filepath)) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.sendFile(filepath);
    } else {
        res.status(404).json({ error: 'Audio file not found' });
    }
});

// --- Helpers ---

async function transcribeAudio(filePath) {
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not found');

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
        headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
    });
    return response.data.text;
}

async function queryHAL(text) {
    // Escape single quotes
    const safeText = text.replace(/'/g, "'\\''");
    
    return new Promise((resolve) => {
        // We use 'openclaw agent' to run a turn. 
        // We add --json to parse output.
        // We add --channel telegram (or default) if needed, but for agent cmd, we just need the reply.
        // Since we are running on the host, we can target a 'voice-session' or similar to keep context separate,
        // or just use default routing.
        // To get a pure reply text, we might need to parse standard out.
        // Note: 'openclaw agent' creates a session. We want the reply *content*.
        
        // Command: openclaw agent --message "..." --json
        // Note: This might be slow (spawning node).
        // If speed is critical, we'd hit the gateway HTTP API, but let's stick to CLI for robustness first.
        
        exec(`openclaw agent --message '${safeText}' --json`, { timeout: 60000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[HAL] Exec error: ${error.message}`);
                // Fallback: If CLI fails, just echo (or maybe gateway is down)
                return resolve("I'm having trouble connecting to my brain right now.");
            }
            
            try {
                // Parse JSON output from OpenClaw CLI
                // The output format usually includes the turn result.
                // If it's just the 'agent' command output:
                /*
                {
                    "status": "success",
                    "reply": "Here is the response..."
                }
                */
               // NOTE: We'll have to verify the actual JSON structure. 
               // For now, let's assume a standard structure or regex the output if it's messy.
               
               const jsonMatch = stdout.match(/\{[\s\S]*\}/);
               if (jsonMatch) {
                   const data = JSON.parse(jsonMatch[0]);
                   // Check common fields
                   if (data.reply) return resolve(data.reply);
                   if (data.message) return resolve(data.message);
                   if (data.output) return resolve(data.output);
               }
               
               // Fallback: use stdout string if it looks like text
               if (stdout.trim().length > 0 && !stdout.includes('"status": "error"')) {
                   return resolve(stdout.trim());
               }

            } catch (e) {
                console.error('[HAL] Parse error:', e);
            }
            
            resolve("I processed the request, but couldn't read the response.");
        });
    });
}

async function synthesizeSpeech(text) {
    if (!ELEVENLABS_API_KEY) {
        console.warn('[TTS] No API Key, returning dummy');
        return { filename: 'dummy.mp3', url: '#' }; // Or valid dummy path
    }

    try {
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
            {
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            },
            {
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        const filename = `response-${Date.now()}.mp3`;
        const dir = '/tmp/voice-responses/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        const filepath = path.join(dir, filename);
        fs.writeFileSync(filepath, response.data);

        return { filename, url: `/audio/${filename}` };

    } catch (error) {
        console.error('[TTS] Error:', error.message);
        throw error;
    }
}

app.listen(PORT, () => {
    console.log(`🎤 HAL Voice Server running on http://localhost:${PORT}`);
    console.log(`   - Web Interface: Open voice-interface.html`);
    console.log(`   - Siri Endpoint: POST /api/siri (JSON {text})`);
});
