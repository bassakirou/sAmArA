import ButtonSamara from '@components/ui/button-samara';
import Link from '@components/ui/link';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

interface BecomeOwnerProps {
  className?: string;
}

const BecomeOwnerBlock: React.FC<BecomeOwnerProps> = ({
  className = 'devenir-vendeur my-32 relative',
}) => {
  const { t } = useTranslation('common');
  return (
    <>
      <div
        className={`${className} flex justify-center p-6 md:p-10 2xl:p-8 relative bg-no-repeat bg-center bg-cover`}
        style={{
          backgroundImage: 'url(/assets/images/bg_artisan.jpg)',
        }}
      >
        <span className="absolute w-1/2 flex justify-center motif-top">
          <Image
            src={'/assets/images/Polygone-menu.png'}
            width={200}
            height={32}
            alt={''}
          />
        </span>
        <div className="overlay flex absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black opacity-20 z-0"></div>
        <div className="img-abs-1">
          <Image
            src={'/assets/images/artisan2.png'}
            width={459}
            height={369}
            alt={''}
            className="object-cover"
          />
        </div>
        <div className="img-abs-2">
          <Image
            src={'/assets/images/artisan1.png'}
            width={458}
            height={369}
            alt={''}
            className="object-cover"
          />
        </div>
        <div className="top-0 ltr:left-0 rtl:right-0  w-full h-full duration-500 group-hover:opacity-80 z-10">
          <div className="flex items-center justify-center flex-col relative z-10 py-10 md:py-14 lg:py-20 xl:py-24 2xl:py-32">
            <span className="qst font-satisfy font-normal mb-3 h-10 bg-black text-white flex items-center px-4 z-10">
              {t('text-become-owner-header')}
            </span>
            <h2 className="text-xl md:text-2xl lg:text-5xl font-bold text-white text-center px-36 shadow-teal-900 drop-shadow-lg">
              {t('text-become-owner-desc')}
            </h2>

            <ButtonSamara type="submit" variant="normal" className="mt-6">
              <Link
                href="https://admin.samara-shopping.com/register"
                // href={`${process?.env?.NEXT_ADMIN_SITE_URL}/register`}
                target="_blank"
              >
                {t('text-become-owner-action')}
              </Link>
            </ButtonSamara>
          </div>
        </div>
      </div>
    </>
  );
};

export default BecomeOwnerBlock;
