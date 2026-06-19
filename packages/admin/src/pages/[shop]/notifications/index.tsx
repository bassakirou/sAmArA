import Card from '@/components/common/card';
import ShopLayout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import Pagination from '@/components/ui/pagination';
import NotificationCard from '@/components/ui/notification-card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Routes } from '@/config/routes';
import { useShopQuery } from '@/data/shop';
import {
  useStoreNoticeReadAll,
  useStoreNoticesQuery,
} from '@/data/store-notice';
import { useMeQuery } from '@/data/user';
import { SortOrder } from '@/types';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

dayjs.extend(relativeTime);

export default function ShopNotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: me } = useMeQuery();
  const [page, setPage] = useState(1);
  const [text, setText] = useState('');
  const { readAllStoreNotices, isLoading: isMarkingAllAsRead } =
    useStoreNoticeReadAll();
  const {
    query: { shop },
  } = useRouter();
  const { data: shopData } = useShopQuery({ slug: shop as string });
  const shopId = shopData?.id!;

  const { storeNotices, paginatorInfo, loading, error } = useStoreNoticesQuery({
    limit: 20,
    page,
    orderBy: 'created_at',
    sortedBy: SortOrder.Desc,
    shop_id: shopId,
    text: text || undefined,
  });

  const items = useMemo(() => {
    return (storeNotices ?? []).map((notice: any) => {
      const data = notice?.data ?? {};
      const kind = data?.kind;
      const createdAt = notice?.created_at;
      const priority =
        typeof notice?.priority === 'string'
          ? notice.priority.toLowerCase()
          : null;
      let href: string | undefined;
      if (kind === 'chat_message' && data?.conversation_id) {
        href = `/${shop}${Routes.shopMessage.details(String(data.conversation_id))}`;
      } else if (kind === 'order_paid' && data?.order_id) {
        href = `/${shop}${Routes.order.details(String(data.order_id))}`;
      } else if (kind === 'review_created') {
        href = data?.review_id
          ? `/${shop}${Routes.reviews.details(String(data.review_id))}`
          : `/${shop}${Routes.reviews.list}`;
      }
      return {
        id: String(notice?.id),
        source:
          notice?.creator?.profile?.avatar?.thumbnail ?? '/avatar-placeholder.svg',
        variant:
          kind === 'order_paid'
            ? 'order'
            : kind === 'chat_message'
              ? 'message'
              : kind === 'review_created'
                ? 'warning'
                : priority === 'high'
                  ? 'danger'
                  : priority === 'medium'
                    ? 'warning'
                    : priority === 'low'
                      ? 'info'
                      : 'neutral',
        isRead: Boolean(notice?.is_read),
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
  }, [shop, storeNotices]);

  const unreadNoticeIds = useMemo(
    () =>
      (storeNotices ?? [])
        .filter((notice: any) => !notice?.is_read)
        .map((notice: any) => String(notice?.id)),
    [storeNotices]
  );

  if (
    shopId &&
    !hasAccess(adminOnly, permissions) &&
    !me?.shops?.map((s) => s.id).includes(shopId) &&
    me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
    return null;
  }

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/2">
          <h1 className="text-xl font-semibold text-heading">
            {t('common:text-notifications')}
          </h1>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-1/2 md:flex-row md:items-center md:justify-end">
          <div className="w-full md:w-64">
            <Input
              name="text"
              variant="outline"
              placeholder={t('common:text-search')}
              value={text}
              onChange={(e) => {
                setPage(1);
                setText(e.target.value);
              }}
            />
          </div>
          <Button
            size="small"
            variant="outline"
            onClick={() => {
              if (unreadNoticeIds.length) {
                readAllStoreNotices({ notices: unreadNoticeIds });
              }
            }}
            disabled={!unreadNoticeIds.length}
            loading={isMarkingAllAsRead}
            className="border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            {t('common:text-mark-all-as-read')}
          </Button>
        </div>
      </Card>

      <div className="mb-6 overflow-hidden rounded bg-white shadow">
        {!!items.length ? (
          items.map((item: any) => (
            <NotificationCard
              key={item.id}
              src={item.source}
              text={item.text}
              time={item.time}
              href={item.href}
              variant={item.variant}
              isRead={item.isRead}
            />
          ))
        ) : (
          <div className="flex items-center justify-center border-b border-border-200 bg-light">
            <p className="py-5 text-sm text-body">
              {t('common:text-no-notifications')}
            </p>
          </div>
        )}
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={setPage}
          />
        </div>
      )}
    </>
  );
}

ShopNotificationsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ShopNotificationsPage.Layout = ShopLayout;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common'])),
  },
});
