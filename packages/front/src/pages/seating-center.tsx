import Container from "@components/ui/container";
import { getLayout } from "@components/layout/layout";
import PageHeader from "@components/ui/page-header";
import { useTranslation } from "next-i18next";
import FeatureSamaraBlock from "@containers/feature-samara-block";
import AboutBlock1 from "@containers/about-block1";
import AboutBlock2 from "@containers/about-block2";

export { getStaticProps } from '@framework/common.ssr';

export default function aProposPage() {
  const { t } = useTranslation("common");
  
  return (
    <>
      <PageHeader pageHeader={t("seating-center")} />
      
      <Container>
        <FeatureSamaraBlock />
        <AboutBlock1 />
        <AboutBlock2 />
      </Container>
    </>
  );
}

aProposPage.getLayout = getLayout;
