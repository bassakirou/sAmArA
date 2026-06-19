import cn from 'classnames';
import { useRouter } from 'next/router';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Conversations } from '@/types';
import Avatar from '@/components/common/avatar';
import { siteSettings } from '@/settings/site.settings';
import { resolveConversationListHref } from '@/components/message/chat-route';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  conversation: Conversations;
  className?: string;
}

const UserListView = ({ conversation, className, ...rest }: Props) => {
  const router = useRouter();
  const currentShopSlug =
    typeof router.query.shop === 'string' ? router.query.shop : undefined;
  const isShopContext = Boolean(currentShopSlug);
  const href = resolveConversationListHref({
    conversationId: conversation?.id,
    currentShopSlug,
  });
  const unreadCount = Number(conversation?.unseen ?? 0);
  const previewText =
    conversation?.latest_message?.body?.replace(/['"]+/g, '') || '';
  const counterpartName = isShopContext
    ? conversation?.user?.name ?? 'Client'
    : conversation?.shop?.name ?? conversation?.user?.name ?? 'Conversation';
  const counterpartSecondary = isShopContext
    ? conversation?.user?.email ?? ''
    : conversation?.user?.name ?? '';
  const avatarUrl = isShopContext
    ? conversation?.user?.profile?.avatar?.thumbnail
    : conversation?.shop?.logo?.thumbnail;

  return (
    <>
      <div
        className={cn(
          'relative cursor-pointer border-b border-solid border-b-[#E5E7EB] transition-colors hover:bg-[#eef2f7]',
          String(router?.query?.id ?? '') === String(conversation?.id ?? '')
            ? 'bg-[#F3F4F6]'
            : '',
          Boolean(conversation?.shop?.is_active) ? '' : 'bg-[#e6e7ea]',
          className
        )}
        onClick={() => {
          router.push(href, undefined, {
            scroll: false,
            shallow: Boolean(currentShopSlug),
          });
        }}
        {...rest}
      >
        <div
          className={cn(
            'flex w-full gap-x-2 p-1 sm:p-2',
            !isEmpty(conversation?.latest_message?.body) ? 'items-center' : ''
          )}
        >
          <Avatar
            src={avatarUrl ?? siteSettings?.avatar?.placeholder}
            alt={counterpartName}
            className="h-10 w-10 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="mr-3 truncate text-sm font-semibold text-heading">
                {counterpartName}
              </h2>

              {conversation?.latest_message?.created_at ? (
                <p className="shrink-0 truncate text-xs text-[#686D73]">
                  {dayjs().to(
                    dayjs.utc(conversation?.latest_message?.created_at)
                  )}
                </p>
              ) : (
                ''
              )}
            </div>
            <div className="mt-1 flex items-start justify-between gap-3">
              <div className="min-w-0">
                {!isEmpty(previewText) ? (
                  <p className="truncate text-sm text-[#475569]">
                    {previewText}
                  </p>
                ) : (
                  <p className="truncate text-sm text-[#94A3B8]">
                    Aucune reponse pour le moment.
                  </p>
                )}
              </div>
              {unreadCount > 0 ? (
                <span className="inline-flex min-h-[1.5rem] min-w-[1.5rem] items-center justify-center rounded-full bg-accent px-2 text-xs font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </div>
            {!Boolean(conversation?.shop?.is_active) ? (
              <p className="mt-2 text-xs font-medium text-red-500">
                Boutique inactive
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserListView;
