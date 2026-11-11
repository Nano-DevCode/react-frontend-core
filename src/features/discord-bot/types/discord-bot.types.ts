// ============================================================================
// CONTRATOS DE DISCORD BOT & LAVALINK + TWITCH (/discord)
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
  commandPrefix?: string;
  prefix?: string;
  djRoleIds?: string[];
  autoLeaveOnEmpty?: boolean;
  twentyFourSeven?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserLavalinkRegistration {
  userId: string;
  guildId: string;
  guildName?: string | null;
  voiceChannelId?: string | null;
  discordUserId?: string | null;
  nodeName: string;
  registeredAt: string;
}

export interface LavalinkNodeStatus {
  name: string;
  state: number;
  connected: boolean;
  players: number;
  playingPlayers: number;
}

export interface TwitchChannelLink {
  userId: string;
  twitchChannel: string;
  twitchUserId?: string;
  guildId: string;
  voiceChannelId: string;
  linkedAt: string;
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
  isRegistered?: boolean;
  userSession?: UserLavalinkRegistration | null;
  hasActiveQueue: boolean;
  currentTrack: AudioTrackInfo | null;
  voiceChannels: DiscordVoiceChannel[];
  textChannels: DiscordTextChannel[];
  config: DiscordGuildConfig | null;
}

export type DiscordGuildIdResponse = DiscordGuildListItemResponse;
export type DiscordGuildListResponse = DiscordGuildListItemResponse[];

/**
 * Estado general del bot de Discord y Lavalink
 */
export interface DiscordBotStatusResponse {
  isEnabled: boolean;
  isDiscordConnected: boolean;
  isLavalinkConnected: boolean;
  lavalinkNodes?: LavalinkNodeStatus[];
  guildCount: number;
  activeQueuesCount: number;
  inviteUrl?: string | null;
  myRegistrations?: UserLavalinkRegistration[];
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

export interface RegisterLavalinkDto {
  guildId: string;
  voiceChannelId?: string;
  discordUserId?: string;
}

export interface LinkTwitchChannelDto {
  twitchChannel: string;
  guildId: string;
  voiceChannelId?: string;
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
