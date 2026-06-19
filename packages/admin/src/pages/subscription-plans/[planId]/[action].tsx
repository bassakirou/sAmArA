import Layout from '@/components/layouts/admin';
import SubscriptionPlanForm from '@/components/subscription-plan/subscription-plan-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useSubscriptionPlanQuery } from '@/data/subscription-plan';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

export default function UpdateSubscriptionPlanPage() {
  const { t } = useTranslation();
  const {
    query: { planId },
  } = useRouter();

  const { data, isLoading, error } = useSubscriptionPlanQuery(String(planId), {
    enabled: !!planId,
  });

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as any).message} />;

  return <SubscriptionPlanForm initialValues={data as any} />;
}

UpdateSubscriptionPlanPage.authenticate = {
  permissions: adminOnly,
};

UpdateSubscriptionPlanPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});

