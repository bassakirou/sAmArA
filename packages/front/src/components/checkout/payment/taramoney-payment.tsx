import {
  taramoneyEmailAtom,
  taramoneyNetworkAtom,
  taramoneyPhoneNumberAtom,
} from '@store/checkout';
import cn from 'classnames';
import { RadioGroup } from '@headlessui/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo } from 'react';

type TaramoneyChannel = {
  value: string;
  label: string;
  requiresPhone: boolean;
  requiresEmail: boolean;
};

const TaramoneyPayment = () => {
  const { t } = useTranslation('common');
  const [network, setNetwork] = useAtom(taramoneyNetworkAtom);
  const [phoneNumber, setPhoneNumber] = useAtom(taramoneyPhoneNumberAtom);
  const [, setEmail] = useAtom(taramoneyEmailAtom);

  const channels: TaramoneyChannel[] = useMemo(
    () => [
      {
        value: 'orange_money',
        label: 'Orange Money',
        requiresPhone: true,
        requiresEmail: false,
      },
      {
        value: 'mtn_momo',
        label: 'MTN Mobile Money',
        requiresPhone: true,
        requiresEmail: false,
      },
      { value: 'wave', label: 'Wave', requiresPhone: true, requiresEmail: false },
      { value: 'paypal', label: 'PayPal', requiresPhone: true, requiresEmail: true },
    ],
    []
  );

  useEffect(() => {
    return () => {
      setNetwork(null);
      setPhoneNumber('');
      setEmail('');
    };
  }, [setEmail, setNetwork, setPhoneNumber]);

  const activeChannel = channels.find((c) => c.value === network);

  return (
    <div className="rounded-md border border-gray-100 bg-white p-5 shadow-checkoutCard md:p-7">
      <div className="mb-4 text-sm font-semibold text-heading">
        {t('text-choose-payment')}
      </div>

      <RadioGroup
        value={network}
        onChange={(next) => {
          setNetwork(next);
          setPhoneNumber('');
          setEmail('');
        }}
      >
        <RadioGroup.Label className="sr-only">
          {t('text-choose-payment')}
        </RadioGroup.Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {channels.map((channel) => (
            <RadioGroup.Option key={channel.value} value={channel.value}>
              {({ checked }) => (
                <div
                  className={cn(
                    'cursor-pointer rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-heading transition-colors',
                    checked && 'border-heading'
                  )}
                >
                  {channel.label}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      {!network ? (
        <div className="mt-4 text-sm text-body">{t('text-payment-order')}</div>
      ) : activeChannel?.requiresPhone ? (
        <div className="mt-4 space-y-2 text-sm text-body">
          <div>
            {t('text-contact-number')}: {phoneNumber ? phoneNumber : t('text-no-contact')}
          </div>
          <div>{t('text-payment-order')}</div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-body">{t('text-payment-order')}</div>
      )}
    </div>
  );
};

export default TaramoneyPayment;
