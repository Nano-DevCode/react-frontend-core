export const FILES_ENDPOINTS = {
  UPLOAD: '/files/upload',
  UPLOAD_MULTIPLE: '/files/upload-multiple',
  PUBLIC: (key: string) => `/files/public/${encodeURIComponent(key)}`,
  VIEW: (key: string) => `/files/view/${encodeURIComponent(key)}`,
  URL: (key: string) => `/files/${encodeURIComponent(key)}/url`,
  DELETE: (key: string) => `/files/${encodeURIComponent(key)}`,
} as const;

