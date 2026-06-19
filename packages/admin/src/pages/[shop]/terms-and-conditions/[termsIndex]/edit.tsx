import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import ErrorMessage from '@/components/ui/error-message';
import Input from '@/components/ui/input';
import Loader from '@/components/ui/loader/loader';
import TextArea from '@/components/ui/text-area';
import Button from '@/components/ui/button';
import ShopLayout from '@/components/layouts/shop';
import { useShopQuery, useUpdateShopMutation } from '@/data/shop';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Routes } from '@/config/routes';

type TermsSection = {
  title: string;
  description: string;
  order: number;
};

type FormValues = {
  title: string;
  description: string;
  order: number;
};

const normalizeTerms = (value: unknown): TermsSection[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const section = item as Record<string, unknown>;
      return {
        title: typeof section.title === 'string' ? section.title : '',
        description:
          typeof section.description === 'string' ? section.description : '',
        order:
          Number.isFinite(Number(section.order)) ? Number(section.order) : index,
      };
    })
    .filter((item): item is TermsSection => item !== null);
};

export default function ShopTermsEditPage() {
  const { t } = useTranslation(['common', 'form']);
  const router = useRouter();
  const { shop, termsIndex } = router.query;
  const index = Number(termsIndex);

  const { data, isLoading, error } = useShopQuery(
    { slug: String(shop) },
    { enabled: Boolean(shop) }
  );
  const { mutateAsync: updateShop, isLoading: saving } = useUpdateShopMutation();

  const sections = useMemo(
    () => normalizeTerms((data?.settings as any)?.terms_and_conditions),
    [data?.settings]
  );

  const currentSection = Number.isFinite(index) ? sections[index] : undefined;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      order: 0,
    },
  });

  useEffect(() => {
    if (!currentSection) return;
    reset({
      title: currentSection.title ?? '',
      description: currentSection.description ?? '',
      order: Number(currentSection.order ?? index),
    });
  }, [currentSection, index, reset]);

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  if (!currentSection) {
    return <ErrorMessage message={t('common:something-went-wrong')} />;
  }

  const onSubmit = async (values: FormValues) => {
    if (!data) return;

    const nextSections = sections.map((item, idx) =>
      idx === index
        ? {
            title: values.title.trim(),
            description: values.description.trim(),
            order: Number(values.order ?? idx),
          }
        : item
    );

    try {
      await updateShop({
        id: data.id,
        name: data.name,
        settings: {
          ...(data.settings ?? {}),
          terms_and_conditions: nextSections,
        },
      } as any);
      toast.success(t('common:successfully-updated'));
      await router.push(`/${String(shop)}${Routes.termsAndConditions.list}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t('common:something-went-wrong'));
    }
  };

  return (
    <>
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('common:text-edit')}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="my-5 flex flex-wrap sm:my-8">
          <Description
            title={t('common:sidebar-nav-item-terms-and-conditions')}
            details={t('common:text-manage-shop-terms')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <Input
              label={t('form:input-label-title')}
              variant="outline"
              className="mb-5"
              {...register('title', { required: true })}
              error={errors.title ? t('form:error-title-required') : undefined}
            />

            <Input
              label={t('form:input-label-display-order')}
              type="number"
              variant="outline"
              className="mb-5"
              {...register('order', { valueAsNumber: true })}
            />

            <TextArea
              label={t('form:input-label-description')}
              variant="outline"
              {...register('description')}
            />
          </Card>
        </div>

        <div className="mb-4 text-end">
          <Button loading={saving} disabled={saving}>
            {t('common:text-save')}
          </Button>
        </div>
      </form>
    </>
  );
}

ShopTermsEditPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ShopTermsEditPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});

