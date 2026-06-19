import Card from '@/components/common/card';
import BecameSellerForm from '@/components/became-seller/became-seller-form';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useBecameSellerQuery } from '@/data/became-seller';
import { adminOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function BecomeSellerPage() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { becameSeller, loading, error } = useBecameSellerQuery({
    language: locale!,
  });

  if (loading) {
    return <Loader text={t('common:text-loading')} />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center xl:flex-row">
        <div className="mb-4 md:w-1/4 xl:mb-0">
          <h1 className="text-xl font-semibold text-heading">
            {t('common:sidebar-nav-item-became-seller')}
          </h1>
        </div>
      </Card>
      <BecameSellerForm initialValues={(becameSeller as any)?.page_options} />
    </>
  );
}

BecomeSellerPage.authenticate = {
  permissions: adminOnly,
};

BecomeSellerPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
