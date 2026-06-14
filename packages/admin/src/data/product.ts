import Router, { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { productClient } from './client/product';
import {
  ProductQueryOptions,
  GetParams,
  ProductPaginator,
  Product,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import { getAuthCredentials, hasAccess, ownerAndStaffOnly } from '@/utils/auth-utils';

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();
  const getToastMessage = (error: any) => {
    const data = error?.response?.data;
    const raw =
      typeof data?.message === 'string'
        ? data.message
        : data && typeof data === 'object'
          ? (() => {
              const firstKey = Object.keys(data)[0];
              const firstValue = (data as any)[firstKey];
              if (Array.isArray(firstValue)) return firstValue[0];
              if (typeof firstValue === 'string') return firstValue;
              return null;
            })()
          : null;
    if (!raw) return t('common:something-went-wrong');
    if (/^[A-Z0-9_]+$/.test(raw)) return t(`common:${raw}`);
    return raw;
  };
  return useMutation(productClient.create, {
    onSuccess: async () => {
      const generateRedirectUrl = router.query.shop
        ? `/${router.query.shop}${Routes.product.list}`
        : Routes.product.list;
      await Router.push(generateRedirectUrl, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
    },
    onError: (error: any) => {
      toast.error(getToastMessage(error));
    },
  });
};

export const useCreateProductInlineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(productClient.create, {
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
    },
  });
};

export const useUpdateProductMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const getToastMessage = (error: any) => {
    const data = error?.response?.data;
    const raw =
      typeof data?.message === 'string'
        ? data.message
        : data && typeof data === 'object'
          ? (() => {
              const firstKey = Object.keys(data)[0];
              const firstValue = (data as any)[firstKey];
              if (Array.isArray(firstValue)) return firstValue[0];
              if (typeof firstValue === 'string') return firstValue;
              return null;
            })()
          : null;
    if (!raw) return t('common:something-went-wrong');
    if (/^[A-Z0-9_]+$/.test(raw)) return t(`common:${raw}`);
    return raw;
  };
  return useMutation(productClient.update, {
    onSuccess: async (data) => {
      const { permissions } = getAuthCredentials();
      const isOwnerOrStaff = hasAccess(ownerAndStaffOnly, permissions);
      const targetShopSlug =
        typeof router.query.shop === 'string'
          ? router.query.shop
          : isOwnerOrStaff
          ? (data as any)?.shop?.slug
          : undefined;
      const generateRedirectUrl = targetShopSlug
        ? `/${targetShopSlug}${Routes.product.list}`
        : Routes.product.list;
      await router.push(
        `${generateRedirectUrl}/${data?.slug}/edit`,
        undefined,
        {
          locale: Config.defaultLanguage,
        }
      );
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
    },
    onError: (error: any) => {
      toast.error(getToastMessage(error));
    },
  });
};

export const useUpdateProductInlineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(productClient.update, {
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const getToastMessage = (error: any) => {
    const data = error?.response?.data;
    const raw =
      typeof data?.message === 'string'
        ? data.message
        : data && typeof data === 'object'
          ? (() => {
              const firstKey = Object.keys(data)[0];
              const firstValue = (data as any)[firstKey];
              if (Array.isArray(firstValue)) return firstValue[0];
              if (typeof firstValue === 'string') return firstValue;
              return null;
            })()
          : null;
    if (!raw) return t('common:something-went-wrong');
    if (/^[A-Z0-9_]+$/.test(raw)) return t(`common:${raw}`);
    return raw;
  };
  return useMutation(productClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
    },
    onError: (error: any) => {
      toast.error(getToastMessage(error));
    },
  });
};

export const useProductQuery = ({ slug, language }: GetParams) => {
  const { data, error, isLoading } = useQuery<Product, Error>(
    [API_ENDPOINTS.PRODUCTS, { slug, language }],
    () => productClient.get({ slug, language })
  );

  return {
    product: data,
    error,
    isLoading,
  };
};

export const useProductsQuery = (
  params: Partial<ProductQueryOptions>,
  options: any = {}
) => {
  const { data, error, isLoading } = useQuery<ProductPaginator, Error>(
    [API_ENDPOINTS.PRODUCTS, params],
    ({ queryKey, pageParam }) =>
      productClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
      ...options,
    }
  );

  return {
    products: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useGenerateDescriptionMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  return useMutation(productClient.generateDescription, {
    onSuccess: () => {
      toast.success(t('Generated...'));
    },
    // Always refetch after error or success:
    onSettled: (data) => {
      queryClient.refetchQueries(API_ENDPOINTS.GENERATE_DESCRIPTION);
      data;
    },
  });
};
