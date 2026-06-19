import Layout from '@/components/layouts/owner';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import MessagePageIndex from '@/components/message/index';

export default function ShopMessagePage() {
  return (
    <>
      <MessagePageIndex />
    </>
  );
}

ShopMessagePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};

ShopMessagePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
