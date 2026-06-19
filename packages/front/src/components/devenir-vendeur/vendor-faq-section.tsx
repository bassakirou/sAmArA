import Accordion from '@components/common/accordion';
import Alert from '@components/ui/alert';
import Spinner from '@components/ui/loaders/spinner/spinner';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import client from '@framework/utils/index';
import { Faq } from '@type/index';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';

export default function VendorFaqSection() {
  const { locale } = useRouter();
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery(
    [API_ENDPOINTS.FAQS, 'seller', locale],
    () =>
      client.faqs.all({
        language: locale,
        type: 'seller',
        limit: 100,
      } as any),
    {
      staleTime: 60_000,
    }
  );

  const faqs = ((data?.data ?? []) as Faq[])
    .slice()
    .sort((left, right) => Number(left.order ?? 0) - Number(right.order ?? 0));

  return (
    <section aria-labelledby="vendor-faq-heading" className="mt-20">
      <h2 className="mb-12 px-6 text-center text-xl font-semibold sm:px-24 sm:text-3xl title-font" id="vendor-faq-heading">
        FAQs vendeurs
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner showText={false} />
        </div>
      ) : null}

      {isError ? (
        <Alert
          variant="errorOutline"
          message={error instanceof Error ? error.message : 'Impossible de charger les FAQs vendeurs.'}
          className="mx-auto max-w-5xl"
        />
      ) : null}

      {!isLoading && !isError ? (
        faqs.length ? (
          <div className="mx-auto max-w-5xl space-y-4 px-0 py-12 lg:py-20">
            <Accordion
              items={faqs.map((item) => ({
                title: item.title,
                content: item.description,
              }))}
              translatorNS="faq"
              variant="transparent"
            />
          </div>
        ) : (
          <Alert
            variant="infoOutline"
            message="Aucune FAQ vendeur n'est disponible pour le moment."
            className="mx-auto max-w-5xl"
          />
        )
      ) : null}
    </section>
  );
}
