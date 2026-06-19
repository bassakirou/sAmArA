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
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Routes } from '@/config/routes';

type FaqSection = {
  title: string;
  description: string;
  order: number;
};

type FormValues = {
  title: string;
  description: string;
  order: number;
};

const normalizeFaqs = (value: unknown): FaqSection[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const faq = item as Record<string, unknown>;
      return {
        title:
          typeof faq.title === 'string'
            ? faq.title
            : typeof faq.question === 'string'
              ? faq.question
              : '',
        description:
          typeof faq.description === 'string'
            ? faq.description
            : typeof faq.answer === 'string'
              ? faq.answer
              : '',
        order: Number.isFinite(Number(faq.order)) ? Number(faq.order) : index,
      };
    })
    .filter((item): item is FaqSection => item !== null);
};

export default function ShopFaqCreatePage() {
  const { t } = useTranslation(['common', 'form']);
  const router = useRouter();
  const { shop } = router.query;

  const { data, isLoading, error } = useShopQuery(
    { slug: String(shop) },
    { enabled: Boolean(shop) }
  );
  const { mutateAsync: updateShop, isLoading: saving } = useUpdateShopMutation();

  const faqs = useMemo(
    () => normalizeFaqs((data?.settings as any)?.faqs),
    [data?.settings]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      order: faqs.length,
    },
  });

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const onSubmit = async (values: FormValues) => {
    if (!data) return;

    const nextFaqs: FaqSection[] = [
      ...faqs,
      {
        title: values.title.trim(),
        description: values.description.trim(),
        order: Number(values.order ?? faqs.length),
      },
    ].filter((item) => item.title || item.description);

    try {
      await updateShop({
        id: data.id,
        name: data.name,
        settings: {
          ...(data.settings ?? {}),
          faqs: nextFaqs,
        },
      } as any);
      toast.success(t('common:successfully-created'));
      await router.push(`/${String(shop)}${Routes.faq.list}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t('common:something-went-wrong'));
    }
  };

  return (
    <>
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('common:sidebar-nav-item-add-faq')}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="my-5 flex flex-wrap sm:my-8">
          <Description
            title={t('form:item-description')}
            details={t('common:text-manage-shop-faqs')}
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

ShopFaqCreatePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ShopFaqCreatePage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});

