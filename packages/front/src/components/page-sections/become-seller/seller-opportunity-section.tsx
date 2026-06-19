import Container from '@components/ui/container';
import Link from '@components/ui/link';
import Image from 'next/image';
import { BecomeSellerSectionProps, getImageSrc } from './utils';

export default function SellerOpportunitySection({ data, registerUrl }: BecomeSellerSectionProps) {
  if (!data?.title && !data?.image) {
    return null;
  }

  return (
    <section className="py-16">
      <Container>
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-emerald-50 p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-heading">{data.title}</h2>
            <p className="mb-6 whitespace-pre-line text-body">{data.description}</p>
            <Link href={data.buttonLink || registerUrl} className="rounded bg-accent px-6 py-3 font-semibold text-light">
              {data.buttonName || 'Ouvrir ma boutique'}
            </Link>
          </div>
          <div>
            <Image src={getImageSrc(data.image)} alt={data.title || 'Opportunite vendeur'} width={800} height={600} className="h-auto w-full rounded-2xl object-cover" />
          </div>
        </div>
      </Container>
    </section>
  );
}
