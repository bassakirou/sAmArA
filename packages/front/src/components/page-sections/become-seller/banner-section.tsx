import Container from '@components/ui/container';
import Link from '@components/ui/link';
import Image from 'next/image';
import { BecomeSellerSectionProps, getImageSrc } from './utils';

export default function BannerSection({ data, registerUrl }: BecomeSellerSectionProps) {
  if (!data?.title && !data?.image) {
    return null;
  }

  return (
    <section className="border-b border-slate-200 bg-white">
      <Container>
        <div className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            {data.newsTickerTitle ? (
              <div className="mb-4 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                {data.newsTickerURL ? (
                  <Link href={data.newsTickerURL}>{data.newsTickerTitle}</Link>
                ) : (
                  data.newsTickerTitle
                )}
              </div>
            ) : null}
            <h1 className="mb-5 text-4xl font-bold leading-tight text-heading lg:text-6xl">
              {data.title}
            </h1>
            <p className="mb-8 whitespace-pre-line text-base leading-8 text-body">
              {data.description}
            </p>
            <div className="flex flex-wrap gap-4">
              {(data.button1Name || 'Commencer maintenant') && (
                <Link href={data.button1Link || registerUrl} className="rounded bg-accent px-6 py-3 font-semibold text-light">
                  {data.button1Name || 'Commencer maintenant'}
                </Link>
              )}
              {data.button2Name ? (
                <Link href={data.button2Link || '#become-seller-faq'} className="rounded border border-slate-300 px-6 py-3 font-semibold text-heading">
                  {data.button2Name}
                </Link>
              ) : null}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-emerald-50 p-6">
            <Image src={getImageSrc(data.image)} alt={data.title || 'Become seller'} width={700} height={700} className="h-auto w-full rounded-2xl object-cover" />
          </div>
        </div>
      </Container>
    </section>
  );
}
