import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RoleGuard, FeatureFlagGuard } from '@/router/guards';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const DiscordBotPage = lazyWithRetry(() => import('./components/DiscordBotDashboard'));

export const discordBotRoutes: RouteObject[] = [
  {
    path: 'admin/discord-bot',
    element: (
      <FeatureFlagGuard flagKey="DISCORD_BOT_ENABLED">
        <RoleGuard allowedRoles={['admin']}>
          <Suspense fallback={<BentoGridSkeleton />}>
            <DiscordBotPage />
          </Suspense>
        </RoleGuard>
      </FeatureFlagGuard>
    ),
  },
];

