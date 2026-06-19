import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { subscriptionPlanClient } from '@/data/client/subscription-plan';
import { Routes } from '@/config/routes';
import {
  SubscriptionPlan,
  SubscriptionPlanInput,
  SubscriptionPlanPaginator,
  SubscriptionPlanQueryOptions,
} from '@/types';

export const useSubscriptionPlansQuery = (
  options: Partial<SubscriptionPlanQueryOptions>
) => {
  const { data, error, isLoading } = useQuery<SubscriptionPlanPaginator, Error>(
    [API_ENDPOINTS.SUBSCRIPTION_PLANS, options],
    ({ queryKey, pageParam }) =>
      subscriptionPlanClient.paginated(
        Object.assign({}, queryKey[1], pageParam)
      )
  );

  return {
    plans: data?.data ?? [],
    paginatorInfo: (data as any)?.paginatorInfo,
    error,
    loading: isLoading,
  };
};

export const useActiveSubscriptionPlansQuery = (
  options: Partial<SubscriptionPlanQueryOptions> = {}
) => {
  const { data, error, isLoading } = useQuery<SubscriptionPlanPaginator, Error>(
    [API_ENDPOINTS.SUBSCRIPTION_PLANS_ACTIVE, options],
    ({ queryKey }) => subscriptionPlanClient.active(queryKey[1] as any)
  );

  return {
    plans: data?.data ?? [],
    paginatorInfo: (data as any)?.paginatorInfo,
    error,
    loading: isLoading,
  };
};

export const useSubscriptionPlanQuery = (id: string, options?: any) => {
  return useQuery<SubscriptionPlan, Error>(
    [API_ENDPOINTS.SUBSCRIPTION_PLANS, id],
    () => subscriptionPlanClient.get({ id }),
    options
  );
};

export const useCreateSubscriptionPlanMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();
  return useMutation(
    (input: SubscriptionPlanInput) => subscriptionPlanClient.create(input),
    {
      onSuccess: () => {
        toast.success(t('common:text-successfully-created'));
        router.push(Routes.subscriptionPlans.list);
      },
      onSettled: () => {
        queryClient.invalidateQueries([API_ENDPOINTS.SUBSCRIPTION_PLANS]);
        queryClient.invalidateQueries([
          API_ENDPOINTS.SUBSCRIPTION_PLANS_ACTIVE,
        ]);
      },
      onError: (error: any) => {
        toast.error(t(`common:${error?.response?.data?.message}`));
      },
    }
  );
};

export const useUpdateSubscriptionPlanMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();
  return useMutation(
    ({ id, input }: { id: string; input: SubscriptionPlanInput }) =>
      subscriptionPlanClient.update({ id, ...input }),
    {
      onSuccess: () => {
        toast.success(t('common:text-successfully-updated'));
        router.push(Routes.subscriptionPlans.list);
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries([API_ENDPOINTS.SUBSCRIPTION_PLANS]);
        queryClient.invalidateQueries([
          API_ENDPOINTS.SUBSCRIPTION_PLANS_ACTIVE,
        ]);
        if (variables?.id) {
          queryClient.invalidateQueries([
            API_ENDPOINTS.SUBSCRIPTION_PLANS,
            variables.id,
          ]);
        }
      },
      onError: (error: any) => {
        toast.error(t(`common:${error?.response?.data?.message}`));
      },
    }
  );
};

export const useDeleteSubscriptionPlanMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation((id: string) => subscriptionPlanClient.delete({ id }), {
    onSuccess: () => {
      toast.success(t('common:text-successfully-deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries([API_ENDPOINTS.SUBSCRIPTION_PLANS]);
      queryClient.invalidateQueries([API_ENDPOINTS.SUBSCRIPTION_PLANS_ACTIVE]);
    },
    onError: (error: any) => {
      toast.error(t(`common:${error?.response?.data?.message}`));
    },
  });
};
