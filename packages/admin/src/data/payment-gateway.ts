
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

export function usePaymentGatewaySettingsQuery(gateway: string) {
  const { t } = useTranslation();
  return useQuery<any, Error>(
    [API_ENDPOINTS.PAYMENT_GATEWAY_SETTINGS, gateway],
    () => HttpClient.get(`${API_ENDPOINTS.PAYMENT_GATEWAY_SETTINGS}/${gateway}`),
    {
      enabled: Boolean(gateway),
      onError: (err) => {
        toast.error(t('common:text-something-went-wrong'));
      },
    }
  );
}

export const useUpdatePaymentGatewaySettingsMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(
    ({ gateway, settings }: { gateway: string; settings: any }) =>
      HttpClient.post(`${API_ENDPOINTS.PAYMENT_GATEWAY_SETTINGS}/${gateway}`, settings),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-updated'));
      },
      onSettled: (data, error, variables) => {
        queryClient.invalidateQueries([API_ENDPOINTS.PAYMENT_GATEWAY_SETTINGS, variables.gateway]);
      },
    }
  );
};
