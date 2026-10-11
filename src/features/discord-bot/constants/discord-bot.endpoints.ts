export const DISCORD_BOT_ENDPOINTS = {
  STATUS: '/discord/status',
  GUILDS: '/discord/guilds',
  QUEUE: (guildId: string) => `/discord/queue/${guildId}`,
  PLAYBACK: (guildId: string) => `/discord/playback/${guildId}`,
  REMOVE_TRACK: (guildId: string, index: number) => `/discord/queue/${guildId}/tracks/${index}`,
  CLEAR_QUEUE: (guildId: string) => `/discord/queue/${guildId}`,
  SEND_MESSAGE: '/discord/messages/send',
  UPDATE_CONFIG: (guildId: string) => `/discord/guilds/${guildId}/config`,
} as const;

