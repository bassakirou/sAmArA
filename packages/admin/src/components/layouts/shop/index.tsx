import { Fragment } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layouts/navigation/top-navbar';
import {
  getAuthCredentials,
  hasAccess,
  isStoreOwner,
  isSuperAdmin,
} from '@/utils/auth-utils';
import SidebarItem from '@/components/layouts/navigation/sidebar-item';
import { siteSettings } from '@/settings/site.settings';
import { useTranslation } from 'next-i18next';
import MobileNavigation from '@/components/layouts/navigation/mobile-navigation';
import SubscriptionCtaBanner from '@/components/subscription/subscription-cta-banner';
import { useVendorSubscriptionStatusQuery } from '@/data/vendor-subscription';
import { useShopQuery } from '@/data/shop';

const ShopLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation('common');
  const {
    query: { shop },
    locale,
    pathname,
  } = useRouter();

  const { permissions: currentUserPermissions } = getAuthCredentials();
  const isOwner = isStoreOwner(currentUserPermissions);
  const isSuperAdminUser = isSuperAdmin(currentUserPermissions);
  const {
    data: vendorSubscriptionStatus,
    isLoading: vendorSubscriptionStatusLoading,
  } = useVendorSubscriptionStatusQuery({
    enabled: isOwner,
  });
  const { data: currentShop } = useShopQuery(
    { slug: String(shop) },
    { enabled: typeof shop === 'string' && shop.length > 0 }
  );
  const isPlanRestrictionsExempt = Boolean(
    currentShop?.is_plan_restrictions_exempt
  );

  const hasPlanPermission = (permission?: string) => {
    if (!permission) return true;
    if (isSuperAdminUser) return true;
    if (!isOwner) return true;
    if (isPlanRestrictionsExempt) return true;
    const trialEndsAt = vendorSubscriptionStatus?.trial_ends_at
      ? new Date(vendorSubscriptionStatus.trial_ends_at)
      : null;
    if (trialEndsAt && !Number.isNaN(trialEndsAt.getTime())) {
      if (Date.now() <= trialEndsAt.getTime()) return true;
    }
    const perms = Array.isArray(
      vendorSubscriptionStatus?.active_subscription_plan?.permissions
    )
      ? vendorSubscriptionStatus.active_subscription_plan.permissions
      : [];
    return perms.includes('all') || perms.includes(permission);
  };

  const canViewItem = (entry: any) => {
    if (
      entry?.permissions &&
      !hasAccess(entry.permissions, currentUserPermissions)
    ) {
      return false;
    }
    if (isOwner && entry?.requiresPlanPermission) {
      if (vendorSubscriptionStatusLoading) return false;
      return hasPlanPermission(entry.requiresPlanPermission);
    }
    return true;
  };

  const shopSections = Object.values(siteSettings.sidebarLinks.shop);

  const SidebarItemMap = () => (
    <Fragment>
      {shopSections.map((section: any) => {
        const items = Array.isArray(section?.childMenu)
          ? section.childMenu.filter(canViewItem)
          : [];
        if (!items.length) return null;
        return (
          <div key={section.label} className="space-y-1">
            <div className="pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {t(section.label)}
            </div>
            {items.map((item: any) => (
              <SidebarItem
                key={item.label}
                item={item}
                shop={shop?.toString()}
                canViewItem={canViewItem}
              />
            ))}
          </div>
        );
      })}
    </Fragment>
  );

  const dir = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';
  const isMessageRoute =
    pathname === '/[shop]/shop-message/[id]' ||
    pathname === '/shop-message' ||
    pathname === '/shop-message/[id]';

  return (
    <div
      className="flex min-h-screen flex-col bg-gray-100 transition-colors duration-150"
      dir={dir}
    >
      <Navbar />
      <MobileNavigation>
        <SidebarItemMap />
      </MobileNavigation>

      <div className="flex flex-1 pt-20">
        <aside className="xl:w-76 fixed bottom-0 hidden h-full w-72 overflow-y-auto bg-white px-4 pt-22 shadow ltr:left-0 ltr:right-auto rtl:right-0 rtl:left-auto lg:block">
          <div className="flex flex-col space-y-6 py-3">
            <SidebarItemMap />
          </div>
        </aside>
        <main className="ltr:xl:pl-76 rtl:xl:pr-76 w-full ltr:lg:pl-72 rtl:lg:pr-72 rtl:lg:pl-0">
          <div
            className={`mx-auto h-full w-full max-w-[1300px] ${
              isMessageRoute ? 'p-0 md:p-8' : 'p-5 md:p-8'
            }`}
          >
            {!isMessageRoute ? (
              <SubscriptionCtaBanner
                isPlanRestrictionsExempt={isPlanRestrictionsExempt}
              />
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default ShopLayout;
