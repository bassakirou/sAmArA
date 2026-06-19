import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import usePrice from '@/utils/use-price';
import { useIsRTL } from '@/utils/locals';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type RevenueRow = {
  id: string;
  type: 'subscription' | 'order_commission';
  reference: string;
  amount: number;
  currency: string;
  occurred_at: string;
  vendor_id?: number;
  vendor_name?: string;
  shop_id?: number;
  shop_name?: string;
};

type Props = {
  revenues: RevenueRow[];
  paginatorInfo: any;
  onPagination: (current: number) => void;
};

export default function RevenueList({
  revenues,
  paginatorInfo,
  onPagination,
}: Props) {
  const { alignLeft } = useIsRTL();
  const { t } = useTranslation();
  const router = useRouter();

  const AmountCell = ({ amount }: { amount: any }) => {
    const { price } = usePrice({ amount: Number(amount ?? 0) });
    return <span>{price}</span>;
  };

  const columns: any[] = [
    {
      title: t('common:text-type'),
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 160,
      render: (type: string) =>
        type === 'subscription'
          ? t('common:text-subscriptions')
          : t('common:text-orders'),
    },
    {
      title: t('table:table-item-tracking-number'),
      dataIndex: 'reference',
      key: 'reference',
      align: 'center',
      width: 180,
      render: (reference: string, row: RevenueRow) => (
        <button
          type="button"
          className="text-accent transition-colors hover:text-accent-hover"
          onClick={() => {
            if (row.type === 'subscription') {
              router.push({
                pathname: '/subscription-plans/history',
                query: { search: reference },
              });
              return;
            }
            router.push({
              pathname: '/orders',
              query: { tracking_number: reference },
            });
          }}
        >
          {reference}
        </button>
      ),
    },
    {
      title: t('table:table-item-shop'),
      dataIndex: 'shop_name',
      key: 'shop_name',
      align: alignLeft,
      render: (shop_name: string | undefined) => <span>{shop_name ?? '—'}</span>,
    },
    {
      title: t('common:text-vendor'),
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: alignLeft,
      render: (vendor_name: string | undefined) => (
        <span>{vendor_name ?? '—'}</span>
      ),
    },
    {
      title: t('common:text-amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      width: 160,
      render: (amount: any) => <AmountCell amount={amount} />,
    },
    {
      title: t('table:table-item-order-date'),
      dataIndex: 'occurred_at',
      key: 'occurred_at',
      align: 'center',
      width: 180,
      render: (date: string) => {
        dayjs.extend(relativeTime);
        dayjs.extend(utc);
        dayjs.extend(timezone);
        return (
          <span className="whitespace-nowrap">
            {dayjs.utc(date).tz(dayjs.tz.guess()).fromNow()}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        emptyText={t('table:empty-table-data')}
        data={revenues}
        rowKey="id"
        scroll={{ x: 900 }}
      />
      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.current_page}
            pageSize={paginatorInfo.per_page}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
}
