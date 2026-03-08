# Lingu 🌍

A comprehensive language learning web app built with React, TypeScript, and Vite.

## Features

- **20 Most-Spoken Languages** — Mandarin, Spanish, English, Hindi, Arabic, Bengali, Portuguese, Russian, Japanese, Punjabi, German, Korean, French, Turkish, Vietnamese, Italian, Tamil, Urdu, Thai, Polish
- **Spaced Repetition System (SM-2)** — Reviews words at scientifically optimal intervals for long-term retention
- **5 Learning Activities:**
  - 📚 **Vocabulary Practice** — Flashcards, multiple choice (both directions), type-the-translation, pronunciation (Web Speech API), and listening modes
  - 🧠 **SRS Review** — Daily review of words due for reinforcement
  - 🎧 **Listening Practice** — Hear and identify spoken words/phrases
  - 🧩 **Sentence Builder** — Rearrange scrambled words to form correct sentences
  - 📖 **Reading Stories** — Read passages with clickable word translations
- **Progress Tracking** — Stored in localStorage; level, XP, streaks, and word mastery stats
- **Research-Based Design** — Active recall, spaced repetition, interleaving, comprehensible input (i+1)

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Technology

- React 19 + TypeScript + Vite
- Tailwind CSS
- Web Speech API (TTS + Speech Recognition — browser built-in, free, no API key needed)
- localStorage for offline progress persistence
