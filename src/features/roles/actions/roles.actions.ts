import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  RoleRecord,
  SystemPermission,
  CreateRoleDto,
  UpdateRoleDto,
  QueryRolesParams,
  PaginatedRolesResponse,
} from '../types/roles.types';

export const fetchRolesAction = async (
  params?: QueryRolesParams,
): Promise<PaginatedRolesResponse> => {
  const response = await apiClient.get<PaginatedRolesResponse | RoleRecord[]>(
    API_ENDPOINTS.ROLES.BASE,
    {
      params,
      suppressToast: true,
    },
  );

  const resData = response.data;
  if (Array.isArray(resData)) {
    return {
      roles: resData,
      data: resData,
      total: resData.length,
      page: 1,
      limit: resData.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  const roleList = resData.roles || resData.data || [];
  return {
    roles: roleList,
    data: roleList,
    total: resData.total ?? roleList.length,
    page: resData.page ?? 1,
    limit: resData.limit ?? 10,
    totalPages: resData.totalPages ?? 1,
    hasNextPage: Boolean(resData.hasNextPage),
    hasPrevPage: Boolean(resData.hasPrevPage),
  };
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
