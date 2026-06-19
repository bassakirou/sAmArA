import Container from '@components/ui/container';
import Link from '@components/ui/link';
import Image from 'next/image';
import { BecomeSellerSectionProps, getImageSrc } from './utils';

export default function UserStorySection({ data }: BecomeSellerSectionProps) {
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
        <div className="grid gap-6 lg:grid-cols-2">
          {data.items.map((item: any, index: number) => (
            <div key={`${item.title}-${index}`} className="flex gap-5 rounded-2xl bg-white p-6 shadow-sm">
              {item.thumbnail ? (
                <Image src={getImageSrc(item.thumbnail)} alt={item.title} width={96} height={96} className="h-24 w-24 rounded-full object-cover" />
              ) : null}
              <div>
                <h3 className="mb-2 text-xl font-semibold text-heading">{item.title}</h3>
                <p className="mb-3 whitespace-pre-line text-sm leading-7 text-body">{item.description}</p>
                {item.link ? (
                  <Link href={item.link} className="font-semibold text-accent">
                    Voir le temoignage
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
