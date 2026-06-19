import Card from '@/components/common/card';
import AppLayout from '@/components/layouts/app';
import ErrorMessage from '@/components/ui/error-message';
import { Routes } from '@/config/routes';
import { HttpClient } from '@/data/client/http-client';
import {
  useConfirmVendorSubscriptionCampayMutation,
  useConfirmVendorSubscriptionTaramoneyMutation,
} from '@/data/vendor-subscription';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export default function SubscriptionPaymentPage() {
  const router = useRouter();
  const tracking =
    typeof router.query.tracking === 'string' ? router.query.tracking : '';

  const [paymentGateway, setPaymentGateway] = useState<string>('');
  const hasAutoConfirmedRef = useRef(false);

  useEffect(() => {
    if (!tracking) return;
    let cancelled = false;
    HttpClient.get<any>(`orders/tracking-number/${encodeURIComponent(tracking)}`)
      .then((order) => {
        if (cancelled) return;
        setPaymentGateway(String(order?.payment_gateway ?? '').toUpperCase());
      })
      .catch(() => {
        if (cancelled) return;
        setPaymentGateway('');
      });
    return () => {
      cancelled = true;
    };
  }, [tracking]);

  const taramoneyMutation = useConfirmVendorSubscriptionTaramoneyMutation() as any;
  const campayMutation = useConfirmVendorSubscriptionCampayMutation() as any;

  const confirm =
    paymentGateway === 'CAMPAY' ? campayMutation.mutate : taramoneyMutation.mutate;
  const isLoading =
    paymentGateway === 'CAMPAY' ? campayMutation.isLoading : taramoneyMutation.isLoading;
  const error =
    paymentGateway === 'CAMPAY' ? campayMutation.error : taramoneyMutation.error;
  const data =
    paymentGateway === 'CAMPAY' ? campayMutation.data : taramoneyMutation.data;

  useEffect(() => {
    if (!tracking) return;
    if (hasAutoConfirmedRef.current) return;
    if (isLoading) return;
    hasAutoConfirmedRef.current = true;
    confirm(tracking, {
      onSuccess: () => {
        router.replace(Routes.subscriptions.list);
      },
      onError: () => {
        hasAutoConfirmedRef.current = false;
      },
    });
  }, [confirm, isLoading, router, tracking]);

  return (
    <Card>
      <h1 className="text-xl font-semibold text-heading">Paiement abonnement</h1>
      <p className="mt-2 text-sm text-body">
        Si le paiement a été effectué, confirmez pour activer l’abonnement.
      </p>

      {error ? (
        <div className="mt-4">
          <ErrorMessage message={error.message} />
        </div>
      ) : null}

      {data?.status === 'active' ? (
        <div className="mt-4">
          <p className="text-sm text-green-600">
            Abonnement activé. Redirection en cours…
          </p>
        </div>
      ) : null}

      <button
        type="button"
        disabled={!tracking || isLoading}
        onClick={() => {
          hasAutoConfirmedRef.current = true;
          confirm(tracking, {
            onSuccess: () => {
              router.replace(Routes.subscriptions.list);
            },
            onError: () => {
              hasAutoConfirmedRef.current = false;
            },
          });
        }}
        className="mt-5 rounded bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        Confirmer
      </button>
    </Card>
  );
}

SubscriptionPaymentPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
SubscriptionPaymentPage.Layout = AppLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
