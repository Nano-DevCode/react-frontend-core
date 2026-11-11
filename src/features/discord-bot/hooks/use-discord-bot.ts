import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/use-auth-store';
import {
  fetchBotStatusAction,
  fetchGuildsAction,
  fetchGuildQueueAction,
  sendPlaybackAction,
  removeTrackFromQueueAction,
  clearQueueAction,
  sendChatMessageAction,
  updateGuildConfigAction,
  registerLavalinkSessionAction,
  unregisterLavalinkSessionAction,
  fetchMyTwitchLinksAction,
  linkTwitchChannelAction,
  unlinkTwitchChannelAction,
} from '../actions/discord-bot.actions';
import type {
  DiscordGuildQueue,
  PlaybackActionPayload,
  AudioTrackItem,
  UpdateGuildConfigPayload,
  RegisterLavalinkDto,
  LinkTwitchChannelDto,
} from '../types/discord-bot.types';

export const MAX_HISTORY_ITEMS = 10;
const HISTORY_STORAGE_PREFIX = 'music_history_v1:';
const HISTORY_SYNC_EVENT = 'discord-local-history-sync';

/**
 * Sanitiza una pista para almacenar en localStorage únicamente los metadatos seguros necesarios.
 */
function sanitizeTrackForStorage(track: AudioTrackItem): AudioTrackItem {
  return {
    encoded: track.encoded,
    info: {
      title: track.info.title,
      author: track.info.author,
      uri: track.info.uri || '',
      identifier: track.info.identifier || '',
      artworkUrl: track.info.artworkUrl ?? null,
      length: track.info.length || 0,
      sourceName: track.info.sourceName || 'youtube',
      isSeekable: Boolean(track.info.isSeekable),
      isStream: Boolean(track.info.isStream),
    },
    requester: {
      id: track.requester?.id || 'user',
      username: track.requester?.username || 'Usuario',
    },
  };
}

function readLocalHistory(guildId: string | null): AudioTrackItem[] {
  if (!guildId || typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(
      `${HISTORY_STORAGE_PREFIX}${guildId}`,
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is AudioTrackItem =>
          Boolean(item) &&
          typeof item === 'object' &&
          'encoded' in item &&
          'info' in item,
      )
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

function writeLocalHistory(guildId: string, tracks: AudioTrackItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const capped = tracks
      .map(sanitizeTrackForStorage)
      .slice(0, MAX_HISTORY_ITEMS);
    window.localStorage.setItem(
      `${HISTORY_STORAGE_PREFIX}${guildId}`,
      JSON.stringify(capped),
    );
    window.dispatchEvent(
      new CustomEvent(HISTORY_SYNC_EVENT, { detail: { guildId } }),
    );
  } catch {
    // Ignorar quota exceeded en modo privado
  }
}

/**
 * Hook que sincroniza el historial de reproducción del servidor con localStorage
 * guardando de forma segura únicamente las últimas 10 canciones (FIFO) bajo `music_history_v1:<guildId>`.
 */
export const useLocalMusicHistory = (
  guildId: string | null,
  currentTrack: AudioTrackItem | null | undefined,
  serverHistory: AudioTrackItem[] | undefined,
) => {
  const [localHistory, setLocalHistory] = useState<AudioTrackItem[]>(() =>
    readLocalHistory(guildId),
  );
  const [lastSeenTrackRef, setLastSeenTrackRef] =
    useState<AudioTrackItem | null>(null);

  useEffect(() => {
    setLocalHistory(readLocalHistory(guildId));
    setLastSeenTrackRef(null);
  }, [guildId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !guildId) return;
    const onSync = (event: Event) => {
      const custom = event as CustomEvent<{ guildId?: string }>;
      if (!custom.detail?.guildId || custom.detail.guildId === guildId) {
        setLocalHistory(readLocalHistory(guildId));
      }
    };
    window.addEventListener(HISTORY_SYNC_EVENT, onSync);
    return () => window.removeEventListener(HISTORY_SYNC_EVENT, onSync);
  }, [guildId]);

  // Cuando cambia la canción en reproducción o llega historial del backend, actualizar el FIFO de 10 pistas
  useEffect(() => {
    if (!guildId) return;

    let existing = readLocalHistory(guildId);
    let modified = false;

    // 1. Si había una canción sonando y cambió a otra distinta (o terminó), empujar la anterior al historial local
    if (
      lastSeenTrackRef &&
      (!currentTrack || currentTrack.encoded !== lastSeenTrackRef.encoded)
    ) {
      const sanitizedPrev = sanitizeTrackForStorage(lastSeenTrackRef);
      existing = [
        sanitizedPrev,
        ...existing.filter((t) => t.encoded !== sanitizedPrev.encoded),
      ].slice(0, MAX_HISTORY_ITEMS);
      modified = true;
    }

    if (
      currentTrack &&
      (!lastSeenTrackRef || lastSeenTrackRef.encoded !== currentTrack.encoded)
    ) {
      setLastSeenTrackRef(sanitizeTrackForStorage(currentTrack));
    } else if (!currentTrack && lastSeenTrackRef) {
      setLastSeenTrackRef(null);
    }

    // 2. Fusionar con el historial que envía el backend (serverHistory) respetando el tope de 10
    if (serverHistory && serverHistory.length > 0) {
      const mergedMap = new Map<string, AudioTrackItem>();
      for (const item of serverHistory) {
        const clean = sanitizeTrackForStorage(item);
        if (!mergedMap.has(clean.encoded)) {
          mergedMap.set(clean.encoded, clean);
        }
      }
      for (const item of existing) {
        if (!mergedMap.has(item.encoded)) {
          mergedMap.set(item.encoded, item);
        }
      }
      const mergedList = Array.from(mergedMap.values()).slice(
        0,
        MAX_HISTORY_ITEMS,
      );
      if (JSON.stringify(mergedList) !== JSON.stringify(existing)) {
        existing = mergedList;
        modified = true;
      }
    }

    if (modified) {
      writeLocalHistory(guildId, existing);
      setLocalHistory(existing);
    }
  }, [guildId, currentTrack, serverHistory, lastSeenTrackRef]);

  const clearLocalHistory = useCallback(() => {
    if (!guildId || typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(`${HISTORY_STORAGE_PREFIX}${guildId}`);
      setLocalHistory([]);
      window.dispatchEvent(
        new CustomEvent(HISTORY_SYNC_EVENT, { detail: { guildId } }),
      );
      toast.success('Historial local de reproducción limpiado');
    } catch {
      // Ignorar
    }
  }, [guildId]);

  return {
    history: localHistory.slice(0, MAX_HISTORY_ITEMS),
    clearLocalHistory,
  };
};

const getDiscordSocketEndpoint = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    try {
      const parsed = new URL(envUrl);
      return `${parsed.origin}/realtime/discord-bot`;
    } catch {
      // Fallback si URL es relativa
    }
  }

  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1') &&
    window.location.port !== '3000' &&
    window.location.port !== '80' &&
    window.location.port !== '443' &&
    window.location.port !== ''
  ) {
    return 'http://localhost:3000/realtime/discord-bot';
  }

  return '/realtime/discord-bot';
};

let sharedDiscordSocket: Socket | null = null;
let currentToken: string | null = null;

export const useDiscordSocketSync = (guildId: string | null) => {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isConnected, setIsConnected] = useState<boolean>(() =>
    Boolean(sharedDiscordSocket?.connected),
  );

  useEffect(() => {
    const endpoint = getDiscordSocketEndpoint();

    if (sharedDiscordSocket && currentToken !== accessToken) {
      sharedDiscordSocket.removeAllListeners();
      sharedDiscordSocket.disconnect();
      sharedDiscordSocket = null;
      currentToken = null;
    }

    if (!sharedDiscordSocket) {
      currentToken = accessToken || null;
      sharedDiscordSocket = io(endpoint, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        withCredentials: true,
        auth: {
          token: accessToken || undefined,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 5000,
      });
    }

    const socket = sharedDiscordSocket;

    const onConnect = () => {
      setIsConnected(true);
      if (guildId) {
        socket.emit('join-guild-room', { guildId });
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected && guildId) {
      socket.emit('join-guild-room', { guildId });
    }

    // 1. Evento: Cola actualizada (play, remove, clear, next, previous)
    const onQueueUpdated = (queueData: DiscordGuildQueue) => {
      if (guildId && queueData?.guildId === guildId) {
        queryClient.setQueryData<DiscordGuildQueue>(
          ['discord-queue', guildId],
          (old) => {
            if (!old) return queueData;
            return {
              ...old,
              ...queueData,
            };
          },
        );
        void queryClient.invalidateQueries({
          queryKey: ['discord-bot-guilds'],
        });
      }
    };

    // 2. Evento: Pista iniciada
    const onTrackStart = (data: {
      guildId: string;
      track: AudioTrackItem | null;
    }) => {
      if (guildId && data?.guildId === guildId) {
        queryClient.setQueryData<DiscordGuildQueue>(
          ['discord-queue', guildId],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              currentTrack: data.track,
              position: 0,
              isPaused: false,
            };
          },
        );
        void queryClient.invalidateQueries({
          queryKey: ['discord-bot-guilds'],
        });
      }
    };

    // 3. Evento: Cambio de estado (pause, resume, volume, stop)
    const onPlaybackState = (data: {
      guildId: string;
      isPaused: boolean;
      volume: number;
      status: string;
    }) => {
      if (guildId && data?.guildId === guildId) {
        queryClient.setQueryData<DiscordGuildQueue>(
          ['discord-queue', guildId],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              isPaused: data.isPaused,
              volume: data.volume,
            };
          },
        );
      }
    };

    // 4. Evento: Ticker de progreso en milisegundos
    const onTrackProgress = (data: {
      guildId: string;
      position: number;
      duration: number;
      isPaused: boolean;
    }) => {
      if (guildId && data?.guildId === guildId) {
        queryClient.setQueryData<DiscordGuildQueue>(
          ['discord-queue', guildId],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              position: data.position,
              isPaused: data.isPaused ?? old.isPaused,
            };
          },
        );
      }
    };

    socket.on('discord:queue-updated', onQueueUpdated);
    socket.on('discord:track-start', onTrackStart);
    socket.on('discord:playback-state', onPlaybackState);
    socket.on('discord:track-progress', onTrackProgress);

    return () => {
      if (guildId && socket.connected) {
        socket.emit('leave-guild-room', { guildId });
      }
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('discord:queue-updated', onQueueUpdated);
      socket.off('discord:track-start', onTrackStart);
      socket.off('discord:playback-state', onPlaybackState);
      socket.off('discord:track-progress', onTrackProgress);
    };
  }, [guildId, accessToken, queryClient]);

  return { isConnected };
};

export const useDiscordBotStatusQuery = () => {
  return useQuery({
    queryKey: ['discord-bot-status'],
    queryFn: fetchBotStatusAction,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    staleTime: 1000 * 20,
    retry: 1,
  });
};

export const useDiscordGuildsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['discord-bot-guilds'],
    queryFn: fetchGuildsAction,
    enabled,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    staleTime: 1000 * 30,
    retry: 1,
  });
};

export const useDiscordGuildQueueQuery = (guildId: string | null) => {
  return useQuery({
    queryKey: ['discord-queue', guildId],
    queryFn: () => (guildId ? fetchGuildQueueAction(guildId) : null),
    enabled: Boolean(guildId),
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    staleTime: 1000 * 30,
  });
};

function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const serverMessage = err.response?.data?.message;
    if (typeof serverMessage === 'string') return serverMessage;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export const usePlaybackMutation = (guildId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlaybackActionPayload) => {
      if (!guildId) throw new Error('No se ha seleccionado ningún servidor');
      return sendPlaybackAction(guildId, payload);
    },
    onSuccess: (res, variables) => {
      if (res.message && variables.action !== 'volume' && variables.action !== 'seek') {
        toast.success(res.message);
      }
      if (guildId) {
        if (variables.action === 'volume' && typeof variables.value === 'number') {
          queryClient.setQueryData<DiscordGuildQueue>(
            ['discord-queue', guildId],
            (old) => (old ? { ...old, volume: variables.value! } : old),
          );
        } else {
          void queryClient.invalidateQueries({
            queryKey: ['discord-queue', guildId],
          });
        }
      }
      if (variables.action === 'play' || variables.action === 'stop' || variables.action === 'leave') {
        void queryClient.invalidateQueries({ queryKey: ['discord-bot-guilds'] });
      }
    },
    onError: (err: unknown) => {
      toast.error(
        extractErrorMessage(err, 'Error al procesar la acción de reproducción'),
      );
    },
  });
};

export const useRemoveTrackMutation = (guildId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (index: number) => {
      if (!guildId) throw new Error('No se ha seleccionado ningún servidor');
      return removeTrackFromQueueAction(guildId, index);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Pista eliminada de la cola');
      if (guildId) {
        void queryClient.invalidateQueries({
          queryKey: ['discord-queue', guildId],
        });
      }
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Error al eliminar la pista'));
    },
  });
};

export const useClearQueueMutation = (guildId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!guildId) throw new Error('No se ha seleccionado ningún servidor');
      return clearQueueAction(guildId);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Cola vaciada');
      if (guildId) {
        void queryClient.invalidateQueries({
          queryKey: ['discord-queue', guildId],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ['discord-bot-guilds'] });
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Error al vaciar la cola'));
    },
  });
};

export const useSendMessageMutation = (guildId: string | null) => {
  return useMutation({
    mutationFn: (payload: { channelId: string; content: string }) => {
      if (!guildId) throw new Error('No se ha seleccionado ningún servidor');
      return sendChatMessageAction({ guildId, ...payload });
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Mensaje enviado a Discord');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Error al enviar el mensaje'));
    },
  });
};

export const useUpdateGuildConfigMutation = (guildId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGuildConfigPayload) => {
      if (!guildId) throw new Error('No se ha seleccionado ningún servidor');
      return updateGuildConfigAction(guildId, payload);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Configuración actualizada');
      void queryClient.invalidateQueries({ queryKey: ['discord-bot-guilds'] });
    },
    onError: (err: unknown) => {
      toast.error(
        extractErrorMessage(err, 'Error al actualizar la configuración'),
      );
    },
  });
};

export const useRegisterLavalinkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterLavalinkDto) =>
      registerLavalinkSessionAction(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Registrado en Lavalink exitosamente');
      void queryClient.invalidateQueries({ queryKey: ['discord-bot-status'] });
      void queryClient.invalidateQueries({ queryKey: ['discord-bot-guilds'] });
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Error al registrarse en Lavalink'));
    },
  });
};

export const useUnregisterLavalinkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guildId: string) => unregisterLavalinkSessionAction(guildId),
    onSuccess: (res) => {
      toast.success(res.message || 'Servidor desvinculado de Lavalink');
      void queryClient.invalidateQueries({ queryKey: ['discord-bot-status'] });
      void queryClient.invalidateQueries({ queryKey: ['discord-bot-guilds'] });
    },
    onError: (err: unknown) => {
      toast.error(
        extractErrorMessage(err, 'Error al desvincular servidor de Lavalink'),
      );
    },
  });
};

export const useMyTwitchLinksQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['discord-twitch-links'],
    queryFn: fetchMyTwitchLinksAction,
    enabled,
    staleTime: 1000 * 30,
    retry: 1,
  });
};

export const useLinkTwitchChannelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LinkTwitchChannelDto) =>
      linkTwitchChannelAction(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Canal de Twitch vinculado');
      void queryClient.invalidateQueries({ queryKey: ['discord-twitch-links'] });
    },
    onError: (err: unknown) => {
      toast.error(
        extractErrorMessage(err, 'Error al vincular el canal de Twitch'),
      );
    },
  });
};

export const useUnlinkTwitchChannelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channel: string) => unlinkTwitchChannelAction(channel),
    onSuccess: () => {
      toast.success('Canal de Twitch desvinculado');
      void queryClient.invalidateQueries({ queryKey: ['discord-twitch-links'] });
    },
    onError: (err: unknown) => {
      toast.error(
        extractErrorMessage(err, 'Error al desvincular el canal de Twitch'),
      );
    },
  });
};
