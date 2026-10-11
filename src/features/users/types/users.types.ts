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

export interface UserProfileRecord {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  roles: Array<{
    role: {
      name: string;
      priority?: number;
      permissions?: Array<{
        permission: {
          slug: string;
        };
      }>;
    };
  }>;
  profile?: UserProfileRecord | null;
  twoFactor?: {
    isEnabled: boolean;
  } | null;
}

export interface UserDetailRecord extends UserRecord {
  profile?: UserProfileRecord | null;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  roles?: string[];
  isActive?: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  roles?: string[];
  isActive?: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export interface ToggleUserStatusDto {
  userId: string;
  isActive: boolean;
}

export interface AssignRoleDto {
  userId: string;
  roleNames: string[];
}

export interface PaginatedUsersResponse {
  users: UserRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryUsersParams {
  page?: number;
  limit?: number;
  user_page?: number;
  user_limit?: number;
  status?: 'active' | 'deleted' | 'all';
}

