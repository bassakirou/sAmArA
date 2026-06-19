import Layout from '@/components/layouts/admin';
import CreateOrUpdatePrivacyPolicyForm from '@/components/privacy-policy/privacy-policy-form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';

export default function CreatePrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-create-privacy-policy')}
        </h1>
      </div>
      <CreateOrUpdatePrivacyPolicyForm />
    </>
  );
}

CreatePrivacyPolicyPage.authenticate = {
  permissions: adminOnly,
};
CreatePrivacyPolicyPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
