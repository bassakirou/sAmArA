import Button from '@components/ui/button';
import { Form } from '@components/ui/forms/form';
import PhoneInput from '@components/ui/forms/phone-input';
import Input from '@components/ui/input';
import { useUI } from '@contexts/ui.context';
import {
  customerContactAtom,
  taramoneyAutoSubmitAtom,
  taramoneyEmailAtom,
  taramoneyNetworkAtom,
  taramoneyPhoneNumberAtom,
} from '@store/checkout';
import { Controller, SubmitHandler } from 'react-hook-form';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import * as yup from 'yup';

type FormValues = {
  phone_number: string;
  email: string;
};

const labelByNetwork: Record<string, string> = {
  orange_money: 'Orange Money',
  mtn_momo: 'MTN Mobile Money',
  wave: 'Wave',
  paypal: 'PayPal',
};

const TaramoneyPhoneModal = () => {
  const { t } = useTranslation('common');
  const { closeModal } = useUI();
  const [network] = useAtom(taramoneyNetworkAtom);
  const [phoneNumber, setPhoneNumber] = useAtom(taramoneyPhoneNumberAtom);
  const [email, setEmail] = useAtom(taramoneyEmailAtom);
  const [, setCustomerContact] = useAtom(customerContactAtom);
  const [, setAutoSubmit] = useAtom(taramoneyAutoSubmitAtom);

  const networkLabel = network ? labelByNetwork[network] ?? network : '';
  const requiresEmail = network === 'paypal';

  const schema = useMemo(() => {
    return yup.object().shape({
      phone_number: yup.string().required('error-contact-required'),
      email: requiresEmail
        ? yup.string().email('error-email-invalid').required('error-email-required')
        : yup.string().nullable(),
    });
  }, [requiresEmail]);

  const onSubmit: SubmitHandler<FormValues> = ({ phone_number, email }) => {
    setPhoneNumber(phone_number);
    setCustomerContact(phone_number);
    setEmail(requiresEmail ? email : '');
    setAutoSubmit(true);
    closeModal();
  };

  return (
    <div className="w-screen max-w-md rounded-xl bg-white p-6 md:p-8">
      <h3 className="mb-4 text-center text-base font-semibold text-heading">
        {networkLabel
          ? `${t('text-contact-number')} — ${networkLabel}`
          : t('text-contact-number')}
      </h3>

      <Form<FormValues>
        onSubmit={onSubmit}
        validationSchema={schema}
        className="w-full"
        useFormProps={{
          defaultValues: {
            phone_number: phoneNumber,
            email,
          },
        }}
      >
        {({ control, formState: { errors } }) => (
          <div className="flex flex-col">
            {requiresEmail ? (
              <div className="mb-3">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      name="email"
                      type="email"
                      labelKey="text-email"
                      placeholderKey="text-email-details"
                      variant="solid"
                      errorKey={errors?.email?.message as any}
                    />
                  )}
                />
              </div>
            ) : null}
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

export default TaramoneyPhoneModal;
