import Navbar from '@/components/layouts/navigation/top-navbar';
import OwnerInformation from '@/components/user/user-details';
import MobileNavigation from '@/components/layouts/navigation/mobile-navigation';
import SubscriptionCtaBanner from '@/components/subscription/subscription-cta-banner';
import { useRouter } from 'next/router';

const OwnerLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { locale } = router;
  const dir = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';
  const isMessageRoute =
    router.pathname === '/shop-message' ||
    router.pathname === '/shop-message/[id]';
  return (
    <div
      className="flex min-h-screen flex-col bg-gray-100 transition-colors duration-150"
      dir={dir}
    >
      <Navbar />
      <MobileNavigation>
        <OwnerInformation />
      </MobileNavigation>

      <div className="flex flex-1 pt-20">
        <aside className="xl:w-76 fixed bottom-0 hidden h-full w-72 overflow-y-auto bg-white px-4 pt-22 shadow ltr:left-0 ltr:right-auto rtl:right-0 rtl:left-auto lg:block">
          <OwnerInformation />
        </aside>
        <main className="ltr:xl:pl-76 rtl:xl:pr-76 w-full ltr:lg:pl-72 rtl:lg:pr-72 rtl:lg:pl-0">
          <div className={`h-full ${isMessageRoute ? 'p-0 md:p-8' : 'p-5 md:p-8'}`}>
            {!isMessageRoute ? <SubscriptionCtaBanner /> : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default OwnerLayout;
