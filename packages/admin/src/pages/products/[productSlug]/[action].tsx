import Layout from '@/components/layouts/admin';
import CreateOrUpdateProductForm from '@/components/product/product-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import LinkButton from '@/components/ui/link-button';
import { ArrowPrev } from '@/components/icons/arrow-prev';
import { useProductQuery } from '@/data/product';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Config } from '@/config';
import { Routes } from '@/config/routes';
import { useEffect } from 'react';
import { getAuthCredentials, hasAccess, ownerAndStaffOnly } from '@/utils/auth-utils';

export default function UpdateProductPage() {
  const router = useRouter();
  const { query, locale } = router;
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();
  const isOwnerOrStaff = hasAccess(ownerAndStaffOnly, permissions);
  const listHref = query.shop
    ? `/${query.shop}${Routes.product.list}`
    : Routes.product.list;

  const {
    product,
    isLoading: loading,
    error,
  } = useProductQuery({
    slug: query.productSlug as string,
    language:
      query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
  });

  useEffect(() => {
    if (
      !isOwnerOrStaff ||
      query.shop ||
      !product?.shop?.slug ||
      !product?.slug
    ) {
      return;
    }

    router.replace(
      Routes.product.editWithoutLang(product.slug, product.shop.slug),
      undefined,
      { locale: Config.defaultLanguage }
    );
  }, [isOwnerOrStaff, product?.shop?.slug, product?.slug, query.shop, router]);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error?.message as string} />;
  return (
    <>
      <div className="border-b border-dashed border-border-base py-5 sm:py-8">
        <div className="mb-4">
          <LinkButton
            href={listHref}
            variant="outline"
            size="small"
            className="gap-2"
          >
            <ArrowPrev />
            {t('common:text-back-to-list') ?? 'Retour à la liste'}
          </LinkButton>
        </div>
        <h1 className="text-lg font-semibold text-heading">Edit Product</h1>
      </div>
      <CreateOrUpdateProductForm initialValues={product} />
    </>
  );
}
UpdateProductPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});
