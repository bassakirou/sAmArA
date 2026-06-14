import { CartIconBig } from '@/components/icons/cart-icon-bag';
import { CoinIcon } from '@/components/icons/coin-icon';
import ColumnChart from '@/components/widgets/column-chart';
import StickerCard from '@/components/widgets/sticker-card';
import ErrorMessage from '@/components/ui/error-message';
import usePrice from '@/utils/use-price';
import Loader from '@/components/ui/loader/loader';
import RecentOrders from '@/components/order/recent-orders';
import PopularProductList from '@/components/product/popular-product-list';
import { useOrdersQuery } from '@/data/order';
import { useTranslation } from 'next-i18next';
import { useWithdrawsQuery } from '@/data/withdraw';
import WithdrawTable from '@/components/withdraw/withdraw-table';
import { ShopIcon } from '@/components/icons/sidebar';
import { DollarIcon } from '@/components/icons/shops/dollar';
import { useAnalyticsQuery, usePopularProductsQuery } from '@/data/dashboard';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { OrderStatus } from '@/types';
import AdvancedDateFilter, {
  type AdvancedDateFilterValue,
} from '@/components/dashboard/advanced-date-filter';

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale } = router;
  const [dateFilter, setDateFilter] = useState<AdvancedDateFilterValue>(() => {
    const now = dayjs();
    return {
      preset: 'this_month',
      startDate: now.startOf('month').toDate(),
      endDate: now.endOf('month').toDate(),
    };
  });

  const analyticsParams = useMemo(() => {
    const base: Record<string, unknown> = {
      year: dayjs(dateFilter.endDate ?? new Date()).year(),
    };

    if (dateFilter.preset === 'all_time') {
      return { ...base, all_time: true };
    }

    if (dateFilter.startDate) {
      base.from = dayjs(dateFilter.startDate).format('YYYY-MM-DD');
    }
    if (dateFilter.endDate) {
      base.to = dayjs(dateFilter.endDate).format('YYYY-MM-DD');
    }

    return base;
  }, [dateFilter.endDate, dateFilter.preset, dateFilter.startDate]);

  const {
    data,
    isLoading: loading,
    error: analyticsError,
  } = useAnalyticsQuery({
    ...analyticsParams,
  });
  const { price: total_revenue } = usePrice(
    data && {
      amount: data?.totalRevenue!,
    }
  );
  const { price: todays_revenue } = usePrice(
    data && {
      amount: data?.todaysRevenue!,
    }
  );
  const { price: subscription_revenue } = usePrice(
    data && {
      amount: data?.subscriptionRevenue ?? 0,
    }
  );
  const { price: gross_sales } = usePrice(
    data && {
      amount: data?.grossSales ?? 0,
    }
  );
  const { price: vendor_earnings } = usePrice(
    data && {
      amount: data?.vendorEarnings ?? 0,
    }
  );
  const { price: platform_commission } = usePrice(
    data && {
      amount: data?.platformCommission ?? 0,
    }
  );
  const { price: platform_gap } = usePrice(
    data && {
      amount: (data?.grossSales ?? 0) - (data?.vendorEarnings ?? 0),
    }
  );
  const {
    error: orderError,
    orders: orderData,
    loading: orderLoading,
    paginatorInfo,
  } = useOrdersQuery({
    language: locale,
    limit: 10,
    page: 1,
  });
  const {
    data: popularProductData,
    isLoading: popularProductLoading,
    error: popularProductError,
  } = usePopularProductsQuery({ limit: 10, language: locale });

  const { withdraws, loading: withdrawLoading } = useWithdrawsQuery({
    limit: 10,
  });

  if (loading || orderLoading || popularProductLoading || withdrawLoading) {
    return <Loader text={t('common:text-loading')} />;
  }
  if (analyticsError || orderError || popularProductError) {
    return (
      <ErrorMessage
        message={
          analyticsError?.message ||
          orderError?.message ||
          popularProductError?.message
        }
      />
    );
  }
  let salesByYear: number[] = Array.from({ length: 12 }, (_) => 0);
  if (!!data?.totalYearSaleByMonth?.length) {
    salesByYear = data.totalYearSaleByMonth.map((item: any) =>
      Number(Number(item.total).toFixed(2))
    );
  }
  let subscriptionSalesByYear: number[] = Array.from({ length: 12 }, (_) => 0);
  if (!!data?.subscriptionYearSaleByMonth?.length) {
    subscriptionSalesByYear = data.subscriptionYearSaleByMonth.map(
      (item: any) => Number(Number(item.total).toFixed(2))
    );
  }
  let commissionByYear: number[] = Array.from({ length: 12 }, (_) => 0);
  if (!!data?.totalYearCommissionByMonth?.length) {
    commissionByYear = data.totalYearCommissionByMonth.map((item: any) =>
      Number(Number(item.total).toFixed(2))
    );
  }

  const platformCards = [
    {
      key: 'pending',
      title: t('widgets:order-status-card-pending'),
      status: OrderStatus.PENDING,
      count: data?.ordersByStatus?.pending ?? 0,
      className: 'bg-yellow-50 text-yellow-900',
      badgeClassName: 'bg-yellow-200 text-yellow-900',
    },
    {
      key: 'processing',
      title: t('widgets:order-status-card-processing'),
      status: OrderStatus.PROCESSING,
      count: data?.ordersByStatus?.processing ?? 0,
      className: 'bg-blue-50 text-blue-900',
      badgeClassName: 'bg-blue-200 text-blue-900',
    },
    {
      key: 'at_local_facility',
      title: t('widgets:order-status-card-at-local-facility'),
      status: OrderStatus.AT_LOCAL_FACILITY,
      count: data?.ordersByStatus?.at_local_facility ?? 0,
      className: 'bg-purple-50 text-purple-900',
      badgeClassName: 'bg-purple-200 text-purple-900',
    },
    {
      key: 'out_for_delivery',
      title: t('widgets:order-status-card-out-for-delivery'),
      status: OrderStatus.OUT_FOR_DELIVERY,
      count: data?.ordersByStatus?.out_for_delivery ?? 0,
      className: 'bg-orange-50 text-orange-900',
      badgeClassName: 'bg-orange-200 text-orange-900',
    },
    {
      key: 'completed',
      title: t('widgets:order-status-card-completed'),
      status: OrderStatus.COMPLETED,
      count: data?.ordersByStatus?.completed ?? 0,
      className: 'bg-green-50 text-green-900',
      badgeClassName: 'bg-green-200 text-green-900',
    },
  ];

  return (
    <>
      <div className="mb-6 flex w-full justify-end">
        <AdvancedDateFilter
          value={dateFilter}
          onApply={setDateFilter}
          minDate={
            data?.availableRange?.from
              ? dayjs(data.availableRange.from).toDate()
              : undefined
          }
          maxDate={
            data?.availableRange?.to
              ? dayjs(data.availableRange.to).toDate()
              : undefined
          }
        />
      </div>

      <div className="mb-6 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <div className="w-full ">
          <button
            type="button"
            className="w-full text-left transition hover:opacity-90"
            onClick={() => router.push('/revenues')}
          >
            <StickerCard
              titleTransKey="sticker-card-title-rev"
              subtitleTransKey="sticker-card-subtitle-rev"
              icon={<DollarIcon className="h-7 w-7" color="#047857" />}
              iconBgStyle={{ backgroundColor: '#A7F3D0' }}
              price={total_revenue}
            />
          </button>
        </div>
        <div className="w-full ">
          <button
            type="button"
            className="w-full text-left transition hover:opacity-90"
            onClick={() => router.push('/subscription-plans/history')}
          >
            <StickerCard
              titleTransKey="sticker-card-title-subscription-rev"
              subtitleTransKey="sticker-card-subtitle-rev"
              icon={<CoinIcon />}
              iconBgStyle={{ backgroundColor: '#E0E7FF' }}
              price={subscription_revenue}
            />
          </button>
        </div>
        <div className="w-full ">
          <button
            type="button"
            className="w-full text-left transition hover:opacity-90"
            onClick={() => router.push('/orders')}
          >
            <StickerCard
              titleTransKey="sticker-card-title-order"
              subtitleTransKey="sticker-card-subtitle-order"
              icon={<CartIconBig />}
              price={data?.totalOrders}
            />
          </button>
        </div>
        <div className="w-full ">
          <StickerCard
            titleTransKey="sticker-card-title-today-rev"
            icon={<CoinIcon />}
            price={todays_revenue}
          />
        </div>
        <div className="w-full ">
          <button
            type="button"
            className="w-full text-left transition hover:opacity-90"
            onClick={() => router.push('/shops')}
          >
            <StickerCard
              titleTransKey="sticker-card-title-total-shops"
              icon={<ShopIcon className="w-6" color="#1D4ED8" />}
              iconBgStyle={{ backgroundColor: '#93C5FD' }}
              price={data?.totalShops}
            />
          </button>
        </div>
      </div>

      <div className="mb-6 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {platformCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() =>
              router.push({
                pathname: '/orders',
                query: { order_status: card.status },
              })
            }
            className={`flex h-full w-full flex-col rounded p-6 text-left transition hover:opacity-90 ${card.className}`}
          >
            <span className="text-sm font-semibold">{card.title}</span>
            <span className="mt-3 text-3xl font-semibold">{card.count}</span>
            <span
              className={`mt-4 inline-flex w-fit items-center rounded px-2 py-1 text-xs font-semibold ${card.badgeClassName}`}
            >
              {t('common:filter-by-order')}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-6 w-full rounded bg-light p-6">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-lg font-semibold text-heading">
            {t('widgets:platform-analytics-title')}
          </div>
        </div>

        <div className="mt-6 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded bg-gray-50 p-5">
            <div className="text-sm font-semibold text-body">
              {t('widgets:platform-card-gross-sales')}
            </div>
            <div className="mt-2 text-2xl font-semibold text-heading">
              {gross_sales}
            </div>
          </div>
          <div className="rounded bg-gray-50 p-5">
            <div className="text-sm font-semibold text-body">
              {t('widgets:platform-card-vendor-earnings')}
            </div>
            <div className="mt-2 text-2xl font-semibold text-heading">
              {vendor_earnings}
            </div>
          </div>
          <div className="rounded bg-gray-50 p-5">
            <div className="text-sm font-semibold text-body">
              {t('widgets:platform-card-commission')}
            </div>
            <div className="mt-2 text-2xl font-semibold text-heading">
              {platform_commission}
            </div>
          </div>
          <div className="rounded bg-gray-50 p-5">
            <div className="text-sm font-semibold text-body">
              {t('widgets:platform-card-gap')}
            </div>
            <div className="mt-2 text-2xl font-semibold text-heading">
              {platform_gap}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex w-full flex-wrap md:flex-nowrap">
        <ColumnChart
          widgetTitle={t('common:sale-history')}
          colors={['#03D3B5', '#6366F1']}
          series={[
            { name: t('widgets:sales-series-products'), data: salesByYear },
            {
              name: t('widgets:sales-series-subscriptions'),
              data: subscriptionSalesByYear,
            },
          ]}
          categories={[
            t('common:january'),
            t('common:february'),
            t('common:march'),
            t('common:april'),
            t('common:may'),
            t('common:june'),
            t('common:july'),
            t('common:august'),
            t('common:september'),
            t('common:october'),
            t('common:november'),
            t('common:december'),
          ]}
        />
      </div>

      <div className="mb-6 flex w-full flex-wrap md:flex-nowrap">
        <ColumnChart
          widgetTitle={t('widgets:platform-commission-history')}
          colors={['#F59E0B']}
          series={commissionByYear}
          categories={[
            t('common:january'),
            t('common:february'),
            t('common:march'),
            t('common:april'),
            t('common:may'),
            t('common:june'),
            t('common:july'),
            t('common:august'),
            t('common:september'),
            t('common:october'),
            t('common:november'),
            t('common:december'),
          ]}
        />
      </div>

      <div className="mb-6 flex w-full flex-wrap space-y-6 rtl:space-x-reverse xl:flex-nowrap xl:space-y-0 xl:space-x-5">
        <div className="w-full xl:w-1/2">
          <RecentOrders
            orders={orderData}
            title={t('table:recent-order-table-title')}
          />
        </div>

        <div className="w-full xl:w-1/2">
          <WithdrawTable
            withdraws={withdraws}
            title={t('table:withdraw-table-title')}
          />
        </div>
      </div>
      <div className="mb-6 w-full xl:mb-0">
        <PopularProductList
          products={popularProductData}
          title={t('table:popular-products-table-title')}
        />
      </div>
    </>
  );
}
