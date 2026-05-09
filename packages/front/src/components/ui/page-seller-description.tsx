import { useTranslation } from 'next-i18next';
import Button from '@components/ui/button';
import Link from '@components/ui/link';
import FeatureSellerBlock from '@containers/feature-seller-block';

interface HeaderProps {
  sectionHeader?: string;
}

const PageSellerDescription: React.FC<HeaderProps> = ({
  sectionHeader = 'text-page-seller-description-header',
}) => {
  const { t } = useTranslation('common');
  return (
    <div className="flex justify-center p-6 md:p-10 2xl:p-8 relative bg-no-repeat bg-center bg-cover">
      <section className="mx-auto max-w-[1920px] text-gray-600 body-font">
        {' '}
        <div className="container px-16 py-24 mx-auto">
          <h1 className="sm:text-3xl text-2xl font-medium title-font text-center text-gray-900 mb-20">
            {t(`${sectionHeader}`)}
          </h1>

          <FeatureSellerBlock />
        </div>
      </section>
    </div>
  );
};

export default PageSellerDescription;
