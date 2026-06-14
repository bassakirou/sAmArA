import MobileOtpInput from 'react-otp-input';
import Button from '@components/ui/button';
import { Form } from '@components/ui/forms/form';
import { Controller } from 'react-hook-form';
import * as yup from 'yup';
import { useTranslation } from 'next-i18next';
import { useUI } from '@contexts/ui.context';
import Label from '@components/ui/label';
import ButtonSamara from '@components/ui/button-samara';
import cn from 'classnames';

type OptCodeFormProps = {
  code: string;
};

interface OtpLoginFormForAllUserProps {
  onSubmit: (formData: OptCodeFormProps) => void;
  isLoading: boolean;
}

const otpLoginFormSchemaForExistingUser = yup.object().shape({
  code: yup.string().required('error-code-required'),
});

export default function OtpCodeForm({
  onSubmit,
  isLoading,
}: OtpLoginFormForAllUserProps) {
  const { t } = useTranslation('common');
  const { closeModal, modalData } = useUI();
  const isSellerSubscriptionFlow = Boolean(modalData?.sellerSubscriptionFlow);

  return (
    <div
      className={cn(
        'space-y-5 rounded-2xl border p-5',
        isSellerSubscriptionFlow
          ? 'border-[#eadfcb] bg-white/70 shadow-[0_14px_34px_rgba(15,23,42,0.05)]'
          : 'border-gray-200 bg-white'
      )}
    >
      <Form<OptCodeFormProps>
        onSubmit={onSubmit}
        validationSchema={otpLoginFormSchemaForExistingUser}
      >
        {({ control }) => (
          <>
            <div className="mb-5">
              <div className="mb-2 text-xs leading-6 text-body">
                Saisissez le code OTP recu sur votre telephone pour continuer.
              </div>
              <Label>{t('text-otp-code')}</Label>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <MobileOtpInput
                    value={value}
                    onChange={onChange}
                    numInputs={6}
                    renderSeparator={
                      <span className="hidden sm:inline-block">-</span>
                    }
                    renderInput={(props) => <input {...props} />}
                    containerStyle="flex items-center justify-between -mx-2"
                    inputStyle={cn(
                      'flex items-center justify-center !w-full mx-2 sm:!w-10 !px-0 appearance-none transition duration-300 ease-in-out text-heading text-sm font-semibold focus:outline-0 focus:ring-0 border rounded-xl h-12',
                      isSellerSubscriptionFlow
                        ? 'border-[#d8dbe6] bg-[#edf2fb] focus:border-accent'
                        : 'border-heading focus:border-accent'
                    )}
                  />
                )}
                name="code"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className={cn(
                  'rounded-xl border px-4 py-3',
                  isSellerSubscriptionFlow
                    ? 'border-[#d5d9e6] bg-white text-heading hover:bg-gray-50'
                    : 'hover:border-red-500 hover:bg-red-500 hover:text-white'
                )}
              >
                {t('text-cancel')}
              </Button>
              {isSellerSubscriptionFlow ? (
                <ButtonSamara type="submit" loading={isLoading} disabled={isLoading}>
                  {t('text-verify-code')}
                </ButtonSamara>
              ) : (
                <Button loading={isLoading} disabled={isLoading}>
                  {t('text-verify-code')}
                </Button>
              )}
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
