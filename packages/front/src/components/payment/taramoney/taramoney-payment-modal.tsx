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

const TaramoneyPaymentModal: React.FC<Props> = ({
  trackingNumber,
  paymentIntentInfo,
}) => {
  const { t } = useTranslation('common');
  const { closeModal } = useUI();
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
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
  const paymentLink =
    effectivePaymentIntentInfo?.raw?.generallink ||
    effectivePaymentIntentInfo?.raw?.generalLink ||
    effectivePaymentIntentInfo?.raw?.general_link;
  const ussdCode =
    effectivePaymentIntentInfo?.raw?.ussd ||
    effectivePaymentIntentInfo?.raw?.ussdCode ||
    effectivePaymentIntentInfo?.raw?.code;
  const rawStatus = effectivePaymentIntentInfo?.raw?.status;
  const transactionId =
    effectivePaymentIntentInfo?.raw?.transactionId ||
    effectivePaymentIntentInfo?.raw?.transactionID;
  const vendor = effectivePaymentIntentInfo?.raw?.vendor;
  const selectedNetwork = String(
    effectivePaymentIntentInfo?.taramoney?.input?.network ||
      effectivePaymentIntentInfo?.taramoney?.request?.network ||
      ''
  ).toLowerCase();
  const isOrangeMoney =
    String(vendor || '')
      .toUpperCase()
      .includes('ORANGE') || selectedNetwork.includes('orange');
  const isMtnMoney =
    String(vendor || '')
      .toUpperCase()
      .includes('MTN') || selectedNetwork.includes('mtn');
  const isWave =
    String(vendor || '')
      .toUpperCase()
      .includes('WAVE') || selectedNetwork.includes('wave');
  const isPaypal =
    String(vendor || '')
      .toUpperCase()
      .includes('PAYPAL') || selectedNetwork.includes('paypal');

  const operatorLabel = isOrangeMoney
    ? 'Orange Money'
    : isMtnMoney
    ? 'MTN Mobile Money'
    : isWave
    ? 'Wave'
    : isPaypal
    ? 'PayPal'
    : vendor
    ? String(vendor)
    : null;

  const displayMessage = ussdCode
    ? `Veuillez valider le paiement${
        operatorLabel ? ` via ${operatorLabel}` : ' sur votre téléphone'
      }. Si aucune fenêtre n’apparaît, composez ${ussdCode} pour finaliser le paiement.`
    : paymentLink
    ? `Veuillez ouvrir le lien pour finaliser le paiement${
        operatorLabel ? ` (${operatorLabel})` : ''
      }.`
    : typeof message === 'string' && message.startsWith('API_') && paymentLink
    ? paymentLink
    : message;

  const taraDebug = effectivePaymentIntentInfo?.taramoney;
  const taraEndpoint = taraDebug?.endpoint;
  const taraNetwork = taraDebug?.request?.network;
  const taraPhone = taraDebug?.request?.phoneNumber;
  const taraHttpStatus = taraDebug?.http?.status;
  const taraBaseUrl = taraDebug?.base_url;
  const taraAttempts = Array.isArray(taraDebug?.attempts)
    ? taraDebug?.attempts
    : [];
  // @ts-ignore
  const orderWebhooks = order?.payment_intent_info?.taramoney_webhooks;
  // @ts-ignore
  const intentWebhooks =
    order?.payment_intent?.payment_intent_info?.taramoney_webhooks;
  const webhooks =
    (Array.isArray(intentWebhooks) ? intentWebhooks : null) ||
    (Array.isArray(orderWebhooks) ? orderWebhooks : []);
  const webhookCount = Array.isArray(webhooks) ? webhooks.length : 0;
  const isAwaitingConfirmation =
    String(rawStatus || '').toUpperCase() === 'SUCCESS' &&
    order?.payment_status === PaymentStatus.PENDING;
  const canExit =
    isAwaitingConfirmation && (Number(elapsedMs) >= 15000 || webhookCount > 0);
  const shouldAutoConfirm =
    isAwaitingConfirmation &&
    !didAutoConfirm &&
    webhookCount === 0 &&
    Number(elapsedMs) >= 60000 &&
    Boolean(transactionId);
  const taraNormalized = taraDebug?.normalized;
  const taraInput = taraDebug?.input;

  const debugSnapshot = {
    trackingNumber,
    order: order
      ? {
          id: order.id,
          order_status: order.order_status,
          payment_status: order.payment_status,
        }
      : null,
    payment_intent_info: {
      message: effectivePaymentIntentInfo?.message,
      raw_message: effectivePaymentIntentInfo?.raw?.message,
      raw: effectivePaymentIntentInfo?.raw,
      payment_message: effectivePaymentIntentInfo?.payment_message,
    },
    derived: {
      displayMessage,
      rawStatus,
      transactionId,
      vendor,
      webhookCount,
      paymentLink,
      ussdCode,
      webhooks,
    },
    taramoney: {
      base_url: taraBaseUrl,
      input: taraInput,
      normalized: taraNormalized,
      request: taraDebug?.request,
      response: taraDebug?.response,
      attempts: taraAttempts,
    },
  };

  useEffect(() => {
    if (!shouldAutoConfirm) return;
    setDidAutoConfirm(true);
    (async () => {
      try {
        setIsConfirming(true);
        await HttpClient.post(
          `orders/${encodeURIComponent(trackingNumber)}/confirm-taramoney`,
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
  }, [closeModal, refetch, router, shouldAutoConfirm, trackingNumber]);

  return (
    <div className="w-screen max-w-md rounded-xl bg-white p-6 md:p-8">
      <div className="mb-3 text-base font-semibold text-heading">
        {t('payment-pending')}
      </div>
      <div className="text-sm text-body">
        {displayMessage ? displayMessage : t('text-payment-order')}
      </div>
      {isAwaitingConfirmation ? (
        <div className="mt-3 text-xs text-gray-600">
          <div>
            Validation effectuée&nbsp;: en attente de confirmation serveur.
          </div>
          {transactionId ? (
            <div>Transaction&nbsp;: {String(transactionId)}</div>
          ) : null}
          {vendor ? <div>Opérateur&nbsp;: {String(vendor)}</div> : null}
          <div>Webhooks reçus&nbsp;: {String(webhookCount)}</div>
          {webhookCount === 0 ? (
            <div className="mt-2">
              Si vous avez déjà validé
              {operatorLabel ? ` via ${operatorLabel}` : ' sur votre téléphone'}
              , vous pouvez confirmer le paiement.
            </div>
          ) : null}
        </div>
      ) : null}
      {taraDebug ? (
        <details className="mt-4 rounded-md bg-gray-50 p-3">
          <summary className="cursor-pointer select-none text-xs font-semibold text-gray-700">
            Détails techniques
          </summary>
          <div className="mt-3 space-y-2 text-xs text-gray-700">
            <div className="space-y-1">
              {taraBaseUrl ? (
                <div>base_url&nbsp;: {String(taraBaseUrl)}</div>
              ) : null}
              {taraEndpoint ? (
                <div>endpoint&nbsp;: {String(taraEndpoint)}</div>
              ) : null}
              {taraHttpStatus ? (
                <div>http_status&nbsp;: {String(taraHttpStatus)}</div>
              ) : null}
              {taraPhone ? <div>phone&nbsp;: {String(taraPhone)}</div> : null}
              {taraNetwork ? (
                <div>network&nbsp;: {String(taraNetwork)}</div>
              ) : null}
              {taraInput?.network ? (
                <div>input_network&nbsp;: {String(taraInput.network)}</div>
              ) : null}
              {taraNormalized?.network ? (
                <div>
                  normalized_network&nbsp;: {String(taraNormalized.network)}
                </div>
              ) : null}
            </div>

            {taraAttempts.length ? (
              <div className="rounded border border-gray-200 bg-white p-2">
                <div className="mb-2 text-[11px] font-semibold text-gray-800">
                  Tentatives ({taraAttempts.length})
                </div>
                <div className="space-y-2">
                  {taraAttempts.map((attempt: any, idx: number) => {
                    const respMessage =
                      attempt?.response?.message ||
                      attempt?.response?.raw?.message ||
                      attempt?.response?.raw;
                    return (
                      <div key={idx} className="rounded bg-gray-50 p-2">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          <div>
                            network&nbsp;: {String(attempt?.network ?? '')}
                          </div>
                          <div>
                            http&nbsp;: {String(attempt?.http_status ?? '')}
                          </div>
                          {attempt?.content_type ? (
                            <div>
                              content_type&nbsp;: {String(attempt.content_type)}
                            </div>
                          ) : null}
                        </div>
                        {respMessage ? (
                          <div className="mt-1 break-words text-gray-700">
                            message&nbsp;: {String(respMessage)}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="custom"
                className="w-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 sm:w-auto"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      JSON.stringify(debugSnapshot, null, 2)
                    );
                    toast.success('Détails copiés');
                  } catch (error) {
                    toast.error('Impossible de copier');
                  }
                }}
              >
                Copier les détails
              </Button>

              {paymentLink ? (
                <Button
                  variant="custom"
                  className="w-full bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover sm:w-auto"
                  onClick={() => {
                    window.open(
                      String(paymentLink),
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                >
                  Ouvrir le lien
                </Button>
              ) : null}

              <Button
                variant="custom"
                className="w-full bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-300 sm:w-auto"
                onClick={async () => {
                  await refetch();
                  toast.success('Commande actualisée');
                }}
              >
                Actualiser
              </Button>
            </div>

            {Array.isArray(webhooks) && webhooks.length ? (
              <details className="rounded border border-gray-200 bg-white p-2">
                <summary className="cursor-pointer select-none text-[11px] font-semibold text-gray-800">
                  Webhooks ({webhooks.length})
                </summary>
                <pre className="mt-2 max-h-56 overflow-auto rounded bg-gray-50 p-2 text-[11px] leading-snug text-gray-800">
                  {JSON.stringify(webhooks, null, 2)}
                </pre>
              </details>
            ) : null}

            <pre className="max-h-56 overflow-auto rounded bg-white p-2 text-[11px] leading-snug text-gray-800">
              {JSON.stringify(debugSnapshot, null, 2)}
            </pre>
          </div>
        </details>
      ) : null}
      <div className="mt-6">
        <Spinner showText={false} />
      </div>
      {isAwaitingConfirmation ? (
        <div className="mt-6">
          <Button
            loading={isConfirming}
            disabled={isConfirming}
            variant="custom"
            className="w-full bg-green-600 px-5 py-3 text-white hover:bg-green-700"
            onClick={async () => {
              try {
                setIsConfirming(true);
                await HttpClient.post(
                  `orders/${encodeURIComponent(
                    trackingNumber
                  )}/confirm-taramoney`,
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
      {canExit ? (
        <div className="mt-6">
          <Button
            variant="custom"
            className="w-full bg-gray-900 px-5 py-3 text-white hover:bg-gray-800"
            onClick={() => {
              closeModal();
              router.push(
                `${ROUTES.ACCOUNT_ORDERS}/${encodeURIComponent(trackingNumber)}`
              );
            }}
          >
            Continuer
          </Button>
        </div>
      ) : null}
      <div className="mt-6">
        <Button
          loading={isCancelling}
          disabled={isCancelling}
          variant="custom"
          className="w-full bg-red-600 text-white px-5 py-3 hover:bg-red-700"
          onClick={async () => {
            try {
              setIsCancelling(true);
              await HttpClient.post(
                `orders/${encodeURIComponent(trackingNumber)}/cancel`,
                {}
              );
              toast.success(`${t('text-order')} ${t('order-cancelled')}`);
              closeModal();
              router.push(
                `${ROUTES.ACCOUNT_ORDERS}/${encodeURIComponent(trackingNumber)}`
              );
            } catch (error: any) {
              const message =
                error?.response?.data?.message ||
                error?.message ||
                t('payment-failed');
              toast.error(message);
            } finally {
              setIsCancelling(false);
            }
          }}
        >
          Annuler la commande
        </Button>
      </div>
    </div>
  );
};

export default TaramoneyPaymentModal;
