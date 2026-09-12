import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchUsersAction,
  toggleUserStatusAction,
  assignRoleAction,
  exportUsersAction,
} from '../actions/users.actions';
import type { ToggleUserStatusDto, AssignRoleDto, UserRecord } from '@/types';

export const useUsersQuery = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsersAction,
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
      const previousUsers = queryClient.getQueryData<UserRecord[]>(['users']);

      queryClient.setQueryData<UserRecord[]>(['users'], (old = []) =>
        old.map((u) =>
          u.id === updatedUser.userId ? { ...u, isActive: updatedUser.isActive } : u
        )
      );

      return { previousUsers };
    },
    onError: (_err, _updatedUser, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      toast.error('Error al actualizar el estado del usuario');
    },
    onSuccess: () => {
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
      const previousUsers = queryClient.getQueryData<UserRecord[]>(['users']);

      queryClient.setQueryData<UserRecord[]>(['users'], (old = []) =>
        old.map((u) =>
          u.id === dto.userId
            ? {
                ...u,
                roles: dto.roleNames.map((name) => ({
                  role: { name, permissions: [] },
                })),
              }
            : u
        )
      );

      return { previousUsers };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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

