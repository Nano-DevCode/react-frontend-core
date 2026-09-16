# ==============================================================================
# Etapa 1: Builder (Compilación de TypeScript + Vite)
# ==============================================================================
FROM node:22-alpine AS builder

# Instalar dependencias necesarias de Alpine
RUN apk add --no-cache libc6-compat

# Habilitar pnpm vía Corepack oficial de Node.js
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar manifiestos y lockfile para aprovechar la caché de capas de Docker
COPY package.json pnpm-lock.yaml ./

# Instalación estricta de dependencias basada en el lockfile
RUN pnpm install --frozen-lockfile

# Copiar el código fuente del proyecto
COPY . .

# Garantizar que ningún archivo .env local sobreescriba los argumentos de producción
RUN rm -f .env .env.*

# Argumentos de construcción para inyectar variables de entorno en el bundle de Vite
ARG VITE_API_URL=/api
ARG VITE_APP_NAME="Sistema Enterprise"
ARG VITE_ENABLE_MOCK_FALLBACK=false

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_ENABLE_MOCK_FALLBACK=$VITE_ENABLE_MOCK_FALLBACK

# Compilación de producción (TypeScript type-check + Vite build)
RUN pnpm run build

# ==============================================================================
# Etapa 2: Runner (Servidor Web Nginx de Producción)
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Copiar la configuración optimizada y segura de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos estáticos generados por el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto HTTP
EXPOSE 80

# Chequeo de salud integrado (Healthcheck)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q -O - http://localhost:80/healthz || exit 1

# Arrancar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]

