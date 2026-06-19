import ShopLayout from '@/components/layouts/shop';
import VendorSubscriptionsPage from '@/pages/subscriptions';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function ShopSubscriptionsPage() {
  return <VendorSubscriptionsPage />;
}

ShopSubscriptionsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ShopSubscriptionsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

