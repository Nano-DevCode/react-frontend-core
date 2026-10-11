import type { UserAuthContext } from './auth.types';

export type MobilePlatform = 'ios' | 'android' | 'web';

export interface MobileDeviceInfo {
  deviceId: string;
  platform: MobilePlatform;
  fcmToken?: string;
  deviceModel?: string;
  appVersion?: string;
  osVersion?: string;
}

export interface MobileLoginPayload {
  email: string;
  password?: string;
  device: MobileDeviceInfo;
}

export interface MobileLoginResponse {
  user: UserAuthContext;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MobileRefreshTokenPayload {
  refreshToken: string;
  deviceId: string;
}

export interface MobileQrSession {
  sessionId: string;
  qrCodeUrl: string;
  status: 'pending' | 'scanned' | 'authenticated' | 'expired';
  expiresAt: string;
}

export interface MobilePushNotificationPayload {
  notificationId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

