import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Square,
  Volume2,
  VolumeX,
  Radio,
  Search,
  LogOut,
  Disc3,
  FastForward,
  Rewind,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type {
  DiscordGuildInfo,
  DiscordGuildQueue,
  AudioTrackItem,
} from '../types/discord-bot.types';
import {
  usePlaybackMutation,
  useLocalMusicHistory,
} from '../hooks/use-discord-bot';

interface PlayerControlsProps {
  guild: DiscordGuildInfo;
  queue: DiscordGuildQueue | null | undefined;
  isLoadingQueue: boolean;
}

interface YTPlayerInstance {
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTNamespace {
  Player: new (
    elementId: string | HTMLElement,
    options: {
      height?: string | number;
      width?: string | number;
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayerInstance }) => void;
        onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
        onError?: () => void;
      };
    },
  ) => YTPlayerInstance;
  PlayerState?: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface WebAudioPreferences {
  enabled: boolean;
  muted: boolean;
  volume: number;
}

const WEB_AUDIO_PREFS_KEY = 'music_web_audio_prefs_v1';
const DRIFT_THRESHOLD_SECONDS = 3;

function loadWebAudioPrefs(): WebAudioPreferences {
  if (typeof window === 'undefined') {
    return { enabled: true, muted: false, volume: 80 };
  }
  try {
    const raw = window.localStorage.getItem(WEB_AUDIO_PREFS_KEY);
    if (!raw) return { enabled: true, muted: false, volume: 80 };
    const parsed = JSON.parse(raw) as Partial<WebAudioPreferences>;
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : false,
      volume:
        typeof parsed.volume === 'number'
          ? Math.max(0, Math.min(100, parsed.volume))
          : 80,
    };
  } catch {
    return { enabled: true, muted: false, volume: 80 };
  }
}

function saveWebAudioPrefs(prefs: WebAudioPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WEB_AUDIO_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignorar
  }
}

function extractYouTubeVideoId(track: AudioTrackItem | null | undefined): string | null {
  if (!track) return null;
  const { identifier, uri, sourceName } = track.info;

  if (
    identifier &&
    /^[a-zA-Z0-9_-]{11}$/.test(identifier) &&
    (!sourceName || /youtube/i.test(sourceName))
  ) {
    return identifier;
  }

  if (uri) {
    const match = uri.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    );
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function formatTime(millis: number): string {
  if (!millis || millis <= 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const PlayerControls = ({
  guild,
  queue,
  isLoadingQueue,
}: PlayerControlsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVoiceChannelId, setSelectedVoiceChannelId] =
    useState<string>('');
  const activeVoiceChannelId =
    selectedVoiceChannelId ||
    guild.userSession?.voiceChannelId ||
    guild.voiceChannels[0]?.id ||
    '';

  // Volumen del Bot en Discord (0 - 200%)
  const currentVolume = queue?.volume ?? 100;
  const [prevQueueVolume, setPrevQueueVolume] = useState(currentVolume);
  const [volumeInput, setVolumeInput] = useState<number>(currentVolume);
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (currentVolume !== prevQueueVolume) {
    setPrevQueueVolume(currentVolume);
    setVolumeInput(currentVolume);
  }

  // Audio Local en el Navegador (Independiente del volumen de Discord)
  const [webPrefs, setWebPrefs] = useState<WebAudioPreferences>(() =>
    loadWebAudioPrefs(),
  );
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [isYtReady, setIsYtReady] = useState<boolean>(false);

  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const loadedVideoIdRef = useRef<string | null>(null);

  const playbackMutation = usePlaybackMutation(guild.id);
  const { history: localHistory } = useLocalMusicHistory(
    guild.id,
    queue?.currentTrack,
    queue?.history,
  );

  const currentTrack = queue?.currentTrack;
  const isPaused = queue?.isPaused ?? false;
  const position = queue?.position ?? 0;
  const duration = currentTrack?.info.length ?? 0;
  const progressPercent =
    duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  const hasHistory =
    Boolean(queue?.history && queue.history.length > 0) ||
    localHistory.length > 0;

  // Persistir preferencias locales de audio en el navegador
  const updateWebPrefs = useCallback(
    (updater: (prev: WebAudioPreferences) => WebAudioPreferences) => {
      setWebPrefs((prev) => {
        const next = updater(prev);
        saveWebAudioPrefs(next);
        return next;
      });
    },
    [],
  );

  // Cargar e inicializar YouTube IFrame API para reproducción en el navegador
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initPlayer = () => {
      if (!window.YT?.Player || !ytContainerRef.current || ytPlayerRef.current) {
        return;
      }

      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        height: 1,
        width: 1,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            const prefs = loadWebAudioPrefs();
            event.target.setVolume(prefs.volume);
            if (prefs.muted || !prefs.enabled) {
              event.target.mute();
            } else {
              event.target.unMute();
            }
            setIsYtReady(true);
          },
          onStateChange: (event) => {
            // Si el estado queda en UNSTARTED (-1) o CUED (5) cuando debería estar reproduciendo, el navegador bloqueó el Autoplay
            if ((event.data === -1 || event.data === 5) && !isPaused) {
              setAutoplayBlocked(true);
            } else if (event.data === 1) {
              setAutoplayBlocked(false);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]',
      );
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevCallback?.();
        initPlayer();
      };
    }

    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, [isPaused]);

  // Aplicar Mute y Volumen Local al reproductor del navegador sin tocar Discord
  useEffect(() => {
    const player = ytPlayerRef.current;
    if (player && isYtReady) {
      try {
        player.setVolume(webPrefs.volume);
        if (!webPrefs.enabled || webPrefs.muted || webPrefs.volume === 0) {
          player.mute();
        } else {
          player.unMute();
        }
      } catch {
        // Ignorar si el iframe aún no está listo
      }
    }

    const audioEl = htmlAudioRef.current;
    if (audioEl) {
      audioEl.volume = webPrefs.volume / 100;
      audioEl.muted = !webPrefs.enabled || webPrefs.muted || webPrefs.volume === 0;
    }
  }, [webPrefs, isYtReady]);

  // Sincronizar Pista Actual, Play/Pause y Corrección de Drift (~3s) con WebSocket
  useEffect(() => {
    const ytId = extractYouTubeVideoId(currentTrack);
    const targetSeconds = Math.max(0, Math.floor(position / 1000));

    if (!currentTrack || !webPrefs.enabled) {
      if (ytPlayerRef.current && isYtReady) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Ignorar
        }
      }
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      }
      loadedVideoIdRef.current = null;
      return;
    }

    if (ytId && ytPlayerRef.current && isYtReady) {
      // Pausar audio HTML5 si estaba activo
      if (htmlAudioRef.current && !htmlAudioRef.current.paused) {
        htmlAudioRef.current.pause();
      }

      try {
        if (loadedVideoIdRef.current !== ytId) {
          loadedVideoIdRef.current = ytId;
          ytPlayerRef.current.loadVideoById(ytId, targetSeconds);
          if (isPaused) {
            ytPlayerRef.current.pauseVideo();
          } else {
            ytPlayerRef.current.playVideo();
          }
        } else {
          const state = ytPlayerRef.current.getPlayerState?.();
          if (isPaused && state === 1) {
            ytPlayerRef.current.pauseVideo();
          } else if (!isPaused && state !== 1 && state !== 3) {
            ytPlayerRef.current.playVideo();
          }

          // Corrección de drift si la diferencia con el servidor supera los 3 segundos
          const localTime = ytPlayerRef.current.getCurrentTime?.() || 0;
          if (Math.abs(localTime - targetSeconds) > DRIFT_THRESHOLD_SECONDS) {
            ytPlayerRef.current.seekTo(targetSeconds, true);
          }
        }
      } catch {
        // Ignorar errores transitorios del IFrame
      }
      return;
    }

    // Fallback HTML5 <audio> para streams directos (MP3/OGG/Icecast)
    const audioEl = htmlAudioRef.current;
    if (
      audioEl &&
      !ytId &&
      currentTrack.info.uri &&
      /\.(mp3|ogg|wav|flac|m4a)(\?|$)/i.test(currentTrack.info.uri)
    ) {
      if (audioEl.src !== currentTrack.info.uri) {
        audioEl.src = currentTrack.info.uri;
        audioEl.currentTime = targetSeconds;
      } else if (
        Math.abs(audioEl.currentTime - targetSeconds) > DRIFT_THRESHOLD_SECONDS
      ) {
        audioEl.currentTime = targetSeconds;
      }

      if (isPaused) {
        audioEl.pause();
      } else {
        audioEl.play().catch(() => {
          setAutoplayBlocked(true);
        });
      }
    }
  }, [currentTrack, isPaused, position, webPrefs.enabled, isYtReady]);

  const handleUnlockBrowserAudio = () => {
    setAutoplayBlocked(false);
    updateWebPrefs((prev) => ({ ...prev, enabled: true, muted: false }));
    const targetSeconds = Math.max(0, Math.floor(position / 1000));

    if (ytPlayerRef.current && isYtReady) {
      try {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(webPrefs.volume || 80);
        ytPlayerRef.current.seekTo(targetSeconds, true);
        if (!isPaused) {
          ytPlayerRef.current.playVideo();
        }
      } catch {
        // Ignorar
      }
    }

    if (htmlAudioRef.current && htmlAudioRef.current.src && !isPaused) {
      htmlAudioRef.current.muted = false;
      void htmlAudioRef.current.play().catch(() => undefined);
    }
  };

  const handlePlayOrResume = () => {
    if (isPaused) {
      playbackMutation.mutate({ action: 'resume' });
    } else if (searchQuery.trim()) {
      handleSearchPlay();
    }
  };

  const handlePause = () => {
    playbackMutation.mutate({ action: 'pause' });
  };

  const handleSkip = () => {
    playbackMutation.mutate({ action: 'skip' });
  };

  const handleBack = () => {
    if (queue?.history && queue.history.length > 0) {
      playbackMutation.mutate({ action: 'back' });
      return;
    }

    // Si el historial proviene de localStorage tras reiniciar el servidor, reenviar la última canción reproducida
    const lastLocalTrack = localHistory[0];
    if (lastLocalTrack && activeVoiceChannelId) {
      playbackMutation.mutate({
        action: 'play',
        query:
          lastLocalTrack.info.uri ||
          `${lastLocalTrack.info.title} ${lastLocalTrack.info.author}`,
        voiceChannelId: activeVoiceChannelId,
      });
    }
  };

  const handleStop = () => {
    playbackMutation.mutate({ action: 'stop' });
  };

  const handleLeave = () => {
    playbackMutation.mutate({ action: 'leave' });
  };

  const handleSeek = (deltaSeconds: number) => {
    const currentSeconds = Math.floor(position / 1000);
    const targetSeconds = Math.max(0, currentSeconds + deltaSeconds);
    playbackMutation.mutate({ action: 'seek', value: targetSeconds });
  };

  const handleSearchPlay = () => {
    if (!searchQuery.trim()) return;
    const channelId = activeVoiceChannelId;
    if (!channelId) return;

    playbackMutation.mutate(
      {
        action: 'play',
        query: searchQuery.trim(),
        voiceChannelId: channelId,
      },
      {
        onSuccess: () => {
          setSearchQuery('');
        },
      },
    );
  };

  const handleVolumeChange = (newVol: number) => {
    const stepped = Math.max(0, Math.min(200, Math.round(newVol / 5) * 5));
    setVolumeInput(stepped);

    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }

    volumeTimeoutRef.current = setTimeout(() => {
      volumeTimeoutRef.current = null;
      playbackMutation.mutate({ action: 'volume', value: stepped });
    }, 350);
  };

  const handleVolumeCommit = () => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = null;
      playbackMutation.mutate({ action: 'volume', value: volumeInput });
    }
  };

  const handleStepVolume = (delta: number) => {
    const nextVol = Math.max(
      0,
      Math.min(200, Math.round((volumeInput + delta) / 5) * 5),
    );
    setVolumeInput(nextVol);
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = null;
    }
    playbackMutation.mutate({ action: 'volume', value: nextVol });
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-6">
      {/* Contenedor invisible para YouTube IFrame Audio y HTML5 Audio Fallback */}
      <div
        className="sr-only pointer-events-none h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <div ref={ytContainerRef} />
        <audio ref={htmlAudioRef} preload="none" />
      </div>

      {/* Aviso elegante cuando el navegador bloquea el Autoplay hasta el primer clic */}
      {autoplayBlocked && currentTrack && !isPaused && webPrefs.enabled && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Headphones className="h-4 w-4 text-primary animate-bounce" />
            <span>
              Tu navegador pausó el audio automático por seguridad. Haz clic para escuchar en el navegador.
            </span>
          </div>
          <Button
            size="sm"
            variant="default"
            onClick={handleUnlockBrowserAudio}
            className="h-7 text-xs gap-1.5 shrink-0"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Activar audio en navegador</span>
          </Button>
        </div>
      )}

      {/* Voice Channel and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex items-center gap-2 min-w-[200px]">
          <Radio className="h-4 w-4 text-primary shrink-0" />
          <select
            value={activeVoiceChannelId}
            onChange={(e) => setSelectedVoiceChannelId(e.target.value)}
            className="w-full text-xs font-medium rounded-lg border border-input bg-background/80 px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {guild.voiceChannels.length === 0 ? (
              <option value="">Sin canales de voz</option>
            ) : (
              guild.voiceChannels.map((vc) => (
                <option key={vc.id} value={vc.id}>
                  🔊 {vc.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPlay()}
              placeholder="Buscar título en YouTube, URL de Spotify, etc..."
              className="pl-9 pr-3 text-sm bg-background/80"
              disabled={playbackMutation.isPending}
            />
          </div>
          <Button
            onClick={handleSearchPlay}
            disabled={!searchQuery.trim() || playbackMutation.isPending}
            className="gap-2 shrink-0 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-md shadow-primary/25"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Reproducir</span>
          </Button>
        </div>
      </div>

      {/* Now Playing Widget */}
      <div className="rounded-xl bg-gradient-to-br from-muted/40 via-card/50 to-muted/20 border border-border/60 p-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-muted/80 border border-border/80 flex items-center justify-center shadow-inner">
            {currentTrack?.info.artworkUrl ? (
              <img
                src={currentTrack.info.artworkUrl}
                alt={currentTrack.info.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Disc3
                className={`h-10 w-10 text-primary/70 ${
                  currentTrack && !isPaused ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <Badge
                variant={currentTrack ? 'default' : 'outline'}
                className="text-[10px] uppercase font-mono tracking-wider"
              >
                {currentTrack
                  ? isPaused
                    ? 'Pausado'
                    : 'En Reproducción'
                  : 'En Espera'}
              </Badge>
              {currentTrack?.info.sourceName && (
                <Badge variant="outline" className="text-[10px] capitalize">
                  {currentTrack.info.sourceName}
                </Badge>
              )}
              <Badge
                variant={
                  webPrefs.enabled && !webPrefs.muted ? 'default' : 'secondary'
                }
                className="text-[10px] gap-1"
              >
                <Headphones className="h-3 w-3" />
                <span>
                  {webPrefs.enabled && !webPrefs.muted
                    ? `Web Audio ${webPrefs.volume}%`
                    : 'Web Silenciado'}
                </span>
              </Badge>
            </div>
            <h3 className="text-base font-bold text-foreground truncate">
              {currentTrack?.info.title || 'Ninguna pista en reproducción'}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack
                ? `${currentTrack.info.author} • Solicitado por @${currentTrack.requester.username}`
                : 'Usa la barra superior o comandos de Discord (/play) para añadir pistas'}
            </p>
          </div>

          {/* Quick Leave / Disconnect Button */}
          {currentTrack && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeave}
              disabled={playbackMutation.isPending}
              className="text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40"
              title="Desconectar bot del canal de voz"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Desconectar</span>
            </Button>
          )}
        </div>

        {/* Playback progress bar */}
        {currentTrack && (
          <div className="mt-4 space-y-1.5">
            <Progress value={progressPercent} className="h-1.5" />
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
              <span>{formatTime(position)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons & Dual Volume (Web Local vs Discord Server) */}
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={
                !hasHistory || playbackMutation.isPending || isLoadingQueue
              }
              className="h-9 w-9 rounded-xl hover:bg-muted/80"
              title="Pista anterior (Historial)"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSeek(-10)}
              disabled={!currentTrack || playbackMutation.isPending}
              className="h-8 w-8 rounded-xl hover:bg-muted/80 text-muted-foreground"
              title="Retroceder 10 segundos"
            >
              <Rewind className="h-3.5 w-3.5" />
            </Button>

            {currentTrack && !isPaused ? (
              <Button
                variant="default"
                size="icon"
                onClick={handlePause}
                disabled={playbackMutation.isPending}
                className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform"
                title="Pausar"
              >
                <Pause className="h-5 w-5 fill-current" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="icon"
                onClick={handlePlayOrResume}
                disabled={
                  (!currentTrack && !searchQuery.trim()) ||
                  playbackMutation.isPending
                }
                className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform"
                title="Reanudar o reproducir"
              >
                <Play className="h-5 w-5 fill-current ml-0.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSeek(10)}
              disabled={!currentTrack || playbackMutation.isPending}
              className="h-8 w-8 rounded-xl hover:bg-muted/80 text-muted-foreground"
              title="Adelantar 10 segundos"
            >
              <FastForward className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              disabled={!currentTrack || playbackMutation.isPending}
              className="h-9 w-9 rounded-xl hover:bg-muted/80"
              title="Siguiente pista"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleStop}
              disabled={!currentTrack || playbackMutation.isPending}
              className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              title="Detener reproducción"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>

          {/* Botón de Audio Local en el Navegador (Mute / Volumen Independiente) */}
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-1.5">
            <Headphones className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-[11px] font-medium text-muted-foreground">
              Navegador:
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                updateWebPrefs((prev) => ({
                  ...prev,
                  enabled: true,
                  muted: !prev.muted,
                }))
              }
              className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
              title={
                webPrefs.muted
                  ? 'Activar sonido en este navegador (no afecta a Discord)'
                  : 'Silenciar solo este navegador (no afecta a Discord)'
              }
            >
              {webPrefs.muted || !webPrefs.enabled || webPrefs.volume === 0 ? (
                <VolumeX className="h-3.5 w-3.5 text-rose-500" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </Button>

            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={webPrefs.muted ? 0 : webPrefs.volume}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateWebPrefs((prev) => ({
                  ...prev,
                  enabled: true,
                  muted: val === 0,
                  volume: val,
                }));
              }}
              className="w-20 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
              title={`Volumen local en el navegador: ${webPrefs.muted ? 0 : webPrefs.volume}%`}
            />

            <span className="text-[11px] font-mono text-muted-foreground w-8 text-right">
              {webPrefs.muted ? 'Mute' : `${webPrefs.volume}%`}
            </span>
          </div>
        </div>

        {/* Volumen del Bot en Discord (Lavalink) */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Radio className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>Volumen del Bot en Discord:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const toggled = volumeInput === 0 ? 100 : 0;
                setVolumeInput(toggled);
                if (volumeTimeoutRef.current) {
                  clearTimeout(volumeTimeoutRef.current);
                  volumeTimeoutRef.current = null;
                }
                playbackMutation.mutate({ action: 'volume', value: toggled });
              }}
              className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
              title={
                volumeInput === 0
                  ? 'Activar sonido del bot en Discord'
                  : 'Silenciar bot en Discord'
              }
            >
              {volumeInput === 0 ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStepVolume(-5)}
              disabled={volumeInput <= 0 || playbackMutation.isPending}
              className="h-6 px-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md"
              title="Bajar volumen del bot 5%"
            >
              -5
            </Button>

            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={volumeInput}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              onPointerUp={handleVolumeCommit}
              onTouchEnd={handleVolumeCommit}
              onKeyUp={handleVolumeCommit}
              className="w-24 sm:w-28 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              title={`Volumen en Discord: ${volumeInput}%`}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStepVolume(5)}
              disabled={volumeInput >= 200 || playbackMutation.isPending}
              className="h-6 px-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md"
              title="Subir volumen del bot 5%"
            >
              +5
            </Button>

            <span className="text-xs font-mono text-muted-foreground w-10 text-right shrink-0">
              {volumeInput}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
