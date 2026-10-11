import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  UserRecord,
  UserDetailRecord,
  CreateUserDto,
  UpdateUserDto,
  ToggleUserStatusDto,
  AssignRoleDto,
  PaginatedUsersResponse,
  QueryUsersParams,
} from '../types/users.types';
import type { UsersExportResponse } from '@/features/auth/types/auth.types';

export const fetchUsersAction = async (
  params?: QueryUsersParams
): Promise<PaginatedUsersResponse> => {
  try {
    const response = await apiClient.get<PaginatedUsersResponse | UserRecord[]>(
      API_ENDPOINTS.USERS.BASE,
      {
        params,
        suppressToast: true,
      }
    );

    // Si el backend responde con un arreglo plano
    if (Array.isArray(response.data)) {
      return {
        users: response.data,
        total: response.data.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? response.data.length,
        totalPages: 1,
      };
    }

    // Si el backend responde con objeto paginado estructurado { users: [...], total, page, limit, totalPages }
    if (response.data && Array.isArray(response.data.users)) {
      return {
        users: response.data.users,
        total: response.data.total ?? response.data.users.length,
        page: response.data.page ?? params?.page ?? 1,
        limit: response.data.limit ?? params?.limit ?? 10,
        totalPages: response.data.totalPages ?? 1,
      };
    }

    return {
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
  } catch {
    return {
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
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

export const fetchUserByIdAction = async (
  id: string
): Promise<UserDetailRecord> => {
  const response = await apiClient.get<UserDetailRecord>(
    API_ENDPOINTS.USERS.BY_ID(id)
  );
  return response.data;
};

export const updateUserAction = async (
  id: string,
  dto: UpdateUserDto
): Promise<UserDetailRecord> => {
  const response = await apiClient.patch<{ message: string; user: UserDetailRecord } | UserDetailRecord>(
    API_ENDPOINTS.USERS.BY_ID(id),
    dto
  );
  const data = response.data;
  return (data && 'user' in data ? data.user : data) as UserDetailRecord;
};

export const deleteUserAction = async (
  id: string
): Promise<{ message: string; deleteUser: any }> => {
  const response = await apiClient.delete<{ message: string; deleteUser: any }>(
    API_ENDPOINTS.USERS.BY_ID(id)
  );
  return response.data;
};

export const restoreUserAction = async (
  id: string
): Promise<{ message: string; user: any }> => {
  const response = await apiClient.patch<{ message: string; user: any }>(
    API_ENDPOINTS.USERS.RESTORE(id)
  );
  return response.data;
};

export const createUserAction = async (
  dto: CreateUserDto
): Promise<UserDetailRecord> => {
  const response = await apiClient.post<{ message: string; user: UserDetailRecord } | UserDetailRecord>(
    API_ENDPOINTS.USERS.BASE,
    dto
  );
  const data = response.data;
  return (data && 'user' in data ? data.user : data) as UserDetailRecord;
};


