import Card from '@/components/common/card';
import Search from '@/components/common/search';
import Layout from '@/components/layouts/admin';
import RevenueList from '@/components/revenue/revenue-list';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import Select from '@/components/ui/select/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useRevenuesQuery } from '@/data/revenue';
import { adminOnly } from '@/utils/auth-utils';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function RevenuesPage() {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation();

  const queryPeriod =
    typeof router.query.period === 'string' ? router.query.period : 'month';
  const queryType = typeof router.query.type === 'string' ? router.query.type : 'all';
  const queryDate = typeof router.query.date === 'string' ? router.query.date : undefined;
  const querySearch =
    typeof router.query.search === 'string' ? router.query.search : '';

  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>(
    queryPeriod === 'day' ||
      queryPeriod === 'week' ||
      queryPeriod === 'month' ||
      queryPeriod === 'year'
      ? queryPeriod
      : 'month'
  );
  const [type, setType] = useState<'all' | 'orders' | 'subscriptions'>(
    queryType === 'orders' || queryType === 'subscriptions' || queryType === 'all'
      ? (queryType as any)
      : 'all'
  );
  const [baseDate, setBaseDate] = useState<Date | null>(
    queryDate ? dayjs(queryDate).toDate() : dayjs().toDate()
  );
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearchTerm(querySearch);
  }, [querySearch]);

  function updateUrlQuery(next: Record<string, unknown>) {
    const query: Record<string, unknown> = { ...router.query, ...next };
    Object.keys(query).forEach((key) => {
      if (
        query[key] === undefined ||
        query[key] === null ||
        query[key] === ''
      ) {
        delete query[key];
      }
    });
    router.push({ pathname: router.pathname, query: query as any }, undefined, {
      shallow: true,
    });
  }

  const dateValue = baseDate ? dayjs(baseDate) : dayjs();
  const from =
    period === 'day'
      ? dateValue.startOf('day')
      : period === 'week'
      ? dateValue.startOf('week')
      : period === 'month'
      ? dateValue.startOf('month')
      : dateValue.startOf('year');
  const to =
    period === 'day'
      ? dateValue.endOf('day')
      : period === 'week'
      ? dateValue.endOf('week')
      : period === 'month'
      ? dateValue.endOf('month')
      : dateValue.endOf('year');

  const { revenues, paginatorInfo, loading, error } = useRevenuesQuery({
    language: locale,
    limit: 20,
    page,
    from: from.format('YYYY-MM-DD'),
    to: to.format('YYYY-MM-DD'),
    type,
    ...(searchTerm ? { search: searchTerm } : {}),
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const periodOptions = [
    { label: t('common:filter-date-day'), value: 'day' },
    { label: t('common:filter-date-week'), value: 'week' },
    { label: t('common:filter-date-month'), value: 'month' },
    { label: t('common:filter-date-year'), value: 'year' },
  ];

  const typeOptions = [
    { label: t('common:text-all'), value: 'all' },
    { label: t('common:text-orders'), value: 'orders' },
    { label: t('common:text-subscriptions'), value: 'subscriptions' },
  ];

  return (
    <>
      <Card className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Search
            onSearch={handleSearch}
          />
          <div className="grid w-full grid-cols-1 gap-4 md:w-auto md:grid-cols-3">
            <div className="min-w-[220px]">
              <Select
                options={typeOptions}
                value={typeOptions.find((o) => o.value === type)}
                onChange={(option: any) => {
                  const next = option?.value ?? 'all';
                  setType(next);
                  setPage(1);
                  updateUrlQuery({ type: next });
                }}
              />
            </div>
            <div className="min-w-[220px]">
              <Select
                options={periodOptions}
                value={periodOptions.find((o) => o.value === period)}
                onChange={(option: any) => {
                  const next = option?.value ?? 'month';
                  setPeriod(next);
                  setPage(1);
                  updateUrlQuery({ period: next });
                }}
              />
            </div>
            <div className="min-w-[260px]">
              <DatePicker
                selected={baseDate}
                onChange={(date: any) => {
                  const next = date as Date | null;
                  setBaseDate(next);
                  setPage(1);
                  updateUrlQuery({
                    date: next ? dayjs(next).format('YYYY-MM-DD') : undefined,
                  });
                }}
                isClearable={false}
                className="w-full rounded border border-border-200 px-4 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      <RevenueList
        revenues={revenues}
        paginatorInfo={paginatorInfo}
        onPagination={(current) => setPage(current)}
      />
    </>
  );

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
    updateUrlQuery({ search: searchText || undefined });
  }
}

RevenuesPage.authenticate = {
  permissions: adminOnly,
};

RevenuesPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table'])),
  },
});
