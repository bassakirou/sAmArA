import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import Label from '@/components/ui/label';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import SelectInput from '@/components/ui/select-input';
import ValidationError from '@/components/ui/form-validation-error';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { faqValidationSchema } from './faq-validation-schema';
import { Faq, FaqType } from '@/types';
import { useCreateFaqMutation, useUpdateFaqMutation } from '@/data/faq';

type FormValues = {
  title: string;
  description: string;
  type: { label: string; value: FaqType } | null;
  order: number;
};

const defaultValues = {
  title: '',
  description: '',
  type: null,
  order: 0,
};

type IProps = {
  initialValues?: Faq | null;
};

export default function CreateOrUpdateFaqForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const faqTypeOptions = [
    { label: t('form:faq-type-customer'), value: FaqType.Customer },
    { label: t('form:faq-type-seller'), value: FaqType.Seller },
  ];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
          title: initialValues.title,
          description: initialValues.description,
          type:
            faqTypeOptions.find((opt) => opt.value === initialValues.type) ??
            null,
          order: initialValues.order ?? 0,
        }
      : defaultValues,
    resolver: yupResolver(faqValidationSchema),
  });

  const { mutate: createFaq, isLoading: creating } = useCreateFaqMutation();
  const { mutate: updateFaq, isLoading: updating } = useUpdateFaqMutation();

  const onSubmit = (values: FormValues) => {
    const input = {
      language: router.locale,
      title: values.title,
      description: values.description,
      type: values.type?.value!,
      order: Number(values.order ?? 0),
    };

    if (
      !initialValues ||
      !initialValues.translated_languages.includes(router.locale!)
    ) {
      createFaq({
        ...input,
        ...(initialValues?.slug && { slug: initialValues.slug }),
      } as any);
      return;
    }

    updateFaq({
      ...input,
      id: initialValues.id,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:item-description')}
          details={`${initialValues ? t('form:item-description-update') : t('form:item-description-add')} ${t('form:faq-description-help-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-title')}
            {...register('title')}
            error={t(errors.title?.message!)}
            variant="outline"
            className="mb-5"
          />

          <div className="mb-5">
            <Label>{t('form:input-label-type')}</Label>
            <SelectInput
              name="type"
              control={control}
              options={faqTypeOptions}
            />
            <ValidationError message={t(errors.type?.message)} />
          </div>

          <Input
            label={t('form:input-label-display-order')}
            {...register('order', { valueAsNumber: true })}
            type="number"
            variant="outline"
            className="mb-5"
            error={t(errors.order?.message!)}
          />

          <TextArea
            label={t('form:input-label-description')}
            {...register('description')}
            error={t(errors.description?.message!)}
            variant="outline"
          />
        </Card>
      </div>

      <div className="mb-4 text-end">
        <Button loading={creating || updating} disabled={creating || updating}>
          {initialValues ? t('form:button-label-update-faq') : t('form:button-label-add-faq')}
        </Button>
      </div>
    </form>
  );
}

