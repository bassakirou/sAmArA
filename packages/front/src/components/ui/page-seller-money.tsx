import { useTranslation } from 'next-i18next';
import FeatureSellerMoneyBlock from '@containers/feature-seller-money-block';
import Image from 'next/image';

interface HeaderProps {
  sectionHeader?: string;
  omMomoText?: string;
}

const PageSellerMoney: React.FC<HeaderProps> = ({
  sectionHeader = 'text-page-seller-money-header',
  omMomoText = 'text-om-momo-sub-header',
}) => {
  const { t } = useTranslation('common');
  return (
    <div className="relative flex justify-center p-6 bg-green-700 bg-center bg-no-repeat bg-cover md:p-10 2xl:p-8">
      <section className="mx-auto max-w-[1920px] text-gray-600 body-font">
        {' '}
        <div className="container px-16 py-24 mx-auto">
          <h1 className="px-24 mb-12 text-2xl font-medium text-center text-white sm:text-3xl title-font">
            {t(`${sectionHeader}`)}
          </h1>
          <div className="relative flex justify-center gap-3 mx-auto mb-12 text-center align-middle">
            <img
              className="h-[55px]"
              src="/assets/images/payment/paiement-OM.png"
              alt="Orange Money"
            />
            <img
              className="h-[55px]"
              src="/assets/images/payment/paiement-MOMO.png"
              alt="MTN Mobile Money"
            />
          </div>
          <p className="text-sm text-center text-white px-44">
            {t(`${omMomoText}`)}
          </p>

          <FeatureSellerMoneyBlock />
        </div>
      </section>
    </div>
  );
};

export default PageSellerMoney;
