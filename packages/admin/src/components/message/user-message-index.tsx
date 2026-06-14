import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import cn from 'classnames';
import isEmpty from 'lodash/isEmpty';
import UserMessageView from '@/components/message/views/message-view';
import { useMessagesQuery } from '@/data/conversations';
import { useConversationQuery } from '@/data/conversations';
import { LIMIT } from '@/utils/constants';
import SelectConversation from '@/components/message/views/select-conversation';
import BlockedView from '@/components/message/views/blocked-view';
import CreateMessageForm from '@/components/message/views/form-view';
import HeaderView from '@/components/message/views/header-view';
import { useEffect, useRef, useState } from 'react';
import MessageCardLoader from '@/components/message/content-loader';
import { useWindowSize } from '@/utils/use-window-size';
import { RESPONSIVE_WIDTH } from '@/utils/constants';
import ErrorMessage from '@/components/ui/error-message';
import { useMessageSeen } from '@/data/conversations';
import { useMeQuery } from '@/data/user';
import { getEcho } from '@/utils/echo';

interface Props {
  className?: string;
}

const UserMessageIndex = ({ className, ...rest }: Props) => {
  const { t } = useTranslation();
  const loadMoreRef = useRef(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const [typingName, setTypingName] = useState<string | null>(null);
  const { mutate: createSeenMessage } = useMessageSeen();
  const { query } = router;
  const { data: me } = useMeQuery();
  const { data, loading, error } = useConversationQuery({
    id: query.id as string,
  });
  const { width } = useWindowSize();
  let {
    error: messageError,
    messages,
    loading: messageLoading,
    isSuccess,
    hasMore,
    loadMore,
    isLoadingMore,
    isFetching,
    refetch: refetchMessages,
  } = useMessagesQuery({
    slug: query?.id as string,
    limit: LIMIT,
  });

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const option = { rootMargin: '-110px', threshold: [0, 0.25, 0.5, 0.75, 1] };

    const handleObserver = (entries: any[]) =>
      entries?.forEach((entry) => entry?.isIntersecting && loadMore());

    const observer = new IntersectionObserver(handleObserver, option);

    const element = loadMoreRef && loadMoreRef?.current;

    if (!element) {
      return;
    }

    observer?.observe(element);
  }, [loadMoreRef?.current, hasMore]);

  useEffect(() => {
    if (isEmpty(query?.id)) return;
    const interval = setInterval(() => {
      refetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [query?.id, refetchMessages]);

  useEffect(() => {
    if (isEmpty(query?.id)) return;
    if (!Boolean(data?.unseen)) return;

    createSeenMessage({
      id: query?.id as string,
    });
  }, [createSeenMessage, data?.unseen, query?.id]);

  useEffect(() => {
    const echo = getEcho();
    if (!echo || isEmpty(query?.id)) {
      return;
    }

    try {
      const channel = echo.private(`marvel-conversation.${query.id}`);
      channel.listenForWhisper('typing', (payload: any) => {
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

        setTypingName(
          payload?.name ?? data?.user?.name ?? data?.user?.email ?? 'Client'
        );

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
        echo.leave(`marvel-conversation.${query.id}`);
      };
    } catch {
      return;
    }
  }, [data?.user?.email, data?.user?.name, me?.id, query?.id]);

  const sendTypingState = (isTyping: boolean) => {
    const echo = getEcho();
    if (!echo || isEmpty(query?.id) || !me?.id) {
      return;
    }

    try {
      echo.private(`marvel-conversation.${query.id}`).whisper('typing', {
        isTyping,
        userId: me.id,
        name: data?.shop?.name ?? me?.name ?? 'Vendeur',
      });
    } catch {
      return;
    }
  };

  messages = [...messages].reverse();
  const classes = {
    common: 'inline-block rounded-[18px] px-4 py-3 break-all',
    default: 'bg-white text-left border border-[#E2E8F0]',
    reverse: 'bg-accent text-white',
  };
  if (!isEmpty(query?.id) && messageError)
    return (
      <div className="flex !h-full flex-1 items-center justify-center bg-[#F3F4F6]">
        <ErrorMessage message={messageError?.message} />
      </div>
    );
  return (
    <>
      <div
        className={cn(
          'flex h-full min-h-0 flex-1 overflow-hidden bg-[#F3F4F6]',
          width >= RESPONSIVE_WIDTH ? '2xl:max-w-[calc(100% - 26rem)]' : '',
          className
        )}
        {...rest}
      >
        {!isEmpty(query?.id) ? (
          <>
            {!loading && !messageLoading ? (
              <div className={cn('flex h-full min-h-0 w-full flex-col')}>
                {/* @ts-ignore */}
                <HeaderView conversation={data} />

                <UserMessageView
                  conversation={data as any}
                  messages={messages}
                  id="chatBody"
                  error={messageError}
                  loading={messageLoading}
                  classes={classes}
                  isSuccess={isSuccess}
                  isLoadingMore={isLoadingMore}
                  isFetching={isFetching}
                  typingName={typingName}
                >
                  {hasMore ? (
                    <div ref={loadMoreRef} className="mb-4">
                      {isLoadingMore ? (
                        <MessageCardLoader
                          classes={classes}
                          limit={LIMIT / 2}
                        />
                      ) : (
                        <div className="hidden">No search left</div>
                      )}
                    </div>
                  ) : (
                    ''
                  )}
                </UserMessageView>

                <div className="shrink-0 border-t border-[#E5E7EB] bg-[#F3F4F6] p-2">
                  {/* @ts-ignore */}
                  {Boolean(data?.shop?.is_active) ? (
                    <>
                      <CreateMessageForm
                        conversation={data as any}
                        onTypingChange={sendTypingState}
                      />
                    </>
                  ) : (
                    <>
                      {/* @ts-ignore */}
                      <BlockedView name={data?.shop?.name} />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <Loader
                className="!h-full flex-1"
                text={t('common:text-loading')}
              />
            )}
          </>
        ) : (
          <>{width >= RESPONSIVE_WIDTH ? <SelectConversation /> : ''}</>
        )}
      </div>
    </>
  );
};

export default UserMessageIndex;
