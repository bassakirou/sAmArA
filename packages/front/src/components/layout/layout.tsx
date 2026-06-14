import Header from '@components/layout/header/header';
import Footer from '@components/layout/footer/footer';
import MobileNavigation from '@components/layout/mobile-navigation/mobile-navigation';
import Search from '@components/common/search';
import ChatWidget from '@components/chat/chat-widget';
import { useRouter } from 'next/router';

const SiteLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const showChatLauncher = router.pathname === '/products/[slug]';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main
        className="relative flex-grow"
        style={{
          minHeight: '-webkit-fill-available',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </main>
      <Footer />
      <MobileNavigation />
      <Search />
      <ChatWidget showLauncher={showChatLauncher} />
    </div>
  );
};

export const getLayout = (page: React.ReactElement) => (
  <SiteLayout>{page}</SiteLayout>
);

export default SiteLayout;
