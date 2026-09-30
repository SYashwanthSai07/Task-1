// script.js - Translatify AI Interactive Frontend Architecture
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const sourceLangSelect = document.getElementById('sourceLang');
  const targetLangSelect = document.getElementById('targetLang');
  const swapBtn = document.getElementById('swapBtn');
  const sourceText = document.getElementById('sourceText');
  const clearBtn = document.getElementById('clearBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const translateBtn = document.getElementById('translateBtn');
  const translateSpinner = document.getElementById('translateSpinner');
  const charCount = document.getElementById('charCount');
  const wordCount = document.getElementById('wordCount');
  const outputCharCount = document.getElementById('outputCharCount');
  const emptyState = document.getElementById('emptyState');
  const loadingSkeleton = document.getElementById('loadingSkeleton');
  const translatedText = document.getElementById('translatedText');
  const engineUsedBadge = document.getElementById('engineUsedBadge');
  const copyBtn = document.getElementById('copyBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const ttsSourceBtn = document.getElementById('ttsSourceBtn');
  const ttsTargetBtn = document.getElementById('ttsTargetBtn');
  const stopSpeechBtn = document.getElementById('stopSpeechBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const toastContainer = document.getElementById('toastContainer');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const sampleChips = document.querySelectorAll('.chip');
  const sourceMetaTag = document.getElementById('sourceMetaTag');
  const targetMetaTag = document.getElementById('targetMetaTag');

  // Default Language Fallback List
  const DEFAULT_LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
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

  let currentDetectedLang = 'en';
  let isTranslating = false;
  let historyItems = JSON.parse(localStorage.getItem('translatify_history') || '[]');

  // 1. Theme Management (Light / Dark)
  function initTheme() {
    const savedTheme = localStorage.getItem('translatify_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('translatify_theme', newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info');
  });
  initTheme();

  // 2. Load & Populate Languages
  async function loadLanguages() {
    let languages = DEFAULT_LANGUAGES;
    try {
      const res = await fetch('/api/languages');
      if (res.ok) {
        const data = await res.json();
        if (data.languages && Array.isArray(data.languages)) {
          languages = data.languages;
        }
        const engineStatusText = document.getElementById('engineStatusText');
        if (engineStatusText) {
          engineStatusText.textContent = data.sarvamConfigured ? 'Sarvam AI Connected' : 'Zero-Key Engine Ready';
        }
      }
    } catch (err) {
      console.warn('Using default languages list due to network state:', err);
    }

    // Populate Source (Keep Auto Detect first)
    sourceLangSelect.innerHTML = '<option value="auto">✨ Auto Detect Language</option>';
    targetLangSelect.innerHTML = '';

    languages.forEach(lang => {
      const optSource = document.createElement('option');
      optSource.value = lang.code;
      optSource.textContent = `${lang.flag} ${lang.name} (${lang.native})`;
      sourceLangSelect.appendChild(optSource);

      const optTarget = document.createElement('option');
      optTarget.value = lang.code;
      optTarget.textContent = `${lang.flag} ${lang.name} (${lang.native})`;
      targetLangSelect.appendChild(optTarget);
    });

    // Default selections: Source = English, Target = Tamil (as in user screenshot)
    sourceLangSelect.value = 'en';
    targetLangSelect.value = 'ta';
    updateMetaTags();
  }

  function updateMetaTags() {
    const srcName = sourceLangSelect.options[sourceLangSelect.selectedIndex]?.text.split('(')[0] || 'Source';
    const tgtName = targetLangSelect.options[targetLangSelect.selectedIndex]?.text.split('(')[0] || 'Target';
    sourceMetaTag.textContent = `Input • ${srcName.trim()}`;
    targetMetaTag.textContent = `Output • ${tgtName.trim()}`;
  }

  sourceLangSelect.addEventListener('change', updateMetaTags);
  targetLangSelect.addEventListener('change', updateMetaTags);

  // 3. Live Counters & Word Count
  function updateCounters() {
    const text = sourceText.value;
    charCount.textContent = `${text.length} / 5,000 characters`;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    wordCount.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
  }
  sourceText.addEventListener('input', updateCounters);

  // 4. Quick Sample Chips
  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sourceText.value = chip.getAttribute('data-text');
      updateCounters();
      sourceText.focus();
      triggerTranslation();
    });
  });

  // 5. Clear & Paste Actions
  clearBtn.addEventListener('click', () => {
    sourceText.value = '';
    updateCounters();
    translatedText.textContent = '';
    outputCharCount.textContent = '0 characters';
    translatedText.classList.add('hidden');
    loadingSkeleton.classList.add('hidden');
    emptyState.classList.remove('hidden');
    engineUsedBadge.textContent = 'Ready';
    stopSpeaking();
    sourceText.focus();
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        sourceText.value = clipText;
        updateCounters();
        showToast('Text pasted from clipboard', 'info');
        triggerTranslation();
      }
    } catch (err) {
      showToast('Clipboard access denied. Please paste manually.', 'error');
    }
  });

  // 6. Language Swap Logic
  swapBtn.addEventListener('click', () => {
    let sourceVal = sourceLangSelect.value;
    const targetVal = targetLangSelect.value;

    if (sourceVal === 'auto') {
      sourceVal = currentDetectedLang || 'en';
    }

    sourceLangSelect.value = targetVal;
    targetLangSelect.value = sourceVal;
    updateMetaTags();

    // Swap text content if translation exists
    const currentTranslated = translatedText.textContent.trim();
    if (currentTranslated) {
      const originalSource = sourceText.value;
      sourceText.value = currentTranslated;
      updateCounters();
      translatedText.textContent = originalSource;
      outputCharCount.textContent = `${originalSource.length} characters`;
      triggerTranslation();
    }
    showToast('Languages swapped', 'info');
  });

  // 7. Core Translation Request
  async function triggerTranslation() {
    const text = sourceText.value.trim();
    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;

    if (!text) {
      showToast('Please enter some text to translate.', 'error');
      sourceText.focus();
      return;
    }

    if (sourceLang !== 'auto' && sourceLang === targetLang) {
      showToast('Source and target languages must be different.', 'error');
      return;
    }

    if (isTranslating) return;
    isTranslating = true;

    // UI Loading State
    translateBtn.disabled = true;
    translateSpinner.classList.remove('hidden');
    translateBtn.querySelector('.btn-arrow').classList.add('hidden');
    emptyState.classList.add('hidden');
    translatedText.classList.add('hidden');
    loadingSkeleton.classList.remove('hidden');
    engineUsedBadge.textContent = 'Translating...';

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang, targetLang })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Translation failed with status ${response.status}`);
      }

      // Successful Translation
      loadingSkeleton.classList.add('hidden');
      if (data.transliteratedScript) {
        translatedText.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.4rem; padding-bottom:0.35rem; border-bottom:1px dashed var(--border-subtle);">Recognized Script: <strong style="color:var(--accent-primary);">${data.transliteratedScript}</strong></div>${data.translatedText}`;
      } else {
        translatedText.textContent = data.translatedText;
      }
      translatedText.classList.remove('hidden');
      outputCharCount.textContent = `${data.translatedText.length} characters`;
      engineUsedBadge.textContent = data.transliteratedScript ? `Indic AI Engine` : (data.engine || 'Zero-Key Engine');

      if (data.detectedLanguage) {
        currentDetectedLang = data.detectedLanguage;
      }

      // Add to Session History
      addToHistory({
        sourceText: text,
        translatedText: data.translatedText,
        sourceLang: sourceLangSelect.options[sourceLangSelect.selectedIndex]?.text.split('(')[0].trim(),
        targetLang: targetLangSelect.options[targetLangSelect.selectedIndex]?.text.split('(')[0].trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

    } catch (err) {
      console.error('Translation error:', err);
      loadingSkeleton.classList.add('hidden');
      emptyState.classList.remove('hidden');
      engineUsedBadge.textContent = 'Error';
      showToast(err.message || 'Could not connect to translation engine. Please try again.', 'error');
    } finally {
      isTranslating = false;
      translateBtn.disabled = false;
      translateSpinner.classList.add('hidden');
      translateBtn.querySelector('.btn-arrow').classList.remove('hidden');
    }
  }

  translateBtn.addEventListener('click', triggerTranslation);

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter
  sourceText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      triggerTranslation();
    }
  });

  // 8. Copy Translation to Clipboard
  copyBtn.addEventListener('click', async () => {
    const textToCopy = translatedText.textContent.trim();
    if (!textToCopy) {
      showToast('No translated text to copy.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      copyBtnText.textContent = 'Copied!';
      copyBtn.style.color = 'var(--success)';
      copyBtn.style.borderColor = 'var(--success)';
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => {
        copyBtnText.textContent = 'Copy';
        copyBtn.style.color = '';
        copyBtn.style.borderColor = '';
      }, 2000);
    } catch (err) {
      showToast('Failed to copy to clipboard.', 'error');
    }
  });

  // 9. Audio & Speech Suite (Sarvam AI Default TTS & STT)
  let currentAudio = null;
  let currentUtterance = null;
  let isRecording = false;
  let recognition = null;
  const micBtn = document.getElementById('micBtn');

  // Text-to-Speech: Sarvam AI Bulbul v3 with fallback to browser SpeechSynthesis
  async function speakText(text, langCode, triggerBtn) {
    if (!text || !text.trim()) {
      showToast('No text available to speak.', 'error');
      return;
    }

    stopSpeaking();
    triggerBtn.classList.add('active');
    stopSpeechBtn.classList.remove('hidden');

    try {
      // 1. Try Sarvam AI Bulbul TTS API first
      const resp = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageCode: langCode })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.audioDataUri) {
          showToast(`🔊 Playing voice with ${data.engine}`, 'info');
          const audio = new Audio(data.audioDataUri);
          currentAudio = audio;
          audio.onended = () => stopSpeaking();
          audio.onerror = () => fallbackBrowserTts(text, langCode, triggerBtn);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Sarvam TTS unavailable, using browser speech:', e);
    }

    // 2. Fallback to Browser Native Web Speech
    fallbackBrowserTts(text, langCode, triggerBtn);
  }

  function fallbackBrowserTts(text, langCode, triggerBtn) {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported on this browser.', 'error');
      stopSpeaking();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;
    const voices = window.speechSynthesis.getVoices();
    const cleanCode = langCode.split('-')[0].toLowerCase();
    const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(cleanCode));
    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.lang = langCode;

    utterance.onend = () => stopSpeaking();
    utterance.onerror = () => stopSpeaking();
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    if (currentUtterance) currentUtterance = null;
    ttsSourceBtn.classList.remove('active');
    ttsTargetBtn.classList.remove('active');
    stopSpeechBtn.classList.add('hidden');
  }

  ttsSourceBtn.addEventListener('click', () => {
    const text = sourceText.value.trim();
    const lang = sourceLangSelect.value === 'auto' ? currentDetectedLang : sourceLangSelect.value;
    speakText(text, lang, ttsSourceBtn);
  });

  ttsTargetBtn.addEventListener('click', () => {
    // Extract text content excluding recognized script label if present
    const cleanOutput = translatedText.cloneNode(true);
    const scriptHeader = cleanOutput.querySelector('div');
    if (scriptHeader) scriptHeader.remove();
    const text = cleanOutput.textContent.trim();
    const lang = targetLangSelect.value;
    speakText(text, lang, ttsTargetBtn);
  });

  stopSpeechBtn.addEventListener('click', stopSpeaking);

  // 10. Speech-to-Text (STT) Voice Input Agent
  if (micBtn) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    micBtn.addEventListener('click', async () => {
      if (isRecording) {
        stopVoiceRecording();
        return;
      }

      // Check for Web Speech Recognition API
      if (SpeechRec) {
        startBrowserSpeechRec();
      } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        startMediaRecorderAudio();
      } else {
        showToast('Microphone voice input is not supported in this browser.', 'error');
      }
    });

    function startBrowserSpeechRec() {
      try {
        recognition = new SpeechRec();
        const selectedLang = sourceLangSelect.value;
        recognition.lang = selectedLang === 'auto' ? 'en-IN' : (selectedLang.includes('-') ? selectedLang : `${selectedLang}-IN`);
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
          isRecording = true;
          micBtn.classList.add('active');
          showToast('🎙️ Listening... Speak now in your chosen language!', 'info');
        };

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(r => r[0].transcript)
            .join('');
          sourceText.value = transcript;
          updateCounters();
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          showToast(`Mic error: ${event.error}`, 'error');
          stopVoiceRecording();
        };

        recognition.onend = () => {
          stopVoiceRecording();
          if (sourceText.value.trim()) {
            showToast('Transcription captured!', 'success');
            triggerTranslation();
          }
        };

        recognition.start();
      } catch (err) {
        console.error('Speech recognition start failed:', err);
        stopVoiceRecording();
      }
    }

    function stopVoiceRecording() {
      isRecording = false;
      micBtn.classList.remove('active');
      if (recognition) {
        try { recognition.stop(); } catch(e){}
        recognition = null;
      }
    }

    // MediaRecorder Fallback to Sarvam STT API
    async function startMediaRecorderAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        isRecording = true;
        micBtn.classList.add('active');
        showToast('🎙️ Recording voice for Sarvam STT...', 'info');

        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = async () => {
          isRecording = false;
          micBtn.classList.remove('active');
          stream.getTracks().forEach(t => t.stop());

          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'speech.wav');

          showToast('Transcribing audio with Sarvam AI...', 'info');
          try {
            const resp = await fetch('/api/speech-to-text', {
              method: 'POST',
              body: formData
            });
            const data = await resp.json();
            if (data.success && data.transcript) {
              sourceText.value = data.transcript;
              updateCounters();
              showToast(`Transcribed: "${data.transcript}"`, 'success');
              triggerTranslation();
            } else {
              showToast(data.error || 'Could not transcribe audio.', 'error');
            }
          } catch(e) {
            showToast('Voice transcription server error.', 'error');
          }
        };

        mediaRecorder.start();
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') mediaRecorder.stop();
        }, 5000);
      } catch (err) {
        isRecording = false;
        micBtn.classList.remove('active');
        showToast('Microphone permission denied.', 'error');
      }
    }
  }

  // 10. History Management
  function renderHistory() {
    if (!historyItems.length) {
      historyList.innerHTML = '<div class="history-empty">No previous translations recorded in this session.</div>';
      return;
    }
    historyList.innerHTML = '';
    historyItems.slice(0, 5).forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'history-item';
      card.innerHTML = `
        <div>
          <div class="history-item-langs">${item.sourceLang} → ${item.targetLang} • <span style="opacity:0.7">${item.time}</span></div>
          <div class="history-item-text">"${item.sourceText}" ➔ "${item.translatedText}"</div>
        </div>
        <button class="btn-subtle" style="padding:0.25rem 0.5rem; font-size:0.75rem;">Reuse</button>
      `;
      card.addEventListener('click', () => {
        sourceText.value = item.sourceText;
        updateCounters();
        translatedText.textContent = item.translatedText;
        translatedText.classList.remove('hidden');
        emptyState.classList.add('hidden');
        outputCharCount.textContent = `${item.translatedText.length} characters`;
        showToast('Loaded from history', 'info');
      });
      historyList.appendChild(card);
    });
  }

  function addToHistory(item) {
    historyItems.unshift(item);
    if (historyItems.length > 10) historyItems.pop();
    localStorage.setItem('translatify_history', JSON.stringify(historyItems));
    renderHistory();
  }

  clearHistoryBtn.addEventListener('click', () => {
    historyItems = [];
    localStorage.removeItem('translatify_history');
    renderHistory();
    showToast('Translation history cleared', 'info');
  });

  // 11. Toast System
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toast-in 0.3s reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Initialize
  loadLanguages();
  renderHistory();
  updateCounters();
});
