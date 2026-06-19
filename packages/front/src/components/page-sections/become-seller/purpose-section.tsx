import Container from '@components/ui/container';
import { BecomeSellerSectionProps } from './utils';

export default function PurposeSection({ data }: BecomeSellerSectionProps) {
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((item: any, index: number) => (
            <div key={`${item.title}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              {item.icon ? (
                <div className="mb-4 inline-flex rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                  {item.icon}
                </div>
              ) : null}
              <h3 className="mb-3 text-xl font-semibold text-heading">{item.title}</h3>
              <p className="whitespace-pre-line text-sm leading-7 text-body">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
