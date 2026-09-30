# CodeAlpha Language Translation Tool — Translatify AI

An AI-powered multi-modal translation platform built for the **CodeAlpha Artificial Intelligence Internship (Task 1)** featuring **Sarvam AI** as the default multi-modal agent suite for Text-to-Text, Text-to-Speech, and Speech-to-Text.

![Translatify AI Demo](https://img.shields.io/badge/CodeAlpha-AI_Internship-indigo?style=for-the-badge)
![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-Default_Agent_Suite-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-v18%2B-green?style=for-the-badge)

---

## 🌟 Overview

**Translatify AI** is an intelligent language translation platform that combines:
1. **Sarvam AI (`mayura:v1`)** for state-of-the-art Indic language text translation (including code-mixed and Romanized Tanglish/Hinglish).
2. **Sarvam AI (`bulbul:v3`)** for natural, human-like Indic Text-to-Speech synthesis.
3. **Sarvam AI (`saaras:v3`)** for accurate Speech-to-Text audio transcription.
4. **Google GTX Engine Fallback** to ensure 100% uptime and support for non-Indic languages without requiring complex setup.

---

## 🚀 Key Features

* **Sarvam AI Default Multi-Modal Suite**:
  * **Text-to-Text Translation**: Powered by Sarvam's `mayura:v1` model for seamless translation between English and 11+ Indian languages.
  * **Text-to-Speech (TTS)**: Powered by Sarvam's `bulbul:v3` model generating natural WAV audio streams.
  * **Speech-to-Text (STT)**: Direct microphone voice input with AI transcription powered by Sarvam's `saaras:v3` model.
* **Smart Code-Mixed & Tanglish Parsing**: Type naturally in Romanized script (e.g. `"Mama ela unavu"`, `"kaisa hai bhai"`) and get instant translations.
* **Extensive Language Coverage**:
  * **Indian Languages**: Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, Odia.
  * **Global Languages**: English, Spanish, French, German, Japanese, Korean, Chinese, Arabic, Russian, Portuguese, Italian.
* **Voice Input (Microphone)**: Dedicated microphone button with real-time listening indicator.
* **Interactive Design & Tooling**:
  * Modern dual-panel desktop layout and mobile-optimized responsiveness.
  * Real-time character and word count tracking.
  * 1-Click Copy with visual checkmark feedback and toast notifications.
  * Language Swapping with animated 360° rotation.
  * Session Translation History persisted in `localStorage` with quick reuse.
  * Dark Mode and Light Mode theme toggle.
  * Quick-test sample chips for instant demonstration.

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, Vanilla CSS3 (Custom Design System, Flexbox, Grid), Vanilla JavaScript (ES6+), Web Speech & MediaRecorder APIs.
* **Backend**: Node.js, Express.js, Multer, CORS, Dotenv.
* **AI & Translation Suite**:
  * Default Agent Suite: **Sarvam AI** (`mayura:v1` Translation, `bulbul:v3` TTS, `saaras:v3` STT).
  * Resilient Fallback: Google GTX Engine + Indic Transliteration.
* **Typography**: Google Fonts (*Outfit* & *Plus Jakarta Sans*).

---

## 📂 Project Structure

```text
CodeAlpha_LanguageTranslationTool/
├── public/
│   ├── index.html       # Semantic UI markup with voice mic & audio controls
│   ├── style.css        # Modern CSS design system (Light/Dark themes)
│   └── script.js        # Multi-modal frontend logic: Sarvam TTS, STT, and translate
├── .env                 # Local environment file with SARVAM_API_KEY
├── .gitignore           # Git ignore rules protecting node_modules and .env
├── package.json         # Dependencies and scripts
├── server.js            # Express backend with Sarvam AI multi-modal suite
└── README.md            # Complete documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (Version 18.x or higher)
* npm (bundled with Node.js)

### Step 1: Open the Project Directory
```bash
cd CodeAlpha_LanguageTranslationTool
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
The `.env` file contains your configuration:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
PORT=3000
```
*(Your secret API key is safely ignored by `.gitignore` so it is never committed to GitHub).*

### Step 4: Run the Application
```bash
npm start
```
The server will initialize:
```text
=======================================================
🚀 Translatify AI Server running at http://localhost:3000
🤖 Default AI Suite: Sarvam AI (Text • TTS • STT Active)
=======================================================
```

Open your browser at:
**`http://localhost:3000`**

---

## 🧪 Testing Checklist

All features have been tested and verified:

| Feature | Modality | Test Input | Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Translation** | Text → Text | `"Mama ela unavu"` (te → en) | `"How is uncle?"` via Sarvam Mayura v1 | ✅ Passed |
| **Speech Output** | Text → Speech | `"How is uncle?"` (en) | Natural WAV audio via Sarvam Bulbul v3 | ✅ Passed |
| **Voice Input** | Speech → Text | Microphone speech | Real-time voice capture & translation | ✅ Passed |
| **Tanglish / Hinglish**| Code-mixed | `"kaisa hai bhai"` (hi → en) | `"how are you brother"` | ✅ Passed |
| **Multi-Language** | Text → Text | English → Tamil, Telugu, Hindi, Spanish | Native script translation | ✅ Passed |
| **Clipboard** | Utility | Click "Copy" | "Copied!" green feedback + toast | ✅ Passed |
| **Language Swap** | Utility | Click "Swap" | Interchanges languages and text | ✅ Passed |
| **Theme System** | UI | Click theme button | Instant toggle between Dark/Light mode | ✅ Passed |

---

## 🎬 LinkedIn Demo Flow (Recommended for Video Submission)

Here is a 45–60 second script for your LinkedIn demonstration:

1. **Introduction (0–10s)**:
   * *"Hi everyone! This is my Task 1 project for the CodeAlpha Artificial Intelligence Internship: Translatify AI, featuring Sarvam AI as the default multi-modal agent for Indian and international languages."*
2. **Text & Tanglish Translation Demo (10–25s)**:
   * Select **Telugu → English** and type `"Mama ela unavu"`.
   * Click **Translate** to showcase Sarvam AI translating it to `"How is uncle?"` with the `Sarvam AI (Mayura v1)` badge.
3. **Voice & Text-to-Speech Demo (25–40s)**:
   * Click the **Microphone (🎙️)** button to show real-time voice input.
   * Click the **Speaker (🔊)** button to play Sarvam's natural `bulbul:v3` speech synthesis.
4. **Theme & History (40–50s)**:
   * Click the **Theme Toggle** to switch to Dark Mode.
   * Highlight the **Recent Translations** drawer where previous translations are saved and reusable.
5. **Outro (50–60s)**:
   * *"The application handles text, speech-to-text, and text-to-speech seamlessly. Thank you CodeAlpha for this opportunity!"*

---

## 📤 How to Push to GitHub

Run these commands inside your project root:

```bash
# 1. Initialize Git (if not already done)
git init

# 2. Stage files (.env is automatically protected by .gitignore)
git add .

# 3. Commit changes
git commit -m "feat: implement Sarvam AI default agent suite for CodeAlpha Task 1"

# 4. Set main branch
git branch -M main

# 5. Connect to your GitHub repository
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/CodeAlpha_LanguageTranslationTool.git

# 6. Push to GitHub
git push -u origin main
```

---

## 👤 Author

* **Developer**: Syash
* **Internship**: CodeAlpha Artificial Intelligence Internship (Task 1)
* **Project Name**: `CodeAlpha_LanguageTranslationTool`
