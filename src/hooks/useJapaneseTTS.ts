import { useCallback, useMemo, useRef, useState } from 'react';

type SpeakOptions = {
  rate?: number;
  style?: number;
};

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
const ELEVENLABS_JA_VOICE_ID = (import.meta.env.VITE_ELEVENLABS_JA_VOICE_ID as string | undefined) ?? 'EXAVITQu4vr4xnSDxMaL';

export const useJapaneseTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeAudioUrlRef = useRef<string | null>(null);

  const cleanupAudioUrl = useCallback(() => {
    if (activeAudioUrlRef.current) {
      URL.revokeObjectURL(activeAudioUrlRef.current);
      activeAudioUrlRef.current = null;
    }
  }, []);

  const speakWithElevenLabs = useCallback(async (text: string, options?: SpeakOptions) => {
    const style = Math.max(0, Math.min(1, options?.style ?? 0.2));
    const rate = Math.max(0.75, Math.min(1.35, options?.rate ?? 1));
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_JA_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.45 - style * 0.15,
          similarity_boost: 0.85,
          style,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs request failed with status ${response.status}`);
    }

    const audioBlob = await response.blob();
    cleanupAudioUrl();
    const audioUrl = URL.createObjectURL(audioBlob);
    activeAudioUrlRef.current = audioUrl;

    const audio = new Audio(audioUrl);
    audio.playbackRate = rate;
    await audio.play();

    await new Promise<void>((resolve) => {
      const done = () => {
        audio.removeEventListener('ended', done);
        audio.removeEventListener('error', done);
        resolve();
      };
      audio.addEventListener('ended', done);
      audio.addEventListener('error', done);
    });
  }, [cleanupAudioUrl]);

  const speakWithBrowser = useCallback((text: string, options?: SpeakOptions) => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis unavailable'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = options?.rate ?? 1;

      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('ja'));
      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error('Speech synthesis error'));

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const speak = useCallback(async (text: string, options?: SpeakOptions) => {
    const normalized = text.trim();
    if (!normalized) {
      return;
    }

    setIsSpeaking(true);
    try {
      if (ELEVENLABS_API_KEY) {
        await speakWithElevenLabs(normalized, options);
      } else {
        await speakWithBrowser(normalized, options);
      }
    } catch {
      await speakWithBrowser(normalized, options);
    } finally {
      setIsSpeaking(false);
    }
  }, [speakWithBrowser, speakWithElevenLabs]);

  const providerLabel = useMemo(() => {
    if (ELEVENLABS_API_KEY) {
      return 'ElevenLabs Japanese voice';
    }
    return 'Browser Japanese voice (fallback)';
  }, []);

  return {
    speak,
    isSpeaking,
    providerLabel,
    hasPremiumVoice: Boolean(ELEVENLABS_API_KEY),
  };
};
