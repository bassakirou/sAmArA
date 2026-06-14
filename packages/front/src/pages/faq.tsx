import Container from '@components/ui/container';
import { getLayout } from '@components/layout/layout';
import Accordion from '@components/common/accordion';
import PageHeader from '@components/ui/page-header';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import client from '@framework/utils/index';

type Props = {
  faqs: { title: string; description: string }[];
};

export default function FAQ({ faqs }: Props) {
  return (
    <>
      <PageHeader
        pageHeader="text-page-faq"
        pageBackground="/assets/images/FAQ.png"
      />
      <Container>
        <div className="py-16 lg:py-20 px-0 max-w-5xl mx-auto space-y-4">
          <Accordion
            items={faqs.map((item) => ({
              title: item.title,
              content: item.description,
            }))}
            translatorNS="faq"
          />
        </div>
      </Container>
    </>
  );
}

FAQ.getLayout = getLayout;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(API_ENDPOINTS.SETTINGS, () =>
    client.settings.findAll()
  );
  const faqResponse = await client.faqs.all({
    language: locale!,
    type: 'customer',
    limit: 100,
  } as any);

  return {
    props: {
      faqs: faqResponse?.data ?? [],
      ...(await serverSideTranslations(locale!, [
        'common',
        'menu',
        'forms',
        'footer',
        'faq',
      ])),
    },
  };
};
