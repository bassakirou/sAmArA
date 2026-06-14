import Navbar from '@/components/layouts/navigation/top-navbar';
import { Fragment } from 'react';
import MobileNavigation from '@/components/layouts/navigation/mobile-navigation';
import { siteSettings } from '@/settings/site.settings';
import { useTranslation } from 'next-i18next';
import SidebarItem from '@/components/layouts/navigation/sidebar-item';
import { useRouter } from 'next/router';

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;
  const dir = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';
  const isMessageRoute =
    router.pathname === '/message' || router.pathname === '/message/[id]';
  const adminSections = Object.values(siteSettings.sidebarLinks.admin);

  const SidebarItemMap = () => (
    <Fragment>
      {adminSections.map((section: any) => {
        const items = Array.isArray(section?.childMenu)
          ? section.childMenu
          : [];
        if (!items.length) return null;
        return (
          <div key={section.label} className="space-y-1">
            <div className="pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {t(section.label)}
            </div>
            {items.map((item: any) => (
              <SidebarItem
                key={`${item.label}-${item.href ?? 'group'}`}
                item={item}
              />
            ))}
          </div>
        );
      })}
    </Fragment>
  );

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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
