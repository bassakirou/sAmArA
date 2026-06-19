import Button from '@components/ui/button';
import { Form } from '@components/ui/forms/form';
import PhoneInput from '@components/ui/forms/phone-input';
import { useUI } from '@contexts/ui.context';
import {
  campayAutoSubmitAtom,
  campayOperatorAtom,
  campayPhoneNumberAtom,
  campayUseSavedContactAtom,
  customerContactAtom,
} from '@store/checkout';
import { Controller, SubmitHandler } from 'react-hook-form';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import * as yup from 'yup';

type FormValues = {
  phone_number: string;
};

const CampayPhoneModal = () => {
  const { t } = useTranslation('common');
  const { closeModal } = useUI();
  const [useSaved] = useAtom(campayUseSavedContactAtom);
  const [operator] = useAtom(campayOperatorAtom);
  const [campayPhoneNumber, setCampayPhoneNumber] = useAtom(campayPhoneNumberAtom);
  const [customerContact, setCustomerContact] = useAtom(customerContactAtom);
  const [, setAutoSubmit] = useAtom(campayAutoSubmitAtom);

  const schema = useMemo(() => {
    return yup.object().shape({
      phone_number: yup.string().required('error-contact-required'),
    });
  }, []);

  const onSubmit: SubmitHandler<FormValues> = ({ phone_number }) => {
    if (useSaved) {
      setCustomerContact(phone_number);
    } else {
      setCampayPhoneNumber(phone_number);
    }
    setAutoSubmit(true);
    closeModal();
  };

  const initialValue = useSaved ? customerContact : campayPhoneNumber;
  const operatorLabel =
    operator === 'mtn' ? 'MTN Mobile Money' : operator === 'orange' ? 'Orange Money' : null;

  return (
    <div className="w-screen max-w-md rounded-xl bg-white p-6 md:p-8">
      <h3 className="mb-4 text-center text-base font-semibold text-heading">
        {operatorLabel
          ? `${t('text-contact-number')} — ${operatorLabel}`
          : t('text-contact-number')}
      </h3>

      <Form<FormValues>
        onSubmit={onSubmit}
        validationSchema={schema}
        className="w-full"
        useFormProps={{
          defaultValues: {
            phone_number: initialValue,
          },
        }}
      >
        {({ control, formState: { errors } }) => (
          <div className="flex flex-col">
            <div className="flex w-full items-center md:min-w-[360px]">
              <Controller
                name="phone_number"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    country="cm"
                    inputClass="!p-0 ltr:!pr-4 rtl:!pl-4 ltr:!pl-14 rtl:!pr-14 !flex !items-center !w-full !appearance-none !transition !duration-300 !ease-in-out !text-heading !text-sm focus:!outline-none focus:!ring-0 !border !border-border-base ltr:!border-r-0 rtl:!border-l-0 !rounded ltr:!rounded-r-none rtl:!rounded-l-none focus:!border-accent !h-[52px]"
                    dropdownClass="focus:!ring-0 !border !border-border-base !shadow-350"
                    {...field}
                  />
                )}
              />
              <Button className="!text-sm ltr:!rounded-l-none rtl:!rounded-r-none grow-0 shrink-0 basis-auto">
                {t('text-proceed')}
              </Button>
            </div>
            {errors?.phone_number?.message && (
              <p className="mt-2 text-xs text-red-500 ltr:text-left rtl:text-right">
                {t(errors?.phone_number.message)}
              </p>
            )}
          </div>
        )}
      </Form>
    </div>
  );
};

export default CampayPhoneModal;
