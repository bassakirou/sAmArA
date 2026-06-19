import AdminLayout from '@/components/layouts/admin';
import Navbar from '@/components/layouts/navigation/top-navbar';
import MobileNavigation from '@/components/layouts/navigation/mobile-navigation';
import SidebarItem from '@/components/layouts/navigation/sidebar-item';
import SubscriptionCtaBanner from '@/components/subscription/subscription-cta-banner';
import { Routes } from '@/config/routes';
import {
  getAuthCredentials,
  isSuperAdmin,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const ownerNotificationLinks = [
  {
    href: Routes.dashboard,
    label: 'sidebar-nav-item-dashboard',
    icon: 'DashboardIcon',
  },
  {
    href: Routes.adminMyShops,
    label: 'sidebar-nav-item-my-shops',
    icon: 'MyShopIcon',
  },
  {
    href: Routes.shop.create,
    label: 'sidebar-nav-item-add-shop',
    icon: 'ShopIcon',
  },
  {
    href: Routes.subscriptions.list,
    label: 'sidebar-nav-item-subscription-plans',
    icon: 'CouponsIcon',
  },
  {
    href: '/notifications',
    label: 'common:text-notifications',
    icon: 'StoreNoticeIcon',
  },
  {
    href: Routes.profileUpdate,
    label: 'sidebar-nav-item-profile',
    icon: 'UsersIcon',
  },
];

const OwnerNotificationsLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const dir = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';

  return (
    <div
      className="flex min-h-screen flex-col bg-gray-100 transition-colors duration-150"
      dir={dir}
    >
      <Navbar />
      <MobileNavigation>
        <div className="space-y-1">
          <div className="pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('sidebar-group-main')}
          </div>
          {ownerNotificationLinks.map((item) => (
            <SidebarItem key={item.href} item={item} />
          ))}
        </div>
      </MobileNavigation>

      <div className="flex flex-1 pt-20">
        <aside className="xl:w-76 fixed bottom-0 hidden h-full w-72 overflow-y-auto bg-white px-4 pt-22 shadow ltr:left-0 ltr:right-auto rtl:right-0 rtl:left-auto lg:block">
          <div className="flex flex-col space-y-6 py-3">
            <div className="space-y-1">
              <div className="pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('sidebar-group-main')}
              </div>
              {ownerNotificationLinks.map((item) => (
                <SidebarItem key={item.href} item={item} />
              ))}
            </div>
          </div>
        </aside>
        <main className="ltr:xl:pl-76 rtl:xl:pr-76 w-full ltr:lg:pl-72 rtl:lg:pr-72 rtl:lg:pl-0">
          <div className="h-full p-5 md:p-8">
            <SubscriptionCtaBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const NotificationsLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const auth = getAuthCredentials();

  if (isSuperAdmin(auth)) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <OwnerNotificationsLayout>{children}</OwnerNotificationsLayout>;
};

export default NotificationsLayout;
