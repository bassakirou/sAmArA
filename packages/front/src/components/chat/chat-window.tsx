import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useAtom } from 'jotai';
import { IoChevronBack } from 'react-icons/io5';
import cn from 'classnames';
import MessageList from './message-list';
import MessageInput from './message-input';
import { chatAtom } from '@store/chat-atom';
import { getEcho } from '@utils/echo';
import {
  useConversations,
  useCreateConversation,
  useMarkConversationSeen,
  useMe,
  useMessages,
  useSendMessage,
} from '@framework/conversations';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import client from '@framework/utils/index';
import { getShopLogoSrc, PRODUCT_PLACEHOLDER } from './chat-media';

interface ChatWindowProps {
  isExpanded: boolean;
}

type PendingMessage = {
  id: string;
  body: string;
  created_at: string;
  product?: any | null;
};

const formatConversationTime = (value?: string | null) => {
  if (!value) return '';
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ChatWindow = ({ isExpanded }: ChatWindowProps) => {
  const [chatState, setChatState] = useAtom(chatAtom);
  const { activeConversationId, activeProduct, activeShopId } = chatState;
  const queryClient = useQueryClient();
  const router = useRouter();
  const { locale } = router;
  const autoSeedRef = useRef<string | null>(null);
  const markSeenRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const lastConversationRef = useRef<string | null>(null);
  const lastRenderedMessageCountRef = useRef(0);
  const chatPageProductKey = 'samara:chat:page-product';
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [typingName, setTypingName] = useState<string | null>(null);

  const shopSlug =
    router.pathname === '/shops/[slug]'
      ? (router.query.slug as string)
      : undefined;
  const productSlug =
    router.pathname === '/products/[slug]'
      ? (router.query.slug as string)
      : undefined;

  const { data: me } = useMe();
  const { data: conversationsData, isLoading: isLoadingConversations } =
    useConversations({ limit: 20 });
  const conversations = conversationsData?.data ?? [];
  const orderedConversations = useMemo(() => {
    return [...conversations].sort((left: any, right: any) => {
      const unseenDelta =
        Number(right?.unseen ?? 0) - Number(left?.unseen ?? 0);

      if (unseenDelta !== 0) {
        return unseenDelta;
      }

      const leftTimestamp = new Date(
        left?.latest_message?.created_at ?? left?.updated_at ?? 0
      ).getTime();
      const rightTimestamp = new Date(
        right?.latest_message?.created_at ?? right?.updated_at ?? 0
      ).getTime();

      return rightTimestamp - leftTimestamp;
    });
  }, [conversations]);

  const { data: shopFromPage } = useQuery(
    ['chat_shop', shopSlug, locale],
    () => client.shop.findOne({ slug: shopSlug as string, language: locale }),
    {
      enabled: !!shopSlug,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 15 * 1000,
    }
  );

  const { data: productFromPage } = useQuery(
    ['chat_product', productSlug, locale],
    () =>
      client.product.findOne({ slug: productSlug as string, language: locale }),
    {
      enabled: !!productSlug,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 15 * 1000,
    }
  );

  useEffect(() => {
    if (!chatState.isOpen) return;
    if (router.pathname !== '/products/[slug]') return;
    if (typeof window === 'undefined') return;

    const raw = window.sessionStorage.getItem(chatPageProductKey);
    if (!raw) return;

    let storedSlug: string | undefined;
    try {
      storedSlug = (JSON.parse(raw) as any)?.slug;
    } catch {
      window.sessionStorage.removeItem(chatPageProductKey);
      return;
    }

    if (storedSlug && storedSlug !== productSlug) {
      window.sessionStorage.removeItem(chatPageProductKey);
      return;
    }

    if (!productFromPage) return;

    const p: any = productFromPage;
    const canDiscussPrice =
      Boolean(p?.can_discuss_price) || Boolean(p?.is_negotiable);
    if (!canDiscussPrice) {
      window.sessionStorage.removeItem(chatPageProductKey);
      return;
    }

    const negotiationProduct = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      price: p.price,
      sale_price: p.sale_price,
      min_price: p.min_price,
      max_price: p.max_price,
      shop: p.shop,
    };

    window.sessionStorage.removeItem(chatPageProductKey);
    setChatState((prev) => ({
      ...prev,
      activeProduct: negotiationProduct,
      activeConversationId: null,
      activeShopId: prev.activeShopId ?? p?.shop?.id ?? null,
    }));
  }, [
    chatPageProductKey,
    chatState.isOpen,
    productFromPage,
    productSlug,
    router.pathname,
    setChatState,
  ]);

  const inferredShopId =
    activeShopId ??
    (shopFromPage as any)?.id ??
    (productFromPage as any)?.shop?.id;

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return undefined;
    return orderedConversations.find(
      (c: any) => String(c.id) === String(activeConversationId)
    );
  }, [activeConversationId, orderedConversations]);

  const currentShop = useMemo(
    () =>
      activeConversation?.shop ??
      shopFromPage ??
      (productFromPage as any)?.shop ??
      activeProduct?.shop,
    [activeConversation, shopFromPage, productFromPage, activeProduct]
  );

  const conversationTitle = useMemo(
    () =>
      currentShop?.name ??
      activeConversation?.user?.name ??
      'Discussion',
    [currentShop, activeConversation]
  );

  const conversationSubtitle = useMemo(
    () =>
      activeConversation?.latest_message?.body ||
      currentShop?.name ||
      '',
    [activeConversation, currentShop]
  );

  const { data: messagesData, isLoading: isLoadingMessages } = useMessages(
    activeConversationId ?? undefined,
    { limit: 30 }
  );

  const messages = useMemo(() => {
    const list = messagesData?.data ?? [];
    return [...list].reverse();
  }, [messagesData]);

  const hasSeededCurrentProduct = useMemo(() => {
    if (!activeProduct?.id || !me?.id) return false;

    return messages.some(
      (message: any) =>
        String(message.user_id) === String(me.id) &&
        String(message.product_id) === String(activeProduct.id)
    );
  }, [activeProduct?.id, me?.id, messages]);

  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();
  const markSeen = useMarkConversationSeen();

  const setActiveConversationId = (id: number | string | null) =>
    setChatState((prev) => ({ ...prev, activeConversationId: id }));

  const getDistanceFromBottom = () => {
    const element = messagesViewportRef.current;
    if (!element) return Number.POSITIVE_INFINITY;
    return Math.max(
      0,
      element.scrollHeight - element.clientHeight - element.scrollTop
    );
  };

  const isNearBottom = () => getDistanceFromBottom() <= 24;

  const scrollMessagesToBottom = (behavior: ScrollBehavior = 'auto') => {
    const element = messagesViewportRef.current;
    if (!element) return;
    element.scrollTo({
      top: element.scrollHeight,
      behavior,
    });
  };

  const syncConversationCaches = (message: any) => {
    queryClient.setQueriesData(
      [`${'messages/conversations'}`, message.conversation_id],
      (current: any) => {
        if (!current || !Array.isArray(current.data)) {
          return current;
        }

        const exists = current.data.some(
          (item: any) => String(item.id) === String(message.id)
        );
        if (exists) {
          return current;
        }

        return {
          ...current,
          data: [message, ...current.data],
        };
      }
    );

    queryClient.setQueriesData([`${'conversations'}`], (current: any) => {
      if (!current || !Array.isArray(current.data)) {
        return current;
      }

      const exists = current.data.some(
        (c: any) => String(c.id) === String(message.conversation_id)
      );

      if (!exists) {
        // If it's a new conversation, invalidate to force a fetch
        setTimeout(() => queryClient.invalidateQueries([`${'conversations'}`]), 0);
        return current;
      }

      return {
        ...current,
        data: current.data.map((conversation: any) =>
          String(conversation.id) === String(message.conversation_id)
            ? {
                ...conversation,
                latest_message: message,
                updated_at: message.created_at ?? conversation.updated_at,
              }
            : conversation
        ),
      };
    });
  };

  const sendTypingState = (isTyping: boolean) => {
    const echo = getEcho();
    if (!echo || !activeConversationId || !me?.id) return;

    try {
      echo
        .private(`marvel-conversation.${activeConversationId}`)
        .whisper('typing', {
          isTyping,
          userId: me.id,
          name: me.name ?? 'Client',
        });
    } catch {
      return;
    }
  };

  useEffect(() => {
    if (activeConversationId || isLoadingConversations) return;
    const preferred =
      inferredShopId != null
        ? conversations.find(
            (c: any) => String(c.shop_id) === String(inferredShopId)
          )
        : undefined;

    if (preferred?.id) {
      setActiveConversationId(preferred.id);
      return;
    }

    if (
      activeProduct?.id &&
      inferredShopId != null &&
      !createConversation.isLoading
    ) {
      handleCreateConversation();
      return;
    }
  }, [
    activeConversationId,
    activeProduct?.id,
    conversations,
    createConversation.isLoading,
    inferredShopId,
    isLoadingConversations,
    setChatState,
  ]);

  useEffect(() => {
    if (!activeConversationId) {
      markSeenRef.current = null;
      return;
    }

    const seenKey = String(activeConversationId);
    if (markSeenRef.current === seenKey) {
      return;
    }

    markSeenRef.current = seenKey;
    markSeen.mutate(activeConversationId, {
      onError: () => {
        markSeenRef.current = null;
      },
    });
  }, [activeConversationId, markSeen]);

  useEffect(() => {
    const echo = getEcho();
    if (!echo || !activeConversationId) return;
    try {
      const channel = echo.private(
        `marvel-conversation.${activeConversationId}`
      );
      channel
        .listen('.message.sent', () => {
          queryClient.invalidateQueries([
            `${'messages/conversations'}`,
            activeConversationId,
          ]);
          queryClient.invalidateQueries(`${'conversations'}`);
        })
        .listenForWhisper('typing', (payload: any) => {
          if (String(payload?.userId ?? '') === String(me?.id ?? '')) {
            return;
          }

          if (!payload?.isTyping) {
            setTypingName(null);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            return;
          }

          const nextTypingName =
            payload?.name ||
            activeConversation?.shop?.name ||
            conversationTitle;
          setTypingName(nextTypingName);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setTypingName(null);
          }, 1500);
        });
      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        setTypingName(null);
        echo.leave(`marvel-conversation.${activeConversationId}`);
      };
    } catch {
      return;
    }
  }, [
    activeConversation,
    activeConversationId,
    conversationTitle,
    me?.id,
    queryClient,
  ]);

  const handleCreateConversation = async () => {
    if (!inferredShopId) return;
    try {
      const conversation = await createConversation.mutateAsync({
        shop_id: inferredShopId,
      });
      setActiveConversationId(conversation.id);
    } catch (error: any) {
      throw error;
    }
  };

  const handleSendMessage = (body: string) => {
    if (!activeConversationId) return;
    const pendingId = `pending-${Date.now()}`;
    const optimisticEntry: PendingMessage = {
      id: pendingId,
      body,
      created_at: new Date().toISOString(),
    };

    setPendingMessages((prev) => [...prev, optimisticEntry]);
    sendTypingState(false);

    sendMessage.mutate(
      { conversation_id: activeConversationId, body },
      {
        onSuccess: (message: any) => {
          syncConversationCaches(message);
          setPendingMessages((prev) =>
            prev.filter((item) => item.id !== pendingId)
          );
        },
        onError: () => {
          setPendingMessages((prev) =>
            prev.filter((item) => item.id !== pendingId)
          );
        },
      }
    );
  };

  useEffect(() => {
    if (
      !activeConversationId ||
      !activeProduct?.id ||
      !me?.id ||
      isLoadingMessages
    ) {
      return;
    }

    const seedKey = `${activeConversationId}:${activeProduct.id}`;

    if (autoSeedRef.current === seedKey) {
      return;
    }

    if (hasSeededCurrentProduct) {
      autoSeedRef.current = seedKey;
      setChatState((prev) =>
        prev.activeProduct?.id === activeProduct.id
          ? { ...prev, activeProduct: null }
          : prev
      );
      return;
    }

    autoSeedRef.current = seedKey;
    const pendingId = `pending-product-${activeConversationId}-${activeProduct.id}`;
    setPendingMessages((prev) => [
      ...prev,
      {
        id: pendingId,
        body: 'Bonjour, je souhaite discuter le prix de ce produit.',
        created_at: new Date().toISOString(),
        product: activeProduct,
      },
    ]);
    sendMessage.mutate(
      {
        conversation_id: activeConversationId,
        body: 'Bonjour, je souhaite discuter le prix de ce produit.',
        product_id: activeProduct.id,
      },
      {
        onSuccess: (message: any) => {
          syncConversationCaches(message);
          setPendingMessages((prev) =>
            prev.filter((item) => item.id !== pendingId)
          );
          setChatState((prev) =>
            prev.activeProduct?.id === activeProduct.id
              ? { ...prev, activeProduct: null }
              : prev
          );
        },
        onError: () => {
          setPendingMessages((prev) =>
            prev.filter((item) => item.id !== pendingId)
          );
          autoSeedRef.current = null;
        },
      }
    );
  }, [
    activeConversationId,
    activeProduct,
    hasSeededCurrentProduct,
    isLoadingMessages,
    me?.id,
    sendMessage,
    setChatState,
  ]);

  useEffect(() => {
    if (!activeConversationId) {
      lastConversationRef.current = null;
      lastRenderedMessageCountRef.current = 0;
      return;
    }

    const conversationKey = String(activeConversationId);
    const renderedMessageCount = messages.length + pendingMessages.length;
    const isConversationChanged =
      lastConversationRef.current !== conversationKey;
    const hasNewMessages =
      renderedMessageCount > lastRenderedMessageCountRef.current;
    const shouldStickToBottom =
      isConversationChanged || (hasNewMessages && isNearBottom());

    lastConversationRef.current = conversationKey;
    lastRenderedMessageCountRef.current = renderedMessageCount;

    if (!shouldStickToBottom) {
      return;
    }

    requestAnimationFrame(() => {
      scrollMessagesToBottom(isConversationChanged ? 'auto' : 'smooth');
    });
  }, [activeConversationId, messages.length, pendingMessages.length]);

  const showListInMain = !isExpanded && !activeConversationId;
  const renderConversationItem = (conversation: any) => {
    const isActive =
      activeConversationId != null &&
      String(conversation.id) === String(activeConversationId);
    const title =
      conversation.shop?.name ?? conversation.user?.name ?? 'Discussion';
    const subtitle =
      conversation.latest_message?.body ??
      (conversation.unseen ? 'Nouveaux messages' : 'Aucun message');
    const unreadCount = Number(conversation.unseen ?? 0);

    return (
      <button
        key={conversation.id}
        onClick={() => setActiveConversationId(conversation.id)}
        className={cn(
          'w-full border-b border-gray-100 p-4 text-left transition-colors',
          isActive ? 'bg-white border-l-4 border-l-black' : 'hover:bg-white'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-linen">
            <img
              src={getShopLogoSrc(conversation.shop)}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = PRODUCT_PLACEHOLDER;
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start justify-between gap-3">
              <span className="truncate pr-2 text-sm font-bold">{title}</span>
              <span className="shrink-0 text-[10px] text-gray-400">
                {formatConversationTime(
                  conversation.latest_message?.created_at
                )}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 text-xs text-gray-500">{subtitle}</p>
              {unreadCount > 0 ? (
                <span className="inline-flex min-h-[1.5rem] min-w-[1.5rem] items-center justify-center rounded-full bg-olive px-2 text-[11px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {isExpanded && (
        <div className="w-1/3 border-r flex flex-col bg-gray-50 border-gray-500">
          <div className="p-4 border-b bg-white">
            <button
              onClick={handleCreateConversation}
              disabled={!inferredShopId || createConversation.isLoading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
            >
              Nouvelle conversation
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {isLoadingConversations ? (
              <div className="p-4">
                <p className="text-sm text-gray-400">Chargement…</p>
              </div>
            ) : orderedConversations.length === 0 ? (
              <div className="p-4">
                <p className="text-sm text-gray-400">
                  Aucune conversation pour le moment.
                </p>
              </div>
            ) : (
              orderedConversations.map((conversation: any) =>
                renderConversationItem(conversation)
              )
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex flex-col flex-grow relative',
          isExpanded ? 'w-2/3' : 'w-full'
        )}
      >
        <div className="p-4 border-b flex items-center gap-3">
          {!showListInMain && currentShop ? (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-linen">
              <Image
                src={getShopLogoSrc(currentShop) || PRODUCT_PLACEHOLDER}
                alt={conversationTitle}
                fill
                sizes="44px"
                className="object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.srcset = PRODUCT_PLACEHOLDER;
                }}
              />
            </div>
          ) : null}
          <div className="flex-grow min-w-0">
            <h4 className="font-bold text-sm leading-tight truncate">
              {showListInMain ? 'Conversations' : conversationTitle}
            </h4>
            <p className="text-xs text-gray-400 truncate">
              {showListInMain
                ? 'Sélectionnez une discussion'
                : conversationSubtitle}
            </p>
          </div>
          {!isExpanded && activeConversationId && (
            <button
              onClick={() => {
                setChatState((prev) => ({
                  ...prev,
                  activeConversationId: null,
                  activeProduct: null,
                  activeShopId: null,
                }));
                setPendingMessages([]);
                setTypingName(null);
              }}
              className="p-1 hover:bg-linen rounded-full text-heading transition-colors"
              aria-label="Retour"
            >
              <IoChevronBack size={20} />
            </button>
          )}
        </div>

        <div
          ref={messagesViewportRef}
          className="flex-grow overflow-y-auto p-4 bg-gray-350"
        >
          {showListInMain ? (
            isLoadingConversations ? (
              <div className="py-10 flex items-center justify-center">
                <p className="text-sm text-gray-400">Chargement…</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-10 flex items-center justify-center">
                <p className="text-sm text-gray-400">
                  Aucune conversation pour le moment.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {orderedConversations.map((conversation: any) =>
                  renderConversationItem(conversation)
                )}
              </div>
            )
          ) : !activeConversationId ? (
            <div className="py-10 flex items-center justify-center">
              <p className="text-sm text-gray-400">
                Sélectionnez une conversation.
              </p>
            </div>
          ) : isLoadingMessages ? (
            <div className="py-10 flex items-center justify-center">
              <p className="text-sm text-gray-400">Chargement…</p>
            </div>
          ) : (
            <MessageList
              messages={messages}
              meId={me?.id}
              pendingMessages={pendingMessages}
              typingName={typingName}
              activeShop={activeConversation?.shop}
            />
          )}
        </div>

        {activeConversationId && (
          <div className="p-2 border-t bg-white">
            <MessageInput
              onSend={handleSendMessage}
              isSending={sendMessage.isLoading}
              disabled={!me?.id}
              onTypingChange={sendTypingState}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
