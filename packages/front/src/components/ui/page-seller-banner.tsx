import { useTranslation } from 'next-i18next';
import Button from '@components/ui/button';
import Link from '@components/ui/link';

interface HeaderProps {
  pageSellerHeader?: string;
  pageBackground?: string;
}

const PageSellerBanner: React.FC<HeaderProps> = ({
  pageSellerHeader = 'text-page-seller-header',
  pageBackground = '/assets/images/page-header.jpg',
}) => {
  const { t } = useTranslation('common');
  return (
    <div
      className="flex justify-center p-6 md:p-10 2xl:p-8 relative bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: `url(${pageBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <div className="absolute top-0 ltr:left-0 rtl:right-0 bg-black w-full h-full opacity-50 transition-opacity duration-500 group-hover:opacity-80" />
      <div className="w-full flex flex-col items-center justify-center relative z-10 py-10 md:py-14 lg:py-20 xl:py-24 2xl:py-32 xl:px-52 2xl:px-64 lg:px-32 md:px-20">
        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-white text-center">
          {t(`${pageSellerHeader}`)}
        </h1>
        <div className="flex justify-center">
          <Button
            type="submit"
            className="h-10 mt-1 text-sm lg:text-base w-full sm:w-auto"
          >
            <Link
              href="https://admin.samara-shopping.com/register"
              //href={`${process?.env?.NEXT_ADMIN_SITE_URL}/register`}
              target="_blank"
            >
              {t('text-become-owner-action')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageSellerBanner;
