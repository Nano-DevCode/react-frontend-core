import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  RoleRecord,
  SystemPermission,
  CreateRoleDto,
  UpdateRoleDto,
} from '../types/roles.types';

export const fetchRolesAction = async (): Promise<RoleRecord[]> => {
  const response = await apiClient.get<RoleRecord[]>(
    API_ENDPOINTS.ROLES.BASE,
    { suppressToast: true },
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchPermissionsAction = async (): Promise<SystemPermission[]> => {
  const response = await apiClient.get<SystemPermission[]>(
    API_ENDPOINTS.ROLES.PERMISSIONS,
    { suppressToast: true },
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchRoleByIdAction = async (id: string): Promise<RoleRecord> => {
  const response = await apiClient.get<RoleRecord>(
    API_ENDPOINTS.ROLES.BY_ID(id),
    { suppressToast: true },
  );
  return response.data;
};

export const createRoleAction = async (dto: CreateRoleDto): Promise<RoleRecord> => {
  const response = await apiClient.post<RoleRecord>(
    API_ENDPOINTS.ROLES.BASE,
    dto,
  );
  return response.data;
};

export const updateRoleAction = async (
  id: string,
  dto: UpdateRoleDto,
): Promise<RoleRecord> => {
  const response = await apiClient.patch<RoleRecord>(
    API_ENDPOINTS.ROLES.BY_ID(id),
    dto,
  );
  return response.data;
};

export const deleteRoleAction = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    API_ENDPOINTS.ROLES.BY_ID(id),
  );
  return response.data;
};

