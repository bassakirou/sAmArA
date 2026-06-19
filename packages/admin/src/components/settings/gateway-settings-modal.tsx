import Card from '@/components/common/card';
import { useModalState } from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import {
  usePaymentGatewaySettingsQuery,
  useUpdatePaymentGatewaySettingsMutation,
} from '@/data/payment-gateway';
import Loader from '@/components/ui/loader/loader';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useEffect, useMemo } from 'react';

type GatewayField = {
  key: string;
  type: 'text' | 'password' | 'number';
  labelKey: string;
  defaultLabel: string;
  noteKey?: string;
  defaultNote?: string;
  registerOptions?: Parameters<ReturnType<typeof useForm>['register']>[1];
};

const gatewayConfigs: Record<string, GatewayField[]> = {
  stripe: [
    {
      key: 'api_secret',
      type: 'password',
      labelKey: 'payment-gateway-settings.stripe.api_secret',
      defaultLabel: 'Stripe API Secret',
    },
    {
      key: 'webhook_secret',
      type: 'password',
      labelKey: 'payment-gateway-settings.stripe.webhook_secret',
      defaultLabel: 'Stripe Webhook Secret',
    },
  ],
  paypal: [
    {
      key: 'client_id',
      type: 'password',
      labelKey: 'payment-gateway-settings.paypal.client_id',
      defaultLabel: 'PayPal Client ID',
    },
    {
      key: 'client_secret',
      type: 'password',
      labelKey: 'payment-gateway-settings.paypal.client_secret',
      defaultLabel: 'PayPal Client Secret',
    },
    {
      key: 'webhook_id',
      type: 'text',
      labelKey: 'payment-gateway-settings.paypal.webhook_id',
      defaultLabel: 'PayPal Webhook ID',
    },
  ],
  taramoney: [
    {
      key: 'api_key',
      type: 'password',
      labelKey: 'payment-gateway-settings.taramoney.api_key',
      defaultLabel: 'Taramoney API Key',
    },
    {
      key: 'business_id',
      type: 'text',
      labelKey: 'payment-gateway-settings.taramoney.business_id',
      defaultLabel: 'Taramoney Business ID',
    },
    {
      key: 'return_url',
      type: 'text',
      labelKey: 'payment-gateway-settings.taramoney.return_url',
      defaultLabel: 'URL de retour (HTTPS)',
      noteKey: 'payment-gateway-settings.taramoney.return_url_note',
      defaultNote:
        'Doit être un lien HTTPS accessible publiquement (ex: URL ngrok du dashboard).',
    },
    {
      key: 'webhook_url',
      type: 'text',
      labelKey: 'payment-gateway-settings.taramoney.webhook_url',
      defaultLabel: 'URL Webhook (HTTPS)',
      noteKey: 'payment-gateway-settings.taramoney.webhook_url_note',
      defaultNote:
        'Doit être un lien HTTPS accessible publiquement (ex: URL ngrok de l’API). Le webhook sera ajouté automatiquement sur /webhooks/taramoney si besoin.',
    },
    {
      key: 'webhook_secret',
      type: 'password',
      labelKey: 'payment-gateway-settings.taramoney.webhook_secret',
      defaultLabel: 'Taramoney Webhook Secret',
    },
    {
      key: 'base_url',
      type: 'text',
      labelKey: 'payment-gateway-settings.taramoney.base_url',
      defaultLabel: 'Taramoney Base URL',
    },
    {
      key: 'mobilepay_orange_networks',
      type: 'text',
      labelKey: 'payment-gateway-settings.taramoney.mobilepay_orange_networks',
      defaultLabel: 'Réseaux Orange (codes)',
      noteKey: 'payment-gateway-settings.taramoney.mobilepay_networks_note',
      defaultNote:
        'Liste séparée par des virgules. Utilisée pour corriger INVALID_NETWORK si la plateforme attend des codes spécifiques.',
    },
    {
      key: 'mobilepay_mtn_networks',
      type: 'text',
      labelKey: 'payment-gateway-settings.taramoney.mobilepay_mtn_networks',
      defaultLabel: 'Réseaux MTN (codes)',
      noteKey: 'payment-gateway-settings.taramoney.mobilepay_networks_note',
      defaultNote:
        'Liste séparée par des virgules. Utilisée pour corriger INVALID_NETWORK si la plateforme attend des codes spécifiques.',
    },
    {
      key: 'payout_phone_number',
      type: 'text',
      labelKey: 'payment-gateway-settings.taramoney.payout_phone_number',
      defaultLabel: 'Payout phone number',
      noteKey: 'payment-gateway-settings.taramoney.payout_note',
      defaultNote:
        'If these payout fields are filled in, an automatic payout will be requested after each successful payment.',
      registerOptions: {
        pattern: {
          value: /^\+?\d{8,15}$/,
          message: 'payment-gateway-settings.errors.invalid_phone',
        },
      },
    },
    {
      key: 'payout_beneficiary_name',
      type: 'text',
      labelKey: 'payment-gateway-settings.taramoney.payout_beneficiary_name',
      defaultLabel: 'Beneficiary name',
      noteKey: 'payment-gateway-settings.taramoney.payout_note',
      defaultNote:
        'If these payout fields are filled in, an automatic payout will be requested after each successful payment.',
    },
    {
      key: 'payout_amount_xaf',
      type: 'number',
      labelKey: 'payment-gateway-settings.taramoney.payout_amount_xaf',
      defaultLabel: 'Amount to withdraw (XAF)',
      noteKey: 'payment-gateway-settings.taramoney.payout_note',
      defaultNote:
        'If these payout fields are filled in, an automatic payout will be requested after each successful payment.',
      registerOptions: {
        valueAsNumber: true,
        validate: (value: any) => {
          if (value === undefined || value === null || value === '')
            return true;
          if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
            return 'payment-gateway-settings.errors.invalid_amount';
          }
          if (!Number.isInteger(value)) {
            return 'payment-gateway-settings.errors.invalid_amount';
          }
          return true;
        },
      },
    },
  ],
  campay: [
    {
      key: 'username',
      type: 'text',
      labelKey: 'payment-gateway-settings.campay.username',
      defaultLabel: 'Campay Username',
    },
    {
      key: 'password',
      type: 'password',
      labelKey: 'payment-gateway-settings.campay.password',
      defaultLabel: 'Campay Password',
    },
    {
      key: 'environment',
      type: 'text',
      labelKey: 'payment-gateway-settings.campay.environment',
      defaultLabel: 'Campay Environment (DEV ou PROD)',
    },
    {
      key: 'webhook_secret',
      type: 'password',
      labelKey: 'payment-gateway-settings.campay.webhook_secret',
      defaultLabel: 'Campay Webhook Secret (Optionnel)',
    },
  ],
};

const GatewaySettingsModal = () => {
  const { t } = useTranslation('common');
  const { closeModal } = useModalAction();
  const { data: modalData } = useModalState();
  const gatewayName = modalData?.gateway;

  const {
    data,
    isLoading: loading,
    error,
  } = usePaymentGatewaySettingsQuery(gatewayName);
  const { mutate: updateSettings, isLoading: updating } =
    useUpdatePaymentGatewaySettingsMutation();

  const configFields = useMemo(
    () => (gatewayName ? gatewayConfigs[gatewayName] || [] : []),
    [gatewayName]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Record<string, any>>({});

  const payoutPhoneNumber = watch('payout_phone_number');
  const payoutBeneficiaryName = watch('payout_beneficiary_name');
  const payoutAmountXaf = watch('payout_amount_xaf');

  useEffect(() => {
    if (data?.settings) {
      const valuesToSet: Record<string, any> = {};
      configFields.forEach((field) => {
        valuesToSet[field.key] = data.settings[field.key] ?? '';
      });
      reset(valuesToSet, { keepErrors: true });
    }
  }, [data, reset, configFields]);

  useEffect(() => {
    if (gatewayName !== 'taramoney') return;

    const anyPayoutFieldFilled = Boolean(
      payoutPhoneNumber || payoutBeneficiaryName || payoutAmountXaf
    );
    const allPayoutFieldsFilled = Boolean(
      payoutPhoneNumber && payoutBeneficiaryName && payoutAmountXaf
    );

    if (!anyPayoutFieldFilled) {
      clearErrors([
        'payout_phone_number',
        'payout_beneficiary_name',
        'payout_amount_xaf',
      ]);
      return;
    }

    if (!payoutPhoneNumber) {
      setError('payout_phone_number', {
        type: 'manual',
        message: 'payment-gateway-settings.errors.payout_all_fields_required',
      });
    }
    if (!payoutBeneficiaryName) {
      setError('payout_beneficiary_name', {
        type: 'manual',
        message: 'payment-gateway-settings.errors.payout_all_fields_required',
      });
    }
    if (!payoutAmountXaf) {
      setError('payout_amount_xaf', {
        type: 'manual',
        message: 'payment-gateway-settings.errors.payout_all_fields_required',
      });
    }

    if (allPayoutFieldsFilled) {
      if (
        errors?.payout_phone_number?.message ===
        'payment-gateway-settings.errors.payout_all_fields_required'
      ) {
        clearErrors('payout_phone_number');
      }
      if (
        errors?.payout_beneficiary_name?.message ===
        'payment-gateway-settings.errors.payout_all_fields_required'
      ) {
        clearErrors('payout_beneficiary_name');
      }
      if (
        errors?.payout_amount_xaf?.message ===
        'payment-gateway-settings.errors.payout_all_fields_required'
      ) {
        clearErrors('payout_amount_xaf');
      }
    }
  }, [
    gatewayName,
    payoutPhoneNumber,
    payoutBeneficiaryName,
    payoutAmountXaf,
    errors,
    clearErrors,
    setError,
  ]);

  const onSubmit = (formData: any) => {
    updateSettings(
      { gateway: gatewayName, settings: formData },
      { onSuccess: () => closeModal() }
    );
  };

  return (
    <Card className="relative w-full max-w-lg">
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <h1 className="mb-6 text-lg font-semibold">
        {t('payment-gateway-settings.title', {
          defaultValue: 'Settings for {{gateway}}',
          gateway: gatewayName,
        })}
      </h1>

      {loading && <Loader text={t('common:text-loading')} />}
      {error && <p>{t('common:text-something-went-wrong')}</p>}

      {!loading && !error && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {configFields.map((field) => {
              const InputComponent =
                field.type === 'password' ? PasswordInput : Input;
              const label = t(field.labelKey, {
                defaultValue: field.defaultLabel,
              });
              const note =
                field.noteKey && field.defaultNote
                  ? t(field.noteKey, { defaultValue: field.defaultNote })
                  : undefined;
              const fieldError = errors?.[field.key]?.message as
                | string
                | undefined;
              return (
                <InputComponent
                  key={field.key}
                  label={label}
                  note={note}
                  type={field.type}
                  error={
                    fieldError
                      ? t(fieldError, { defaultValue: fieldError })
                      : undefined
                  }
                  {...register(field.key, field.registerOptions)}
                  variant="outline"
                  className="mb-4"
                />
              );
            })}
          </div>

          <div className="mt-8">
            <Button className="w-full" loading={updating} disabled={updating}>
              {t('form:button-label-save-settings')}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default GatewaySettingsModal;
