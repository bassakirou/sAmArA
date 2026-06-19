import Container from '@components/ui/container';
import Image from 'next/image';
import { BecomeSellerSectionProps, getImageSrc } from './utils';

export default function SellingStepsSection({ data }: BecomeSellerSectionProps) {
  if (!data?.items?.length) {
    return null;
  }

  return (
    <section className="py-16">
      <Container>
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-3 text-3xl font-bold text-heading">{data.title}</h2>
          <p className="whitespace-pre-line text-body">{data.description}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((item: any, index: number) => (
            <div key={`${item.title}-${index}`} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <Image src={getImageSrc(item.image)} alt={item.title} width={420} height={280} className="h-56 w-full object-cover" />
              <div className="p-6">
                <div className="mb-2 text-sm font-semibold text-accent">Etape {index + 1}</div>
                <h3 className="mb-3 text-xl font-semibold text-heading">{item.title}</h3>
                <p className="whitespace-pre-line text-sm leading-7 text-body">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
