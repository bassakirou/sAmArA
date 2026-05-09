import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface Props {
  className?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string;
}

const AboutBlock2: React.FC<Props> = ({
  className = ' my-28 md:mb-14 xl:mb-16',
  aboutTitle = '',
  aboutDescription = '',
  aboutImage = '',
}) => {
  const { t } = useTranslation('common');
  return (
    <div
      className={`${className} feature-about-wrapper w-full grid items-center grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 py-12 xl:py-0 sm:px-4 md:px-8 lg:px-16 xl:px-32`}
    >
      <div className="feat-img flex justify-end">
        <Image
          src={aboutImage}
          width={400}
          height={400}
          alt={t(`${aboutTitle}`)}
        />
      </div>
      <div className="feat-text-left text-left">
        <h2 className="text-xl font-bold mb-6 text-black">
          {t(`${aboutTitle}`)}
        </h2>
        <p>{t(`${aboutDescription}`)}</p>
      </div>
    </div>
  );
};

export default AboutBlock2;
