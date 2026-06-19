import Modal from '@components/common/modal/modal';
import Alert from '@components/ui/alert';
import Button from '@components/ui/button';
import Spinner from '@components/ui/loaders/spinner/spinner';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import client from '@framework/utils/index';
import { Order, PaymentIntentInfo, PaymentStatus } from '@type/index';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';

type SupportedVendorGateway = 'TARAMONEY' | 'CAMPAY';

interface Props {
  open: boolean;
  trackingNumber: string | null;
  paymentGateway: SupportedVendorGateway | null;
  paymentIntentInfo: PaymentIntentInfo | null;
  onClose: () => void;
  onSuccess: () => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  const responseMessage = (error as any)?.response?.data?.message;
  const firstError = (error as any)?.response?.data?.errors
    ? Object.values((error as any).response.data.errors)?.[0]
    : null;

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  if (Array.isArray(firstError) && firstError[0]) {
    return String(firstError[0]);
  }

  if (firstError) {
    return String(firstError);
  }

  return (error as any)?.message ?? fallback;
}

export default function VendorSubscriptionPaymentModal({
  open,
  trackingNumber,
  paymentGateway,
  paymentIntentInfo,
  onClose,
  onSuccess,
}: Props) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [didAutoConfirm, setDidAutoConfirm] = useState(false);

  const { data: order, isLoading } = useQuery<Order>(
    [API_ENDPOINTS.ORDER, trackingNumber, 'vendor-subscription-payment'],
    () => client.orders.findOne(trackingNumber as string),
    {
      enabled: open && Boolean(trackingNumber),
      refetchInterval: open && trackingNumber ? 3000 : false,
      retry: false,
    }
  );

  useEffect(() => {
    if (!open) {
      setElapsedMs(0);
      setDidAutoConfirm(false);
      return;
    }

    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [open, trackingNumber]);

  const effectivePaymentIntentInfo =
    order?.payment_intent?.payment_intent_info ?? paymentIntentInfo;

  const confirmMutation = useMutation(
    async () => {
      if (!trackingNumber || !paymentGateway) {
        throw new Error("Paiement d'abonnement introuvable.");
      }

      if (paymentGateway === 'TARAMONEY') {
        return client.vendorSubscriptions.confirmTaramoney(trackingNumber);
      }

      return client.vendorSubscriptions.confirmCampay(trackingNumber);
    },
    {
      onSuccess: () => {
        toast.success("L'abonnement vendeur a ete active.");
        onSuccess();
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(error, "Impossible de confirmer le paiement.")
        );
      },
    }
  );

  const raw = useMemo(() => {
    return effectivePaymentIntentInfo?.raw ?? {};
  }, [effectivePaymentIntentInfo]);

  const message =
    effectivePaymentIntentInfo?.message ||
    raw?.message ||
    effectivePaymentIntentInfo?.payment_message;

  const paymentLink =
    raw?.generallink || raw?.generalLink || raw?.general_link || null;

  const ussdCode = raw?.ussd || raw?.ussdCode || raw?.code || null;
  const rawStatus = String(raw?.status ?? '').toUpperCase();
  const vendor = raw?.vendor;
  const transactionId = raw?.transactionId || raw?.transactionID || null;
  const selectedNetwork = String(
    effectivePaymentIntentInfo?.taramoney?.input?.network ||
      effectivePaymentIntentInfo?.taramoney?.request?.network ||
      ''
  ).toLowerCase();

  const operatorLabel =
    String(vendor || '').toUpperCase().includes('ORANGE') ||
    selectedNetwork.includes('orange')
      ? 'Orange Money'
      : String(vendor || '').toUpperCase().includes('MTN') ||
        selectedNetwork.includes('mtn')
      ? 'MTN Mobile Money'
      : String(vendor || '').toUpperCase().includes('WAVE') ||
        selectedNetwork.includes('wave')
      ? 'Wave'
      : String(vendor || '').toUpperCase().includes('PAYPAL') ||
        selectedNetwork.includes('paypal')
      ? 'PayPal'
      : vendor
      ? String(vendor)
      : null;

  const displayMessage = ussdCode
    ? `Veuillez valider le paiement${
        operatorLabel ? ` via ${operatorLabel}` : ' sur votre telephone'
      }. Si aucune fenetre n'apparait, composez ${String(
        ussdCode
      )} pour finaliser le paiement.`
    : paymentLink
    ? `Veuillez ouvrir le lien pour finaliser le paiement${
        operatorLabel ? ` (${operatorLabel})` : ''
      }.`
    : typeof message === 'string' && message.trim()
    ? message
    : 'Finalisez le paiement depuis votre telephone pour activer le plan.';

  const isTaramoneyReady =
    paymentGateway === 'TARAMONEY' &&
    rawStatus.includes('SUCCESS') &&
    order?.payment_status === PaymentStatus.PENDING;

  const isCampayReady =
    paymentGateway === 'CAMPAY' && Number(elapsedMs) >= 15000;

  const shouldAutoConfirm =
    open &&
    !didAutoConfirm &&
    !confirmMutation.isLoading &&
    Number(elapsedMs) >= 60000 &&
    (isTaramoneyReady || isCampayReady);

  useEffect(() => {
    if (!shouldAutoConfirm) {
      return;
    }

    setDidAutoConfirm(true);
    confirmMutation.mutate();
  }, [confirmMutation, shouldAutoConfirm]);

  const canClose =
    confirmMutation.isSuccess ||
    order?.payment_status === PaymentStatus.FAILED ||
    Number(elapsedMs) >= 15000;

  return (
    <Modal
      open={open}
      onClose={onClose}
      canClose={canClose}
      showCloseButton={canClose}
    >
      <div className="w-screen max-w-md rounded-xl bg-white p-6 md:p-8">
        <div className="mb-3 text-base font-semibold text-heading">
          Paiement abonnement en attente
        </div>

        {!trackingNumber ? (
          <Alert
            variant="errorOutline"
            message="Aucun suivi de paiement n'est disponible."
          />
        ) : (
          <>
            <div className="space-y-2 text-sm text-body">
              <p>{displayMessage}</p>
              <p className="text-xs text-gray-600">
                Reference: {trackingNumber}
              </p>
              {transactionId ? (
                <p className="text-xs text-gray-600">
                  Transaction: {String(transactionId)}
                </p>
              ) : null}
            </div>

            {paymentLink ? (
              <div className="mt-4">
                <Button
                  variant="custom"
                  className="w-full bg-accent px-4 py-3 text-white hover:bg-accent-hover"
                  onClick={() =>
                    window.open(
                      String(paymentLink),
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  Ouvrir le lien de paiement
                </Button>
              </div>
            ) : null}

            {confirmMutation.isError ? (
              <Alert
                variant="errorOutline"
                className="mt-4"
                message={getErrorMessage(
                  confirmMutation.error,
                  'Impossible de confirmer le paiement.'
                )}
              />
            ) : null}

            {order?.payment_status === PaymentStatus.FAILED ? (
              <Alert
                variant="errorOutline"
                className="mt-4"
                message="Le paiement a echoue. Vous pouvez fermer cette fenetre et relancer le checkout."
              />
            ) : null}

            {paymentGateway === 'TARAMONEY' &&
            !isTaramoneyReady &&
            Number(elapsedMs) >= 15000 ? (
              <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs text-gray-700">
                Si vous avez deja valide sur le telephone mais que le statut tarde
                a remonter, patientez quelques secondes puis essayez de confirmer.
              </div>
            ) : null}

            <div className="mt-5">
              {isLoading && !effectivePaymentIntentInfo ? (
                <div className="py-4">
                  <Spinner showText={false} />
                </div>
              ) : (
                <Spinner showText={false} />
              )}
            </div>

            {(isTaramoneyReady || isCampayReady) &&
            order?.payment_status !== PaymentStatus.FAILED ? (
              <div className="mt-6">
                <Button
                  loading={confirmMutation.isLoading}
                  disabled={confirmMutation.isLoading}
                  variant="custom"
                  className="w-full bg-green-600 px-5 py-3 text-white hover:bg-green-700"
                  onClick={() => confirmMutation.mutate()}
                >
                  Confirmer le paiement
                </Button>
              </div>
            ) : null}

            {canClose ? (
              <div className="mt-4">
                <Button
                  variant="custom"
                  className="w-full bg-gray-900 px-5 py-3 text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  Retour au checkout
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  );
}
