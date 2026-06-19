import { useQuery } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { revenueClient } from '@/data/client/revenue';

export const useRevenuesQuery = (options: any) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.REVENUES, options],
    ({ queryKey }) => revenueClient.all(queryKey[1] as any)
  );

  return {
    revenues: data?.data ?? [],
    paginatorInfo: data ?? null,
    error,
    loading: isLoading,
  };
};

