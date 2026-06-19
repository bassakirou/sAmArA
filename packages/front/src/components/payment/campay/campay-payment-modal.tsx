import Spinner from '@components/ui/loaders/spinner/spinner';
import Button from '@components/ui/button';
import { useUI } from '@contexts/ui.context';
import { useOrder } from '@framework/orders';
import { HttpClient } from '@framework/utils/request';
import { ROUTES } from '@lib/routes';
import { PaymentGateway, PaymentIntentInfo, PaymentStatus } from '@type/index';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

interface Props {
  paymentIntentInfo: PaymentIntentInfo;
  trackingNumber: string;
  paymentGateway: PaymentGateway;
}

const CampayPaymentModal: React.FC<Props> = ({
  trackingNumber,
  paymentIntentInfo,
}) => {
  const { t } = useTranslation('common');
  const { closeModal } = useUI();
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [didAutoConfirm, setDidAutoConfirm] = useState(false);
  const {
    data: order,
    isLoading,
    refetch,
  } = useOrder({
    tracking_number: trackingNumber,
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refetch();
    }, 3000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [refetch]);

  useEffect(() => {
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!order?.payment_status) return;
    if (order.payment_status === PaymentStatus.SUCCESS) {
      toast.success(t('payment-successful'));
      closeModal();
      return;
    }
    if (order.payment_status === PaymentStatus.FAILED) {
      toast.error(t('payment-failed'));
      closeModal();
    }
  }, [closeModal, order?.payment_status, t]);

  if (isLoading) {
    return (
      <div className="h-80 w-screen max-w-md rounded-xl bg-white p-12">
        <Spinner className="!h-full" showText={false} />
      </div>
    );
  }

  const effectivePaymentIntentInfo =
    order?.payment_intent?.payment_intent_info ?? paymentIntentInfo;

  const message =
    effectivePaymentIntentInfo?.message ||
    effectivePaymentIntentInfo?.raw?.message ||
    effectivePaymentIntentInfo?.payment_message;
  const ussdCode =
    effectivePaymentIntentInfo?.raw?.ussd ||
    effectivePaymentIntentInfo?.campay?.ussd_code ||
    effectivePaymentIntentInfo?.campay?.ussdCode;
  const vendor =
    effectivePaymentIntentInfo?.raw?.vendor ||
    effectivePaymentIntentInfo?.campay?.operator;

  const displayMessage = ussdCode
    ? `Veuillez valider le paiement${
        vendor ? ` via ${String(vendor)}` : ' sur votre téléphone'
      }. Si aucune fenêtre n’apparaît, composez ${String(
        ussdCode
      )} pour finaliser le paiement.`
    : typeof message === 'string'
    ? message
    : t('text-payment-order');

  const canConfirm =
    order?.payment_status === PaymentStatus.PENDING &&
    Number(elapsedMs) >= 15000;

  const shouldAutoConfirm =
    order?.payment_status === PaymentStatus.PENDING &&
    !didAutoConfirm &&
    Number(elapsedMs) >= 60000;

  useEffect(() => {
    if (!shouldAutoConfirm) return;
    setDidAutoConfirm(true);
    (async () => {
      try {
        setIsConfirming(true);
        await HttpClient.post(
          `orders/${encodeURIComponent(trackingNumber)}/confirm-campay`,
          {}
        );
        toast.success('Paiement confirmé');
        await refetch();
        closeModal();
        router.push(
          `${ROUTES.ACCOUNT_ORDERS}/${encodeURIComponent(trackingNumber)}`
        );
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Erreur de confirmation';
        toast.error(message);
      } finally {
        setIsConfirming(false);
      }
    })();
  }, [closeModal, didAutoConfirm, refetch, router, shouldAutoConfirm, trackingNumber]);

  return (
    <div className="w-screen max-w-md rounded-xl bg-white p-6 md:p-8">
      <div className="mb-3 text-base font-semibold text-heading">
        {t('payment-pending')}
      </div>
      <div className="text-sm text-body">{displayMessage}</div>
      {canConfirm ? (
        <div className="mt-4 space-y-2 rounded-md bg-gray-50 p-3 text-xs text-gray-700">
          <div>
            Si vous avez déjà validé le paiement sur le téléphone, vous pouvez
            confirmer.
          </div>
          <Button
            loading={isConfirming}
            variant="custom"
            className="w-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
            onClick={async () => {
              try {
                setIsConfirming(true);
                await HttpClient.post(
                  `orders/${encodeURIComponent(trackingNumber)}/confirm-campay`,
                  {}
                );
                toast.success('Paiement confirmé');
                await refetch();
                closeModal();
                router.push(
                  `${ROUTES.ACCOUNT_ORDERS}/${encodeURIComponent(
                    trackingNumber
                  )}`
                );
              } catch (error: any) {
                const message =
                  error?.response?.data?.message ||
                  error?.message ||
                  'Erreur de confirmation';
                toast.error(message);
              } finally {
                setIsConfirming(false);
              }
            }}
          >
            Confirmer le paiement
          </Button>
        </div>
      ) : null}
      <div className="mt-5">
        <Button
          loading={isLeaving}
          onClick={async () => {
            try {
              setIsLeaving(true);
              closeModal();
              await router.push(
                `${ROUTES.ORDERS}/${encodeURIComponent(trackingNumber)}`
              );
            } finally {
              setIsLeaving(false);
            }
          }}
          className="w-full"
        >
          Voir la commande
        </Button>
      </div>
    </div>
  );
};

export default CampayPaymentModal;
