// ============================================================================
// CONTRATOS DE USUARIOS Y RBAC (/users)
// ============================================================================

export interface PermissionRecord {
  id: string;
  slug: string;
  description: string | null;
}

export interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Array<{
    permission: PermissionRecord;
  }>;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles: Array<{
    role: {
      name: string;
      permissions: Array<{
        permission: {
          slug: string;
        };
      }>;
    };
  }>;
  twoFactor?: {
    isEnabled: boolean;
  } | null;
}

export interface ToggleUserStatusDto {
  userId: string;
  isActive: boolean;
}

export interface AssignRoleDto {
  userId: string;
  roleNames: string[];
}

