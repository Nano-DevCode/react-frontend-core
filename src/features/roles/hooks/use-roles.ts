import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchRolesAction,
  fetchPermissionsAction,
  fetchRoleByIdAction,
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from '../actions/roles.actions';
import type {
  RoleRecord,
  SystemPermission,
  CreateRoleDto,
  UpdateRoleDto,
  QueryRolesParams,
  PaginatedRolesResponse,
} from '../types/roles.types';

export const ROLES_QUERY_KEY = ['roles'];
export const PERMISSIONS_QUERY_KEY = ['roles', 'permissions'];

export const useRolesQuery = (params?: QueryRolesParams) => {
  return useQuery<PaginatedRolesResponse>({
    queryKey: [...ROLES_QUERY_KEY, params],
    queryFn: () => fetchRolesAction(params),
    staleTime: 1000 * 30, // 30 segundos
    refetchOnMount: true,
  });
};

export const usePermissionsQuery = () => {
  return useQuery<SystemPermission[]>({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: fetchPermissionsAction,
    staleTime: 1000 * 60 * 5, // 5 minutos (los permisos son fijos)
  });
};

export const useRoleDetailsQuery = (id?: string) => {
  return useQuery<RoleRecord>({
    queryKey: ['roles', id],
    queryFn: () => fetchRoleByIdAction(id!),
    enabled: Boolean(id),
  });
};

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateRoleDto) => createRoleAction(dto),
    onSuccess: (newRole) => {
      toast.success(`Rol "${newRole.name}" creado exitosamente.`);
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al crear el rol';
      toast.error(message);
    },
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      updateRoleAction(id, dto),
    onSuccess: (updatedRole) => {
      toast.success(`Rol "${updatedRole.name}" actualizado correctamente.`);
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['roles', updatedRole.id] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al actualizar el rol';
      toast.error(message);
    },
  });
};

export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoleAction(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Rol eliminado correctamente.');
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al eliminar el rol';
      toast.error(message);
    },
  });
};

