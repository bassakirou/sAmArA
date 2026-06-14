import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import OrderList from '@/components/order/order-list';
import { Fragment, useEffect, useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useOrdersQuery } from '@/data/order';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { OrderStatus, SortOrder } from '@/types';
import { adminOnly } from '@/utils/auth-utils';
import { MoreIcon } from '@/components/icons/more-icon';
import { useExportOrderQuery } from '@/data/export';
import { useRouter } from 'next/router';
import { useShopQuery } from '@/data/shop';
import { Menu, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { DownloadIcon } from '@/components/icons/download-icon';
import Select from '@/components/ui/select/select';
import dayjs from 'dayjs';
import { DatePicker } from '@/components/ui/date-picker';

export default function Orders() {
  const router = useRouter();
  const { locale } = useRouter();
  const {
    query: { shop },
  } = router;
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const queryOrderStatus =
    typeof router.query.order_status === 'string'
      ? router.query.order_status
      : typeof router.query.status === 'string'
      ? router.query.status
      : undefined;
  const queryDateMode =
    typeof router.query.date_mode === 'string'
      ? router.query.date_mode
      : 'range';
  const queryFrom =
    typeof router.query.from === 'string' ? router.query.from : undefined;
  const queryTo =
    typeof router.query.to === 'string' ? router.query.to : undefined;

  const [orderStatus, setOrderStatus] = useState<string | undefined>(
    queryOrderStatus
  );
  const [dateMode, setDateMode] = useState<'day' | 'month' | 'year' | 'range'>(
    queryDateMode === 'day' ||
      queryDateMode === 'month' ||
      queryDateMode === 'year' ||
      queryDateMode === 'range'
      ? queryDateMode
      : 'range'
  );
  const [singleDate, setSingleDate] = useState<Date | null>(
    queryFrom ? dayjs(queryFrom).toDate() : null
  );
  const [rangeDates, setRangeDates] = useState<[Date | null, Date | null]>([
    queryFrom ? dayjs(queryFrom).toDate() : null,
    queryTo ? dayjs(queryTo).toDate() : null,
  ]);

  useEffect(() => {
    setOrderStatus(queryOrderStatus);
  }, [queryOrderStatus]);

  useEffect(() => {
    setDateMode(
      queryDateMode === 'day' ||
        queryDateMode === 'month' ||
        queryDateMode === 'year' ||
        queryDateMode === 'range'
        ? queryDateMode
        : 'range'
    );
  }, [queryDateMode]);

  useEffect(() => {
    if (queryFrom) {
      setSingleDate(dayjs(queryFrom).toDate());
    } else {
      setSingleDate(null);
    }

    setRangeDates([
      queryFrom ? dayjs(queryFrom).toDate() : null,
      queryTo ? dayjs(queryTo).toDate() : null,
    ]);
  }, [queryFrom, queryTo]);

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  const { data: shopData, isLoading: fetchingShop } = useShopQuery(
    {
      slug: shop as string,
    },
    {
      enabled: !!shop,
    }
  );
  const shopId = shopData?.id!;
  const statusFilter = orderStatus;
  let from: string | undefined;
  let to: string | undefined;

  if (dateMode === 'range') {
    const [start, end] = rangeDates;
    from = start ? dayjs(start).format('YYYY-MM-DD') : undefined;
    to = end ? dayjs(end).format('YYYY-MM-DD') : undefined;
  } else if (dateMode === 'day') {
    from = singleDate ? dayjs(singleDate).format('YYYY-MM-DD') : undefined;
    to = from;
  } else if (dateMode === 'month') {
    from = singleDate
      ? dayjs(singleDate).startOf('month').format('YYYY-MM-DD')
      : undefined;
    to = singleDate
      ? dayjs(singleDate).endOf('month').format('YYYY-MM-DD')
      : undefined;
  } else if (dateMode === 'year') {
    from = singleDate
      ? dayjs(singleDate).startOf('year').format('YYYY-MM-DD')
      : undefined;
    to = singleDate
      ? dayjs(singleDate).endOf('year').format('YYYY-MM-DD')
      : undefined;
  }

  const { orders, loading, paginatorInfo, error } = useOrdersQuery(
    {
      language: locale,
      limit: 20,
      page,
      tracking_number: searchTerm,
      order_status: statusFilter,
      from,
      to,
    },
    {
      refetchInterval: 5000,
    }
  );
  const { refetch } = useExportOrderQuery(
    {
      ...(shopId && { shop_id: shopId }),
    },
    { enabled: false }
  );

  if (loading) return <Loader text={t('common:text-loading')} />;

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  async function handleExportOrder() {
    const { data } = await refetch();

    if (data) {
      const a = document.createElement('a');
      a.href = data;
      a.setAttribute('download', 'export-order');
      a.click();
    }
  }

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

  const orderStatusOptions = [
    { label: t('common:text-order-status'), value: '' },
    { label: t('common:order-pending'), value: OrderStatus.PENDING },
    { label: t('common:order-processing'), value: OrderStatus.PROCESSING },
    {
      label: t('common:order-at-local-facility'),
      value: OrderStatus.AT_LOCAL_FACILITY,
    },
    {
      label: t('common:order-out-for-delivery'),
      value: OrderStatus.OUT_FOR_DELIVERY,
    },
    { label: t('common:order-completed'), value: OrderStatus.COMPLETED },
  ];

  const dateModeOptions = [
    { label: t('common:filter-date-range'), value: 'range' },
    { label: t('common:filter-date-day'), value: 'day' },
    { label: t('common:filter-date-month'), value: 'month' },
    { label: t('common:filter-date-year'), value: 'year' },
  ];

  return (
    <>
      <Card className="mb-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <h1 className="text-lg font-semibold text-heading">
              {t('form:input-label-orders')}
            </h1>
          </div>

          <div className="flex w-full flex-col items-center ms-auto md:w-1/2 md:flex-row">
            <Search onSearch={handleSearch} />
          </div>

          <Menu
            as="div"
            className="relative inline-block ltr:text-left rtl:text-right"
          >
            <Menu.Button className="group p-2">
              <MoreIcon className="w-3.5 text-body" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                as="ul"
                className={classNames(
                  'shadow-700 absolute z-50 mt-2 w-52 overflow-hidden rounded border border-border-200 bg-light py-2 focus:outline-none ltr:right-0 ltr:origin-top-right rtl:left-0 rtl:origin-top-left'
                )}
              >
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleExportOrder}
                      className={classNames(
                        'flex w-full items-center space-x-3 px-5 py-2.5 text-sm font-semibold capitalize transition duration-200 hover:text-accent focus:outline-none rtl:space-x-reverse',
                        active ? 'text-accent' : 'text-body'
                      )}
                    >
                      <DownloadIcon className="w-5 shrink-0" />
                      <span className="whitespace-nowrap">
                        {t('common:text-export-orders')}
                      </span>
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <Select
              options={orderStatusOptions}
              isClearable
              value={
                orderStatus
                  ? orderStatusOptions.find((o) => o.value === orderStatus) ??
                    null
                  : null
              }
              onChange={(option: any) => {
                const nextStatus = option?.value || undefined;
                setOrderStatus(nextStatus);
                setPage(1);
                updateUrlQuery({ order_status: nextStatus || undefined });
              }}
              placeholder={t('common:text-order-status')}
            />
          </div>

          <div className="md:col-span-3">
            <Select
              options={dateModeOptions}
              value={dateModeOptions.find((o) => o.value === dateMode)}
              onChange={(option: any) => {
                const nextMode = option?.value ?? 'range';
                setDateMode(nextMode);
                setPage(1);
                updateUrlQuery({ date_mode: nextMode });
              }}
            />
          </div>

          <div className="md:col-span-5">
            {dateMode === 'range' ? (
              <DatePicker
                selectsRange
                startDate={rangeDates[0]}
                endDate={rangeDates[1]}
                onChange={(update: any) => {
                  const next = update as [Date | null, Date | null];
                  setRangeDates(next);
                  setPage(1);
                  updateUrlQuery({
                    from: next[0]
                      ? dayjs(next[0]).format('YYYY-MM-DD')
                      : undefined,
                    to: next[1]
                      ? dayjs(next[1]).format('YYYY-MM-DD')
                      : undefined,
                  });
                }}
                isClearable
                placeholderText={`${t('common:text-date')} (${t(
                  'common:filter-date-range'
                )})`}
                className="w-full rounded border border-border-200 px-4 py-2 text-sm"
              />
            ) : (
              <DatePicker
                selected={singleDate}
                onChange={(date: any) => {
                  const next = date as Date | null;
                  setSingleDate(next);
                  setPage(1);
                  if (!next) {
                    updateUrlQuery({ from: undefined, to: undefined });
                    return;
                  }

                  if (dateMode === 'day') {
                    const d = dayjs(next).format('YYYY-MM-DD');
                    updateUrlQuery({ from: d, to: d });
                  }
                  if (dateMode === 'month') {
                    updateUrlQuery({
                      from: dayjs(next).startOf('month').format('YYYY-MM-DD'),
                      to: dayjs(next).endOf('month').format('YYYY-MM-DD'),
                    });
                  }
                  if (dateMode === 'year') {
                    updateUrlQuery({
                      from: dayjs(next).startOf('year').format('YYYY-MM-DD'),
                      to: dayjs(next).endOf('year').format('YYYY-MM-DD'),
                    });
                  }
                }}
                isClearable
                showMonthYearPicker={dateMode === 'month'}
                showYearPicker={dateMode === 'year'}
                dateFormat={
                  dateMode === 'year'
                    ? 'yyyy'
                    : dateMode === 'month'
                    ? 'MM/yyyy'
                    : 'dd/MM/yyyy'
                }
                placeholderText={`${t('common:text-date')} (${t(
                  dateMode === 'day'
                    ? 'common:filter-date-day'
                    : dateMode === 'month'
                    ? 'common:filter-date-month'
                    : 'common:filter-date-year'
                )})`}
                className="w-full rounded border border-border-200 px-4 py-2 text-sm"
              />
            )}
          </div>
        </div>
      </Card>

      <OrderList
        orders={orders}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
      />
    </>
  );
}

Orders.authenticate = {
  permissions: adminOnly,
};
Orders.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
