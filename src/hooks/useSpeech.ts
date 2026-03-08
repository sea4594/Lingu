import { useCallback, useRef } from 'react';

// Web Speech API types (vendor-prefixed in many browsers)
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
}

type ISpeechRecognitionConstructor = new () => ISpeechRecognition;

const getSpeechRecognitionCtor = (): ISpeechRecognitionConstructor | null => {
  const w = window as Window & {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useSpeech = () => {
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  /** Speak text using Web SpeechSynthesis API */
  const speak = useCallback((text: string, options: SpeechOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang ?? 'en-US';
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      const voices = window.speechSynthesis.getVoices();
      const langCode = utterance.lang.split('-')[0];
      const matchingVoice =
        voices.find((v) => v.lang === utterance.lang) ??
        voices.find((v) => v.lang.startsWith(langCode));
      if (matchingVoice) utterance.voice = matchingVoice;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(new Error(`Speech error: ${e.error}`));
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const isRecognitionSupported =
    typeof window !== 'undefined' && getSpeechRecognitionCtor() !== null;

  /** Start speech recognition and return the transcript */
  const recognize = useCallback(
    (lang = 'en-US', timeout = 8000): Promise<string> => {
      return new Promise((resolve, reject) => {
        const Ctor = getSpeechRecognitionCtor();
        if (!Ctor) {
          reject(new Error('Speech recognition not supported'));
          return;
        }

        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }

        const recognition = new Ctor();
        recognitionRef.current = recognition;
        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        recognition.onresult = (event: ISpeechRecognitionEvent) => {
          if (timeoutId) clearTimeout(timeoutId);
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };

        recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
          if (timeoutId) clearTimeout(timeoutId);
          reject(new Error(`Recognition error: ${event.error}`));
        };

        recognition.onend = () => {
          if (timeoutId) clearTimeout(timeoutId);
        };

        recognition.start();

        timeoutId = setTimeout(() => {
          recognition.stop();
          reject(new Error('Recognition timed out'));
        }, timeout);
      });
    },
    []
  );

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  return {
    speak,
    stopSpeaking,
    recognize,
    stopRecognition,
    isSpeechSupported,
    isRecognitionSupported,
  };
};
