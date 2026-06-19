import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { DatePicker } from '@/components/ui/date-picker';
import Select from '@/components/ui/select/select';
import SwitchInput from '@/components/ui/switch-input';
import LinkButton from '@/components/ui/link-button';
import { ArrowPrev } from '@/components/icons/arrow-prev';
import { Routes } from '@/config/routes';
import {
  useCreateSubscriptionPlanMutation,
  useSubscriptionPlansQuery,
  useUpdateSubscriptionPlanMutation,
} from '@/data/subscription-plan';
import { SubscriptionPlan, SubscriptionPlanInput } from '@/types';
import { subscriptionPlanPermissionsOptions } from './permissions';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

type LevelOption = { label: string; value: number };

type FormValues = Omit<SubscriptionPlanInput, 'permissions' | 'level'> & {
  permissions?: { label: string; value: string }[];
  discount_range?: [Date | null, Date | null];
  level?: LevelOption | null;
};

const schema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string().required(),
  level: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.number().integer().min(1).max(4).required(),
    })
    .nullable()
    .required(),
  monthly_price: yup.number().typeError('required').min(0).required(),
  annual_monthly_prorata_price: yup
    .number()
    .typeError('required')
    .min(0)
    .required(),
  max_products: yup
    .number()
    .nullable()
    .transform((v) => (Number.isNaN(v) ? null : v))
    .min(1),
  platform_commission_rate: yup
    .number()
    .nullable()
    .transform((v) => (Number.isNaN(v) ? null : v))
    .min(0)
    .max(100),
  discount_percent: yup
    .number()
    .nullable()
    .transform((v) => (Number.isNaN(v) ? null : v))
    .min(1)
    .max(100),
});

export default function SubscriptionPlanForm({
  initialValues,
}: {
  initialValues?: SubscriptionPlan | null;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: createPlan, isLoading: creating } =
    useCreateSubscriptionPlanMutation();
  const { mutate: updatePlan, isLoading: updating } =
    useUpdateSubscriptionPlanMutation();
  const plansQuery = useSubscriptionPlansQuery({ limit: 100 });

  const usedLevels = useMemo(() => {
    const currentId = initialValues?.id ? String(initialValues.id) : null;
    const all = plansQuery.plans ?? [];
    return all
      .filter((p: any) => String(p?.id) !== currentId)
      .map((p: any) => Number(p?.level))
      .filter((v: any) => Number.isFinite(v));
  }, [initialValues?.id, plansQuery.plans]);

  const levelOptions = useMemo<LevelOption[]>(() => {
    const current = initialValues?.level ? Number(initialValues.level) : null;
    const base: LevelOption[] = [1, 2, 3, 4].map((n) => ({
      label: String(n),
      value: n,
    }));
    return base.filter(
      (opt) => opt.value === current || !usedLevels.includes(opt.value)
    );
  }, [initialValues?.level, usedLevels]);

  const defaultValues = useMemo<FormValues>(() => {
    const allOption = subscriptionPlanPermissionsOptions.find(
      (o) => o.value === 'all'
    )!;
    const selectedRaw =
      initialValues?.permissions?.map((p) => {
        const opt = subscriptionPlanPermissionsOptions.find(
          (o) => o.value === p
        );
        return opt ?? { label: p, value: p };
      }) ?? [];
    const selected = selectedRaw.some((p) => p.value === 'all')
      ? [allOption]
      : selectedRaw.filter((p) => p.value !== 'all');

    const start = initialValues?.discount_starts_at
      ? new Date(initialValues.discount_starts_at)
      : null;
    const end = initialValues?.discount_ends_at
      ? new Date(initialValues.discount_ends_at)
      : null;

    return {
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      level:
        levelOptions.find(
          (o) => o.value === Number(initialValues?.level ?? 1)
        ) ??
        levelOptions[0] ??
        null,
      monthly_price: initialValues?.monthly_price ?? 0,
      annual_monthly_prorata_price:
        initialValues?.annual_monthly_prorata_price ?? 0,
      permissions: selected,
      max_products: initialValues?.max_products ?? null,
      platform_commission_rate: initialValues?.platform_commission_rate ?? null,
      discount_percent: initialValues?.discount_percent ?? null,
      discount_range: [start, end],
      is_active: initialValues?.is_active ?? true,
    };
  }, [initialValues, levelOptions]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    defaultValues,
    resolver: yupResolver(schema),
  });

  const selectedPermissions = watch('permissions') ?? [];
  const hasAllPermissions = selectedPermissions.some((p) => p.value === 'all');
  const hasProducts = selectedPermissions.some(
    (p) => p.value === 'product_publication' || p.value === 'all'
  );
  const hasCommission = selectedPermissions.some(
    (p) => p.value === 'platform_commission' || p.value === 'all'
  );

  const onSubmit = (values: FormValues) => {
    const permissions = (values.permissions ?? []).map((p) => p.value);
    const [start, end] = values.discount_range ?? [null, null];
    const input: SubscriptionPlanInput = {
      name: values.name,
      description: values.description,
      level: values.level?.value ?? null,
      monthly_price: Number(values.monthly_price),
      annual_monthly_prorata_price: Number(values.annual_monthly_prorata_price),
      permissions,
      max_products: hasProducts ? values.max_products ?? null : null,
      platform_commission_rate: hasCommission
        ? values.platform_commission_rate ?? null
        : null,
      discount_percent: values.discount_percent ?? null,
      discount_starts_at: start ? start.toISOString() : null,
      discount_ends_at: end ? end.toISOString() : null,
      is_active: values.is_active ?? true,
    };

    if (!initialValues?.id) {
      createPlan(input);
      return;
    }
    updatePlan({ id: String(initialValues.id), input });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full xl:mx-auto xl:max-w-5xl"
    >
      <div className="mb-4">
        <LinkButton
          href={Routes.subscriptionPlans.list}
          variant="outline"
          size="small"
          className="gap-2"
        >
          <ArrowPrev />
          Retour aux abonnements
        </LinkButton>
      </div>
      <div className="flex flex-col pb-8 border-b border-dashed border-border-base my-5 sm:my-8">
        <Description
          title="Abonnement"
          details="Création ou modification d’un plan d’abonnement."
          className="w-full px-0 sm:px-4"
        />

        <Card className="w-full">
          <Input
            label="Nom de l’abonnement"
            {...register('name')}
            error={t(errors.name?.message ?? '')}
          />
          <TextArea
            label="Description détaillée"
            {...register('description')}
            error={t(errors.description?.message ?? '')}
          />

          <div className="mb-3">
            <label className="mb-3 block text-sm font-semibold leading-none text-body-dark">
              Niveau (1 = plus bas, 4 = plus haut)
            </label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={levelOptions}
                  getOptionLabel={(option: any) => option.label}
                  getOptionValue={(option: any) => String(option.value)}
                  placeholder="Niveau"
                />
              )}
            />
            {errors.level ? (
              <p className="mt-1 text-xs text-red-500">Champ requis</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Prix mensuel"
              type="number"
              step="0.01"
              {...register('monthly_price')}
              error={t(errors.monthly_price?.message ?? '')}
            />
            <Input
              label="Prix mensuel pro-rata (annuel)"
              type="number"
              step="0.01"
              {...register('annual_monthly_prorata_price')}
              error={t(errors.annual_monthly_prorata_price?.message ?? '')}
            />
          </div>

          <div className="mb-3">
            <label className="mb-3 block text-sm font-semibold leading-none text-body-dark">
              Droits associés
            </label>
            <Controller
              name="permissions"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={subscriptionPlanPermissionsOptions}
                  getOptionLabel={(option: any) => option.label}
                  getOptionValue={(option: any) => option.value}
                  isMulti
                  placeholder="Droits associés"
                  isOptionDisabled={(option: any) =>
                    hasAllPermissions && option.value !== 'all'
                  }
                  onChange={(nextValue: any) => {
                    const next = Array.isArray(nextValue) ? nextValue : [];
                    const allOption = subscriptionPlanPermissionsOptions.find(
                      (o) => o.value === 'all'
                    )!;
                    const normalized = next.some((p) => p.value === 'all')
                      ? [allOption]
                      : next.filter((p) => p.value !== 'all');
                    field.onChange(normalized);
                  }}
                />
              )}
            />
          </div>

          {hasProducts ? (
            <Input
              label="Nombre maximum de produits"
              type="number"
              {...register('max_products')}
              error={t(errors.max_products?.message ?? '')}
            />
          ) : null}

          {hasCommission ? (
            <Input
              label="Commission plateforme (%)"
              type="number"
              step="0.01"
              {...register('platform_commission_rate')}
              error={t(errors.platform_commission_rate?.message ?? '')}
            />
          ) : null}

          <Input
            label="Réduction (%)"
            type="number"
            {...register('discount_percent')}
            error={t(errors.discount_percent?.message ?? '')}
          />

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-heading">
              Période de validité de la réduction
            </label>
            <DatePicker
              selectsRange
              startDate={watch('discount_range')?.[0] ?? null}
              endDate={watch('discount_range')?.[1] ?? null}
              onChange={(dates: any) => setValue('discount_range', dates)}
              className="w-full rounded border border-border-base px-3 py-2"
            />
          </div>

          <div className="mt-5">
            <SwitchInput label="Actif" name="is_active" control={control} />
          </div>
        </Card>
      </div>

      <div className="mb-4 text-end">
        <button
          type="button"
          onClick={() => router.push(Routes.subscriptionPlans.list)}
          className="me-4 text-sm font-semibold text-body transition-colors hover:text-heading"
        >
          {t('form:button-label-back')}
        </button>
        <button
          type="submit"
          className="text-sm font-semibold text-white bg-accent px-4 py-2 rounded transition-colors hover:bg-accent-hover"
          disabled={creating || updating}
        >
          {t('form:button-label-save')}
        </button>
      </div>
    </form>
  );
}
