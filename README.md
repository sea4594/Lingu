# Lingu: Japanese Vocabulary Trainer

A focused Japanese-only vocabulary learning app built with React, TypeScript, and Vite.

## What this version does

- Japanese is the only language in scope.
- Includes a cached in-repo vocabulary dataset with more than 20,000 words/phrases.
- Runs a first-launch placement quiz to estimate starting level.
- Flashcards support English -> Japanese and Japanese -> English directions.
- Japanese-side card details are configurable (characters, romaji, context notes).
- Card scheduling uses per-word progress with repetition, accuracy, and recency.
- Vocab list groups words into bite-size clusters and tracks comprehension scores.
- Users can add the next group, select upcoming groups/specific words, and remove words/groups.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Stack

- React 19 + TypeScript + Vite
- localStorage for offline progress persistence

## Optional: Japanese AI Text-to-Speech

The app includes Japanese text-to-speech for flashcards, placement cards, and vocab rows.

- Default: browser Japanese voice (`ja-JP`) fallback
- Premium option: ElevenLabs Japanese AI voice

Set these in your environment to enable the premium voice:

```bash
VITE_ELEVENLABS_API_KEY=your_api_key
VITE_ELEVENLABS_JA_VOICE_ID=your_japanese_voice_id
```
