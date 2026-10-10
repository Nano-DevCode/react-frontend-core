import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchFeatureFlagsAction,
  toggleFeatureFlagAction,
  fetchBetaFeatureAction,
  fetchPublicFeatureFlagsAction,
  DEFAULT_FEATURE_FLAGS,
  type PublicFeatureFlags,
} from '../actions/feature-flags.actions';
import type { FeatureFlagRecord } from '@/types/feature-flags.types';

export const useFeatureFlagsQuery = () => {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchFeatureFlagsAction,
    initialData: DEFAULT_FEATURE_FLAGS,
    staleTime: 1000 * 60, // 1 min
  });
};

export const useToggleFeatureFlagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, isEnabled }: { key: string; isEnabled: boolean }) =>
      toggleFeatureFlagAction(key, isEnabled),
    onMutate: async ({ key, isEnabled }) => {
      await queryClient.cancelQueries({ queryKey: ['feature-flags'] });
      const previousFlags = queryClient.getQueryData<FeatureFlagRecord[]>([
        'feature-flags',
      ]);

      queryClient.setQueryData<FeatureFlagRecord[]>(['feature-flags'], (old = []) =>
        old.map((f) => (f.key === key ? { ...f, isEnabled } : f))
      );

      return { previousFlags };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFlags) {
        queryClient.setQueryData(['feature-flags'], context.previousFlags);
      }
      toast.error('Error al modificar la bandera de funcionalidad');
    },
    onSuccess: (data) => {
      toast.success(
        `Bandera "${data.key}" ${data.isEnabled ? 'habilitada' : 'deshabilitada'} en caliente`
      );
    },
  });
};

/**
 * Hook reactivo para evaluar si una bandera está activa
 */
export const useFeatureFlag = (key: string): boolean => {
  const { data: flags } = useFeatureFlagsQuery();
  const flag = flags?.find((f) => f.key === key);
  return flag ? flag.isEnabled : false;
};

export const useBetaFeatureQuery = (enabled = false) => {
  return useQuery({
    queryKey: ['beta-feature'],
    queryFn: fetchBetaFeatureAction,
    enabled,
    retry: false,
  });
};

export const usePublicFeatureFlagsQuery = () => {
  return useQuery<PublicFeatureFlags>({
    queryKey: ['public-feature-flags'],
    queryFn: fetchPublicFeatureFlagsAction,
    staleTime: 1000 * 60, // 1 minuto
    refetchOnMount: 'always',
  });
};

