import { useState, useEffect } from 'react';
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
} from '../actions/discord-bot.actions';
import type {
  DiscordGuildQueue,
  PlaybackActionPayload,
  AudioTrackItem,
  UpdateGuildConfigPayload,
} from '../types/discord-bot.types';

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
      // Evitar saturación de toasts con acciones frecuentes de volumen o seek
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
      // Solo invalidar el listado de servidores si la acción modifica el estado global
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
