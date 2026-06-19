import Card from '@/components/common/card';
import AppLayout from '@/components/layouts/app';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useActiveSubscriptionPlansQuery } from '@/data/subscription-plan';
import { useVendorSubscriptionStatusQuery } from '@/data/vendor-subscription';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { CheckMark } from '@/components/icons/checkmark';
import { resolveSubscriptionPlanPermissionLabels } from '@/components/subscription-plan/permissions';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

export default function VendorSubscriptionsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(
    'monthly'
  );

  const statusQuery = useVendorSubscriptionStatusQuery();
  const plansQuery = useActiveSubscriptionPlansQuery();

  const trialEndsAt = statusQuery.data?.trial_ends_at;
  const activePlan = statusQuery.data?.active_subscription_plan;
  const activeStartsAt = statusQuery.data?.active_subscription_starts_at;
  const activeEndsAt = statusQuery.data?.active_subscription_ends_at;
  const activeBillingPeriod =
    statusQuery.data?.active_subscription_billing_period;
  const hasActivePaid =
    !!activePlan && !!activeEndsAt && dayjs(activeEndsAt).isAfter(dayjs());
  const activeLevel = Number(activePlan?.level ?? NaN);

  const computedPlans = useMemo(() => {
    const next = (plansQuery.plans ?? []).map((plan: any) => {
      const monthly = Number(plan.monthly_price ?? 0);
      const annual = Number(plan.annual_monthly_prorata_price ?? 0) * 12;
      return { ...plan, _monthlyTotal: monthly, _annualTotal: annual };
    });
    next.sort((a: any, b: any) => {
      const la = Number(a?.level);
      const lb = Number(b?.level);
      const na = Number.isFinite(la) ? la : 999;
      const nb = Number.isFinite(lb) ? lb : 999;
      if (na !== nb) return na - nb;
      return Number(a?.id ?? 0) - Number(b?.id ?? 0);
    });
    return next;
  }, [plansQuery.plans]);

  if (statusQuery.isLoading || plansQuery.loading) {
    return <Loader text={t('common:text-loading')} />;
  }
  if (statusQuery.error)
    return <ErrorMessage message={statusQuery.error.message} />;
  if (plansQuery.error)
    return <ErrorMessage message={plansQuery.error.message} />;

  return (
    <>
      <Card className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-heading">Abonnements</h1>
          <div className="inline-flex rounded bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setBillingPeriod('annual')}
              className={cn(
                'rounded px-3 py-1 text-xs font-semibold transition-colors',
                billingPeriod === 'annual'
                  ? 'bg-accent text-white'
                  : 'text-gray-700 hover:bg-white'
              )}
            >
              Annuel
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'rounded px-3 py-1 text-xs font-semibold transition-colors',
                billingPeriod === 'monthly'
                  ? 'bg-accent text-white'
                  : 'text-gray-700 hover:bg-white'
              )}
            >
              Mensuel
            </button>
          </div>
        </div>
        {trialEndsAt ? (
          <p className="mt-2 text-sm text-body">
            Période d’essai jusqu’au{' '}
            {new Date(trialEndsAt).toLocaleDateString()}.
          </p>
        ) : null}
        {activePlan ? (
          <div className="mt-2 text-sm text-body">
            <div>
              Abonnement actif :{' '}
              <span className="font-semibold">{activePlan?.name}</span>
            </div>
            {hasActivePaid && activeBillingPeriod ? (
              <div className="mt-1 text-xs text-gray-600">
                Période :{' '}
                {activeBillingPeriod === 'annual' ? 'Annuel' : 'Mensuel'}
              </div>
            ) : null}
            {hasActivePaid && activeStartsAt ? (
              <div className="mt-1 text-xs text-gray-600">
                Démarré le {dayjs(activeStartsAt).format('DD/MM/YYYY')}
              </div>
            ) : null}
            {hasActivePaid && activeEndsAt ? (
              <div className="mt-1 text-xs text-gray-600">
                Valable jusqu’au {dayjs(activeEndsAt).format('DD/MM/YYYY')}
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {computedPlans.map((plan: any) => {
          const perMonth =
            billingPeriod === 'annual'
              ? Number(plan.annual_monthly_prorata_price ?? 0)
              : Number(plan.monthly_price ?? 0);
          const dueToday =
            billingPeriod === 'annual' ? plan._annualTotal : plan._monthlyTotal;
          const shopParam =
            typeof router.query.shop === 'string' ? router.query.shop : null;
          const checkoutPath = shopParam
            ? `/${shopParam}/subscriptions/checkout`
            : '/subscriptions/checkout';
          const planLevel = Number(plan?.level);
          const normalizedPlanLevel = Number.isFinite(planLevel)
            ? planLevel
            : 999;
          const normalizedActiveLevel = Number.isFinite(activeLevel)
            ? activeLevel
            : 999;
          const isActivePlan =
            hasActivePaid &&
            !!activePlan &&
            String(activePlan?.id) === String(plan?.id);
          const isUpgrade =
            hasActivePaid &&
            !isActivePlan &&
            normalizedPlanLevel > normalizedActiveLevel;
          const isDowngrade =
            hasActivePaid &&
            !isActivePlan &&
            normalizedPlanLevel < normalizedActiveLevel;
          const ctaDisabled = isActivePlan || isDowngrade;
          const ctaLabel = isActivePlan
            ? 'Renouveler'
            : isUpgrade
            ? 'Upgrade'
            : isDowngrade
            ? 'Downgrade'
            : 'Payer';

          return (
            <div
              key={plan.id}
              className={cn(
                'rounded border p-5 shadow-sm transition-colors',
                isActivePlan
                  ? 'border-border-200 bg-gray-50 opacity-80'
                  : 'border-border-200 bg-white'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-lg font-semibold text-heading">
                  {plan.name}
                </div>
                {isActivePlan ? (
                  <span className="rounded bg-accent px-2 py-1 text-xs font-semibold text-white">
                    Actif
                  </span>
                ) : null}
              </div>
              <div className="mt-2 text-sm text-body">{plan.description}</div>
              <div className="mt-4 text-2xl font-bold text-heading">
                {perMonth.toLocaleString()} XAF
                <span className="text-sm font-semibold text-gray-500">/mo</span>
              </div>
              {billingPeriod === 'annual' ? (
                <div className="mt-1 text-xs text-gray-500">
                  Facturé {dueToday.toLocaleString()} XAF / an
                </div>
              ) : null}
              {(() => {
                const labels = resolveSubscriptionPlanPermissionLabels(
                  plan.permissions,
                  { platformCommissionRate: plan.platform_commission_rate }
                );
                if (!labels.length) return null;
                return (
                  <ul className="mt-4 space-y-2">
                    {labels.map((label) => (
                      <li key={label} className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-status-complete">
                          <CheckMark className="h-3 w-3 text-white" />
                        </span>
                        <span className="text-sm text-body">{label}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
              <button
                type="button"
                disabled={ctaDisabled}
                className={cn(
                  'mt-5 w-full rounded px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60',
                  ctaDisabled
                    ? 'bg-gray-400'
                    : 'bg-accent hover:bg-accent-hover'
                )}
                onClick={() => {
                  if (ctaDisabled) return;
                  router.push({
                    pathname: checkoutPath,
                    query: { plan: plan.id, period: billingPeriod },
                  });
                }}
              >
                {ctaLabel}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

VendorSubscriptionsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
VendorSubscriptionsPage.Layout = AppLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
