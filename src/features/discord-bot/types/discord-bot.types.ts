// ============================================================================
// CONTRATOS DE DISCORD BOT (/discord-bot)
// ============================================================================

export interface AudioTrackInfo {
  title: string;
  author: string;
  length: number;
  identifier: string;
  isSeekable: boolean;
  isStream: boolean;
  uri: string;
  artworkUrl?: string | null;
  sourceName: string;
}

export interface AudioTrackRequester {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface AudioTrackItem {
  encoded: string;
  info: AudioTrackInfo;
  requester: AudioTrackRequester;
}

export interface DiscordVoiceChannel {
  id: string;
  name: string;
}

export interface DiscordTextChannel {
  id: string;
  name: string;
}

export interface DiscordGuildConfig {
  id: string;
  guildId: string;
  dedicatedChannelId?: string | null;
  defaultVolume: number;
  commandPrefix: string;
  djRoleIds: string[];
  autoLeaveOnEmpty: boolean;
  twentyFourSeven: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Atributos universales y compartidos de un Servidor de Discord (Guild)
 */
export interface DiscordGuildBase {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
}

/**
 * Representación de un servidor en listados de Discord (DiscordGuildListItemResponse)
 */
export interface DiscordGuildListItemResponse extends DiscordGuildBase {
  hasActiveQueue: boolean;
  currentTrack: AudioTrackInfo | null;
  voiceChannels: DiscordVoiceChannel[];
  textChannels: DiscordTextChannel[];
  config: DiscordGuildConfig | null;
}

/**
 * Representación detallada de un servidor de Discord por su ID (DiscordGuildIdResponse)
 */
export type DiscordGuildIdResponse = DiscordGuildListItemResponse;

/**
 * Lista de servidores de Discord
 */
export type DiscordGuildListResponse = DiscordGuildListItemResponse[];

/**
 * Estado general del bot de Discord y Lavalink
 */
export interface DiscordBotStatusResponse {
  isEnabled: boolean;
  isDiscordConnected: boolean;
  isLavalinkConnected: boolean;
  guildCount: number;
  activeQueuesCount: number;
  user: {
    id: string;
    tag: string;
    avatar: string | null;
  } | null;
}

/**
 * Cola de reproducción musical de un servidor (DiscordGuildQueueResponse)
 */
export interface DiscordGuildQueueResponse {
  guildId: string;
  currentTrack: AudioTrackItem | null;
  tracks: AudioTrackItem[];
  history: AudioTrackItem[];
  volume: number;
  isPaused: boolean;
  repeatMode: 'off' | 'track' | 'queue';
  position: number;
}

/**
 * DTO para el envío de comandos de reproducción
 */
export interface PlaybackActionDto {
  action:
    | 'play'
    | 'pause'
    | 'resume'
    | 'skip'
    | 'back'
    | 'seek'
    | 'volume'
    | 'stop'
    | 'leave';
  query?: string;
  voiceChannelId?: string;
  value?: number;
}

/**
 * DTO para enviar un mensaje de texto a un canal de Discord
 */
export interface SendMessageDto {
  guildId: string;
  channelId: string;
  content: string;
}

/**
 * DTO para actualizar la configuración de un servidor de Discord
 */
export interface UpdateGuildConfigDto {
  dedicatedChannelId?: string | null;
}

// ----------------------------------------------------------------------------
// ALIASES DE RETROCOMPATIBILIDAD
// ----------------------------------------------------------------------------
export type DiscordGuildInfo = DiscordGuildListItemResponse;
export type DiscordBotStatus = DiscordBotStatusResponse;
export type DiscordGuildQueue = DiscordGuildQueueResponse;
export type PlaybackActionPayload = PlaybackActionDto;
export type SendMessagePayload = SendMessageDto;
export type UpdateGuildConfigPayload = UpdateGuildConfigDto;
