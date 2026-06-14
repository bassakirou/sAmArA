import Logo from '@/components/ui/logo';
import { useUI } from '@/contexts/ui.context';
import AuthorizedMenu from './authorized-menu';
import LinkButton from '@/components/ui/link-button';
import { NavbarIcon } from '@/components/icons/navbar-icon';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { resolveConversationHref } from '@/components/message/chat-route';
import {
  getAuthCredentials,
  isStoreOwner,
  isSuperAdmin,
} from '@/utils/auth-utils';
import { Config } from '@/config';
import NotificationMenu from '@/components/common/notification-menu';
import { useMyShopsQuery, useShopQuery } from '@/data/shop';
import {
  useNotificationStoreNoticesQuery,
  useStoreNoticeReadAll,
} from '@/data/store-notice';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';

dayjs.extend(relativeTime);

const Navbar = () => {
  const { t } = useTranslation();
  const { toggleSidebar } = useUI();
  const { query } = useRouter();
  const auth = getAuthCredentials();

  const isAdminUser = isSuperAdmin(auth);
  const isOwnerUser = isStoreOwner(auth);

  const shopParam = typeof query.shop === 'string' ? query.shop : undefined;
  const { data: shopData } = useShopQuery(
    { slug: shopParam as string },
    { enabled: typeof shopParam === 'string' }
  );
  const shopId = shopData?.id;
  const allowMultipleShops =
    process.env.NEXT_PUBLIC_ALLOW_MULTIPLE_SHOPS_PER_OWNER === 'true';
  const myShopsQuery = useMyShopsQuery({
    enabled: isAdminUser || isOwnerUser,
  });
  const myShops = myShopsQuery.data ?? [];
  const canCreateShop =
    isAdminUser ||
    (isOwnerUser &&
      (allowMultipleShops ||
        (!myShopsQuery.isLoading && (myShops?.length ?? 0) === 0)));
  const { storeNotices, unreadCount } = useNotificationStoreNoticesQuery(
    shopId ? { shop_id: shopId } : {}
  );
  const { readAllStoreNotices } = useStoreNoticeReadAll();
  const prevUnreadRef = useRef<number>(0);

  useEffect(() => {
    if (typeof unreadCount !== 'number') return;
    if (prevUnreadRef.current && unreadCount > prevUnreadRef.current) {
      toast.info(t('common:text-new-notification-received'));
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, t]);

  const notificationItems = useMemo(() => {
    return (storeNotices ?? []).slice(0, 5).map((notice: any) => {
      const data = notice?.data ?? {};
      const kind = data?.kind;
      const createdAt = notice?.created_at;
      let href: string | undefined;
      if (kind === 'chat_message' && data?.conversation_id) {
        href = resolveConversationHref({
          conversationId: data.conversation_id,
          currentShopSlug: shopParam,
          noticeShopId: data?.shop_id,
          ownedShops: myShops,
          fallbackToOwnerView: !isAdminUser,
        });
      } else if (kind === 'order_paid' && data?.order_id) {
        href = shopParam
          ? `/${shopParam}${Routes.order.details(String(data.order_id))}`
          : Routes.order.details(String(data.order_id));
      } else if (kind === 'review_created') {
        href = data?.review_id
          ? shopParam
            ? `/${shopParam}${Routes.reviews.details(String(data.review_id))}`
            : Routes.reviews.details(String(data.review_id))
          : shopParam
          ? `/${shopParam}${Routes.reviews.list}`
          : Routes.reviews.list;
      }
      return {
        source:
          notice?.creator?.profile?.avatar?.thumbnail ??
          '/avatar-placeholder.svg',
        text: (
          <span>
            <span className="font-semibold text-heading">
              {notice?.notice ?? ''}
            </span>
            {notice?.description ? (
              <span className="block text-xs text-muted">
                {notice?.description}
              </span>
            ) : null}
          </span>
        ),
        time: createdAt ? dayjs(createdAt).fromNow() : '',
        href,
      };
    });
  }, [isAdminUser, myShops, shopParam, storeNotices]);

  const unreadNoticeIds = useMemo(
    () =>
      (storeNotices ?? [])
        .filter((notice: any) => !notice?.is_read)
        .map((notice: any) => String(notice?.id)),
    [storeNotices]
  );

  return (
    <header className="bg-sable fixed z-40 w-full bg-white shadow">
      <nav className="flex items-center justify-between px-5 py-4 md:px-8">
        {/* <!-- Mobile menu button --> */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={toggleSidebar}
          className="flex h-full items-center justify-center p-2 focus:text-accent focus:outline-none lg:hidden"
        >
          <NavbarIcon />
        </motion.button>

        <div className="ms-5 me-auto hidden md:flex">
          <Logo />
        </div>

        <div className="space-s-3 flex items-center">
          {canCreateShop && (
            <LinkButton
              href={Routes.shop.create}
              className="ms-4 md:ms-6"
              size="small"
            >
              {t('common:text-create-shop')}
            </LinkButton>
          )}
          <NotificationMenu
            data={notificationItems}
            total={unreadCount}
            onClear={() => {
              if (unreadNoticeIds.length) {
                readAllStoreNotices({ notices: unreadNoticeIds });
              }
            }}
            seeAllHref={
              shopParam ? `/${shopParam}/notifications` : '/notifications'
            }
            seeAllLabel={t('common:text-see-all')}
          />
          <LinkButton
            href={`${process.env.NEXT_PUBLIC_SHOP_URL}`}
            className="ms-4 md:ms-6 bg-green-600"
            size="small"
            target="_blank"
          >
            {t('common:text-goto-shop')}
          </LinkButton>
          <AuthorizedMenu />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
