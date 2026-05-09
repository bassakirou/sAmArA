import { getLayout } from '@components/layout/layout';
import Container from '@components/ui/container';
import PageSellerBanner from '@components/ui/page-seller-banner';
import BecomeOwnerBlock from '@containers/become-owner-block';
import { useTranslation } from 'next-i18next';
import PageSellerDescription from '@components/ui/page-seller-description';
import PageSellerMoney from '@components/ui/page-seller-money';
import Accordion from '@components/common/accordion';
import { faqSeller } from '@settings/faq.settings';

export { getStaticProps } from '@framework/homepage/modern';

function DevenirVendeur() {
  const { t } = useTranslation('common');
  return (
    <>
      <PageSellerBanner pageBackground={'/assets/images/devenir-vendeur.jpg'} />

      <Container>
        <PageSellerDescription />
        <PageSellerMoney />
        <h2 className="px-24 mt-20 mb-12 text-xl font-semibold text-center sm:text-3xl title-font">
          {t('text-page-faq')}
        </h2>
        <div className="max-w-5xl px-0 py-12 mx-auto space-y-4 lg:py-20">
          <Accordion
            items={faqSeller}
            translatorNS="faq"
            variant="transparent"
          />
        </div>
      </Container>
      <BecomeOwnerBlock />
    </>
  );
}

export default DevenirVendeur;

DevenirVendeur.getLayout = getLayout;
