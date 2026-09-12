/**
 * Utilidades para decodificación y cálculo de tiempos de vida de tokens JWT
 */

export interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
  exp?: number; // Unix timestamp en segundos
  iat?: number; // Unix timestamp en segundos
  jti?: string;
  [key: string]: unknown;
}

/**
 * Decodifica de forma segura el payload de un token JWT en cliente sin librerías externas
 */
export function parseJwt(token: string | null | undefined): JwtPayload | null {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;

    // Normalizar Base64URL a Base64 estándar
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Retorna los milisegundos restantes hasta la expiración del token.
 * Retorna 0 si el token no tiene claim `exp` o si ya expiró.
 */
export function getTokenRemainingTime(token: string | null | undefined): number {
  if (!token) return 0;
  const payload = parseJwt(token);
  if (!payload?.exp || typeof payload.exp !== 'number') {
    // Si es un token de prueba/mock sin formato JWT (ej: "mock-token"),
    // asumimos una duración estándar de 30 minutos (1,800,000 ms)
    if (token.startsWith('mock-')) {
      return 30 * 60 * 1000;
    }
    return 0;
  }

  const expiryMs = payload.exp * 1000;
  const now = Date.now();
  return Math.max(0, expiryMs - now);
}

/**
 * Determina si el token ya expiró o si está a punto de expirar dentro de `bufferSeconds`.
 * El buffer de seguridad (por defecto 30 segundos) previene fallos por latencia de red.
 */
export function isTokenExpired(
  token: string | null | undefined,
  bufferSeconds = 30
): boolean {
  if (!token) return true;
  const payload = parseJwt(token);

  if (!payload?.exp || typeof payload.exp !== 'number') {
    // Token de demostración mock: no expira prematuramente
    if (token.startsWith('mock-')) {
      return false;
    }
    return true;
  }

  const expiryMs = payload.exp * 1000;
  const now = Date.now();
  const bufferMs = bufferSeconds * 1000;

  return expiryMs - now <= bufferMs;
}

/**
 * Retorna el objeto Date de expiración o null si no es un JWT válido
 */
export function getTokenExpiryDate(token: string | null | undefined): Date | null {
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload?.exp || typeof payload.exp !== 'number') return null;
  return new Date(payload.exp * 1000);
}

