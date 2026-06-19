import Layout from '@/components/layouts/admin';
import { useRouter } from 'next/router';
import CreateOrUpdatePrivacyPolicyForm from '@/components/privacy-policy/privacy-policy-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { usePrivacyPolicyQuery } from '@/data/privacy-policy';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Config } from '@/config';
import { adminOnly } from '@/utils/auth-utils';

export default function UpdatePrivacyPolicyPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();

  const { privacyPolicy, loading, error } = usePrivacyPolicyQuery({
    slug: query.privacySlug as string,
    language:
      query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-privacy-policy')}
        </h1>
      </div>
      <CreateOrUpdatePrivacyPolicyForm initialValues={privacyPolicy} />
    </>
  );
}

UpdatePrivacyPolicyPage.authenticate = {
  permissions: adminOnly,
};
UpdatePrivacyPolicyPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
