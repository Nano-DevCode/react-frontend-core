import {
  Users,
  HardDrive,
  Activity,
  ShieldAlert,
  Flag,
  LayoutDashboard,
  KeyRound,
  Terminal,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: string[];
  badge?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'user', 'auditor'],
  },
  {
    title: 'Usuarios & RBAC',
    path: '/usuarios',
    icon: Users,
    roles: ['admin'],
    badge: 'Admin',
  },
  {
    title: 'Archivos S3',
    path: '/archivos',
    icon: HardDrive,
    roles: ['admin', 'user'],
  },
  {
    title: 'Auditoría & Logs',
    path: '/auditoria',
    icon: Activity,
    roles: ['admin', 'auditor'],
  },
  {
    title: 'Salud del Sistema',
    path: '/salud',
    icon: ShieldAlert,
    roles: ['admin', 'user', 'auditor'],
  },
  {
    title: 'Seguridad 2FA',
    path: '/seguridad-2fa',
    icon: KeyRound,
    roles: ['admin', 'user', 'auditor'],
  },
  {
    title: 'Feature Flags',
    path: '/feature-flags',
    icon: Flag,
    roles: ['admin'],
    badge: 'Beta',
  },
  {
    title: 'Logs del Sistema',
    path: '/admin/logs',
    icon: Terminal,
    roles: ['admin'],
    badge: 'Admin',
  },
];

