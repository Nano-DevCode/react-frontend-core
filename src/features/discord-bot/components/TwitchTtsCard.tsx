import { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Trash2,
  Settings2,
  Mic,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useTwitchTts } from '../hooks/use-twitch-tts';

interface TwitchTtsCardProps {
  className?: string;
}

export const TwitchTtsCard = ({ className = '' }: TwitchTtsCardProps) => {
  const {
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
  } = useTwitchTts();

  const [showSettings, setShowSettings] = useState(false);

  // Filtrar voces para destacar las en español
  const spanishVoices = voices.filter(
    (v) =>
      v.lang.startsWith('es') ||
      v.lang.includes('ES') ||
      v.lang.includes('MX'),
  );

  return (
    <Card
      className={`border-border/80 bg-card/60 backdrop-blur-xl ${className}`}
    >
      <CardContent className="p-4 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Mic className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Lector de Voz Twitch (
                  <code className="font-mono text-purple-400">!pr</code>)
                </h3>
                <Badge
                  variant={enabled ? 'default' : 'secondary'}
                  className={`text-[10px] ${
                    enabled ? 'bg-purple-600 text-white' : ''
                  }`}
                >
                  {enabled ? 'Voz Activa' : 'Silenciado'}
                </Badge>
                {isSpeaking && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-emerald-400 border-emerald-500/40 animate-pulse"
                  >
                    Hablando...
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Reproduce en tu navegador lo que tus viewers escriban con{' '}
                <code className="font-mono text-foreground">!pr [mensaje]</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ajustes</span>
            </Button>

            <div className="flex items-center gap-1.5 pl-2 border-l border-border/50">
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
                aria-label="Activar o desactivar TTS"
              />
            </div>
          </div>
        </div>

        {/* Panel de Ajustes Desplegable */}
        {showSettings && (
          <div className="p-3.5 rounded-xl bg-background/60 border border-border/60 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Selector de Voz */}
              <div className="space-y-1.5">
                <div className="text-muted-foreground font-medium flex items-center justify-between">
                  <span>Voz del sintetizador</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({voices.length} disponibles)
                  </span>
                </div>
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => setSelectedVoiceUri(e.target.value)}
                  className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground"
                >
                  <option value="">Predeterminada (Español recomendado)</option>
                  {spanishVoices.length > 0 && (
                    <optgroup label="Voces en Español">
                      {spanishVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Todas las voces">
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Controles de Volumen y Velocidad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Volumen</span>
                    <span className="font-mono">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Velocidad</span>
                    <span className="font-mono">{rate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Opciones Adicionales */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/40 gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSender}
                  onChange={(e) => setIncludeSender(e.target.checked)}
                  className="rounded border-border text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                />
                <span className="text-muted-foreground">
                  Anunciar quién envía el mensaje (ej:{' '}
                  <em className="text-foreground">"Juan dice: hola"</em>)
                </span>
              </label>

              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopSpeaking}
                    className="h-7 text-xs text-rose-400 hover:text-rose-300 gap-1"
                  >
                    <Square className="h-3 w-3 fill-current" />
                    <span>Detener</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testSpeak}
                    className="h-7 text-xs gap-1"
                  >
                    <Play className="h-3 w-3" />
                    <span>Probar Audio</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Acciones Rápidas y Estado */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              {volume === 0 || !enabled ? (
                <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-purple-400" />
              )}
              <span>Solo en este navegador (no entra a Discord)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!showSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={testSpeak}
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span>Probar voz</span>
              </Button>
            )}
            {recentMessages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-rose-400"
              >
                <Trash2 className="h-3 w-3" />
                <span>Limpiar historial</span>
              </Button>
            )}
          </div>
        </div>

        {/* Historial Reciente de Mensajes !pr */}
        {recentMessages.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>Últimos mensajes leídos del chat:</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {recentMessages.map((item, idx) => (
                <div
                  key={`${item.timestamp}-${idx}`}
                  className="flex items-start justify-between gap-2 p-2 rounded-lg bg-background/40 border border-border/40 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-semibold text-purple-400">
                      @{item.displayName}:
                    </span>{' '}
                    <span className="text-foreground break-words">
                      {item.text}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speak(item.displayName, item.text)}
                    className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-purple-400"
                    title="Repetir audio"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
