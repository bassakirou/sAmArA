import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { GetStaticPathsContext, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import client from '@framework/utils/index';
import { SettingsQueryOptions } from '@type/index';

// This function gets called at build time
export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  try {
    const { data } = await client.shop.find({ is_active: '1' });
    const paths = data?.flatMap((shop: any) =>
      locales?.map((locale) => ({ params: { slug: shop.slug }, locale }))
    );
    return { paths, fallback: 'blocking' };
  } catch (error) {
    return { paths: [], fallback: 'blocking' };
  }
}

// This also gets called at build time
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  });

  try {
    await queryClient.prefetchQuery(
      [API_ENDPOINTS.SETTINGS, { language: locale }],
      ({ queryKey }) =>
        client.settings.findAll(queryKey[1] as SettingsQueryOptions)
    );
    const shop = await client.shop.findOne({
      slug: params!.slug as string,
      // language: locale,
    });
    await queryClient.prefetchInfiniteQuery(
      [API_ENDPOINTS.PRODUCTS, { shop_id: shop?.id }],
      ({ queryKey, pageParam }) =>
        client.product.all(Object.assign({}, queryKey[1], pageParam))
    );

    let termsAndConditions: any[] = [];
    let faqs: any[] = [];
    try {
      const [termsResponse, faqsResponse] = await Promise.all([
        client.termsAndConditions.all({ language: locale!, limit: 200 } as any),
        client.faqs.all({
          language: locale!,
          type: 'customer',
          limit: 100,
        } as any),
      ]);
      termsAndConditions = termsResponse?.data ?? [];
      faqs = faqsResponse?.data ?? [];
    } catch {}

    return {
      props: {
        data: { shop, termsAndConditions, faqs },
        ...(await serverSideTranslations(locale!, [
          'common',
          'menu',
          'forms',
          'footer',
        ])),
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
      revalidate: Number(process.env.REVALIDATE_DURATION) ?? 120,
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
