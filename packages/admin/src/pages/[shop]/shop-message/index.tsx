import ShopLayout from '@/components/layouts/shop';
import MessagePageIndex from '@/components/message/index';
import { Routes } from '@/config/routes';
import { useShopQuery } from '@/data/shop';
import { useVendorSubscriptionStatusQuery } from '@/data/vendor-subscription';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  isStoreOwner,
  isSuperAdmin,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ShopMessagePage() {
  const router = useRouter();
  const shopSlug =
    typeof router.query.shop === 'string' ? router.query.shop : undefined;
  const { permissions } = getAuthCredentials();
  const isOwner = isStoreOwner(permissions);
  const isSuperAdminUser = isSuperAdmin(permissions);
  const { data: currentShop } = useShopQuery(
    { slug: shopSlug ?? '' },
    { enabled: Boolean(shopSlug) }
  );
  const isPlanRestrictionsExempt = Boolean(
    currentShop?.is_plan_restrictions_exempt
  );
  const { data: vendorSubscriptionStatus, isLoading } =
    useVendorSubscriptionStatusQuery({
      enabled: isOwner,
    });

  useEffect(() => {
    if (!isOwner) return;
    if (isSuperAdminUser) return;
    if (isPlanRestrictionsExempt) return;
    if (isLoading) return;
    const trialEndsAt = vendorSubscriptionStatus?.trial_ends_at
      ? new Date(vendorSubscriptionStatus.trial_ends_at)
      : null;
    const trialActive =
      trialEndsAt && !Number.isNaN(trialEndsAt.getTime())
        ? Date.now() <= trialEndsAt.getTime()
        : false;
    const perms = Array.isArray(
      vendorSubscriptionStatus?.active_subscription_plan?.permissions
    )
      ? vendorSubscriptionStatus.active_subscription_plan.permissions
      : [];
    const allowed =
      trialActive || perms.includes('all') || perms.includes('chat_negotiation');
    if (!allowed && shopSlug) {
      router.replace(`/${shopSlug}${Routes.subscriptions.list}`);
    }
  }, [
    isOwner,
    isSuperAdminUser,
    isPlanRestrictionsExempt,
    isLoading,
    router,
    shopSlug,
    vendorSubscriptionStatus,
  ]);

  if (isOwner && !isSuperAdminUser && !isPlanRestrictionsExempt && isLoading) {
    return null;
  }

  return (
    <>
      <MessagePageIndex />
    </>
  );
}

ShopMessagePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};

ShopMessagePage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
