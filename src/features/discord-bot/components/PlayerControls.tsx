import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { DiscordGuildInfo, DiscordGuildQueue } from '../types/discord-bot.types';
import { usePlaybackMutation } from '../hooks/use-discord-bot';

interface PlayerControlsProps {
  guild: DiscordGuildInfo;
  queue: DiscordGuildQueue | null | undefined;
  isLoadingQueue: boolean;
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
  const [selectedVoiceChannelId, setSelectedVoiceChannelId] = useState<string>(
    guild.voiceChannels[0]?.id || ''
  );
  const [volumeInput, setVolumeInput] = useState<number>(queue?.volume || 100);

  useEffect(() => {
    if (!selectedVoiceChannelId && guild.voiceChannels.length > 0) {
      setSelectedVoiceChannelId(guild.voiceChannels[0].id);
    }
  }, [guild.voiceChannels, selectedVoiceChannelId]);

  useEffect(() => {
    if (typeof queue?.volume === 'number') {
      setVolumeInput(queue.volume);
    }
  }, [queue?.volume]);

  const playbackMutation = usePlaybackMutation(guild.id);

  const currentTrack = queue?.currentTrack;
  const isPaused = queue?.isPaused ?? false;
  const position = queue?.position ?? 0;
  const duration = currentTrack?.info.length ?? 0;
  const progressPercent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

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
    playbackMutation.mutate({ action: 'back' });
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
    const channelId = selectedVoiceChannelId || guild.voiceChannels[0]?.id;
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
      }
    );
  };

  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(200, newVol));
    setVolumeInput(clamped);
    playbackMutation.mutate({ action: 'volume', value: clamped });
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-6">
      {/* Voice Channel and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex items-center gap-2 min-w-[200px]">
          <Radio className="h-4 w-4 text-primary shrink-0" />
          <select
            value={selectedVoiceChannelId}
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

      {/* Control Buttons & Volume */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            disabled={
              !queue?.history?.length ||
              playbackMutation.isPending ||
              isLoadingQueue
            }
            className="h-9 w-9 rounded-xl hover:bg-muted/80"
            title="Pista anterior"
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

        {/* Volume Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto min-w-[180px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVolumeChange(volumeInput === 0 ? 100 : 0)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={volumeInput === 0 ? 'Activar sonido' : 'Silenciar'}
          >
            {volumeInput === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          <input
            type="range"
            min={0}
            max={200}
            step={5}
            value={volumeInput}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full sm:w-28 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <span className="text-xs font-mono text-muted-foreground w-9 text-right">
            {volumeInput}%
          </span>
        </div>
      </div>
    </div>
  );
};

