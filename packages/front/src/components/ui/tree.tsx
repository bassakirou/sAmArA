import Container from "@components/ui/container";
import { getLayout } from "@components/layout/layout";
import PageHeader from "@components/ui/page-header";
import { useTranslation } from "next-i18next";
import { readFileSync } from "fs";
import Sitemap from "@containers/sitemap";


export default function siteMapPage({ data }: any) {
  const { tree } = data;

  const { t } = useTranslation("common");
  return (
    <>
      <PageHeader pageHeader={t("sitemap")} />

      <Container>
        <Sitemap tree={tree} />
      </Container>
    </>
  );
}


export async function getStaticProps() {
  const data = JSON.parse(readFileSync("src/data/static/sitemap.json", 'utf8'));
  return {
    props: {
      data,
    },
  };
}
siteMapPage.getLayout = getLayout;
