export interface SystemPermission {
  id: string;
  slug: string;
  description: string | null;
}

export interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  permissions: SystemPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  priority: number;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  priority?: number;
  permissionIds?: string[];
}

