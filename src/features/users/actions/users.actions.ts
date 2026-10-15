import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  UserRecord,
  UserListResponse,
  UserIdResponse,
  CreateUserDto,
  UpdateUserDto,
  ToggleUserStatusDto,
  AssignRoleDto,
  QueryUsersParams,
} from '../types/users.types';
import type { UsersExportResponse } from '@/features/auth/types/auth.types';

export const fetchUsersAction = async (
  params?: QueryUsersParams
): Promise<UserListResponse> => {
  const response = await apiClient.get<UserListResponse>(
    API_ENDPOINTS.USERS.BASE,
    {
      params,
      suppressToast: true,
    }
  );
  return response.data;
};

export const toggleUserStatusAction = async (
  dto: ToggleUserStatusDto
): Promise<UserRecord> => {
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
};

export const assignRoleAction = async (
  dto: AssignRoleDto
): Promise<UserRecord> => {
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
};

export const exportUsersAction = async (): Promise<UsersExportResponse> => {
  const response = await apiClient.get<UsersExportResponse>(
    API_ENDPOINTS.AUTH.USERS_EXPORT
  );
  return response.data;
};

export const fetchUserByIdAction = async (
  id: string
): Promise<UserIdResponse> => {
  const response = await apiClient.get<UserIdResponse>(
    API_ENDPOINTS.USERS.BY_ID(id)
  );
  return response.data;
};

export const updateUserAction = async (
  id: string,
  dto: UpdateUserDto
): Promise<UserIdResponse> => {
  const response = await apiClient.patch<{ message?: string; user?: UserIdResponse } | UserIdResponse>(
    API_ENDPOINTS.USERS.BY_ID(id),
    dto
  );
  const data = response.data;
  return ('user' in data && data.user ? data.user : data) as UserIdResponse;
};

export const deleteUserAction = async (
  id: string
): Promise<{ message: string; deleteUser: UserRecord }> => {
  const response = await apiClient.delete<{ message: string; deleteUser: UserRecord }>(
    API_ENDPOINTS.USERS.BY_ID(id)
  );
  return response.data;
};

export const restoreUserAction = async (
  id: string
): Promise<{ message: string; user: UserRecord }> => {
  const response = await apiClient.patch<{ message: string; user: UserRecord }>(
    API_ENDPOINTS.USERS.RESTORE(id)
  );
  return response.data;
};

export const createUserAction = async (
  dto: CreateUserDto
): Promise<UserIdResponse> => {
  const response = await apiClient.post<{ message?: string; user?: UserIdResponse } | UserIdResponse>(
    API_ENDPOINTS.USERS.BASE,
    dto
  );
  const data = response.data;
  return ('user' in data && data.user ? data.user : data) as UserIdResponse;
};
