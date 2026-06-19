import Layout from '@/components/layouts/admin';
import CreateOrUpdateTermsAndConditionsForm from '@/components/terms-and-conditions/terms-and-conditions-form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';

export default function CreateTermsAndConditionsPage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-create-terms-and-conditions')}
        </h1>
      </div>
      <CreateOrUpdateTermsAndConditionsForm />
    </>
  );
}

CreateTermsAndConditionsPage.authenticate = {
  permissions: adminOnly,
};
CreateTermsAndConditionsPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});

