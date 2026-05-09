import Container from "@components/ui/container";
import { getLayout } from "@components/layout/layout";
import PageHeader from "@components/ui/page-header";
import { useTranslation } from "next-i18next";
// import { readFileSync } from "fs";
// import Sitemap from "@containers/sitemap";
import Image from "next/image";


export default function SiteMapPage() {

  const { t } = useTranslation("common");
  return (
    <>
      <PageHeader pageHeader={t("sitemap")} />

      <Container>
        <Image
          src={"/assets/images/sitemap.png"}
          width={1624}
          height={1200}
          alt={""}
          className="h-full"  
        />
      </Container>
    </>
  );
}


// export async function getStaticProps() {
//   const data = JSON.parse(readFileSync("src/data/static/sitemap.json", 'utf8'));
//   return {
//     props: {
//       data,
//     },
//   };
// }
SiteMapPage.getLayout = getLayout;
