import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PublicOnlyRoute } from '@/router/guards';
import { lazyWithRetry } from '@/router/lazy-retry';

const LoginPage = lazyWithRetry(() => import('./components/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./components/RegisterPage'));
const VerifyEmailPage = lazyWithRetry(() => import('./components/VerifyEmailPage'));

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<div className="h-screen bg-background" />}>
          <LoginPage />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<div className="h-screen bg-background" />}>
          <RegisterPage />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<div className="h-screen bg-background" />}>
          <VerifyEmailPage />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
];

