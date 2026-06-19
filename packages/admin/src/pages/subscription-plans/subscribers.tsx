import Card from '@/components/common/card';
import Search from '@/components/common/search';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { Routes } from '@/config/routes';
import { useVendorSubscribersQuery } from '@/data/vendor-subscription';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import dayjs from 'dayjs';
import usePrice from '@/utils/use-price';

const AmountCell = ({ amount, currency }: { amount: number; currency: string }) => {
  const { price } = usePrice({ amount: Number(amount ?? 0), currencyCode: currency || 'XAF' });
  return <span>{price}</span>;
};

export default function SubscriptionSubscribersPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { subscribers, paginatorInfo, loading, error } = useVendorSubscribersQuery({
    limit: 15,
    page,
    search: searchTerm,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const columns: any = [
    {
      title: 'Utilisateur',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-heading">{user?.name ?? '-'}</span>
          <span className="text-xs text-gray-600">{user?.email ?? '-'}</span>
        </div>
      ),
    },
    {
      title: 'Boutiques',
      dataIndex: 'user',
      key: 'shops',
      render: (user: any) => {
        const shops = Array.isArray(user?.shops) ? user.shops : [];
        if (!shops.length) return <span className="text-gray-600">-</span>;
        return (
          <div className="flex flex-col gap-1">
            {shops.slice(0, 3).map((s: any) => (
              <span key={s?.id} className="text-sm text-body">
                {s?.name ?? s?.slug ?? '-'}
              </span>
            ))}
            {shops.length > 3 ? (
              <span className="text-xs text-gray-600">+{shops.length - 3} autre(s)</span>
            ) : null}
          </div>
        );
      },
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: any) => <span className="font-semibold">{plan?.name ?? '-'}</span>,
    },
    {
      title: 'Tracking',
      dataIndex: 'payment_tracking_number',
      key: 'payment_tracking_number',
      render: (v: string) => (
        <span className="font-mono text-xs text-gray-700">{v ?? '-'}</span>
      ),
    },
    {
      title: 'Gateway',
      dataIndex: 'payment_gateway',
      key: 'payment_gateway',
      render: (v: string) => <span className="text-sm text-body">{v ?? '-'}</span>,
    },
    {
      title: 'Période',
      dataIndex: 'billing_period',
      key: 'billing_period',
      render: (v: string) => (v === 'annual' ? 'Annuel' : 'Mensuel'),
    },
    {
      title: 'Prix',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: any, row: any) => (
        <AmountCell amount={Number(amount ?? 0)} currency={row?.currency ?? 'XAF'} />
      ),
    },
    {
      title: 'Valable jusqu’au',
      dataIndex: 'ends_at',
      key: 'ends_at',
      render: (v: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => (
        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          {v ?? '-'}
        </span>
      ),
    },
  ];

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/2">
          <h1 className="text-xl font-semibold text-heading">Abonnés</h1>
        </div>

        <div className="flex w-full items-center justify-end md:w-1/2">
          <Search
            onSearch={(e) => {
              setSearchTerm(e.searchText);
              setPage(1);
            }}
          />
          <LinkButton href={Routes.subscriptionPlans.list} className="ms-4" variant="outline">
            Retour
          </LinkButton>
        </div>
      </Card>

      <Table
        columns={columns}
        emptyText="Aucun abonné"
        data={subscribers ?? []}
        rowKey="id"
        scroll={{ x: 900 }}
      />

      {!!paginatorInfo?.total && (
        <div className="mt-4 flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.current_page}
            pageSize={paginatorInfo.per_page}
            onChange={setPage}
          />
        </div>
      )}
    </>
  );
}

SubscriptionSubscribersPage.authenticate = {
  permissions: adminOnly,
};

SubscriptionSubscribersPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
