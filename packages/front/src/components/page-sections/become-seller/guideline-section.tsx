import Container from '@components/ui/container';
import Link from '@components/ui/link';
import { BecomeSellerSectionProps } from './utils';

export default function GuidelineSection({ data }: BecomeSellerSectionProps) {
  if (!data?.items?.length) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <Container>
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-3 text-3xl font-bold text-heading">{data.title}</h2>
          <p className="whitespace-pre-line text-body">{data.description}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.items.map((item: any, index: number) => (
            <div key={`${item.title}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-2 text-sm font-semibold text-accent">Conseil {index + 1}</div>
              <h3 className="mb-2 text-lg font-semibold text-heading">{item.title}</h3>
              {item.link ? (
                <Link href={item.link} className="text-sm font-medium text-accent">
                  Ouvrir le lien
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
