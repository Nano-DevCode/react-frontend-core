# Sistema SaaS Enterprise - Frontend

Aplicación web empresarial moderna construida con **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Zustand** y el ecosistema **TanStack** (Query v5, Table v8, Virtual v3).

---

## 🚀 Requisitos Previos

- **Node.js**: v20 o v22 LTS (recomendado v22)
- **Gestor de Paquetes**: `pnpm` (v10+ o v11+)
- **Docker & Docker Compose**: Opcional, requerido para despliegues contenerizados en producción

---

## 🛠️ Entorno de Desarrollo Local

1. **Instalar dependencias con pnpm:**
   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno:**
   Copia `.env.example` a `.env` y ajusta según tu entorno:
   ```bash
   cp .env.example .env
   ```

3. **Iniciar el servidor de desarrollo con HMR:**
   ```bash
   pnpm run dev
   ```
   La aplicación se abrirá por defecto en `http://localhost:5173`.

4. **Comandos de calidad de código y compilación:**
   ```bash
   # Análisis de tipos TypeScript y empaquetado Vite
   pnpm run build

   # Auditoría de buenas prácticas y linting
   pnpm run lint

   # Previsualizar el bundle de producción localmente
   pnpm run preview
   ```

---

## 🐳 Despliegue en Producción con Docker

El proyecto incluye un entorno contenerizado listo para producción con **Dockerfile multi-etapa** y servidor web **Nginx Alpine** de alto rendimiento.

### Características de la Imagen de Producción:
* **Multi-stage build:** Etapa `builder` con Node 22 + Corepack/pnpm, y etapa `runner` ultra-ligera con Nginx 1.27 (~25MB).
* **Enrutamiento SPA:** Soporte nativo para React Router mediante `try_files $uri $uri/ /index.html;`.
* **Políticas de Caché Optimizadas:**
  * Assets con hash de Vite (`/assets/*`): `Cache-Control: public, max-age=31536000, immutable`.
  * `index.html`: `no-store, no-cache, must-revalidate` (para despliegues inmediatos sin caché fantasma).
* **Compresión Gzip en caliente:** Activa para JS, CSS, HTML, SVG y JSON.
* **Cabeceras de Seguridad HTTP:** `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy` y `Permissions-Policy`.
* **Healthcheck Integrado:** Endpoint `/healthz` monitoreado automáticamente por Docker Engine.

### Comandos Docker Compose:

1. **Construir la imagen de producción:**
   ```bash
   docker compose build
   ```

2. **Levantar el contenedor en segundo plano (detached):**
   ```bash
   docker compose up -d
   ```
   Accede a la aplicación en `http://localhost` (o en el puerto definido por `FRONTEND_PORT` en `.env`).

3. **Inspeccionar el estado y los logs en tiempo real:**
   ```bash
   docker compose ps
   docker compose logs -f frontend
   ```

4. **Detener el contenedor:**
   ```bash
   docker compose down
   ```

---

## 🔒 Variables de Entorno para Producción

En Vite, las variables con prefijo `VITE_` se inyectan en el bundle en **tiempo de compilación**. En `docker-compose.yml` se pasan como `build args`:

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `FRONTEND_PORT` | Puerto expuesto en el host por Docker | `80` |
| `VITE_API_URL` | URL base del API Backend NestJS | `http://localhost:3000/api` |
| `VITE_APP_NAME` | Nombre institucional mostrado en la app | `SaaS Enterprise Security` |
| `VITE_ENABLE_MOCK_FALLBACK` | Activa datos de prueba cuando el backend esté offline | `true` |

---

## 📄 Licencia

Este software se distribuye bajo una **Licencia Comercial Propietaria**. Consulta el archivo [`LICENSE.md`](./LICENSE.md) para conocer los términos de uso, derechos concedidos y restricciones estrictas de redistribución.

Copyright (c) 2026 Manuel Eduardo Santiago Feria. Todos los derechos reservados.

