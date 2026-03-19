import { useCallback, useRef } from 'react';

// Web Speech API types (vendor-prefixed in many browsers)
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous?: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart?: (() => void) | null;
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
        const startedAt = Date.now();
        let usedEarlyRecovery = false;
        let restartId: ReturnType<typeof setTimeout> | null = null;

        const cleanup = () => {
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
          }
          if (restartId) {
            clearTimeout(restartId);
            restartId = null;
          }
          recognitionRef.current = null;
          pendingRejectRef.current = null;
        };

        const shouldTryEarlyRecovery = () => {
          if (usedEarlyRecovery || settled || manuallyStoppedRef.current) {
            return false;
          }
          const elapsedMs = Date.now() - startedAt;
          return elapsedMs < 1400;
        };

        const startSession = () => {
          if (settled || manuallyStoppedRef.current) {
            return;
          }

          const recognition = new Ctor();
          recognitionRef.current = recognition;
          recognition.lang = lang;
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.maxAlternatives = 2;

          recognition.onresult = (event: ISpeechRecognitionEvent) => {
            const latestIndex = event.results.length - 1;
            const latest = event.results[latestIndex]?.[0]?.transcript ?? '';
            const nextTranscript = latest.trim();

            if (!nextTranscript) {
              return;
            }

            transcript = nextTranscript;
            if (!settled) {
              settled = true;
              cleanup();
              resolve(transcript);
            }
          };

          recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
            if (settled) {
              return;
            }

            if (manuallyStoppedRef.current) {
              settled = true;
              cleanup();
              reject(new Error('Recognition manually stopped'));
              return;
            }

            const err = event.error.toLowerCase();
            const recoverable = err === 'aborted' || err === 'network' || err === 'no-speech';
            if (recoverable && shouldTryEarlyRecovery()) {
              usedEarlyRecovery = true;
              restartId = setTimeout(() => {
                restartId = null;
                startSession();
              }, 260);
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

            if (transcript.length > 0) {
              settled = true;
              cleanup();
              resolve(transcript);
              return;
            }

            if (shouldTryEarlyRecovery()) {
              usedEarlyRecovery = true;
              restartId = setTimeout(() => {
                restartId = null;
                startSession();
              }, 260);
              return;
            }

            settled = true;
            cleanup();
            reject(new Error('Recognition timed out'));
          };

          try {
            recognition.start();
          } catch (e) {
            if (shouldTryEarlyRecovery()) {
              usedEarlyRecovery = true;
              restartId = setTimeout(() => {
                restartId = null;
                startSession();
              }, 300);
              return;
            }

            settled = true;
            cleanup();
            reject(new Error(`Failed to start recognition: ${e instanceof Error ? e.message : String(e)}`));
          }
        };

        startSession();

        timeoutIdRef.current = setTimeout(() => {
          if (settled) {
            return;
          }

          settled = true;
          const activeRecognition = recognitionRef.current;
          cleanup();
          if (activeRecognition) {
            try {
              activeRecognition.stop();
            } catch {
              // Ignore errors on stop
            }
          }

          reject(new Error('Recognition timed out'));
        }, timeout);
      });
    },
    []
  );

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      manuallyStoppedRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors from already-ended iOS sessions.
      }
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
