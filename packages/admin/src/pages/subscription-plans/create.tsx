import Layout from '@/components/layouts/admin';
import SubscriptionPlanForm from '@/components/subscription-plan/subscription-plan-form';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function CreateSubscriptionPlanPage() {
  return <SubscriptionPlanForm />;
}

CreateSubscriptionPlanPage.authenticate = {
  permissions: adminOnly,
};

CreateSubscriptionPlanPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});

