import Alert from '@components/ui/alert';
import ButtonSamara from '@components/ui/button-samara';
import Spinner from '@components/ui/loaders/spinner/spinner';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import client from '@framework/utils/index';
import usePrice from '@lib/use-price';
import { SubscriptionPlan, VendorSubscriptionBillingPeriod } from '@type/index';
import cn from 'classnames';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';

const permissionLabels: Record<string, string> = {
  shop_publication: 'Publication de la boutique',
  product_publication: 'Publication de produits',
  chat_negotiation: 'Acces au chat de negociation de prix',
  whatsapp_notifications: 'Notifications WhatsApp (vendeur)',
  platform_commission: 'Commission plateforme',
};

const permissionOrder = [
  'shop_publication',
  'product_publication',
  'chat_negotiation',
  'whatsapp_notifications',
  'platform_commission',
];

const planThemes = [
  {
    cardBorder: 'border-[#f1dcc0]',
    topBackground: 'from-[#fff5e8] via-[#fff9f2] to-white',
    glow: 'bg-[#f8ddb5]',
    buttonClassName:
      'bg-white text-heading border border-gray-200 hover:bg-gray-50 hover:text-heading',
  },
  {
    cardBorder: 'border-[#cfd5ff]',
    topBackground: 'from-[#eef1ff] via-[#f7f8ff] to-white',
    glow: 'bg-[#cfd5ff]',
    buttonClassName:
      'bg-[#6f82eb] text-white hover:bg-[#5f73df] hover:text-white',
  },
  {
    cardBorder: 'border-[#cfe8e3]',
    topBackground: 'from-[#edf9f6] via-[#f7fcfb] to-white',
    glow: 'bg-[#cfe8e3]',
    buttonClassName:
      'bg-white text-heading border border-gray-200 hover:bg-gray-50 hover:text-heading',
  },
];

function resolvePlanTheme(index: number) {
  return planThemes[index % planThemes.length];
}

function getPlanFeatures(plan: SubscriptionPlan) {
  const permissions = Array.isArray(plan.permissions) ? plan.permissions : [];
  const hasAllPermissions = permissions.includes('all');

  const basePermissions = hasAllPermissions
    ? permissionOrder
    : Array.from(
        new Set([
          ...permissionOrder.filter((permission) =>
            permissions.includes(permission)
          ),
          ...permissions.filter(
            (permission) =>
              permission !== 'all' && !permissionOrder.includes(permission)
          ),
        ])
      );

  return basePermissions.map((permission) => {
    if (
      permission === 'platform_commission' &&
      typeof plan.platform_commission_rate === 'number'
    ) {
      return `Commission plateforme (${plan.platform_commission_rate}%)`;
    }

    return permissionLabels[permission] ?? permission.replace(/_/g, ' ');
  });
}

function PlanCard({
  plan,
  billingPeriod,
  onSelect,
  isSubmitting,
  themeIndex,
}: {
  plan: SubscriptionPlan;
  billingPeriod: VendorSubscriptionBillingPeriod;
  onSelect: (plan: SubscriptionPlan) => void;
  isSubmitting: boolean;
  themeIndex: number;
}) {
  const theme = resolvePlanTheme(themeIndex);
  const monthlyAmount = Number(plan.monthly_price ?? 0);
  const annualMonthlyAmount = Number(plan.annual_monthly_prorata_price ?? 0);
  const annualAmount = annualMonthlyAmount * 12;
  const selectedAmount =
    billingPeriod === 'annual' ? annualAmount : monthlyAmount;
  const { price } = usePrice({ amount: selectedAmount });
  const { price: monthlyProrataPrice } = usePrice({
    amount: annualMonthlyAmount,
  });
  const features = useMemo(() => getPlanFeatures(plan), [plan]);

  return (
    <article
      className={cn(
        'flex w-full max-w-[340px] flex-col overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1',
        theme.cardBorder
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden border-b border-black/5 bg-gradient-to-b px-6 pb-6 pt-7',
          theme.topBackground
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-60 blur-2xl',
            theme.glow
          )}
        />
        <span
          aria-hidden="true"
          className="absolute left-6 top-4 h-2 w-2 rounded-full bg-white/70"
        />
        <span
          aria-hidden="true"
          className="absolute left-10 top-8 h-1.5 w-1.5 rounded-full bg-white/60"
        />

        <div className="relative">
          <h3 className="text-[30px] font-semibold leading-tight text-heading">
            {plan.name}
          </h3>
          {plan.description ? (
            <p className="mt-3 max-h-[112px] overflow-hidden text-sm leading-7 text-body">
              {plan.description}
            </p>
          ) : null}

          <div className="mt-6 rounded-2xl bg-white/85 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur">
            <div className="text-sm font-medium text-body">
              {billingPeriod === 'annual'
                ? 'Facturation annuelle'
                : 'Facturation mensuelle'}
            </div>
            <div className="mt-2 flex items-end gap-1 text-heading">
              <span className="text-[42px] font-semibold leading-none">
                {price}
              </span>
              <span className="pb-1 text-sm font-medium text-body">
                {billingPeriod === 'annual' ? '/an' : '/mo'}
              </span>
            </div>
            {billingPeriod === 'annual' ? (
              <div className="mt-3 text-sm text-body">
                Soit {monthlyProrataPrice} / mois
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <div className="mb-5 space-y-2 text-sm text-body">
          {typeof plan.max_products === 'number' ? (
            <div>
              <span className="font-semibold text-heading">Produits max:</span>{' '}
              {plan.max_products}
            </div>
          ) : null}
          {typeof plan.discount_percent === 'number' ? (
            <div>
              <span className="font-semibold text-heading">Remise:</span>{' '}
              {plan.discount_percent}%
            </div>
          ) : null}
        </div>

        <div className="mb-5 h-px bg-gray-200" />

        <ul className="mb-8 space-y-3 text-sm leading-6 text-body">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#19b486] text-xs font-bold text-white"
              >
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-auto">
          <ButtonSamara
            type="button"
            variant="normal"
            className="w-auto justify-center"
            onClick={() => onSelect(plan)}
            
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Choisir ce plan
          </ButtonSamara>
        </div>
      </div>
    </article>
  );
}

export default function SubscriptionPricingSection({
  onSelectPlan,
  isSubmitting,
}: {
  onSelectPlan: (
    plan: SubscriptionPlan,
    billingPeriod: VendorSubscriptionBillingPeriod
  ) => void;
  isSubmitting: boolean;
}) {
  const [billingPeriod, setBillingPeriod] =
    useState<VendorSubscriptionBillingPeriod>('monthly');
  const { data, isLoading, isError, error } = useQuery(
    [API_ENDPOINTS.SUBSCRIPTION_PLANS_ACTIVE],
    () => client.subscriptionPlans.active({ limit: 100 }),
    {
      staleTime: 60_000,
    }
  );

  const plans = (data?.data ?? []) as SubscriptionPlan[];

  return (
    <section aria-labelledby="seller-pricing-heading" className="mt-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="seller-pricing-heading"
          className="text-3xl font-semibold text-heading sm:text-4xl"
        >
          Choisissez votre abonnement vendeur
        </h2>
        <p className="mt-4 text-base leading-7 text-body">
          Comparez les plans actifs, consultez tous les acces inclus et
          continuez vers le checkout abonnement apres connexion.
        </p>

        <div className="mt-8 flex justify-center">
          <div
            className="inline-flex rounded-full border border-[#eadfcb] bg-black p-1 shadow-sm"
            role="tablist"
            aria-label="Choix de periode de facturation"
          >
            <button
              type="button"
              role="tab"
              aria-selected={billingPeriod === 'monthly'}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                billingPeriod === 'monthly'
                  ? 'bg-white text-heading shadow-sm'
                  : 'text-white'
              )}
              onClick={() => setBillingPeriod('monthly')}
            >
              Mensuel
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billingPeriod === 'annual'}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                billingPeriod === 'annual'
                  ? 'bg-white text-heading shadow-sm'
                  : 'text-white'
              )}
              onClick={() => setBillingPeriod('annual')}
            >
              Annuel
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner showText={false} />
        </div>
      ) : null}

      {isError ? (
        <Alert
          variant="errorOutline"
          message={
            error instanceof Error
              ? error.message
              : "Impossible de charger les plans d'abonnement."
          }
          className="mx-auto mt-8 max-w-5xl"
        />
      ) : null}

      {!isLoading && !isError ? (
        plans.length ? (
          <div className="mx-auto mt-12 max-w-[1120px]">
            <div className="flex flex-wrap justify-center gap-6">
              {plans.map((plan, index) => (
                <PlanCard
                  key={String(plan.id)}
                  plan={plan}
                  billingPeriod={billingPeriod}
            onSelect={(plan) => onSelectPlan(plan, billingPeriod)}
                  isSubmitting={isSubmitting}
                  themeIndex={index}
                />
              ))}
            </div>
          </div>
        ) : (
          <Alert
            variant="infoOutline"
            message="Aucun plan d'abonnement actif n'est disponible pour le moment."
            className="mx-auto mt-8 max-w-5xl"
          />
        )
      ) : null}
    </section>
  );
}
