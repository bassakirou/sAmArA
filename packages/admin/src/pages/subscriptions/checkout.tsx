import Card from '@/components/common/card';
import TaramoneySubscriptionPaymentModal from '@/components/subscription/taramoney-subscription-payment-modal';
import TaramoneySubscriptionPhoneModal from '@/components/subscription/taramoney-subscription-phone-modal';
import AppLayout from '@/components/layouts/app';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useSettings } from '@/contexts/settings.context';
import { useActiveSubscriptionPlansQuery } from '@/data/subscription-plan';
import { useStartVendorSubscriptionMutation } from '@/data/vendor-subscription';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import cn from 'classnames';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type BillingPeriod = 'monthly' | 'annual';

export default function VendorSubscriptionCheckoutPage() {
  const router = useRouter();
  const settings = useSettings();
  const plansQuery = useActiveSubscriptionPlansQuery();
  const { mutate: startSubscription, isLoading: starting } =
    useStartVendorSubscriptionMutation();

  const planId = typeof router.query.plan === 'string' ? router.query.plan : '';
  const billingPeriod = (
    router.query.period === 'annual' ? 'annual' : 'monthly'
  ) as BillingPeriod;
  const trackingFromQuery =
    typeof router.query.tracking === 'string' ? router.query.tracking : '';
  const shopParam =
    typeof router.query.shop === 'string' ? router.query.shop : null;

  const selectedPlan = useMemo(() => {
    const id = Number(planId);
    return (
      (plansQuery.plans ?? []).find((p: any) => Number(p?.id) === id) ?? null
    );
  }, [planId, plansQuery.plans]);

  const availableGateways = useMemo(() => {
    const rawList = Array.isArray(settings?.paymentGateway)
      ? settings?.paymentGateway
      : [];
    const names = rawList
      .map((g: any) => (typeof g === 'string' ? g : g?.name))
      .filter(Boolean)
      .map((n: any) => String(n).toUpperCase());
    return names.length ? names : ['TARAMONEY'];
  }, [settings?.paymentGateway]);

  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [taramoneyNetwork, setTaramoneyNetwork] = useState<
    'orange_money' | 'mtn_momo'
  >('orange_money');
  const [taramoneyPhone, setTaramoneyPhone] = useState('');

  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTracking, setPaymentTracking] = useState('');
  const [paymentIntentInfo, setPaymentIntentInfo] = useState<any>(null);

  useEffect(() => {
    if (!selectedGateway && availableGateways.length) {
      setSelectedGateway(
        availableGateways.includes('TARAMONEY')
          ? 'TARAMONEY'
          : availableGateways[0]
      );
    }
  }, [availableGateways, selectedGateway]);

  useEffect(() => {
    if (!trackingFromQuery) return;
    setPaymentTracking(trackingFromQuery);
    setPaymentModalOpen(true);
  }, [trackingFromQuery]);

  const dueToday = useMemo(() => {
    if (!selectedPlan) return 0;
    const monthly = Number(selectedPlan.monthly_price ?? 0);
    const annualMonthly = Number(
      selectedPlan.annual_monthly_prorata_price ?? 0
    );
    return billingPeriod === 'annual' ? annualMonthly * 12 : monthly;
  }, [billingPeriod, selectedPlan]);

  const perMonth = useMemo(() => {
    if (!selectedPlan) return 0;
    return billingPeriod === 'annual'
      ? Number(selectedPlan.annual_monthly_prorata_price ?? 0)
      : Number(selectedPlan.monthly_price ?? 0);
  }, [billingPeriod, selectedPlan]);

  if (plansQuery.loading) {
    return <Loader text="Chargement…" />;
  }
  if (plansQuery.error)
    return <ErrorMessage message={plansQuery.error.message} />;
  if (!selectedPlan) {
    return (
      <ErrorMessage message="Plan introuvable. Retournez à la liste des abonnements et réessayez." />
    );
  }

  const checkoutPath = shopParam
    ? `/${shopParam}/subscriptions/checkout`
    : '/subscriptions/checkout';

  return (
    <>
      <TaramoneySubscriptionPhoneModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        network={taramoneyNetwork}
        defaultPhoneNumber={taramoneyPhone}
        loading={starting}
        onSubmit={(phoneNumber) => {
          setTaramoneyPhone(phoneNumber);
          const origin =
            typeof window !== 'undefined' ? window.location.origin : '';
          const returnUrlBase =
            origin && origin.startsWith('https://')
              ? `${origin}${checkoutPath}`
              : undefined;
          const restApiEndpoint =
            process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? '';
          const webhookUrl =
            restApiEndpoint && restApiEndpoint.startsWith('https://')
              ? `${restApiEndpoint.replace(
                  /\/$/,
                  ''
                )}/webhooks/${selectedGateway.toLowerCase()}`
              : undefined;

          startSubscription(
            {
              subscription_plan_id: selectedPlan.id,
              billing_period: billingPeriod,
              payment_gateway: selectedGateway,
              ...(selectedGateway === 'CAMPAY'
                ? {
                    campay: {
                      network: taramoneyNetwork,
                      phone_number: phoneNumber,
                      return_url_base: returnUrlBase,
                      webhook_url: webhookUrl,
                    },
                  }
                : {
                    taramoney: {
                      network: taramoneyNetwork,
                      phone_number: phoneNumber,
                      return_url_base: returnUrlBase,
                      webhook_url: webhookUrl,
                    },
                  }),
            },
            {
              onSuccess: (res: any) => {
                const tracking =
                  res?.subscription?.payment_tracking_number ||
                  res?.payment_intent?.tracking_number ||
                  '';
                setPaymentTracking(tracking);
                setPaymentIntentInfo(
                  res?.payment_intent?.payment_intent_info ?? null
                );
                if (tracking) {
                  router.replace({
                    pathname: checkoutPath,
                    query: {
                      plan: selectedPlan.id,
                      period: billingPeriod,
                      tracking,
                    },
                  });
                }
                setPhoneModalOpen(false);
                setPaymentModalOpen(true);
              },
              onError: (error: any) => {
                const message =
                  error?.response?.data?.message ||
                  error?.response?.data?.error ||
                  error?.message ||
                  'Impossible de démarrer le paiement.';
                toast.error(String(message));
              },
            }
          );
        }}
      />
      <TaramoneySubscriptionPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        tracking={paymentTracking}
        initialPaymentIntentInfo={paymentIntentInfo}
        onActivated={() => {
          const next = shopParam ? `/${shopParam}` : '/';
          router.replace(next);
        }}
      />

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-heading">Checkout</h1>
        <button
          type="button"
          className="rounded bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200"
          onClick={() =>
            router.push(
              shopParam ? `/${shopParam}/subscriptions` : '/subscriptions'
            )
          }
        >
          Retour
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Card className="mb-6">
            <div className="text-sm font-semibold text-heading">
              Plan choisi
            </div>
            <div className="mt-3 rounded border border-border-200 bg-white p-4">
              <div className="text-base font-semibold text-heading">
                {selectedPlan.name}
              </div>
              <div className="mt-1 text-sm text-body">
                {selectedPlan.description}
              </div>
              <div className="mt-4 text-2xl font-bold text-heading">
                {perMonth.toLocaleString()} XAF
                <span className="text-sm font-semibold text-gray-500">/mo</span>
              </div>
              {billingPeriod === 'annual' ? (
                <div className="mt-1 text-xs text-gray-500">
                  Facturé {dueToday.toLocaleString()} XAF / an
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold text-heading">
              Méthode de paiement
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {availableGateways.includes('TARAMONEY') && (
                <button
                  type="button"
                  onClick={() => setSelectedGateway('TARAMONEY')}
                  className={cn(
                    'flex h-16 items-center justify-center rounded border p-3 font-bold transition-colors',
                    selectedGateway === 'TARAMONEY'
                      ? 'border-accent bg-accent/5 text-heading'
                      : 'border-border-200 bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  Taramoney
                </button>
              )}
              {availableGateways.includes('CAMPAY') && (
                <button
                  type="button"
                  onClick={() => setSelectedGateway('CAMPAY')}
                  className={cn(
                    'flex h-16 items-center justify-center rounded border p-3 font-bold transition-colors',
                    selectedGateway === 'CAMPAY'
                      ? 'border-accent bg-accent/5 text-heading'
                      : 'border-border-200 bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  Campay
                </button>
              )}
            </div>

            {selectedGateway === 'TARAMONEY' || selectedGateway === 'CAMPAY' ? (
              <div className="mt-6">
                <div className="mb-2 text-sm font-semibold text-heading">
                  Réseau (OM/MoMo)
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setTaramoneyNetwork('orange_money')}
                    className={cn(
                      'rounded border px-4 py-3 text-sm font-semibold transition-colors',
                      taramoneyNetwork === 'orange_money'
                        ? 'border-accent bg-accent/5 text-heading'
                        : 'border-border-200 bg-white text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    Orange Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaramoneyNetwork('mtn_momo')}
                    className={cn(
                      'rounded border px-4 py-3 text-sm font-semibold transition-colors',
                      taramoneyNetwork === 'mtn_momo'
                        ? 'border-accent bg-accent/5 text-heading'
                        : 'border-border-200 bg-white text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    MTN Mobile Money
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-600">
                Ce moyen de paiement n’est pas encore disponible pour les
                abonnements.
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card>
            <div className="text-sm font-semibold text-heading">
              Récapitulatif
            </div>
            <div className="mt-4 space-y-3 text-sm text-body">
              <div className="flex items-center justify-between">
                <span>Période</span>
                <span className="font-semibold text-heading">
                  {billingPeriod === 'annual' ? 'Annuel' : 'Mensuel'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="text-lg font-bold text-heading">
                  {dueToday.toLocaleString()} XAF
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={starting || !(selectedGateway === 'TARAMONEY' || selectedGateway === 'CAMPAY')}
              className="mt-6 w-full rounded bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              onClick={() => {
                if (!(selectedGateway === 'TARAMONEY' || selectedGateway === 'CAMPAY')) {
                  toast.error('Moyen de paiement non disponible');
                  return;
                }
                setPhoneModalOpen(true);
              }}
            >
              Commander
            </button>
          </Card>
        </div>
      </div>
    </>
  );
}

VendorSubscriptionCheckoutPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
VendorSubscriptionCheckoutPage.Layout = AppLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
