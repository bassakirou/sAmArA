import { Controller, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { Form } from '@components/ui/forms/form';
import PhoneInput from '@components/ui/forms/phone-input';
import * as yup from 'yup';
import Button from '@components/ui/button';
import ButtonSamara from '@components/ui/button-samara';
import { useUI } from '@contexts/ui.context';
import cn from 'classnames';

type FormValues = {
  phone_number: string;
};

const checkoutContactSchema = yup.object().shape({
  phone_number: yup.string().required('error-contact-required'),
});

interface PhoneNumberFormProps {
  onSubmit: SubmitHandler<FormValues>;
  phoneNumber?: string;
  isLoading?: boolean;
  view?: 'login';
}
export default function PhoneNumberForm({
  phoneNumber,
  onSubmit,
  isLoading,
  view,
}: PhoneNumberFormProps) {
  const { t } = useTranslation('common');
  const { modalData } = useUI();
  const isSellerSubscriptionFlow = Boolean(modalData?.sellerSubscriptionFlow);

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      validationSchema={checkoutContactSchema}
      className="w-full"
      useFormProps={{
        defaultValues: {
          phone_number: phoneNumber,
        },
      }}
    >
      {({ control, formState: { errors } }) => (
        <div className="w-full">
          <div
            className={cn(
              'rounded-2xl border p-4',
              isSellerSubscriptionFlow
                ? 'border-[#eadfcb] bg-white/70 shadow-[0_14px_34px_rgba(15,23,42,0.05)]'
                : 'border-gray-200 bg-transparent'
            )}
          >
            <div className="mb-3 text-sm font-medium text-heading">
              {t('text-login-mobile')}
            </div>
            <div className="mb-4 text-xs leading-6 text-body">
              Entrez votre numero de telephone pour recevoir un code OTP.
            </div>
            <Controller
              name="phone_number"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  country="cm"
                  inputClass={cn(
                    '!p-0 ltr:!pr-4 rtl:!pl-4 ltr:!pl-14 rtl:!pr-14 !flex !items-center !w-full !appearance-none !transition !duration-300 !ease-in-out !text-heading !text-sm focus:!outline-none focus:!ring-0 !border !rounded !h-[54px]',
                    isSellerSubscriptionFlow
                      ? '!border-[#d8dbe6] !bg-[#edf2fb] focus:!border-accent'
                      : '!border-border-base focus:!border-accent'
                  )}
                  dropdownClass="focus:!ring-0 !border !border-border-base !shadow-350"
                  {...field}
                />
              )}
            />
            {errors?.phone_number?.message ? (
              <p className="mt-3 text-xs text-red-500 ltr:text-left rtl:text-right">
                {t(errors?.phone_number.message)}
              </p>
            ) : null}

            <div className="mt-5 flex justify-center">
              {isSellerSubscriptionFlow ? (
                <ButtonSamara
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {view === 'login' ? (
                    t('text-send-otp')
                  ) : (
                    <>
                      {Boolean(phoneNumber) ? t('text-update') : t('text-add')}{' '}
                      {t('nav-menu-contact')}
                    </>
                  )}
                </ButtonSamara>
              ) : (
                <Button
                  loading={isLoading}
                  disabled={isLoading}
                  className="!text-sm"
                >
                  {view === 'login' ? (
                    t('text-send-otp')
                  ) : (
                    <>
                      {Boolean(phoneNumber) ? t('text-update') : t('text-add')}{' '}
                      {t('nav-menu-contact')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Form>
  );
}
