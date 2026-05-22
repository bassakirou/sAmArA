import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { getFieldErrors, getFormErrors } from './client/http-client';
import { settingsClient } from './client/settings';
import { useSettings } from '@/contexts/settings.context';
import { Settings } from '@/types';

export const useUpdateSettingsMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { updateSettings } = useSettings();

  return useMutation(settingsClient.update, {
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
    onSuccess: (data) => {
      updateSettings(data?.options);
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SETTINGS);
    },
  });
};

export const useSettingsQuery = ({ language }: { language: string }) => {
  const { data, error, isLoading } = useQuery<Settings, Error>(
    [API_ENDPOINTS.SETTINGS, { language }],
    () => settingsClient.all({ language })
  );

  return {
    settings: data ?? {},
    error,
    loading: isLoading,
  };
};
