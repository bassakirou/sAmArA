import Container from '@components/ui/container';
import { getLayout } from '@components/layout/layout';
import PageHeader from '@components/ui/page-header';
import { useTranslation } from 'next-i18next';
import AboutBlock1 from '@containers/about-block1';
import AboutBlock2 from '@containers/about-block2';

export { getStaticProps } from '@framework/common.ssr';

export default function aProposPage() {
  const { t } = useTranslation('common');

  return (
    <>
      <PageHeader
        pageHeader={t('delivery')}
        pageBackground="/assets/images/livraison_colis.jpg"
      />

      <Container>
        <AboutBlock1
          aboutTitle={t('text-artisanat-expedition-title')}
          aboutDescription={t('text-artisanat-expedition-description')}
          aboutImage="/assets/images/delevery-1.png"
        />
        <AboutBlock2
          aboutTitle={t('text-artisanat-deliery-title')}
          aboutDescription={t('text-artisanat-deliery-description')}
          aboutImage="/assets/images/delevery-2.png"
        />
      </Container>
    </>
  );
}

aProposPage.getLayout = getLayout;
