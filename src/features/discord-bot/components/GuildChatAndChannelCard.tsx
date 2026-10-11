import { useState } from 'react';
import {
  MessageSquare,
  Hash,
  Send,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { DiscordGuildInfo } from '../types/discord-bot.types';
import {
  useUpdateGuildConfigMutation,
  useSendMessageMutation,
} from '../hooks/use-discord-bot';

interface GuildChatAndChannelCardProps {
  guild: DiscordGuildInfo;
}

export const GuildChatAndChannelCard = ({
  guild,
}: GuildChatAndChannelCardProps) => {
  const currentDedicatedId = guild.config?.dedicatedChannelId || '';
  const [prevDedicatedId, setPrevDedicatedId] = useState(currentDedicatedId);
  const [selectedDedicatedChannel, setSelectedDedicatedChannel] =
    useState<string>(currentDedicatedId);

  if (currentDedicatedId !== prevDedicatedId) {
    setPrevDedicatedId(currentDedicatedId);
    setSelectedDedicatedChannel(currentDedicatedId);
  }

  const [messageTargetChannel, setMessageTargetChannel] = useState<string>('');
  const activeMessageTarget =
    messageTargetChannel || guild.textChannels[0]?.id || '';
  const [messageText, setMessageText] = useState<string>('');

  const updateConfigMutation = useUpdateGuildConfigMutation(guild.id);
  const sendMessageMutation = useSendMessageMutation(guild.id);

  const hasDedicatedChannelChanged =
    selectedDedicatedChannel !== (guild.config?.dedicatedChannelId || '');

  const handleSaveDedicatedChannel = () => {
    updateConfigMutation.mutate({
      dedicatedChannelId: selectedDedicatedChannel ? selectedDedicatedChannel : null,
    });
  };

  const handleRemoveDedicatedChannel = () => {
    setSelectedDedicatedChannel('');
    updateConfigMutation.mutate({
      dedicatedChannelId: null,
    });
  };

  const handleSendMessage = () => {
    if (!activeMessageTarget || !messageText.trim()) return;

    sendMessageMutation.mutate(
      {
        channelId: activeMessageTarget,
        content: messageText.trim(),
      },
      {
        onSuccess: () => {
          setMessageText('');
        },
      },
    );
  };

  const dedicatedChannelObj = guild.textChannels.find(
    (c) => c.id === guild.config?.dedicatedChannelId,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Panel 1: Restricción de Canal Exclusivo */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Canal Exclusivo de Comandos
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Limita la atención de comandos de música a un único canal
                </CardDescription>
              </div>
            </div>
            {guild.config?.dedicatedChannelId ? (
              <Badge
                variant="outline"
                className="text-[11px] gap-1 font-mono text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
              >
                <Hash className="h-3 w-3" />
                {dedicatedChannelObj?.name || guild.config.dedicatedChannelId}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[11px]">
                Sin restricción
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Si defines un canal exclusivo, el bot ignorará y responderá una alerta
            temporal (autoeliminada en 5 segundos) a cualquier persona que escriba
            o use comandos fuera de él.
          </p>

          <div className="space-y-2">
            <label className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
              Canal Asignado
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={selectedDedicatedChannel}
                onChange={(e) => setSelectedDedicatedChannel(e.target.value)}
                className="flex-1 text-xs font-medium rounded-lg border border-input bg-background/80 px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">
                  🌐 Todos los canales (Sin restricción)
                </option>
                {guild.textChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    # {c.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveDedicatedChannel}
                  disabled={
                    !hasDedicatedChannelChanged ||
                    updateConfigMutation.isPending
                  }
                  className="gap-1.5 text-xs bg-primary hover:bg-primary/90"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Guardar</span>
                </Button>

                {guild.config?.dedicatedChannelId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveDedicatedChannel}
                    disabled={updateConfigMutation.isPending}
                    className="text-xs hover:bg-destructive/10 hover:text-destructive"
                  >
                    Restablecer
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex items-start gap-2.5 text-[11px] text-muted-foreground">
            <Radio className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Comando de Discord equivalente:</p>
              <p className="font-mono text-[10px] mt-0.5">
                /setchannel canal:#tu-canal &nbsp;|&nbsp; /setchannel remover:true
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel 2: Enviar Mensaje al Chat */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Enviar Mensaje al Chat
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Publica anuncios o mensajes a nombre del bot en Discord
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
              Canal de Destino
            </label>
            <select
              value={activeMessageTarget}
              onChange={(e) => setMessageTargetChannel(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-input bg-background/80 px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {guild.textChannels.length === 0 ? (
                <option value="">Sin canales de texto detectados</option>
              ) : (
                guild.textChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    # {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
              Contenido del Mensaje
            </label>
            <div className="flex flex-col gap-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={3}
                placeholder="Escribe el mensaje que enviará el bot al servidor..."
                className="w-full text-xs font-medium rounded-lg border border-input bg-background/80 px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                disabled={sendMessageMutation.isPending}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Presiona <kbd className="bg-muted px-1 rounded border">Enter</kbd> para enviar o el botón
                </span>
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={
                    !messageText.trim() ||
                    !messageTargetChannel ||
                    sendMessageMutation.isPending
                  }
                  className="gap-2 text-xs bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-md shadow-primary/25"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{sendMessageMutation.isPending ? 'Enviando...' : 'Enviar al Chat'}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex items-start gap-2.5 text-[11px] text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Comando de Discord equivalente:</p>
              <p className="font-mono text-[10px] mt-0.5">
                /say canal:#canal mensaje:Tu texto aquí
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

