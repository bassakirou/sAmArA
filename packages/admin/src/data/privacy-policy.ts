import Router from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { mapPaginatorData } from '@/utils/data-mappers';
import { API_ENDPOINTS } from './client/api-endpoints';
import { Routes } from '@/config/routes';
import {
  GetParams,
  PrivacyPolicy,
  PrivacyPolicyPaginator,
  PrivacyPolicyQueryOptions,
} from '@/types';
import { privacyPoliciesClient } from '@/data/client/privacy-policy';
import { Config } from '@/config';

export const useCreatePrivacyPolicyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(privacyPoliciesClient.create, {
    onSuccess: () => {
      Router.push(Routes.privacyPolicies.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRIVACY_POLICIES);
    },
  });
};

export const useDeletePrivacyPolicyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(privacyPoliciesClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRIVACY_POLICIES);
    },
  });
};

export const useUpdatePrivacyPolicyMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(privacyPoliciesClient.update, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRIVACY_POLICIES);
    },
  });
};

export const usePrivacyPolicyQuery = ({ slug, language }: GetParams) => {
  const { data, error, isLoading } = useQuery<PrivacyPolicy, Error>(
    [API_ENDPOINTS.PRIVACY_POLICIES, { slug, language }],
    () => privacyPoliciesClient.get({ slug, language })
  );
  return {
    privacyPolicy: data,
    error,
    loading: isLoading,
  };
};

export const usePrivacyPoliciesListQuery = (
  options: Partial<PrivacyPolicyQueryOptions>
) => {
  const { data, error, isLoading } = useQuery<PrivacyPolicyPaginator, Error>(
    [API_ENDPOINTS.PRIVACY_POLICIES, options],
    ({ queryKey, pageParam }) =>
      privacyPoliciesClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    }
  );

  return {
    privacyPolicies: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};
