import { API_ENDPOINTS } from '@framework/utils/endpoints';
import client from '@framework/utils/index';
import {
  Conversation,
  ConversationPaginator,
  Message,
  MessagePaginator,
  User,
} from '@type/index';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export const useMe = () => {
  return useQuery<User, Error>([API_ENDPOINTS.CUSTOMER], () => client.user.me(), {
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useConversations = (params?: { limit?: number; with?: string }) => {
  return useQuery<ConversationPaginator, Error>(
    [API_ENDPOINTS.CONVERSATIONS, params],
    () => client.conversation.all(params),
    {
      keepPreviousData: true,
      retry: false,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 15 * 1000,
    }
  );
};

export const useConversation = (id?: number | string) => {
  return useQuery<Conversation, Error>(
    [API_ENDPOINTS.CONVERSATIONS, id],
    () => client.conversation.findOne(id as number | string),
    {
      enabled: !!id,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 15 * 1000,
    }
  );
};

export const useMessages = (
  conversationId?: number | string,
  params?: { limit?: number }
) => {
  return useQuery<MessagePaginator, Error>(
    [`${API_ENDPOINTS.MESSAGES_CONVERSATIONS}`, conversationId, params],
    () => client.message.allByConversation(conversationId as number | string, params),
    {
      enabled: !!conversationId,
      keepPreviousData: true,
      retry: false,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 10 * 1000,
    }
  );
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (input: { shop_id: number | string }) => client.conversation.create(input),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.CONVERSATIONS);
      },
    }
  );
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (input: {
      conversation_id: number | string;
      body: string;
      product_id?: number | string | null;
      negotiated_price?: number | string | null;
    }) =>
      client.message.create(input.conversation_id, {
        body: input.body,
        product_id: input.product_id,
        negotiated_price: input.negotiated_price,
      }),
    {
      onSuccess: (_data: Message, variables) => {
        queryClient.invalidateQueries([
          `${API_ENDPOINTS.MESSAGES_CONVERSATIONS}`,
          variables.conversation_id,
        ]);
        queryClient.invalidateQueries(API_ENDPOINTS.CONVERSATIONS);
      },
    }
  );
};

export const useMarkConversationSeen = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (conversation_id: number | string) => client.message.seen(conversation_id),
    {
      onSuccess: (_data, conversation_id) => {
        queryClient.invalidateQueries(API_ENDPOINTS.CONVERSATIONS);
        queryClient.invalidateQueries([
          `${API_ENDPOINTS.MESSAGES_CONVERSATIONS}`,
          conversation_id,
        ]);
      },
    }
  );
};
