import { useUI } from '@contexts/ui.context';
import {
  campayOperatorAtom,
  campayPhoneNumberAtom,
  campayUseSavedContactAtom,
  customerContactAtom,
} from '@store/checkout';
import cn from 'classnames';
import { RadioGroup } from '@headlessui/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

type CampayOption = {
  value: 'saved' | 'orange' | 'mtn';
  label: string;
};

const CampayPayment = () => {
  const { t } = useTranslation('common');
  const { openModal, setModalView } = useUI();
  const [useSaved, setUseSaved] = useAtom(campayUseSavedContactAtom);
  const [operator, setOperator] = useAtom(campayOperatorAtom);
  const [campayPhoneNumber, setCampayPhoneNumber] = useAtom(campayPhoneNumberAtom);
  const [customerContact] = useAtom(customerContactAtom);

  const options: CampayOption[] = [
    {
      value: 'saved',
      label: customerContact
        ? `Numéro enregistré (${customerContact})`
        : 'Numéro enregistré',
    },
    {
      value: 'orange',
      label: 'Orange Money',
    },
    {
      value: 'mtn',
      label: 'MTN Mobile Money',
    },
  ];

  useEffect(() => {
    if (useSaved) {
      setCampayPhoneNumber('');
    }
  }, [setCampayPhoneNumber, useSaved]);

  return (
    <div className="rounded-md border border-gray-100 bg-white p-5 shadow-checkoutCard md:p-7">
      <div className="mb-4 text-sm font-semibold text-heading">
        {t('text-choose-payment')}
      </div>

      <RadioGroup
        value={
          useSaved ? 'saved' : operator === 'mtn' ? 'mtn' : 'orange'
        }
        onChange={(next: 'saved' | 'orange' | 'mtn') => {
          const nextUseSaved = next === 'saved';
          setUseSaved(nextUseSaved);
          if (!nextUseSaved) {
            setOperator(next);
            setModalView('CAMPAY_PHONE_MODAL');
            openModal();
          } else {
            setOperator(null);
          }
        }}
      >
        <RadioGroup.Label className="sr-only">
          {t('text-choose-payment')}
        </RadioGroup.Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => (
            <RadioGroup.Option key={option.value} value={option.value}>
              {({ checked }) => (
                <div
                  className={cn(
                    'cursor-pointer rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-heading transition-colors',
                    checked && 'border-heading'
                  )}
                >
                  {option.label}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      {!useSaved && campayPhoneNumber ? (
        <div className="mt-4 space-y-2 text-sm text-body">
          <div>
            {t('text-contact-number')}: {campayPhoneNumber}
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-accent underline"
            onClick={() => {
              setModalView('CAMPAY_PHONE_MODAL');
              openModal();
            }}
          >
            Modifier le numéro
          </button>
        </div>
      ) : (
        <div className="mt-4 text-sm text-body">{t('text-payment-order')}</div>
      )}
    </div>
  );
};

export default CampayPayment;
