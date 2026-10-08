import { useState } from 'react';
import {
  Bot,
  Radio,
  Server,
  Headphones,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDiscordBotStatusQuery,
  useDiscordGuildsQuery,
  useDiscordGuildQueueQuery,
  useDiscordSocketSync,
} from '../hooks/use-discord-bot';
import { PlayerControls } from './PlayerControls';
import { QueueViewer } from './QueueViewer';
import { GuildChatAndChannelCard } from './GuildChatAndChannelCard';

export default function DiscordBotDashboard() {
  const {
    data: status,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useDiscordBotStatusQuery();

  const isBotEnabled = Boolean(status?.isEnabled);

  const {
    data: guilds = [],
    isLoading: isLoadingGuilds,
    refetch: refetchGuilds,
  } = useDiscordGuildsQuery(isBotEnabled);

  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);

  const selectedGuild =
    (selectedGuildId ? guilds.find((g) => g.id === selectedGuildId) : null) ||
    guilds.find((g) => g.hasActiveQueue) ||
    guilds[0] ||
    null;

  const currentGuildId = selectedGuild?.id || null;

  const { isConnected: isWsConnected } = useDiscordSocketSync(currentGuildId);

  const {
    data: queue,
    isLoading: isLoadingQueue,
  } = useDiscordGuildQueueQuery(currentGuildId);

  const handleRefresh = () => {
    refetchStatus();
    if (isBotEnabled) {
      refetchGuilds();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>AntiGravity Music Bot</span>
                <Badge
                  variant={isBotEnabled ? 'default' : 'secondary'}
                  className="text-[11px] font-mono"
                >
                  {isBotEnabled ? 'Activo' : 'Desactivado'}
                </Badge>
                {isBotEnabled && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] gap-1.5 font-medium ${
                      isWsConnected
                        ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-amber-500 border-amber-500/30 bg-amber-500/10'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isWsConnected
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span>
                      {isWsConnected ? 'En Vivo' : 'Conectando...'}
                    </span>
                  </Badge>
                )}
              </h1>
              <p className="text-xs text-muted-foreground">
                Control y orquestación en tiempo real del reproductor de audio en Discord con Lavalink v4
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Feature Flag Disabled Banner */}
      {!isLoadingStatus && !isBotEnabled && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-amber-500">
                El módulo del bot de Discord está desactivado por Feature Flag
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La bandera dinámica <code className="font-mono bg-background/80 px-1.5 py-0.5 rounded border">DISCORD_BOT_ENABLED</code> se encuentra actualmente desactivada.
                Puedes habilitarla o deshabilitarla al instante desde el panel de <strong className="text-foreground">Gestión de Feature Flags</strong> sin necesidad de reiniciar el servidor ni reconstruir la aplicación.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Estado Discord</p>
              <div className="flex items-center gap-2">
                {status?.isDiscordConnected ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
                <span className="text-sm font-bold">
                  {status?.isDiscordConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              {status?.user && (
                <p className="text-[11px] text-muted-foreground truncate">
                  @{status.user.tag}
                </p>
              )}
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Motor Lavalink v4</p>
              <div className="flex items-center gap-2">
                {status?.isLavalinkConnected ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
                <span className="text-sm font-bold">
                  {status?.isLavalinkConnected ? 'En línea' : 'Sin conexión'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Decodificación PCM 48kHz
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Radio className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Servidores Unidos</p>
              <p className="text-xl font-bold text-foreground">
                {status?.guildCount ?? 0}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Guilds de Discord
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Server className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Reproductores Activos</p>
              <p className="text-xl font-bold text-foreground">
                {status?.activeQueuesCount ?? 0}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Colas de voz en curso
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Headphones className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guilds Selector & Control Center */}
      {isBotEnabled && (
        <div className="space-y-6">
          {/* Guilds Selection Ribbon */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Seleccionar Servidor de Discord
              </label>
              <span className="text-xs text-muted-foreground">
                {guilds.length} servidor(es) disponible(s)
              </span>
            </div>

            {isLoadingGuilds ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                <Skeleton className="h-16 w-52 rounded-xl" />
                <Skeleton className="h-16 w-52 rounded-xl" />
              </div>
            ) : guilds.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
                El bot aún no está invitado a ningún servidor de Discord. Invítalo usando la URL generada en el Discord Developer Portal.
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {guilds.map((g) => {
                  const isSelected = g.id === currentGuildId;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGuildId(g.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left min-w-[220px] transition-all shrink-0 ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border/80 bg-card/60 hover:bg-muted/60'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-border/60">
                        {g.icon ? (
                          <img
                            src={g.icon}
                            alt={g.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Server className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {g.name}
                          </h4>
                          {g.hasActiveQueue && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {g.memberCount} miembros
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Guild Player & Queue */}
          {selectedGuild && (
            <div className="space-y-6">
              {/* Guild Header Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-card/40 border border-border/60">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {selectedGuild.name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    ID: {selectedGuild.id}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Sliders className="h-3.5 w-3.5 text-primary" />
                    Prefijo: <code className="text-foreground font-mono">{selectedGuild.config?.commandPrefix || '/'}</code>
                  </span>
                  <span>•</span>
                  <span>Volumen Predeterminado: <strong className="text-foreground">{selectedGuild.config?.defaultVolume || 100}%</strong></span>
                </div>
              </div>

              {/* Main 2-column Grid: Player on left/top, Queue on right/bottom */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  <PlayerControls
                    guild={selectedGuild}
                    queue={queue}
                    isLoadingQueue={isLoadingQueue}
                  />
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <QueueViewer
                    guild={selectedGuild}
                    queue={queue}
                    isLoading={isLoadingQueue}
                  />
                </div>
              </div>

              {/* Dedicated Channel & Direct Messaging Panel */}
              <GuildChatAndChannelCard guild={selectedGuild} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
