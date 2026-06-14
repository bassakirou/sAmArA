import cn from 'classnames';
import { useRouter } from 'next/router';
import isEmpty from 'lodash/isEmpty';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import Avatar from '@/components/common/avatar';
import ProductMessageCard from '@/components/message/product-message-card';
import CustomOrderOfferCard from '@/components/message/custom-order-offer-card';
import { siteSettings } from '@/settings/site.settings';
import { Conversations } from '@/types';
import MessageNotFound from '@/components/message/views/no-message-found';
import React, { useEffect, useState, useRef } from 'react';
import {
  offset,
  flip,
  autoUpdate,
  useFloating,
  shift,
} from '@floating-ui/react-dom-interactions';
import { ArrowDown } from '@/components/icons/arrow-down';
import { useMeQuery } from '@/data/user';

const AUTO_SCROLL_THRESHOLD = 24;

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

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  conversation?: Conversations;
  className?: string;
  id?: string;
  listen?: boolean;
  loading?: boolean;
  messages: any[];
  error: any;
  classes: any;
  isSuccess: boolean;
  children: React.ReactNode;
  isLoadingMore: boolean;
  isFetching: boolean;
  typingName?: string | null;
}

const UserMessageView = ({
  conversation,
  className,
  id,
  listen,
  messages = [],
  error,
  loading,
  classes,
  isSuccess,
  children,
  isLoadingMore,
  isFetching,
  typingName,
  ...rest
}: Props) => {
  const { query } = useRouter();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const { data, isLoading: meLoading, error: meError } = useMeQuery();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const visibleRef = useRef(false);
  const lastVisibleRef = useRef<boolean | null>(null);
  const lastMessageKeyRef = useRef<string | number | null>(null);
  const isShopContext = typeof query.shop === 'string';
  const { x, y, reference, floating, strategy, update, refs } = useFloating({
    strategy: 'fixed',
    placement: 'bottom',
    middleware: [offset(-80), flip(), shift()],
  });

  const getChatBody = () =>
    typeof document === 'undefined'
      ? null
      : document.getElementById('chatBody');

  const getDistanceFromBottom = (element: HTMLElement | null) => {
    if (!element) return Number.POSITIVE_INFINITY;
    return Math.max(
      0,
      element.scrollHeight - element.clientHeight - element.scrollTop
    );
  };

  const isNearBottom = (element: HTMLElement | null) =>
    getDistanceFromBottom(element) <= AUTO_SCROLL_THRESHOLD;

  useEffect(() => {
    lastMessageKeyRef.current = null;
  }, [query?.id]);

  useEffect(() => {
    const chatBody = getChatBody();
    const latestMessageKey =
      messages?.length > 0
        ? messages[messages.length - 1]?.id ?? messages.length
        : null;
    const latestMessageChanged = latestMessageKey !== lastMessageKeyRef.current;
    const distanceFromBottom = getDistanceFromBottom(chatBody);
    const shouldAutoScroll =
      latestMessageChanged && (!visibleRef.current || isNearBottom(chatBody));

    // #region debug-point A:messages-effect
    reportVendorChatDebug(
      'A',
      'message-view.tsx:defaultScrollToBottom',
      '[DEBUG] messages effect requests scroll to bottom',
      {
        conversationId: query?.id,
        messageCount: messages?.length ?? 0,
        scrollTop: chatBody?.scrollTop ?? null,
        scrollHeight: chatBody?.scrollHeight ?? null,
        clientHeight: chatBody?.clientHeight ?? null,
        isScrollDownVisible: visibleRef.current,
        distanceFromBottom,
        latestMessageKey,
        latestMessageChanged,
        shouldAutoScroll,
      }
    );
    // #endregion
    if (!chatBody || !shouldAutoScroll) {
      return;
    }

    //@ts-ignore
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
    lastMessageKeyRef.current = latestMessageKey;
  }, [messages, query?.id]);

  // scroll to bottom
  useEffect(() => {
    const chatBody = getChatBody();
    // #region debug-point B:conversation-open-scroll
    reportVendorChatDebug(
      'B',
      'message-view.tsx:conversation-open-effect',
      '[DEBUG] conversation effect requests scroll to latest message',
      {
        conversationId: query?.id,
        isSuccess,
        scrollTop: chatBody?.scrollTop ?? null,
        scrollHeight: chatBody?.scrollHeight ?? null,
        clientHeight: chatBody?.clientHeight ?? null,
      }
    );
    // #endregion
    // @ts-ignore
    chatBody?.scrollTo({
      top: chatBody?.scrollHeight,
    });
    if (!refs.reference.current || !refs.floating.current) {
      return;
    }
    return autoUpdate(refs.reference.current, refs.floating.current, update);
  }, [query?.id, isSuccess, refs.reference, refs.floating, update]);

  const scrollToBottom = () => {
    const chatBody = getChatBody();
    chatBody?.scrollTo({
      top: chatBody?.scrollHeight,
      behavior: 'smooth',
    });
  };
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);
  useEffect(() => {
    const chatBody = getChatBody();
    const toggleVisible = () => {
      const distanceFromBottom = getDistanceFromBottom(chatBody);
      const nextVisible =
        distanceFromBottom > AUTO_SCROLL_THRESHOLD &&
        Number(chatBody?.clientHeight) <= Number(chatBody?.scrollHeight);
      if (lastVisibleRef.current !== nextVisible) {
        // #region debug-point C:scroll-visibility-change
        reportVendorChatDebug(
          'C',
          'message-view.tsx:toggleVisible',
          '[DEBUG] scroll-to-bottom visibility changed',
          {
            conversationId: query?.id,
            nextVisible,
            scrollTop: chatBody?.scrollTop ?? null,
            scrollHeight: chatBody?.scrollHeight ?? null,
            clientHeight: chatBody?.clientHeight ?? null,
            distanceFromBottom,
          }
        );
        // #endregion
        lastVisibleRef.current = nextVisible;
      }
      if (nextVisible) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    chatBody?.addEventListener('scroll', toggleVisible);
    return () => {
      chatBody?.removeEventListener('scroll', toggleVisible);
    };
  }, [loading]);

  if (loading || meLoading)
    return (
      <Loader className="!h-full flex-1" text={t('common:text-loading')} />
    );
  if (meError)
    return (
      <div className="!h-full flex-1">
        <ErrorMessage message={meError?.message} />
      </div>
    );
  return (
    <>
      <div
        id={id}
        className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC] px-4 py-6 md:px-6"
        ref={reference}
        {...rest}
      >
        <div
          onClick={() => {
            const chatBody = getChatBody();
            // #region debug-point D:manual-scroll-bottom
            reportVendorChatDebug(
              'D',
              'message-view.tsx:scrollButtonClick',
              '[DEBUG] user clicked scroll-to-bottom button',
              {
                conversationId: query?.id,
                scrollTop: chatBody?.scrollTop ?? null,
                scrollHeight: chatBody?.scrollHeight ?? null,
                clientHeight: chatBody?.clientHeight ?? null,
              }
            );
            // #endregion
            scrollToBottom();
          }}
          className={`flex h-10 w-10 transform cursor-pointer rounded-full border border-solid border-[#F3F4F6] bg-[#F3F4F6] text-black shadow-lg transition-all duration-300 hover:border-accent-hover hover:bg-accent-hover hover:text-white ${
            visible
              ? 'visible translate-y-0 opacity-100'
              : 'invisible translate-y-1 opacity-0'
          }`}
          ref={floating}
          style={{
            position: strategy,
            top: y ?? '',
            left: x ?? '',
            zIndex: 50,
          }}
        >
          <ArrowDown height="14" width="14" className="m-auto" />
        </div>
         {/* render loader */}
        {children}
        {/* render content */}
        {isSuccess ? (
          <>
            {!isEmpty(messages) ? (
              <div className="space-y-6 pb-2">
                {messages?.map((item: any, key: number) => {
                  const {
                    body,
                    created_at,
                    user_id,
                    conversation,
                    product,
                    custom_offer,
                  } = item;
                  const checkUser = Number(data?.id) === Number(user_id);
                  const avatarUrl = isShopContext
                    ? conversation?.user?.profile?.avatar?.thumbnail
                    : item?.conversation?.shop?.logo?.thumbnail;
                  return (
                    <div
                      className={`flex w-full gap-x-3 ${
                        checkUser ? 'flex-row-reverse' : ''
                      }`}
                      key={key}
                    >
                      {checkUser ? null : (
                        <div className="w-10 shrink-0 pt-1">
                          <Avatar
                            src={avatarUrl ?? siteSettings?.avatar?.placeholder}
                            {...rest}
                            alt="avatar"
                          />
                        </div>
                      )}
                      <div
                        className={`w-full sm:w-[75%] ${
                          checkUser ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={cn(
                            'inline-flex max-w-full flex-col gap-3',
                            checkUser ? 'items-end' : 'items-start'
                          )}
                        >
                          {custom_offer ? (
                            <CustomOrderOfferCard offer={custom_offer} />
                          ) : product ? (
                            <ProductMessageCard product={product} />
                          ) : null}
                          {body ? (
                            <div
                              className={`${cn(
                                classes?.common,
                                checkUser ? classes?.reverse : classes?.default
                              )}`}
                            >
                              {body.replace(/['"]+/g, '')}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-2 text-xs text-[#686D73]">
                          {dayjs().to(dayjs.utc(created_at))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {typingName ? (
                  <div className="flex w-full gap-x-3">
                    <div className="w-10 shrink-0 pt-1">
                      <Avatar
                        src={
                          conversation?.user?.profile?.avatar?.thumbnail ??
                          siteSettings?.avatar?.placeholder
                        }
                        {...rest}
                        alt={typingName}
                      />
                    </div>
                    <div className="w-full text-left sm:w-[75%]">
                      <div className="inline-flex max-w-full flex-col items-start gap-2 rounded-[18px] border border-[#E2E8F0] bg-white px-4 py-3">
                        <span className="text-xs font-medium text-[#64748B]">
                          {typingName} est en train d'ecrire...
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#94A3B8] [animation-delay:-0.2s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#94A3B8] [animation-delay:-0.1s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#94A3B8]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <MessageNotFound />
              </>
            )}
          </>
        ) : (
          ''
        )}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
};

export default UserMessageView;
