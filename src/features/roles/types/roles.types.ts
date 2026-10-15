// ============================================================================
// CONTRATOS DE ROLES Y PERMISOS RBAC (/roles)
// ============================================================================

export interface SystemPermission {
  id: string;
  slug: string;
  description: string | null;
}

/**
 * Atributos universales y compartidos de un Rol
 */
export interface RoleBase {
  name: string;
  description?: string | null;
  priority: number;
}

/**
 * Representación de un Rol dentro de listados y tablas (RoleListItemResponse)
 */
export interface RoleListItemResponse extends RoleBase {
  id: string;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  permissions: SystemPermission[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Representación detallada de un Rol por su ID (RoleIdResponse)
 */
export interface RoleIdResponse extends RoleListItemResponse {
  permissions: SystemPermission[];
}

/**
 * DTO para la creación de un nuevo Rol
 */
export interface CreateRoleDto {
  name: string;
  description?: string;
  priority: number;
  permissionIds?: string[];
}

/**
 * DTO para la actualización de un Rol existente
 */
export type UpdateRoleDto = Partial<CreateRoleDto>;

/**
 * Parámetros de consulta para el listado paginado de roles
 */
export interface QueryRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  all?: boolean;
}

/**
 * Sobre de respuesta paginada de roles (RoleListResponse)
 */
export interface RoleListResponse {
  roles: RoleListItemResponse[];
  data: RoleListItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ----------------------------------------------------------------------------
// ALIASES DE RETROCOMPATIBILIDAD
// ----------------------------------------------------------------------------
export type RoleRecord = RoleListItemResponse;
export type RoleDetailResponse = RoleIdResponse;
export type PaginatedRolesResponse = RoleListResponse;
