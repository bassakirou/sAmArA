import ShopLayout from '@/components/layouts/shop';
import VendorSubscriptionCheckoutPage from '@/pages/subscriptions/checkout';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function ShopSubscriptionCheckoutPage() {
  return <VendorSubscriptionCheckoutPage />;
}

ShopSubscriptionCheckoutPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ShopSubscriptionCheckoutPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

