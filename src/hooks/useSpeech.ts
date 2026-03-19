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
  const pendingRejectRef = useRef<((reason?: unknown) => void) | null>(null);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manuallyStoppedRef = useRef(false);
  const restartCountRef = useRef(0);
  const maxRestartsRef = useRef(3);
  const recognizeConfigRef = useRef<{ lang: string; timeout: number }>({ lang: 'en-US', timeout: 8000 });

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

        // Store config for potential restarts
        recognizeConfigRef.current = { lang, timeout };
        restartCountRef.current = 0;

        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }

        pendingRejectRef.current = reject;
        manuallyStoppedRef.current = false;

        let settled = false;
        let transcript = '';
        let timeoutFired = false;
        const startTime = Date.now();

        const cleanup = () => {
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
          }
          recognitionRef.current = null;
          pendingRejectRef.current = null;
        };

        const startRecognition = () => {
          const recognition = new Ctor();
          recognitionRef.current = recognition;
          recognition.lang = lang;
          recognition.interimResults = false;
          recognition.maxAlternatives = 3;

          recognition.onresult = (event: ISpeechRecognitionEvent) => {
            const firstResult = event.results[0]?.[0]?.transcript ?? '';
            transcript = firstResult.trim();
          };

          recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
            if (settled) {
              return;
            }
            // On iOS, "network" errors are common and often recoverable
            const error = event.error.toLowerCase();
            if (error === 'network' && restartCountRef.current < maxRestartsRef.current && !timeoutFired) {
              restartCountRef.current += 1;
              // Restart after a small delay on network errors (iOS quirk)
              if (recognitionRef.current) {
                recognitionRef.current.stop();
              }
              setTimeout(() => {
                if (!manuallyStoppedRef.current && !timeoutFired) {
                  startRecognition();
                }
              }, 100);
              return;
            }
            settled = true;
            cleanup();
            reject(new Error(`Recognition error: ${event.error}`));
          };

          recognition.onend = () => {
            if (settled) {
              return;
            }

            if (manuallyStoppedRef.current) {
              settled = true;
              cleanup();
              reject(new Error('Recognition manually stopped'));
              return;
            }

            // If timeout hasn't fired and we haven't restarted too many times, restart
            if (!timeoutFired && restartCountRef.current < maxRestartsRef.current) {
              const elapsed = Date.now() - startTime;
              if (elapsed < timeout) {
                restartCountRef.current += 1;
                // Small delay before restarting to avoid immediate re-end on iOS
                setTimeout(() => {
                  if (!manuallyStoppedRef.current && !timeoutFired) {
                    startRecognition();
                  }
                }, 50);
                return;
              }
            }

            settled = true;
            cleanup();
            resolve(transcript);
          };

          try {
            recognition.start();
          } catch (e) {
            // iOS sometimes throws synchronously
            if (!settled) {
              settled = true;
              cleanup();
              reject(new Error(`Failed to start recognition: ${e instanceof Error ? e.message : String(e)}`));
            }
          }
        };

        startRecognition();

        timeoutIdRef.current = setTimeout(() => {
          timeoutFired = true;
          if (!settled && recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch {
              // Ignore errors on stop
            }
          }
        }, timeout);
      });
    },
    []
  );

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      manuallyStoppedRef.current = true;
      recognitionRef.current.stop();
      if (pendingRejectRef.current) {
        pendingRejectRef.current(new Error('Recognition manually stopped'));
        pendingRejectRef.current = null;
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
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
