import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  UserRecord,
  ToggleUserStatusDto,
  AssignRoleDto,
} from '@/types/users.types';
import type { UsersExportResponse } from '@/types/auth.types';

export const fetchUsersAction = async (): Promise<UserRecord[]> => {
  try {
    const response = await apiClient.get<UserRecord[]>(API_ENDPOINTS.USERS.BASE, {
      suppressToast: true,
    });
    return response.data;
  } catch {
    return [];
  }
};

export const toggleUserStatusAction = async (
  dto: ToggleUserStatusDto
): Promise<UserRecord> => {
  try {
    const response = await apiClient.patch<UserRecord>(
      API_ENDPOINTS.USERS.STATUS(dto.userId),
      {
        isActive: dto.isActive,
      },
      {
        suppressToast: true,
      }
    );
    return response.data;
  } catch {
    return {
      id: dto.userId,
      email: '',
      name: null,
      isActive: dto.isActive,
      emailVerifiedAt: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      roles: [],
    };
  }
};

export const assignRoleAction = async (
  dto: AssignRoleDto
): Promise<UserRecord> => {
  try {
    const response = await apiClient.patch<UserRecord>(
      API_ENDPOINTS.USERS.ROLES(dto.userId),
      {
        roles: dto.roleNames,
      },
      {
        suppressToast: true,
      }
    );
    return response.data;
  } catch {
    return {
      id: dto.userId,
      email: '',
      name: null,
      isActive: true,
      emailVerifiedAt: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      roles: dto.roleNames.map((name) => ({
        role: { name, permissions: [] },
      })),
    };
  }
};

export const exportUsersAction = async (): Promise<UsersExportResponse> => {
  const response = await apiClient.get<UsersExportResponse>(
    API_ENDPOINTS.AUTH.USERS_EXPORT
  );
  return response.data;
};

