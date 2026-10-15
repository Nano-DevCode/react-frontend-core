// ============================================================================
// CONTRATOS DE USUARIOS Y RBAC (/users)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Catálogos Base (Permisos y Roles)
// ----------------------------------------------------------------------------

export interface PermissionRecord {
  id: string;
  slug: string;
  description: string | null;
}

export interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  priority?: number;
  createdAt: string;
  updatedAt: string;
  permissions?: Array<{
    permission: PermissionRecord;
  }>;
}

export interface UserProfileRecord {
  firstName?: string | null;
  firstLastName?: string | null;
  secondLastName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

// ----------------------------------------------------------------------------
// 2. Modelo General / Base (UserBase)
//    Propiedades esenciales de identidad compartidas por respuestas y DTOs
// ----------------------------------------------------------------------------

export interface UserBase {
  email: string;
  name?: string | null;
  isActive?: boolean;
}

// ----------------------------------------------------------------------------
// 3. Respuestas de API (Listados vs Detalle por ID)
// ----------------------------------------------------------------------------

/**
 * Elemento individual para tablas y tarjetas (GET /users)
 * Payload ligero optimizado para paginación y renderizado rápido.
 */
export interface UserListItemResponse extends UserBase {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  twoFactor?: {
    isEnabled: boolean;
  } | null;
  roles: Array<{
    role: {
      name: string;
      priority?: number;
      permissions?: Array<{
        permission: {
          slug: string;
          description?: string | null;
        };
      }>;
    };
  }>;
  profile?: UserProfileRecord | null;
}

/**
 * Respuesta paginada completa del endpoint de listado (GET /users)
 */
export interface UserListResponse {
  users: UserListItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Respuesta completa y enriquecida del endpoint por ID (GET /users/:id)
 * Contiene todas las relaciones, timestamps, 2FA y matriz de permisos.
 */
export interface UserIdResponse extends UserListItemResponse {
  emailVerifiedAt: string | null;
}

// ----------------------------------------------------------------------------
// 4. Alias de compatibilidad (Previene rupturas en componentes existentes)
// ----------------------------------------------------------------------------

export type UserRecord = UserListItemResponse;
export type UserDetailRecord = UserIdResponse;
export type UserByIdResponse = UserIdResponse;
export type PaginatedUsersResponse = UserListResponse;

// ----------------------------------------------------------------------------
// 5. DTOs de Creación, Edición y Mutaciones (Basados en UserBase)
// ----------------------------------------------------------------------------

export interface CreateUserDto extends UserBase {
  password: string;
  roles?: string[];
  profile: {
    firstName: string;
    firstLastName: string;
    secondLastName: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export interface UpdateUserDto extends Partial<UserBase> {
  password?: string;
  roles?: string[];
  profile?: {
    firstName?: string;
    firstLastName?: string;
    secondLastName?: string;
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

export interface QueryUsersParams {
  page?: number;
  limit?: number;
  user_page?: number;
  user_limit?: number;
  status?: 'active' | 'deleted' | 'all';
}
