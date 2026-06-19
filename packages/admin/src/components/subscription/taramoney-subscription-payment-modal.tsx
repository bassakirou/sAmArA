import Card from '@/components/common/card';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import Modal from '@/components/ui/modal/modal';
import { HttpClient } from '@/data/client/http-client';
import {
  useConfirmVendorSubscriptionCampayMutation,
  useConfirmVendorSubscriptionTaramoneyMutation,
} from '@/data/vendor-subscription';
import cn from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
  open: boolean;
  onClose: () => void;
  tracking: string;
  initialPaymentIntentInfo?: any;
  onActivated?: () => void;
};

export default function TaramoneySubscriptionPaymentModal({
  open,
  onClose,
  tracking,
  initialPaymentIntentInfo,
  onActivated,
}: Props) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [didAutoConfirm, setDidAutoConfirm] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const {
    mutate: confirmTaramoney,
    isLoading: confirmingTaramoney,
    error: confirmErrorTaramoney,
  } = useConfirmVendorSubscriptionTaramoneyMutation() as any;
  const {
    mutate: confirmCampay,
    isLoading: confirmingCampay,
    error: confirmErrorCampay,
  } = useConfirmVendorSubscriptionCampayMutation() as any;

  useEffect(() => {
    if (!open || !tracking) return;
    let cancelled = false;
    let intervalId: number | null = null;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await HttpClient.get<any>(
          `orders/tracking-number/${encodeURIComponent(tracking)}`
        );
        if (!cancelled) {
          setOrder(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    intervalId = window.setInterval(fetchOrder, 3000);
    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [open, tracking]);

  useEffect(() => {
    if (!open) return;
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [open]);

  const paymentIntentInfo = useMemo(() => {
    return (
      order?.payment_intent?.payment_intent_info ?? initialPaymentIntentInfo
    );
  }, [initialPaymentIntentInfo, order?.payment_intent?.payment_intent_info]);

  const raw = paymentIntentInfo?.raw ?? {};
  const rawStatus = String(raw?.status ?? '').toUpperCase();
  const paymentLink =
    raw?.generallink || raw?.generalLink || raw?.general_link || null;
  const ussdCode = raw?.ussd || raw?.ussdCode || raw?.code || null;
  const vendor = raw?.vendor || null;

  const message =
    paymentIntentInfo?.message ||
    raw?.message ||
    paymentIntentInfo?.payment_message ||
    null;

  const displayMessage = ussdCode
    ? `Veuillez valider le paiement${
        vendor ? ` via ${String(vendor)}` : ''
      }. Si aucune fenêtre n’apparaît, composez ${String(
        ussdCode
      )} pour finaliser le paiement.`
    : paymentLink
    ? `Veuillez ouvrir le lien pour finaliser le paiement${
        vendor ? ` (${String(vendor)})` : ''
      }.`
    : message;

  const canConfirm = rawStatus.includes('SUCCESS');
  const isPaid = order?.payment_status === 'payment-success';
  const paymentGateway = String(order?.payment_gateway ?? '').toUpperCase();
  const confirm =
    paymentGateway === 'CAMPAY' ? confirmCampay : confirmTaramoney;
  const confirming =
    paymentGateway === 'CAMPAY' ? confirmingCampay : confirmingTaramoney;
  const confirmError =
    paymentGateway === 'CAMPAY' ? confirmErrorCampay : confirmErrorTaramoney;

  useEffect(() => {
    if (!open) return;
    if (!tracking) return;
    if (!isPaid) return;
    if (didAutoConfirm) return;
    if (confirming) return;

    setDidAutoConfirm(true);
    confirm(tracking, {
      onSuccess: () => {
        onActivated?.();
        onClose();
      },
      onError: () => {
        setDidAutoConfirm(false);
      },
    });
  }, [
    confirm,
    confirming,
    didAutoConfirm,
    isPaid,
    onActivated,
    onClose,
    open,
    tracking,
  ]);

  return (
    <Modal open={open} onClose={onClose} disableClose>
      <Card className="w-screen max-w-lg">
        <h1 className="text-xl font-semibold text-heading">
          Paiement abonnement
        </h1>
        <div className="mt-2 text-sm text-body">
          {displayMessage ? displayMessage : 'En attente du paiement…'}
        </div>

        {isPaid ? (
          <div className="mt-4 rounded bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            Paiement reçu. Activation en cours…
          </div>
        ) : null}

        {loading && !order && !initialPaymentIntentInfo ? (
          <div className="mt-6">
            <Loader text="Chargement…" />
          </div>
        ) : null}

        {confirmError ? (
          <div className="mt-4">
            <ErrorMessage message={confirmError?.message} />
          </div>
        ) : null}
        {error ? (
          <div className="mt-4">
            <ErrorMessage message={error?.message} />
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {paymentLink ? (
            <button
              type="button"
              className={cn(
                'w-full rounded bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover sm:w-auto'
              )}
              onClick={() =>
                window.open(
                  String(paymentLink),
                  '_blank',
                  'noopener,noreferrer'
                )
              }
            >
              Ouvrir le lien
            </button>
          ) : null}
          <button
            type="button"
            disabled={isCancelling || confirming || isPaid || elapsedMs < 15000}
            className="w-full rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 sm:w-auto"
            onClick={async () => {
              try {
                setIsCancelling(true);
                await HttpClient.post<any>(
                  `orders/${encodeURIComponent(tracking)}/cancel`,
                  {}
                );
                toast.success('Paiement annulé');
                onClose();
              } catch (e: any) {
                const message =
                  e?.response?.data?.message ||
                  e?.message ||
                  'Impossible d’annuler le paiement.';
                toast.error(String(message));
              } finally {
                setIsCancelling(false);
              }
            }}
          >
            Annuler le paiement
          </button>
        </div>

        {canConfirm && !didAutoConfirm ? (
          <div className="mt-4">
            <button
              type="button"
              disabled={confirming}
              className="w-full rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
              onClick={() => {
                setDidAutoConfirm(false);
                confirm(tracking, {
                  onSuccess: () => {
                    onActivated?.();
                    onClose();
                  },
                });
              }}
            >
              Confirmer le paiement
            </button>
          </div>
        ) : null}
      </Card>
    </Modal>
  );
}
