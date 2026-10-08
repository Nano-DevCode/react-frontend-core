import { useState } from 'react';
import {
  ListMusic,
  Trash2,
  Clock,
  User,
  History,
  Music2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DiscordGuildInfo, DiscordGuildQueue } from '../types/discord-bot.types';
import {
  useRemoveTrackMutation,
  useClearQueueMutation,
} from '../hooks/use-discord-bot';

interface QueueViewerProps {
  guild: DiscordGuildInfo;
  queue: DiscordGuildQueue | null | undefined;
  isLoading: boolean;
}

function formatTime(millis: number): string {
  if (!millis || millis <= 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const QueueViewer = ({ guild, queue, isLoading: _isLoading }: QueueViewerProps) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const removeTrackMutation = useRemoveTrackMutation(guild.id);
  const clearQueueMutation = useClearQueueMutation(guild.id);

  const tracks = queue?.tracks || [];
  const history = queue?.history || [];

  const totalDuration = tracks.reduce(
    (acc, item) => acc + (item.info.length || 0),
    0
  );

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-4">
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              <ListMusic className="h-4 w-4" />
              <span>Próximas Pistas</span>
              <Badge
                variant={activeTab === 'upcoming' ? 'outline' : 'secondary'}
                className="text-[10px] px-1.5 py-0 h-4 border-white/20"
              >
                {tracks.length}
              </Badge>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Historial</span>
              <Badge
                variant={activeTab === 'history' ? 'outline' : 'secondary'}
                className="text-[10px] px-1.5 py-0 h-4 border-white/20"
              >
                {history.length}
              </Badge>
            </button>
          </div>
        </div>

        {activeTab === 'upcoming' && tracks.length > 0 && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(totalDuration)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearQueueMutation.mutate()}
              disabled={clearQueueMutation.isPending}
              className="text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/40 h-8 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Vaciar Cola</span>
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'upcoming' ? (
        tracks.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <Music2 className="h-10 w-10 mx-auto opacity-30 stroke-1" />
            <p className="text-sm font-medium">La cola de reproducción está vacía</p>
            <p className="text-xs opacity-75 max-w-sm mx-auto">
              Añade canciones desde el buscador de arriba o interactúa en Discord usando el comando <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono">/play</code>.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 max-h-[380px] overflow-y-auto pr-1 space-y-1 scrollbar-thin">
            {tracks.map((track, idx) => (
              <div
                key={`${track.encoded}-${idx}`}
                className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <span className="text-xs font-mono text-muted-foreground w-6 text-center shrink-0">
                  #{idx + 1}
                </span>

                <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-muted/80 border border-border/60 flex items-center justify-center">
                  {track.info.artworkUrl ? (
                    <img
                      src={track.info.artworkUrl}
                      alt={track.info.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Music2 className="h-5 w-5 text-muted-foreground/60" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {track.info.title}
                    </h4>
                    {track.info.uri && (
                      <a
                        href={track.info.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity shrink-0"
                        title="Abrir enlace original"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                    <span>{track.info.author}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {track.requester.username}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {formatTime(track.info.length)}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTrackMutation.mutate(idx)}
                  disabled={removeTrackMutation.isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar de la cola"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* History Tab */
        history.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <History className="h-10 w-10 mx-auto opacity-30 stroke-1" />
            <p className="text-sm font-medium">Sin historial previo de reproducción</p>
            <p className="text-xs opacity-75">
              Las pistas reproducidas en esta sesión se listarán aquí para consulta o re-inserción rápida.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 max-h-[380px] overflow-y-auto pr-1 space-y-1 scrollbar-thin">
            {history.map((track, idx) => (
              <div
                key={`history-${track.encoded}-${idx}`}
                className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="relative h-9 w-9 shrink-0 rounded-lg overflow-hidden bg-muted/80 border border-border/60 flex items-center justify-center">
                  {track.info.artworkUrl ? (
                    <img
                      src={track.info.artworkUrl}
                      alt={track.info.title}
                      className="h-full w-full object-cover opacity-80"
                    />
                  ) : (
                    <Music2 className="h-4 w-4 text-muted-foreground/60" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-foreground truncate">
                    {track.info.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {track.info.author}
                  </p>
                </div>

                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {formatTime(track.info.length)}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
