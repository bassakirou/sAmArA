import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { getFieldErrors, getFormErrors } from './client/http-client';
import { becameSellerClient } from './client/became-seller';

export const useBecameSellerQuery = ({ language }: { language: string }) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.BECAME_SELLER, { language }],
    () => becameSellerClient.all({ language })
  );

  return {
    becameSeller: data ?? null,
    error,
    loading: isLoading,
  };
};

export const useUpdateBecameSellerMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(becameSellerClient.update, {
    onError: (error) => {
      const message = getFormErrors(error);
      const fieldErrors = getFieldErrors(error);
      const firstField = fieldErrors ? Object.keys(fieldErrors)[0] : null;
      const firstFieldMessage =
        firstField && Array.isArray((fieldErrors as any)?.[firstField])
          ? (fieldErrors as any)?.[firstField]?.[0]
          : null;

      if (firstFieldMessage) {
        toast.error(firstFieldMessage);
        return;
      }
      if (message) {
        toast.error(t(message));
        return;
      }
      toast.error(t('common:SAMARA_ERROR.SOMETHING_WENT_WRONG'));
    },
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.BECAME_SELLER);
    },
  });
};

