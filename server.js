// server.js - Full-Stack Translation Server: Sarvam AI Default Agent Suite (Text-to-Text, Text-to-Speech, Speech-to-Text)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Prevent caching so all updates are served live
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { etag: false, maxAge: 0 }));

// Dynamically check for Sarvam API Key from process.env, .env, or .env.example
function getSarvamApiKey() {
  if (process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY.trim() && process.env.SARVAM_API_KEY.trim() !== 'your_sarvam_api_key_here') {
    return process.env.SARVAM_API_KEY.trim();
  }

  const checkFiles = ['.env', '.env.example', '.env.local'];
  for (const file of checkFiles) {
    try {
      const p = path.join(__dirname, file);
      if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, 'utf8');
        const match = text.match(/SARVAM_API_KEY\s*=\s*([^\r\n]+)/);
        if (match && match[1]) {
          const val = match[1].trim().replace(/^["']|["']$/g, '');
          if (val && val !== 'your_sarvam_api_key_here' && val !== 'your_actual_sarvam_key_here') {
            return val;
          }
        }
      }
    } catch (e) {}
  }
  return null;
}

// Supported languages list with ISO codes and native labels
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' }
];

const languageCodeMap = new Map();
SUPPORTED_LANGUAGES.forEach(lang => {
  languageCodeMap.set(lang.code.toLowerCase(), lang.code);
  languageCodeMap.set(lang.name.toLowerCase(), lang.code);
});

// Sarvam AI supported language codes
const SARVAM_LANGUAGES = new Set(['en', 'te', 'hi', 'ta', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'od']);

function toSarvamCode(code) {
  if (!code || code === 'auto') return 'auto';
  const clean = code.split('-')[0].toLowerCase();
  return `${clean}-IN`;
}

// -------------------------------------------------------------
// 1. SARVAM AI: TEXT-TO-TEXT AGENT
// -------------------------------------------------------------
async function translateWithSarvam(text, sourceCode, targetCode) {
  const apiKey = getSarvamApiKey();
  if (!apiKey) throw new Error('Sarvam API key not configured');

  const src = toSarvamCode(sourceCode);
  const tgt = toSarvamCode(targetCode);

  const res = await fetch('https://api.sarvam.ai/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey
    },
    body: JSON.stringify({
      input: text,
      source_language_code: src,
      target_language_code: tgt,
      mode: 'formal',
      model: 'mayura:v1'
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sarvam Translation error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (data && data.translated_text) {
    return {
      translatedText: data.translated_text,
      detectedLanguage: sourceCode,
      provider: 'Sarvam AI (Mayura v1)'
    };
  }
  throw new Error('Invalid response received from Sarvam Translate API');
}

// -------------------------------------------------------------
// 2. SARVAM AI: TEXT-TO-SPEECH AGENT
// -------------------------------------------------------------
async function ttsWithSarvam(text, langCode) {
  const apiKey = getSarvamApiKey();
  if (!apiKey) throw new Error('Sarvam API key not configured');

  const cleanLang = toSarvamCode(langCode);

  const res = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey
    },
    body: JSON.stringify({
      text: text.slice(0, 2500),
      language_code: cleanLang,
      speaker: 'shubh',
      model: 'bulbul:v3',
      pace: 1.0
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sarvam TTS error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (data && Array.isArray(data.audios) && data.audios[0]) {
    return {
      audioBase64: data.audios[0],
      format: 'wav',
      provider: 'Sarvam AI (Bulbul v3)'
    };
  }
  throw new Error('Sarvam TTS returned no audio data');
}

// -------------------------------------------------------------
// 3. SARVAM AI: SPEECH-TO-TEXT AGENT
// -------------------------------------------------------------
async function sttWithSarvam(fileBuffer, originalFilename = 'audio.wav') {
  const apiKey = getSarvamApiKey();
  if (!apiKey) throw new Error('Sarvam API key not configured');

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'audio/wav' });
  formData.append('file', blob, originalFilename);
  formData.append('model', 'saaras:v3');
  formData.append('mode', 'transcribe');

  const res = await fetch('https://api.sarvam.ai/speech-to-text', {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey
    },
    body: formData
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sarvam STT error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (data && (data.transcript || data.text)) {
    return {
      transcript: data.transcript || data.text,
      languageCode: data.language_code || 'auto',
      provider: 'Sarvam AI (Saaras v3)'
    };
  }
  throw new Error('Sarvam STT returned empty transcript');
}

// -------------------------------------------------------------
// Secondary / Fallback Translation (Google GTX + Transliteration)
// -------------------------------------------------------------
const TRANSLITERATION_MAP = {
  te: 'te-t-i0-und', hi: 'hi-t-i0-und', ta: 'ta-t-i0-und',
  kn: 'kn-t-i0-und', ml: 'ml-t-i0-und', bn: 'bn-t-i0-und',
  mr: 'mr-t-i0-und', gu: 'gu-t-i0-und', pa: 'pa-t-i0-und', ur: 'ur-t-i0-und'
};

async function transliterateIndicText(text, langCode) {
  const itc = TRANSLITERATION_MAP[langCode];
  if (!itc) return null;
  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${itc}&num=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data[0] === 'SUCCESS' && Array.isArray(data[1])) {
      return data[1].map(w => (w[1] && w[1][0] ? w[1][0] : w[0])).join(' ');
    }
  } catch (err) {}
  return null;
}

function isAsciiText(str) {
  const letters = str.replace(/[^a-zA-Z]/g, '');
  return letters.length > 0 && letters.length / str.replace(/\s/g, '').length > 0.6;
}

async function translateWithGoogleGtx(text, sourceCode, targetCode) {
  const sl = sourceCode === 'auto' ? 'auto' : sourceCode;
  const tl = targetCode === 'zh' ? 'zh-CN' : targetCode;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&dt=bd&q=${encodeURIComponent(text)}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  if (!res.ok) throw new Error(`Google GTX status ${res.status}`);
  const data = await res.json();
  const translatedText = data[0].filter(s => s && s[0]).map(s => s[0]).join('');
  const detectedLanguage = data[2] || (sourceCode !== 'auto' ? sourceCode : 'en');
  return { translatedText, detectedLanguage, provider: 'Google Engine (Fallback)' };
}

// -------------------------------------------------------------
// Express Endpoints
// -------------------------------------------------------------

// API: Check Engine status
app.get('/api/engine-status', (req, res) => {
  const key = getSarvamApiKey();
  res.json({
    sarvamConfigured: Boolean(key),
    activeEngine: key ? 'Sarvam AI (Default Agent Suite)' : 'Zero-Key Google Engine',
    services: {
      textToText: key ? 'Sarvam Mayura v1' : 'Google GTX',
      textToSpeech: key ? 'Sarvam Bulbul v3' : 'Browser Web Speech',
      speechToText: key ? 'Sarvam Saaras v3' : 'Browser Web Speech Recognition'
    }
  });
});

// API: List supported languages
app.get('/api/languages', (req, res) => {
  const key = getSarvamApiKey();
  res.json({
    languages: SUPPORTED_LANGUAGES,
    sarvamConfigured: Boolean(key)
  });
});

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Translatify AI • Sarvam Agent Suite' });
});

// API: 1. Text-to-Text Translation (Sarvam AI Default)
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please enter text to translate.' });
    }
    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text exceeds maximum limit of 5,000 characters.' });
    }
    if (!sourceLang || !targetLang) {
      return res.status(400).json({ error: 'Source and target languages are required.' });
    }

    const sourceKey = sourceLang.toLowerCase().trim();
    const targetKey = targetLang.toLowerCase().trim();
    const sourceCode = sourceKey === 'auto' ? 'auto' : languageCodeMap.get(sourceKey) || sourceKey;
    const targetCode = languageCodeMap.get(targetKey) || targetKey;

    if (!targetCode) {
      return res.status(400).json({ error: `Unsupported target language: "${targetLang}"` });
    }
    if (sourceCode !== 'auto' && sourceCode === targetCode) {
      return res.status(400).json({ error: 'Source and target languages are identical. Please select different languages.' });
    }

    // 1. Smart Transliteration for Romanized Indic text (Tanglish/Hinglish like "ela unavu", "kaisa hai")
    let queryText = text.trim();
    let transliteratedScript = null;

    if (TRANSLITERATION_MAP[sourceCode] && isAsciiText(queryText)) {
      const nativeScript = await transliterateIndicText(queryText, sourceCode);
      if (nativeScript) {
        transliteratedScript = nativeScript;
        queryText = nativeScript;
      }
    }

    const hasSarvam = Boolean(getSarvamApiKey());
    const isSarvamPair = (sourceCode === 'auto' || SARVAM_LANGUAGES.has(sourceCode)) && SARVAM_LANGUAGES.has(targetCode);

    // 2. Default Priority: Sarvam AI
    if (hasSarvam && isSarvamPair) {
      try {
        const sarvamResult = await translateWithSarvam(queryText, sourceCode, targetCode);
        return res.json({
          success: true,
          sourceLanguage: sourceCode,
          targetLanguage: targetCode,
          detectedLanguage: sarvamResult.detectedLanguage,
          translatedText: sarvamResult.translatedText,
          transliteratedScript: transliteratedScript,
          engine: sarvamResult.provider
        });
      } catch (sarvamErr) {
        console.warn('Sarvam Translation error, routing to fallback:', sarvamErr.message);
      }
    }

    let result = await translateWithGoogleGtx(queryText, sourceCode, targetCode);
    if (
      result.translatedText.trim().toLowerCase() === text.trim().toLowerCase() &&
      TRANSLITERATION_MAP[sourceCode] &&
      !transliteratedScript
    ) {
      const fallbackScript = await transliterateIndicText(text.trim(), sourceCode);
      if (fallbackScript) {
        transliteratedScript = fallbackScript;
        result = await translateWithGoogleGtx(fallbackScript, sourceCode, targetCode);
      }
    }

    return res.json({
      success: true,
      sourceLanguage: sourceCode,
      targetLanguage: targetCode,
      detectedLanguage: result.detectedLanguage,
      translatedText: result.translatedText,
      transliteratedScript: transliteratedScript,
      engine: result.provider
    });

  } catch (err) {
    console.error('Translation processing error:', err);
    res.status(500).json({ error: 'Translation could not be completed. Please try again.' });
  }
});

// API: 2. Text-to-Speech (Sarvam AI Bulbul v3 Default)
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text, languageCode } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for speech synthesis.' });
    }

    const hasSarvam = Boolean(getSarvamApiKey());
    const cleanLang = (languageCode || 'hi').split('-')[0].toLowerCase();

    if (hasSarvam && SARVAM_LANGUAGES.has(cleanLang)) {
      try {
        const ttsResult = await ttsWithSarvam(text.trim(), cleanLang);
        return res.json({
          success: true,
          audioDataUri: `data:audio/${ttsResult.format};base64,${ttsResult.audioBase64}`,
          engine: ttsResult.provider
        });
      } catch (sarvamTtsErr) {
        console.warn('Sarvam TTS error, suggesting client fallback:', sarvamTtsErr.message);
      }
    }

    // Inform client to use browser synthesis fallback
    return res.json({
      success: false,
      useBrowserFallback: true,
      message: 'Browser SpeechSynthesis fallback active.'
    });

  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'TTS request failed.', useBrowserFallback: true });
  }
});

// API: 3. Speech-to-Text (Sarvam AI Saaras v3 Default)
app.post('/api/speech-to-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    const hasSarvam = Boolean(getSarvamApiKey());
    if (!hasSarvam) {
      return res.status(400).json({
        error: 'Sarvam AI API key is not configured in .env. Please configure SARVAM_API_KEY to enable AI speech-to-text.',
        useBrowserFallback: true
      });
    }

    const sttResult = await sttWithSarvam(req.file.buffer, req.file.originalname || 'recording.wav');
    return res.json({
      success: true,
      transcript: sttResult.transcript,
      languageCode: sttResult.languageCode,
      engine: sttResult.provider
    });

  } catch (err) {
    console.error('STT error:', err);
    res.status(500).json({ error: err.message || 'Speech-to-text transcription failed.', useBrowserFallback: true });
  }
});

app.listen(PORT, () => {
  const hasSarvam = Boolean(getSarvamApiKey());
  console.log(`=======================================================`);
  console.log(`🚀 Translatify AI Server running at http://localhost:${PORT}`);
  console.log(`🤖 Default AI Suite: ${hasSarvam ? 'Sarvam AI (Text • TTS • STT Active)' : 'Google Engine / Zero-Key Mode'}`);
  console.log(`=======================================================`);
});
