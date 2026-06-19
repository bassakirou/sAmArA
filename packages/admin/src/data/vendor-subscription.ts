import { useMutation, useQuery, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { vendorSubscriptionClient } from '@/data/client/vendor-subscription';

export const useVendorSubscriptionStatusQuery = (options?: any) => {
  return useQuery<any, Error>(
    [API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_ME],
    () => vendorSubscriptionClient.me(),
    options
  );
};

export const useStartVendorSubscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation((input: any) => vendorSubscriptionClient.start(input), {
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_ME);
      queryClient.invalidateQueries(API_ENDPOINTS.SUBSCRIPTION_PLANS_ACTIVE);
    },
  });
};

export const useConfirmVendorSubscriptionTaramoneyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation((tracking: string) => vendorSubscriptionClient.confirmTaramoney(tracking), {
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_ME);
    },
  });
};

export const useConfirmVendorSubscriptionCampayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation((tracking: string) => vendorSubscriptionClient.confirmCampay(tracking), {
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_ME);
    },
  });
};

export const useVendorSubscribersQuery = (options: any) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_SUBSCRIBERS, options],
    ({ queryKey }) => vendorSubscriptionClient.subscribers(queryKey[1] as any)
  );

  return {
    subscribers: data?.data ?? [],
    paginatorInfo: data ?? null,
    error,
    loading: isLoading,
  };
};

export const useVendorSubscriptionHistoryQuery = (options: any) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_HISTORY, options],
    ({ queryKey }) => vendorSubscriptionClient.history(queryKey[1] as any)
  );

  return {
    subscriptions: data?.data ?? [],
    paginatorInfo: data ?? null,
    error,
    loading: isLoading,
  };
};
