import Router from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { mapPaginatorData } from '@/utils/data-mappers';
import { API_ENDPOINTS } from './client/api-endpoints';
import { Routes } from '@/config/routes';
import { Faq, FaqPaginator, FaqQueryOptions, GetParams } from '@/types';
import { faqClient } from '@/data/client/faq';
import { Config } from '@/config';

export const useCreateFaqMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(faqClient.create, {
    onSuccess: () => {
      Router.push(Routes.faq.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.FAQS);
    },
  });
};

export const useDeleteFaqMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(faqClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.FAQS);
    },
  });
};

export const useUpdateFaqMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(faqClient.update, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.FAQS);
    },
  });
};

export const useFaqQuery = ({ slug, language }: GetParams) => {
  const { data, error, isLoading } = useQuery<Faq, Error>(
    [API_ENDPOINTS.FAQS, { slug, language }],
    () => faqClient.get({ slug, language })
  );
  return {
    faq: data,
    error,
    loading: isLoading,
  };
};

export const useFaqsQuery = (options: Partial<FaqQueryOptions>) => {
  const { data, error, isLoading } = useQuery<FaqPaginator, Error>(
    [API_ENDPOINTS.FAQS, options],
    ({ queryKey, pageParam }) =>
      faqClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    }
  );

  return {
    faqs: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

