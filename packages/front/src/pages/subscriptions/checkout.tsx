import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import axios from 'axios';
import { getLayout } from '@components/layout/layout';
import Alert from '@components/ui/alert';
import Button from '@components/ui/button';
import Container from '@components/ui/container';
import Input from '@components/ui/input';
import Link from '@components/ui/link';
import PageHeader from '@components/ui/page-header';
import Spinner from '@components/ui/loaders/spinner/spinner';
import VendorSubscriptionPaymentModal from '@components/subscriptions/vendor-subscription-payment-modal';
import { useUser } from '@framework/auth';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import client from '@framework/utils/index';
import { ROUTES } from '@lib/routes';
import {
  clearPendingSubscriptionCheckout,
  getSelectedSubscriptionPlan,
} from '@lib/subscription-plan-checkout';
import usePrice from '@lib/use-price';
import {
  PaymentIntentInfo,
  SubscriptionPlan,
  VendorSubscriptionBillingPeriod,
} from '@type/index';
import cn from 'classnames';
import { toast } from 'react-toastify';

type PaymentGatewayType = 'TARAMONEY' | 'CAMPAY';

type PaymentSession = {
  trackingNumber: string;
  paymentGateway: PaymentGatewayType;
  paymentIntentInfo: PaymentIntentInfo | null;
  open: boolean;
};

const billingOptions: Array<{
  value: VendorSubscriptionBillingPeriod;
  title: string;
  description: string;
}> = [
  {
    value: 'monthly',
    title: 'Paiement mensuel',
    description: 'Renouvellement chaque mois au tarif mensuel du plan.',
  },
  {
    value: 'annual',
    title: 'Paiement annuel',
    description: "Facturation annuelle sur la base du prix mensuel pro-rata.",
  },
];

const taramoneyChannels = [
  {
    value: 'orange_money',
    title: 'Orange Money',
    description: 'Paiement mobile Orange via Taramoney.',
  },
  {
    value: 'mtn_momo',
    title: 'MTN Mobile Money',
    description: 'Paiement mobile MTN via Taramoney.',
  },
  {
    value: 'wave',
    title: 'Wave',
    description: 'Paiement Wave si ce canal est actif dans la configuration.',
  },
  {
    value: 'paypal',
    title: 'PayPal',
    description: 'Paiement PayPal via Taramoney avec email requis.',
  },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    if (typeof error.response?.data?.message === 'string') {
      return error.response.data.message;
    }

    const firstError = error.response?.data?.errors
      ? Object.values(error.response.data.errors)?.[0]
      : null;

    if (Array.isArray(firstError) && firstError[0]) {
      return String(firstError[0]);
    }

    if (firstError) {
      return String(firstError);
    }
  }

  return (error as any)?.message ?? fallback;
}

function BillingOptionCard({
  checked,
  title,
  description,
  amount,
  onClick,
}: {
  checked: boolean;
  title: string;
  description: string;
  amount: number;
  onClick: () => void;
}) {
  const { price } = usePrice({ amount });

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-5 text-left transition',
        checked
          ? 'border-accent bg-accent/5 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
      aria-pressed={checked}
    >
      <div className="text-base font-semibold text-heading">{title}</div>
      <div className="mt-2 text-sm text-body">{description}</div>
      <div className="mt-4 text-2xl font-bold text-heading">{price}</div>
    </button>
  );
}

export default function SubscriptionCheckoutPage() {
  const { me, loading: userLoading } = useUser();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [billingPeriod, setBillingPeriod] =
    useState<VendorSubscriptionBillingPeriod>('monthly');
  const [paymentGateway, setPaymentGateway] =
    useState<PaymentGatewayType>('TARAMONEY');
  const [taramoneyNetwork, setTaramoneyNetwork] = useState('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(
    null
  );

  const { data: subscriptionSummary, refetch: refetchSubscriptionSummary } =
    useQuery(
      [API_ENDPOINTS.VENDOR_SUBSCRIPTIONS, 'me'],
      () => client.vendorSubscriptions.me(),
      {
        retry: false,
      }
    );

  useEffect(() => {
    setPlan(getSelectedSubscriptionPlan());
    clearPendingSubscriptionCheckout();
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (me?.profile?.contact && !phoneNumber) {
      setPhoneNumber(String(me.profile.contact));
    }
    if (me?.email && !email) {
      setEmail(String(me.email));
    }
  }, [email, me?.email, me?.profile?.contact, phoneNumber]);

  const monthlyAmount = Number(plan?.monthly_price ?? 0);
  const annualAmount = Number(plan?.annual_monthly_prorata_price ?? 0) * 12;
  const selectedAmount =
    billingPeriod === 'annual' ? annualAmount : monthlyAmount;
  const { price: selectedPrice } = usePrice({ amount: selectedAmount });
  const requiresPaypalEmail =
    paymentGateway === 'TARAMONEY' && taramoneyNetwork === 'paypal';

  const activeSubscriptionMessage = useMemo(() => {
    if (!subscriptionSummary?.active_subscription_plan) {
      return null;
    }

    const currentPlan = subscriptionSummary.active_subscription_plan.name;
    const period =
      subscriptionSummary.active_subscription_billing_period === 'annual'
        ? 'annuel'
        : 'mensuel';

    return `Abonnement actif: ${currentPlan} (${period}).`;
  }, [
    subscriptionSummary?.active_subscription_billing_period,
    subscriptionSummary?.active_subscription_plan,
  ]);

  const startSubscriptionMutation = useMutation(
    async () => {
      if (!plan) {
        throw new Error("Aucun plan d'abonnement selectionne.");
      }

      if (!phoneNumber.trim()) {
        throw new Error('Le numero de paiement est requis.');
      }

      if (requiresPaypalEmail && !email.trim()) {
        throw new Error("L'email est requis pour PayPal.");
      }

      const httpsReturnUrlBase =
        typeof window !== 'undefined' &&
        window.location.origin.startsWith('https://')
          ? `${window.location.origin}${ROUTES.SUBSCRIPTION_CHECKOUT}`
          : undefined;

      return client.vendorSubscriptions.start({
        subscription_plan_id: plan.id,
        billing_period: billingPeriod,
        payment_gateway: paymentGateway,
        ...(paymentGateway === 'TARAMONEY'
          ? {
              taramoney: {
                phone_number: phoneNumber.trim(),
                network: taramoneyNetwork,
                ...(requiresPaypalEmail ? { email: email.trim() } : {}),
                ...(httpsReturnUrlBase
                  ? { return_url_base: httpsReturnUrlBase }
                  : {}),
              },
            }
          : {
              campay: {
                phone_number: phoneNumber.trim(),
              },
            }),
      });
    },
    {
      onSuccess: (data) => {
        const trackingNumber =
          data?.subscription?.payment_tracking_number ??
          data?.payment_intent?.tracking_number;
        const paymentIntentInfo = data?.payment_intent?.payment_intent_info;

        if (!trackingNumber) {
          toast.error("La reference de paiement n'a pas ete retournee.");
          return;
        }

        if (paymentIntentInfo?.is_redirect && paymentIntentInfo?.redirect_url) {
          window.location.assign(String(paymentIntentInfo.redirect_url));
          return;
        }

        setPaymentSession({
          trackingNumber: String(trackingNumber),
          paymentGateway,
          paymentIntentInfo: paymentIntentInfo ?? null,
          open: true,
        });
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(
            error,
            "Impossible de lancer le paiement de l'abonnement."
          )
        );
      },
    }
  );

  const isSubmitDisabled =
    !plan ||
    userLoading ||
    !phoneNumber.trim() ||
    (paymentGateway === 'TARAMONEY' && !taramoneyNetwork) ||
    (requiresPaypalEmail && !email.trim()) ||
    startSubscriptionMutation.isLoading;

  return (
    <>
      <PageHeader pageHeader="Checkout abonnement vendeur" />
      <Container>
        <div className="mx-auto max-w-6xl py-12 lg:py-16">
          {!hasMounted ? (
            <div className="flex justify-center py-12">
              <Spinner showText={false} />
            </div>
          ) : !plan ? (
            <Alert
              variant="warningOutline"
              message="Aucun plan n'a ete selectionne. Retournez a la page vendeur pour choisir un abonnement."
            />
          ) : (
            <>
              {activeSubscriptionMessage ? (
                <Alert
                  variant="successOutline"
                  className="mb-6"
                  message={activeSubscriptionMessage}
                />
              ) : null}

              {paymentSession && !paymentSession.open ? (
                <Alert
                  variant="infoOutline"
                  className="mb-6"
                  message={`Paiement en cours pour la reference ${paymentSession.trackingNumber}.`}
                />
              ) : null}

              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-8">
                  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-heading">
                          {plan.name}
                        </h2>
                        <p className="mt-2 text-body">{plan.description}</p>
                      </div>
                      <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                        Niveau {plan.level}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {billingOptions.map((option) => (
                        <BillingOptionCard
                          key={option.value}
                          checked={billingPeriod === option.value}
                          title={option.title}
                          description={option.description}
                          amount={
                            option.value === 'annual'
                              ? annualAmount
                              : monthlyAmount
                          }
                          onClick={() => setBillingPeriod(option.value)}
                        />
                      ))}
                    </div>

                    <div className="mt-6 space-y-3 text-sm text-body">
                      {typeof plan.max_products === 'number' ? (
                        <div>
                          <span className="font-semibold text-heading">
                            Produits max:
                          </span>{' '}
                          {plan.max_products}
                        </div>
                      ) : null}
                      {typeof plan.platform_commission_rate === 'number' ? (
                        <div>
                          <span className="font-semibold text-heading">
                            Commission plateforme:
                          </span>{' '}
                          {plan.platform_commission_rate}%
                        </div>
                      ) : null}
                      {typeof plan.discount_percent === 'number' ? (
                        <div>
                          <span className="font-semibold text-heading">
                            Remise admin:
                          </span>{' '}
                          {plan.discount_percent}%
                        </div>
                      ) : null}
                    </div>
                  </section>

                  {Array.isArray(plan.permissions) && plan.permissions.length ? (
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-heading">
                        Fonctionnalites incluses
                      </h3>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                        {plan.permissions.map((permission) => (
                          <li
                            key={permission}
                            className="flex items-start gap-3 text-sm text-body"
                          >
                            <span
                              className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-green-500"
                              aria-hidden="true"
                            />
                            <span>{permission.replace(/_/g, ' ')}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-heading">
                    Finaliser le paiement
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-body">
                    Choisissez le mode de facturation, renseignez votre numero de
                    paiement puis lancez l'activation du plan.
                  </p>

                  <div className="mt-6 space-y-6">
                    <div>
                      <div className="mb-3 text-sm font-semibold text-heading">
                        Passerelle de paiement
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setPaymentGateway('TARAMONEY')}
                          className={cn(
                            'rounded-xl border p-4 text-left transition',
                            paymentGateway === 'TARAMONEY'
                              ? 'border-accent bg-accent/5'
                              : 'border-gray-200'
                          )}
                        >
                          <div className="font-semibold text-heading">
                            Taramoney
                          </div>
                          <div className="mt-1 text-sm text-body">
                            Orange Money, MTN Mobile Money, Wave ou PayPal.
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentGateway('CAMPAY')}
                          className={cn(
                            'rounded-xl border p-4 text-left transition',
                            paymentGateway === 'CAMPAY'
                              ? 'border-accent bg-accent/5'
                              : 'border-gray-200'
                          )}
                        >
                          <div className="font-semibold text-heading">
                            Campay
                          </div>
                          <div className="mt-1 text-sm text-body">
                            Paiement mobile OM ou MoMo avec suivi integre.
                          </div>
                        </button>
                      </div>
                    </div>

                    {paymentGateway === 'TARAMONEY' ? (
                      <div>
                        <div className="mb-3 text-sm font-semibold text-heading">
                          Canal de paiement
                        </div>
                        <div className="grid gap-3">
                          {taramoneyChannels.map((channel) => (
                            <button
                              key={channel.value}
                              type="button"
                              onClick={() => setTaramoneyNetwork(channel.value)}
                              className={cn(
                                'rounded-xl border p-4 text-left transition',
                                taramoneyNetwork === channel.value
                                  ? 'border-accent bg-accent/5'
                                  : 'border-gray-200'
                              )}
                            >
                              <div className="font-semibold text-heading">
                                {channel.title}
                              </div>
                              <div className="mt-1 text-sm text-body">
                                {channel.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <Input
                      name="subscription-payment-phone"
                      type="tel"
                      labelKey=""
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder="Numero de paiement"
                      className="block"
                      variant="outline"
                    />

                    {requiresPaypalEmail ? (
                      <Input
                        name="subscription-payment-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Adresse email PayPal"
                        className="block"
                        variant="outline"
                      />
                    ) : null}

                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="text-sm text-body">Montant a payer</div>
                      <div className="mt-1 text-3xl font-bold text-heading">
                        {selectedPrice}
                      </div>
                      <div className="mt-2 text-sm text-body">
                        Facturation{' '}
                        {billingPeriod === 'annual' ? 'annuelle' : 'mensuelle'}.
                      </div>
                    </div>

                    <Button
                      loading={startSubscriptionMutation.isLoading}
                      disabled={isSubmitDisabled}
                      className="w-full"
                      onClick={() => startSubscriptionMutation.mutate()}
                    >
                      Payer et activer ce plan
                    </Button>

                    {paymentSession && !paymentSession.open ? (
                      <Button
                        variant="custom"
                        className="w-full bg-gray-900 py-3 text-white hover:bg-gray-800"
                        onClick={() =>
                          setPaymentSession((current) =>
                            current ? { ...current, open: true } : current
                          )
                        }
                      >
                        Reprendre le suivi du paiement
                      </Button>
                    ) : null}
                  </div>
                </section>
              </div>
            </>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/devenir-vendeur"
              className="rounded border border-gray-300 px-5 py-3 font-semibold text-heading"
            >
              Retour aux abonnements vendeur
            </Link>
            <Link
              href={ROUTES.verifyEmail}
              className="rounded bg-accent px-5 py-3 font-semibold text-light"
            >
              Verifier mon email
            </Link>
          </div>
        </div>
      </Container>

      <VendorSubscriptionPaymentModal
        open={Boolean(paymentSession?.open)}
        trackingNumber={paymentSession?.trackingNumber ?? null}
        paymentGateway={paymentSession?.paymentGateway ?? null}
        paymentIntentInfo={paymentSession?.paymentIntentInfo ?? null}
        onClose={() =>
          setPaymentSession((current) =>
            current ? { ...current, open: false } : current
          )
        }
        onSuccess={() => {
          setPaymentSession(null);
          refetchSubscriptionSummary();
        }}
      />
    </>
  );
}

SubscriptionCheckoutPage.getLayout = getLayout;
SubscriptionCheckoutPage.authenticate = true;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'menu', 'forms', 'footer'])),
  },
});
