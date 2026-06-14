import { useRouter } from 'next/router';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  MessageQueryOptions,
  ConversionPaginator,
  ConversationQueryOptions,
  MessagePaginator,
  Conversations,
  SortOrder,
  User,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { conversationsClient } from './client/conversations';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { getAuthCredentials, isSuperAdmin } from '@/utils/auth-utils';

const reportVendorChatDebug = (
  hypothesisId: string,
  location: string,
  msg: string,
  data: Record<string, unknown> = {}
) => {
  fetch('http://127.0.0.1:7777/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: 'vendor-chat-scroll-lag',
      runId: 'post-fix',
      hypothesisId,
      location,
      msg,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
};

export const useConversationsQuery = (
  options: Partial<ConversationQueryOptions>
) => {
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isSuccess,
    isFetchingNextPage,
  } = useInfiniteQuery<ConversionPaginator, Error>(
    [API_ENDPOINTS.CONVERSIONS, options],
    ({ queryKey, pageParam }) =>
      conversationsClient.allConversation(
        Object.assign({}, queryKey[1], pageParam)
      ),
    {
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
    }
  );

  function handleLoadMore() {
    if (Boolean(hasNextPage)) {
      fetchNextPage();
    }
  }

  return {
    conversations: data?.pages?.flatMap((page) => page.data) ?? [],
    paginatorInfo: Array.isArray(data?.pages)
      ? mapPaginatorData(data?.pages[data.pages.length - 1])
      : null,
    loading: isLoading,
    error,
    isFetching,
    refetch,
    isSuccess,
    isLoadingMore: isFetchingNextPage,
    loadMore: handleLoadMore,
    hasMore: Boolean(hasNextPage),
  };
};

export const useConversationNotificationsQuery = (
  options: Partial<ConversationQueryOptions> = {}
) => {
  const query = useQuery<ConversionPaginator, Error>(
    [API_ENDPOINTS.CONVERSIONS, 'notifications', options],
    () =>
      conversationsClient.allConversation({
        limit: 20,
        sortedBy: SortOrder.Desc,
        orderBy: 'updated_at',
        ...options,
      }),
    {
      refetchInterval: 5000,
    }
  );

  const conversations = query.data?.data ?? [];
  const unseenCount = conversations.reduce(
    (acc: number, c: any) => acc + (Number(c?.unseen) || 0),
    0
  );

  return {
    ...query,
    conversations,
    unseenCount,
  };
};

export const useCreateConversations = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { closeModal } = useModalAction();
  const queryClient = useQueryClient();
  const auth = getAuthCredentials();
  const shopParam =
    typeof router.query.shop === 'string' ? router.query.shop : undefined;
  return useMutation(conversationsClient.create, {
    onSuccess: (data) => {
      if (data?.id) {
        const routes = shopParam
          ? `/${shopParam}${Routes.shopMessage.details(data?.id)}`
          : isSuperAdmin(auth)
          ? Routes?.message?.details(data?.id)
          : Routes?.shopMessage?.details(data?.id);
        toast.success(t('common:successfully-created'));
        router.push(`${routes}`);
        closeModal();
      } else {
        // @ts-ignore
        toast.error(t(data?.errors[0]?.message));
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.MESSAGE);
      queryClient.invalidateQueries(API_ENDPOINTS.CONVERSIONS);
    },
  });
};

export const useMessagesQuery = (options: Partial<MessageQueryOptions>) => {
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isSuccess,
    isFetchingNextPage,
  } = useInfiniteQuery<MessagePaginator, Error>(
    [API_ENDPOINTS.MESSAGE, options],
    ({ queryKey, pageParam }) =>
      conversationsClient.getMessage(Object.assign({}, queryKey[1], pageParam)),
    {
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
    }
  );

  function handleLoadMore() {
    if (Boolean(hasNextPage)) {
      fetchNextPage();
    }
  }

  return {
    messages: data?.pages?.flatMap((page) => page.data) ?? [],
    paginatorInfo: Array.isArray(data?.pages)
      ? mapPaginatorData(data?.pages[data.pages.length - 1])
      : null,
    loading: isLoading,
    error,
    isFetching,
    refetch,
    isSuccess,
    isLoadingMore: isFetchingNextPage,
    loadMore: handleLoadMore,
    hasMore: Boolean(hasNextPage),
  };
};

export const useConversationQuery = ({ id }: { id: string }) => {
  const { data, error, isLoading, isFetching } = useQuery<Conversations, Error>(
    [API_ENDPOINTS.CONVERSIONS, id],
    () => conversationsClient.getConversion({ id }),
    {
      enabled: Boolean(id),
      keepPreviousData: true,
    }
  );

  return {
    data,
    error,
    loading: isLoading,
    isFetching,
  };
};

export const useSendMessage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(conversationsClient.messageCreate, {
    onMutate: async (variables: any) => {
      await queryClient.cancelQueries(API_ENDPOINTS.MESSAGE);

      const me = queryClient.getQueryData<User>([API_ENDPOINTS.ME]);
      const optimisticId = `optimistic-${Date.now()}`;
      const conversationId = String(variables?.id ?? '');
      const previousMessageQueries = queryClient.getQueriesData(
        API_ENDPOINTS.MESSAGE
      );

      previousMessageQueries.forEach(([queryKey]) => {
        const keyOptions =
          Array.isArray(queryKey) && queryKey.length > 1
            ? (queryKey[1] as any)
            : null;

        if (String(keyOptions?.slug ?? '') !== conversationId) {
          return;
        }

        queryClient.setQueryData(queryKey, (current: any) => {
          if (!current?.pages?.length) {
            return current;
          }

          const optimisticMessage = {
            id: optimisticId,
            body: variables?.message ?? '',
            conversation_id: conversationId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: String(me?.id ?? ''),
            product_id: variables?.product_id,
            product: null,
            custom_offer: null,
          };

          return {
            ...current,
            pages: current.pages.map((page: any, index: number) =>
              index === 0
                ? {
                    ...page,
                    data: [optimisticMessage, ...(page?.data ?? [])],
                  }
                : page
            ),
          };
        });
      });

      return {
        previousMessageQueries,
      };
    },
    onSuccess: () => {
      // #region debug-point E:mutation-success
      reportVendorChatDebug(
        'E',
        'data/conversations.tsx:useSendMessage:onSuccess',
        '[DEBUG] send message mutation resolved successfully'
      );
      // #endregion
      toast.success(t('common:text-message-sent'));
    },
    onError: (_error, _variables, context: any) => {
      context?.previousMessageQueries?.forEach(
        ([queryKey, data]: [unknown, unknown]) => {
          queryClient.setQueryData(queryKey as any, data);
        }
      );
    },
    // Always refetch after error or success:
    onSettled: () => {
      // #region debug-point E:mutation-settled
      reportVendorChatDebug(
        'E',
        'data/conversations.tsx:useSendMessage:onSettled',
        '[DEBUG] invalidating queries after send message'
      );
      // #endregion
      queryClient.invalidateQueries(API_ENDPOINTS.MESSAGE);
      queryClient.invalidateQueries(API_ENDPOINTS.CONVERSIONS);
    },
  });
};

export const useMessageSeen = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(conversationsClient.messageSeen, {
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.MESSAGE);
      queryClient.invalidateQueries(API_ENDPOINTS.CONVERSIONS);
    },
  });
};
