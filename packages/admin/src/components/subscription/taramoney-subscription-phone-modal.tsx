import Card from '@/components/common/card';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal/modal';
import { useState } from 'react';

type Network = 'orange_money' | 'mtn_momo' | 'wave';

type Props = {
  open: boolean;
  onClose: () => void;
  network: Network;
  defaultPhoneNumber?: string;
  loading?: boolean;
  onSubmit: (phoneNumber: string) => void;
};

const labelByNetwork: Record<Network, string> = {
  orange_money: 'Orange Money',
  mtn_momo: 'MTN Mobile Money',
  wave: 'Wave',
};

export default function TaramoneySubscriptionPhoneModal({
  open,
  onClose,
  network,
  defaultPhoneNumber,
  loading,
  onSubmit,
}: Props) {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber ?? '');
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal
      open={open}
      onClose={() => {
        setError(null);
        onClose();
      }}
    >
      <Card className="w-screen max-w-lg">
        <h1 className="text-xl font-semibold text-heading">
          Numéro de paiement — {labelByNetwork[network]}
        </h1>
        <div className="mt-2 text-sm text-body">
          Entrez le numéro qui recevra la demande de paiement sur votre téléphone.
        </div>

        <div className="mt-6">
          <Input
            label="Numéro de téléphone"
            name="taramoney_phone_number"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if (error) setError(null);
            }}
            variant="outline"
            placeholder="Ex: 699001122"
          />
          {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="w-full rounded bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200 sm:w-auto"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={loading}
            className="w-full rounded bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60 sm:w-auto"
            onClick={() => {
              const cleaned = String(phoneNumber ?? '').trim();
              if (!cleaned) {
                setError('Le numéro est obligatoire.');
                return;
              }
              onSubmit(cleaned);
            }}
          >
            Continuer
          </button>
        </div>
      </Card>
    </Modal>
  );
}

