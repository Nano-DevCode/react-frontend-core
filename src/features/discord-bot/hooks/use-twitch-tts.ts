import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { TwitchTtsPayload } from '../types/discord-bot.types';

const STORAGE_KEYS = {
  ENABLED: 'antigravity_twitch_tts_enabled',
  VOLUME: 'antigravity_twitch_tts_volume',
  RATE: 'antigravity_twitch_tts_rate',
  VOICE_URI: 'antigravity_twitch_tts_voice_uri',
  INCLUDE_SENDER: 'antigravity_twitch_tts_include_sender',
};

export const useTwitchTts = () => {
  const [enabled, setEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(STORAGE_KEYS.ENABLED) !== 'false';
  });

  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.0;
    const val = localStorage.getItem(STORAGE_KEYS.VOLUME);
    return val ? parseFloat(val) : 1.0;
  });

  const [rate, setRateState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.0;
    const val = localStorage.getItem(STORAGE_KEYS.RATE);
    return val ? parseFloat(val) : 1.0;
  });

  const [includeSender, setIncludeSenderState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(STORAGE_KEYS.INCLUDE_SENDER) !== 'false';
  });

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUriState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEYS.VOICE_URI) || '';
  });

  const [recentMessages, setRecentMessages] = useState<TwitchTtsPayload[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const queueRef = useRef<Array<{ displayName: string; text: string }>>([]);
  const isProcessingQueueRef = useRef<boolean>(false);

  // Cargar voces del sintetizador nativo del navegador
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    localStorage.setItem(STORAGE_KEYS.ENABLED, String(value));
    if (!value && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      queueRef.current = [];
      setIsSpeaking(false);
    }
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    localStorage.setItem(STORAGE_KEYS.VOLUME, String(value));
  }, []);

  const setRate = useCallback((value: number) => {
    setRateState(value);
    localStorage.setItem(STORAGE_KEYS.RATE, String(value));
  }, []);

  const setIncludeSender = useCallback((value: boolean) => {
    setIncludeSenderState(value);
    localStorage.setItem(STORAGE_KEYS.INCLUDE_SENDER, String(value));
  }, []);

  const setSelectedVoiceUri = useCallback((uri: string) => {
    setSelectedVoiceUriState(uri);
    localStorage.setItem(STORAGE_KEYS.VOICE_URI, uri);
  }, []);

  const processQueue = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (queueRef.current.length === 0) {
      isProcessingQueueRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isProcessingQueueRef.current = true;
    setIsSpeaking(true);

    const item = queueRef.current.shift();
    if (!item) {
      processQueue();
      return;
    }

    const textToSpeak = includeSender
      ? `${item.displayName} dice: ${item.text}`
      : item.text;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.volume = volume;
    utterance.rate = rate;

    // Buscar voz seleccionada o preferir español
    if (selectedVoiceUri) {
      const found = voices.find((v) => v.voiceURI === selectedVoiceUri);
      if (found) utterance.voice = found;
    } else {
      const spanishVoice = voices.find(
        (v) =>
          v.lang.startsWith('es') ||
          v.lang.includes('ES') ||
          v.lang.includes('MX'),
      );
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
    }

    utterance.onend = () => {
      setTimeout(() => {
        processQueue();
      }, 100);
    };

    utterance.onerror = () => {
      setTimeout(() => {
        processQueue();
      }, 100);
    };

    window.speechSynthesis.speak(utterance);
  }, [includeSender, volume, rate, selectedVoiceUri, voices]);

  const speak = useCallback(
    (displayName: string, text: string) => {
      if (!enabled) return;
      queueRef.current.push({ displayName, text });
      if (!isProcessingQueueRef.current) {
        processQueue();
      }
    },
    [enabled, processQueue],
  );

  const testSpeak = useCallback(() => {
    speak(
      'Prueba',
      'El lector de voz de Twitch con comando !pr está funcionando en tu navegador.',
    );
  }, [speak]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    queueRef.current = [];
    isProcessingQueueRef.current = false;
    setIsSpeaking(false);
  }, []);

  const clearHistory = useCallback(() => {
    setRecentMessages([]);
  }, []);

  // Escuchar eventos entrantes desde el WebSocket
  useEffect(() => {
    const handleIncoming = (e: Event) => {
      const customEvent = e as CustomEvent<TwitchTtsPayload>;
      const payload = customEvent.detail;
      if (!payload || !payload.text) return;

      setRecentMessages((prev) => [payload, ...prev.slice(0, 19)]);

      if (enabled) {
        toast.info(`🗣️ Twitch !pr de @${payload.displayName}`, {
          description: payload.text,
          duration: 4000,
        });
        speak(payload.displayName, payload.text);
      }
    };

    window.addEventListener('antigravity:twitch-tts', handleIncoming);
    return () => {
      window.removeEventListener('antigravity:twitch-tts', handleIncoming);
    };
  }, [enabled, speak]);

  return {
    enabled,
    setEnabled,
    volume,
    setVolume,
    rate,
    setRate,
    includeSender,
    setIncludeSender,
    voices,
    selectedVoiceUri,
    setSelectedVoiceUri,
    isSpeaking,
    testSpeak,
    stopSpeaking,
    recentMessages,
    clearHistory,
    speak,
  };
};
