import Container from '@components/ui/container';
import { getLayout } from '@components/layout/layout';
import PageHeader from '@components/ui/page-header';
import { useTranslation } from 'next-i18next';
import AboutBlock1 from '@containers/about-block1';

export { getStaticProps } from '@framework/common.ssr';

export default function aProposPage() {
  const { t } = useTranslation('common');

  return (
    <>
      <PageHeader
        pageHeader={t('refunds-changes')}
        pageBackground="/assets/images/refund_remboursement.png"
      />

      <Container>
        <AboutBlock1
          aboutTitle={t('text-artisanat-refund-title')}
          aboutDescription={t('text-artisanat-refund-description')}
          aboutImage="/assets/images/refunds.png"
        />
      </Container>
    </>
  );
}

aProposPage.getLayout = getLayout;
