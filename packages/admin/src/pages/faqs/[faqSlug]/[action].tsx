import Layout from '@/components/layouts/admin';
import { useRouter } from 'next/router';
import CreateOrUpdateFaqForm from '@/components/faq/faq-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useFaqQuery } from '@/data/faq';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Config } from '@/config';
import { adminOnly } from '@/utils/auth-utils';

export default function UpdateFaqPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();

  const { faq, loading, error } = useFaqQuery({
    slug: query.faqSlug as string,
    language:
      query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-faq')}
        </h1>
      </div>
      <CreateOrUpdateFaqForm initialValues={faq} />
    </>
  );
}

UpdateFaqPage.authenticate = {
  permissions: adminOnly,
};
UpdateFaqPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});

