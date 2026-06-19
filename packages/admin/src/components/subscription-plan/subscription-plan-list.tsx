import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { useDeleteSubscriptionPlanMutation } from '@/data/subscription-plan';
import { MappedPaginatorInfo, SubscriptionPlan } from '@/types';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import usePrice from '@/utils/use-price';

export type IProps = {
  plans: SubscriptionPlan[] | undefined | null;
  onPagination: (key: number) => void;
  paginatorInfo: MappedPaginatorInfo | null;
};

const PlanPriceCell = ({ amount }: { amount: number }) => {
  const { price } = usePrice({ amount: Number(amount ?? 0) });
  return <span>{price}</span>;
};

const SubscriptionPlanList = ({ plans, onPagination, paginatorInfo }: IProps) => {
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();
  const { mutate: deletePlan } = useDeleteSubscriptionPlanMutation();

  const columns: any = [
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 90,
    },
    {
      title: t('table:table-item-title'),
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
    },
    {
      title: 'Mensuel',
      dataIndex: 'monthly_price',
      key: 'monthly_price',
      align: 'center' as const,
      render: (v: number) => <PlanPriceCell amount={Number(v ?? 0)} />,
    },
    {
      title: 'Annuel',
      dataIndex: 'annual_monthly_prorata_price',
      key: 'annual_monthly_prorata_price',
      align: 'center' as const,
      render: (v: number) => <PlanPriceCell amount={Number(v ?? 0) * 12} />,
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      render: (id: string, record: SubscriptionPlan) => (
        <div className="flex items-center justify-end gap-4">
          <Link
            href={Routes.subscriptionPlans.editWithoutLang(String(id))}
            className="text-accent transition hover:text-accent-hover"
          >
            {t('common:text-edit')}
          </Link>
          <button
            onClick={() => deletePlan(String(id))}
            className="text-red-500 transition hover:text-red-600"
            type="button"
          >
            {t('common:text-delete')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        emptyText={t('table:empty-table-data')}
        data={plans ?? []}
        rowKey="id"
        scroll={{ x: 800 }}
      />

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default SubscriptionPlanList;
