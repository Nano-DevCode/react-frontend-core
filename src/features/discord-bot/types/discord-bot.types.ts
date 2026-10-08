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

export interface DiscordGuildInfo {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  hasActiveQueue: boolean;
  currentTrack: AudioTrackInfo | null;
  voiceChannels: DiscordVoiceChannel[];
  textChannels: DiscordTextChannel[];
  config: DiscordGuildConfig | null;
}

export interface DiscordBotStatus {
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

export interface DiscordGuildQueue {
  guildId: string;
  currentTrack: AudioTrackItem | null;
  tracks: AudioTrackItem[];
  history: AudioTrackItem[];
  volume: number;
  isPaused: boolean;
  repeatMode: 'off' | 'track' | 'queue';
  position: number;
}

export interface PlaybackActionPayload {
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

export interface SendMessagePayload {
  guildId: string;
  channelId: string;
  content: string;
}

export interface UpdateGuildConfigPayload {
  dedicatedChannelId?: string | null;
}

