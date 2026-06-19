import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { termsAndConditionsValidationSchema } from './terms-and-conditions-validation-schema';
import { TermsAndCondition } from '@/types';
import {
  useCreateTermsAndConditionsMutation,
  useUpdateTermsAndConditionsMutation,
} from '@/data/terms-and-conditions';

type FormValues = {
  title: string;
  description: string;
  order: number;
};

const defaultValues = {
  title: '',
  description: '',
  order: 0,
};

type IProps = {
  initialValues?: TermsAndCondition | null;
};

export default function CreateOrUpdateTermsAndConditionsForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
          title: initialValues.title,
          description: initialValues.description,
          order: initialValues.order ?? 0,
        }
      : defaultValues,
    resolver: yupResolver(termsAndConditionsValidationSchema),
  });

  const { mutate: create, isLoading: creating } = useCreateTermsAndConditionsMutation();
  const { mutate: update, isLoading: updating } = useUpdateTermsAndConditionsMutation();

  const onSubmit = (values: FormValues) => {
    const input = {
      language: router.locale,
      title: values.title,
      description: values.description,
      order: Number(values.order ?? 0),
    };

    if (
      !initialValues ||
      !initialValues.translated_languages.includes(router.locale!)
    ) {
      create({
        ...input,
        ...(initialValues?.slug && { slug: initialValues.slug }),
      } as any);
      return;
    }

    update({
      ...input,
      id: initialValues.id,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:item-description')}
          details={`${initialValues ? t('form:item-description-update') : t('form:item-description-add')} ${t('form:terms-and-conditions-description-help-text')}`}
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
          {initialValues
            ? t('form:button-label-update-terms-and-conditions')
            : t('form:button-label-add-terms-and-conditions')}
        </Button>
      </div>
    </form>
  );
}

