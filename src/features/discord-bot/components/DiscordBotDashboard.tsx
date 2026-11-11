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
  ExternalLink,
  Tv,
  Link2,
  Unlink,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/use-auth-store';
import {
  useDiscordBotStatusQuery,
  useDiscordGuildsQuery,
  useDiscordGuildQueueQuery,
  useDiscordSocketSync,
  useRegisterLavalinkMutation,
  useUnregisterLavalinkMutation,
  useMyTwitchLinksQuery,
  useLinkTwitchChannelMutation,
  useUnlinkTwitchChannelMutation,
} from '../hooks/use-discord-bot';
import { PlayerControls } from './PlayerControls';
import { QueueViewer } from './QueueViewer';
import { GuildChatAndChannelCard } from './GuildChatAndChannelCard';

export default function DiscordBotDashboard() {
  const user = useAuthStore((state) => state.user);
  const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
  const isAdmin =
    userRoles.includes('admin') || userRoles.includes('superadmin');

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

  const { data: twitchData } = useMyTwitchLinksQuery(isBotEnabled);
  const twitchLinks = twitchData?.links || [];

  const registerLavalink = useRegisterLavalinkMutation();
  const unregisterLavalink = useUnregisterLavalinkMutation();
  const linkTwitch = useLinkTwitchChannelMutation();
  const unlinkTwitch = useUnlinkTwitchChannelMutation();

  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [preferredVoiceId, setPreferredVoiceId] = useState<string>('');
  const [discordUserIdInput, setDiscordUserIdInput] = useState<string>('');
  const [manualGuildIdInput, setManualGuildIdInput] = useState<string>('');
  const [twitchChannelInput, setTwitchChannelInput] = useState<string>('');
  const [isRedirectingOAuth, setIsRedirectingOAuth] = useState<boolean>(false);

  const selectedGuild =
    (selectedGuildId ? guilds.find((g) => g.id === selectedGuildId) : null) ||
    guilds.find((g) => g.isRegistered) ||
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

  const handleConnectDiscordOAuth = async () => {
    try {
      setIsRedirectingOAuth(true);
      const res = await apiClient.get<{ authorizeUrl: string }>(
        '/discord/oauth/url',
        {
          params: { redirectPath: '/admin/discord-bot' },
        },
      );
      if (res.data?.authorizeUrl) {
        window.location.href = res.data.authorizeUrl;
      }
    } catch {
      toast.error(
        'No se pudo iniciar la sincronización OAuth2 con Discord. Verifica la configuración del cliente OAuth2 o usa la vinculación por ID.',
      );
    } finally {
      setIsRedirectingOAuth(false);
    }
  };

  const handleManualClaimGuild = () => {
    if (!manualGuildIdInput.trim() || !discordUserIdInput.trim()) {
      toast.error(
        'Ingresa el ID de tu servidor de Discord (Guild ID) y tu Discord User ID para verificar tu propiedad.',
      );
      return;
    }

    registerLavalink.mutate(
      {
        guildId: manualGuildIdInput.trim(),
        discordUserId: discordUserIdInput.trim(),
      },
      {
        onSuccess: () => {
          setManualGuildIdInput('');
        },
      },
    );
  };

  const handleRegisterLavalink = () => {
    if (!selectedGuild) return;
    const defaultVoice =
      preferredVoiceId ||
      selectedGuild.userSession?.voiceChannelId ||
      selectedGuild.voiceChannels[0]?.id ||
      undefined;

    registerLavalink.mutate({
      guildId: selectedGuild.id,
      voiceChannelId: defaultVoice,
      discordUserId:
        discordUserIdInput.trim() ||
        selectedGuild.userSession?.discordUserId ||
        undefined,
    });
  };

  const handleLinkTwitch = () => {
    if (!selectedGuild || !twitchChannelInput.trim()) return;
    const voiceId =
      preferredVoiceId ||
      selectedGuild.userSession?.voiceChannelId ||
      selectedGuild.voiceChannels[0]?.id;

    linkTwitch.mutate(
      {
        twitchChannel: twitchChannelInput.trim(),
        guildId: selectedGuild.id,
        voiceChannelId: voiceId,
      },
      {
        onSuccess: () => setTwitchChannelInput(''),
      },
    );
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
                Escucha tu música en Discord con Lavalink v4 y recibe pedidos en vivo desde tu chat de Twitch con <code className="font-mono">!pl</code>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleConnectDiscordOAuth}
            disabled={isRedirectingOAuth}
            className="gap-2 text-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
            <span>Sincronizar mis Servidores (Discord OAuth2)</span>
          </Button>
          {status?.inviteUrl && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (status.inviteUrl) {
                  window.open(status.inviteUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className="gap-2 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Invitar Bot a mi Discord</span>
            </Button>
          )}
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
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Metrics Row (Solo Administrador) */}
      {isAdmin && (
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
                  {status?.myRegistrations?.length ?? 0} vinculado(s) a tu cuenta
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
      )}

      {/* Guilds Selector & Control Center */}
      {isBotEnabled && (
        <div className="space-y-6">
          {/* Guilds Selection Ribbon */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Mis Servidores de Discord Autorizados
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
              <Card className="border-dashed border-border bg-card/40">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      Aún no tienes servidores de Discord vinculados a tu cuenta
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                      Cada usuario solo puede ver y controlar sus propios servidores de Discord. Invita al bot a tu servidor y sincroniza con Discord OAuth2 (o verifica manualmente tu propiedad con el ID del servidor y tu Discord User ID).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-2xl mx-auto">
                    <Input
                      placeholder="ID de tu Servidor (Guild ID)"
                      value={manualGuildIdInput}
                      onChange={(e) => setManualGuildIdInput(e.target.value)}
                      className="h-9 text-xs"
                    />
                    <Input
                      placeholder="Tu Discord User ID (Owner/Admin)"
                      value={discordUserIdInput}
                      onChange={(e) => setDiscordUserIdInput(e.target.value)}
                      className="h-9 text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleManualClaimGuild}
                      disabled={registerLavalink.isPending}
                      className="h-9 text-xs gap-1.5"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      <span>Verificar y Vincular Servidor</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {guilds.map((g) => {
                  const isSelected = g.id === currentGuildId;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGuildId(g.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left min-w-[230px] transition-all shrink-0 ${
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
                          {g.isRegistered && (
                            <Badge variant="default" className="text-[9px] px-1 py-0">
                              Vinculado
                            </Badge>
                          )}
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
                  {selectedGuild.isRegistered ? (
                    <Badge className="text-[10px] bg-emerald-600 text-white">
                      Servidor Verificado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Sin vincular
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Sliders className="h-3.5 w-3.5 text-primary" />
                    Prefijo: <code className="text-foreground font-mono">{selectedGuild.config?.commandPrefix || selectedGuild.config?.prefix || '/'}</code>
                  </span>
                  <span>•</span>
                  <span>Volumen Predeterminado: <strong className="text-foreground">{selectedGuild.config?.defaultVolume || 100}%</strong></span>
                </div>
              </div>

              {/* Lavalink Session Registration & Twitch Chat Bot Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4 text-purple-500" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Configuración de Canal de Voz (Lavalink)
                        </h3>
                      </div>
                      {selectedGuild.isRegistered && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unregisterLavalink.mutate(selectedGuild.id)}
                          disabled={unregisterLavalink.isPending}
                          className="h-7 text-xs text-rose-500 hover:text-rose-600 gap-1"
                        >
                          <Unlink className="h-3 w-3" />
                          <span>Desvincular</span>
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Selecciona tu canal de voz predeterminado y tu ID de Discord para que Lavalink reproduzca tu música automáticamente en tu canal.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={
                          preferredVoiceId ||
                          selectedGuild.userSession?.voiceChannelId ||
                          ''
                        }
                        onChange={(e) => setPreferredVoiceId(e.target.value)}
                        className="h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                      >
                        <option value="">Seleccionar canal de voz...</option>
                        {selectedGuild.voiceChannels.map((vc) => (
                          <option key={vc.id} value={vc.id}>
                            🔊 {vc.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="Tu Discord User ID (Owner/Admin)"
                        value={discordUserIdInput}
                        onChange={(e) => setDiscordUserIdInput(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleRegisterLavalink}
                      disabled={registerLavalink.isPending}
                      className="w-full text-xs gap-1.5"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      <span>
                        {selectedGuild.isRegistered
                          ? 'Actualizar Canal de Voz Preferido'
                          : 'Vincular Servidor a mi Cuenta'}
                      </span>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tv className="h-4 w-4 text-purple-500" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Twitch Chat Bot (<code className="font-mono">!pl</code>, <code className="font-mono">!song</code>, <code className="font-mono">!skip</code>)
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Cooldown 15s • Máx 10m
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Permite que tus viewers en Twitch pidan canciones en el chat con <code className="font-mono text-foreground">!pl [nombre o URL]</code> directo a este servidor.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nombre de tu canal de Twitch (ej. legend_slayer4)"
                        value={twitchChannelInput}
                        onChange={(e) => setTwitchChannelInput(e.target.value)}
                        className="h-9 text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={handleLinkTwitch}
                        disabled={linkTwitch.isPending || !twitchChannelInput.trim()}
                        className="h-9 text-xs shrink-0 gap-1.5"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        <span>Vincular Twitch</span>
                      </Button>
                    </div>
                    {twitchLinks.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {twitchLinks.map((item) => (
                          <Badge
                            key={item.twitchChannel}
                            variant="secondary"
                            className="text-[11px] gap-1.5 py-1 px-2"
                          >
                            <span>#{item.twitchChannel}</span>
                            <button
                              type="button"
                              onClick={() => unlinkTwitch.mutate(item.twitchChannel)}
                              className="text-rose-500 hover:text-rose-600 ml-1"
                              title="Desvincular canal"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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

              {/* Dedicated Channel & Direct Messaging Panel (Solo Admin puede enviar anuncios globales) */}
              {isAdmin && <GuildChatAndChannelCard guild={selectedGuild} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
