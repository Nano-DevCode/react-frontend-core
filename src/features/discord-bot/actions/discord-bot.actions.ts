import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  DiscordBotStatusResponse,
  DiscordGuildListItemResponse,
  DiscordGuildQueueResponse,
  PlaybackActionDto,
  SendMessageDto,
  UpdateGuildConfigDto,
  DiscordGuildConfig,
} from '../types/discord-bot.types';

export const fetchBotStatusAction = async (): Promise<DiscordBotStatusResponse> => {
  const response = await apiClient.get<DiscordBotStatusResponse>(
    API_ENDPOINTS.DISCORD_BOT.STATUS,
    { suppressToast: true }
  );
  return response.data;
};

export const fetchGuildsAction = async (): Promise<DiscordGuildListItemResponse[]> => {
  const response = await apiClient.get<DiscordGuildListItemResponse[]>(
    API_ENDPOINTS.DISCORD_BOT.GUILDS,
    { suppressToast: true }
  );
  return response.data;
};

export const fetchGuildQueueAction = async (
  guildId: string
): Promise<DiscordGuildQueueResponse> => {
  const response = await apiClient.get<DiscordGuildQueueResponse>(
    API_ENDPOINTS.DISCORD_BOT.QUEUE(guildId),
    { suppressToast: true }
  );
  return response.data;
};

export const sendPlaybackAction = async (
  guildId: string,
  payload: PlaybackActionDto
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    API_ENDPOINTS.DISCORD_BOT.PLAYBACK(guildId),
    payload
  );
  return response.data;
};

export const removeTrackFromQueueAction = async (
  guildId: string,
  index: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    API_ENDPOINTS.DISCORD_BOT.REMOVE_TRACK(guildId, index)
  );
  return response.data;
};

export const clearQueueAction = async (
  guildId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    API_ENDPOINTS.DISCORD_BOT.CLEAR_QUEUE(guildId)
  );
  return response.data;
};

export const sendChatMessageAction = async (
  payload: SendMessageDto
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    API_ENDPOINTS.DISCORD_BOT.SEND_MESSAGE,
    payload
  );
  return response.data;
};

export const updateGuildConfigAction = async (
  guildId: string,
  payload: UpdateGuildConfigDto
): Promise<{ success: boolean; message: string; config: DiscordGuildConfig }> => {
  const response = await apiClient.patch<{
    success: boolean;
    message: string;
    config: DiscordGuildConfig;
  }>(API_ENDPOINTS.DISCORD_BOT.UPDATE_CONFIG(guildId), payload);
  return response.data;
};
