import Router from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { mapPaginatorData } from '@/utils/data-mappers';
import { API_ENDPOINTS } from './client/api-endpoints';
import { Routes } from '@/config/routes';
import {
  GetParams,
  TermsAndCondition,
  TermsAndConditionPaginator,
  TermsAndConditionQueryOptions,
} from '@/types';
import { termsAndConditionsClient } from '@/data/client/terms-and-conditions';
import { Config } from '@/config';

export const useCreateTermsAndConditionsMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(termsAndConditionsClient.create, {
    onSuccess: () => {
      Router.push(Routes.termsAndConditions.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.TERMS_AND_CONDITIONS);
    },
  });
};

export const useDeleteTermsAndConditionsMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(termsAndConditionsClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.TERMS_AND_CONDITIONS);
    },
  });
};

export const useUpdateTermsAndConditionsMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(termsAndConditionsClient.update, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.TERMS_AND_CONDITIONS);
    },
  });
};

export const useTermsAndConditionsQuery = ({ slug, language }: GetParams) => {
  const { data, error, isLoading } = useQuery<TermsAndCondition, Error>(
    [API_ENDPOINTS.TERMS_AND_CONDITIONS, { slug, language }],
    () => termsAndConditionsClient.get({ slug, language })
  );
  return {
    termsAndConditions: data,
    error,
    loading: isLoading,
  };
};

export const useTermsAndConditionsListQuery = (
  options: Partial<TermsAndConditionQueryOptions>
) => {
  const { data, error, isLoading } = useQuery<TermsAndConditionPaginator, Error>(
    [API_ENDPOINTS.TERMS_AND_CONDITIONS, options],
    ({ queryKey, pageParam }) =>
      termsAndConditionsClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    }
  );

  return {
    termsAndConditions: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

