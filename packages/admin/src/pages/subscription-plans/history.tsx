import Card from '@/components/common/card';
import Search from '@/components/common/search';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Input from '@/components/ui/input';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { Routes } from '@/config/routes';
import { useVendorSubscriptionHistoryQuery } from '@/data/vendor-subscription';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import usePrice from '@/utils/use-price';

const AmountCell = ({ amount, currency }: { amount: number; currency: string }) => {
  const { price } = usePrice({ amount: Number(amount ?? 0), currencyCode: currency || 'XAF' });
  return <span>{price}</span>;
};

export default function SubscriptionHistoryPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [day, setDay] = useState<string>('');

  const queryOptions = useMemo(() => {
    return {
      limit: 15,
      page,
      search: searchTerm,
      year: year || undefined,
      month: month || undefined,
      day: day || undefined,
    };
  }, [day, month, page, searchTerm, year]);

  const { subscriptions, paginatorInfo, loading, error } =
    useVendorSubscriptionHistoryQuery(queryOptions);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const columns: any = [
    {
      title: 'Date',
      dataIndex: 'paid_at',
      key: 'paid_at',
      render: (v: string) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-'),
      width: 170,
    },
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
            {shops.slice(0, 2).map((s: any) => (
              <span key={s?.id} className="text-sm text-body">
                {s?.name ?? s?.slug ?? '-'}
              </span>
            ))}
            {shops.length > 2 ? (
              <span className="text-xs text-gray-600">+{shops.length - 2} autre(s)</span>
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
      width: 140,
    },
    {
      title: 'Tracking',
      dataIndex: 'payment_tracking_number',
      key: 'payment_tracking_number',
      render: (v: string) => (
        <span className="font-mono text-xs text-gray-700">{v ?? '-'}</span>
      ),
      width: 160,
    },
    {
      title: 'Gateway',
      dataIndex: 'payment_gateway',
      key: 'payment_gateway',
      render: (v: string) => <span className="text-sm text-body">{v ?? '-'}</span>,
      width: 120,
    },
    {
      title: 'Période',
      dataIndex: 'billing_period',
      key: 'billing_period',
      render: (v: string) => (v === 'annual' ? 'Annuel' : 'Mensuel'),
      width: 110,
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: any, row: any) => (
        <AmountCell amount={Number(amount ?? 0)} currency={row?.currency ?? 'XAF'} />
      ),
      width: 140,
    },
    {
      title: 'Du',
      dataIndex: 'starts_at',
      key: 'starts_at',
      render: (v: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '-'),
      width: 120,
    },
    {
      title: 'Au',
      dataIndex: 'ends_at',
      key: 'ends_at',
      render: (v: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '-'),
      width: 120,
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
      width: 110,
    },
  ];

  return (
    <>
      <Card className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/2">
            <h1 className="text-xl font-semibold text-heading">
              Historique des abonnements
            </h1>
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
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            name="year"
            type="number"
            label="Année"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            placeholder="2026"
          />
          <Input
            name="month"
            type="number"
            label="Mois"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            placeholder="1-12"
          />
          <Input
            name="day"
            type="number"
            label="Jour"
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              setPage(1);
            }}
            placeholder="1-31"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="rounded bg-gray-100 px-4 py-2 text-sm font-semibold text-heading transition-colors hover:bg-gray-200"
            onClick={() => {
              setYear('');
              setMonth('');
              setDay('');
              setSearchTerm('');
              setPage(1);
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      </Card>

      <Table
        columns={columns}
        emptyText="Aucun abonnement"
        data={subscriptions ?? []}
        rowKey="id"
        scroll={{ x: 1400 }}
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

SubscriptionHistoryPage.authenticate = {
  permissions: adminOnly,
};

SubscriptionHistoryPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
