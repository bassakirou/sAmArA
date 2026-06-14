import { Form } from '@components/ui/forms/form';
import Input from '@components/ui/input';
import Label from '@components/ui/label';
import { useUI } from '@contexts/ui.context';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import MobileOtpInput from 'react-otp-input';
import Button from '@components/ui/button';
import ButtonSamara from '@components/ui/button-samara';
import cn from 'classnames';

interface OtpRegisterFormProps {
  onSubmit: (formData: any) => void;
  loading: boolean;
}

type OtpRegisterFormValues = {
  email: string;
  name: string;
  code: string;
};

const otpLoginFormSchemaForNewUser = yup.object().shape({
  email: yup
    .string()
    .email('error-email-format')
    .required('error-email-required'),
  name: yup.string().required('error-name-required'),
  code: yup.string().required('error-code-required'),
});

function OtpRegisterForm({
  onSubmit,
  loading,
}: OtpRegisterFormProps) {
  const { t } = useTranslation('common');
  const { closeModal, modalData } = useUI();
  const isSellerSubscriptionFlow = Boolean(modalData?.sellerSubscriptionFlow);
  return (
    <Form<OtpRegisterFormValues>
      onSubmit={onSubmit}
      validationSchema={otpLoginFormSchemaForNewUser}>
      {({ register, control, formState: { errors } }) => (
        <div
          className={cn(
            'rounded-2xl border p-5',
            isSellerSubscriptionFlow
              ? 'border-[#eadfcb] bg-white/70 shadow-[0_14px_34px_rgba(15,23,42,0.05)]'
              : 'border-gray-200 bg-white'
          )}
        >
          <div className="mb-4 text-xs leading-6 text-body">
            Completez vos informations puis validez le code OTP pour activer
            directement votre parcours vendeur.
          </div>
          <Input
            labelKey={t('text-email')}
            {...register('email')}
            type="email"
            variant={isSellerSubscriptionFlow ? 'solid' : 'outline'}
            className="mb-5"
            errorKey={t(errors.email?.message!)}
          />
          <Input
            labelKey={t('text-name')}
            {...register('name')}
            variant={isSellerSubscriptionFlow ? 'solid' : 'outline'}
            className="mb-5"
            errorKey={t(errors.name?.message!)}
          />

          <div className="mb-5">
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
              defaultValue=""
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className={cn(
                'rounded-xl border px-4 py-3',
                isSellerSubscriptionFlow
                  ? 'border-[#d5d9e6] bg-white text-heading hover:bg-gray-50'
                  : 'bg-red-600 text-white border-red-600 hover:border-red-500 hover:bg-red-500'
              )}
              onClick={closeModal}
            >
              {t('text-cancel')}
            </Button>

            {isSellerSubscriptionFlow ? (
              <ButtonSamara type="submit" loading={loading} disabled={loading}>
                {t('text-verify-code')}
              </ButtonSamara>
            ) : (
              <Button loading={loading} disabled={loading}>
                {t('text-verify-code')}
              </Button>
            )}
          </div>
        </div>
      )}
    </Form>
  )
}

export default OtpRegisterForm
