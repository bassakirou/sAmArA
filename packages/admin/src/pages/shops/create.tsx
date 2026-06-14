import AppLayout from '@/components/layouts/app';
import ShopForm from '@/components/shop/shop-form';
import { useMyShopsQuery } from '@/data/shop';
import {
  adminAndOwnerOnly,
  getAuthCredentials,
  isStoreOwner,
  isSuperAdmin,
} from '@/utils/auth-utils';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CreateShopPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const isAdminUser = isSuperAdmin(permissions);
  const isOwnerUser = isStoreOwner(permissions);
  const allowMultipleShops =
    process.env.NEXT_PUBLIC_ALLOW_MULTIPLE_SHOPS_PER_OWNER === 'true';
  const myShopsQuery = useMyShopsQuery({
    enabled: !allowMultipleShops && isOwnerUser && !isAdminUser,
  });

  useEffect(() => {
    if (allowMultipleShops) return;
    if (isAdminUser) return;
    const shops = myShopsQuery.data ?? [];
    if (!myShopsQuery.isLoading && shops.length > 0) {
      router.replace(`/${shops[0].slug}`);
    }
  }, [
    allowMultipleShops,
    isAdminUser,
    myShopsQuery.data,
    myShopsQuery.isLoading,
    router,
  ]);

  return (
    <>
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-create-shop')}
        </h1>
      </div>
      <ShopForm />
    </>
  );
}
CreateShopPage.authenticate = {
  permissions: adminAndOwnerOnly,
};
CreateShopPage.Layout = AppLayout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common', 'form'])),
  },
});
