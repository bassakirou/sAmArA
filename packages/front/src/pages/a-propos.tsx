import Container from '@components/ui/container';
import { getLayout } from '@components/layout/layout';
import PageHeader from '@components/ui/page-header';
import { useTranslation } from 'next-i18next';
import FeatureSamaraBlock from '@containers/feature-samara-block';
import AboutBlock1 from '@containers/about-block1';
import AboutBlock2 from '@containers/about-block2';

export { getStaticProps } from '@framework/common.ssr';

export default function aProposPage() {
  const { t } = useTranslation('common');

  return (
    <>
      <PageHeader pageHeader={t('text-about')} />

      <Container>
        <FeatureSamaraBlock />
        <AboutBlock1
          aboutTitle={t('text-artisanat-title1')}
          aboutDescription={t('text-artisanat-description1')}
          aboutImage="/assets/images/feature/artisans.svg"
        />
        <AboutBlock2
          aboutTitle={t('text-artisanat-title2')}
          aboutDescription={t('text-artisanat-description2')}
          aboutImage="/assets/images/feature/potier.svg"
        />
      </Container>
    </>
  );
}

aProposPage.getLayout = getLayout;
