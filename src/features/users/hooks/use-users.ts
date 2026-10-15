import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/use-auth-store';
import { syncUserSession } from '@/api/auth-session';
import {
  fetchUsersAction,
  toggleUserStatusAction,
  assignRoleAction,
  exportUsersAction,
  fetchUserByIdAction,
  updateUserAction,
  deleteUserAction,
  restoreUserAction,
  createUserAction,
} from '../actions/users.actions';
import type {
  ToggleUserStatusDto,
  AssignRoleDto,
  PaginatedUsersResponse,
  QueryUsersParams,
  UserRecord,
  CreateUserDto,
  UpdateUserDto,
} from '../types/users.types';

export const useUsersQuery = (params?: QueryUsersParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsersAction(params),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 1000 * 30, // 30s
  });
};

export const useToggleUserStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ToggleUserStatusDto) => toggleUserStatusAction(dto),
    // Mutación optimista: el switch de estado cambia de inmediato en la interfaz
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });

      queryClient.setQueriesData<PaginatedUsersResponse | UserRecord[]>(
        { queryKey: ['users'] },
        (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.map((u) =>
              u.id === updatedUser.userId ? { ...u, isActive: updatedUser.isActive } : u
            );
          }
          return {
            ...old,
            users: old.users.map((u) =>
              u.id === updatedUser.userId ? { ...u, isActive: updatedUser.isActive } : u
            ),
          };
        }
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.error('Error al actualizar el estado del usuario');
    },
    onSuccess: async (_data, variables) => {
      const currentUserId = useAuthStore.getState().user?.id;
      if (currentUserId === variables.userId) {
        await syncUserSession();
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Estado de usuario actualizado con éxito');
    },
  });
};

export const useAssignRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AssignRoleDto) => assignRoleAction(dto),
    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });

      queryClient.setQueriesData<PaginatedUsersResponse | UserRecord[]>(
        { queryKey: ['users'] },
        (old) => {
          if (!old) return old;
          const mappedRoles = dto.roleNames.map((name) => ({
            role: { name, permissions: [] },
          }));

          if (Array.isArray(old)) {
            return old.map((u) =>
              u.id === dto.userId
                ? {
                    ...u,
                    roles: mappedRoles,
                  }
                : u
            );
          }
          return {
            ...old,
            users: old.users.map((u) =>
              u.id === dto.userId
                ? {
                    ...u,
                    roles: mappedRoles,
                  }
                : u
            ),
          };
        }
      );
    },
    onSuccess: async (_data, variables) => {
      const currentUserId = useAuthStore.getState().user?.id;
      if (currentUserId === variables.userId) {
        await syncUserSession();
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Roles y permisos actualizados correctamente');
    },
  });
};

export const useExportUsersMutation = () => {
  return useMutation({
    mutationFn: exportUsersAction,
    onSuccess: (data) => {
      toast.success(data.message || 'Exportación autorizada');
    },
  });
};

export const useUserDetailQuery = (id: string | null) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserByIdAction(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) =>
      updateUserAction(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al actualizar el usuario';
      toast.error(message);
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUserAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario dado de baja correctamente');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al dar de baja al usuario';
      toast.error(message);
    },
  });
};

export const useRestoreUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreUserAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario restaurado exitosamente');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al restaurar al usuario';
      toast.error(message);
    },
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUserDto) => createUserAction(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al crear el usuario';
      toast.error(message);
    },
  });
};


