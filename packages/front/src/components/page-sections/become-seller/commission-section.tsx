import Container from '@components/ui/container';
import { BecomeSellerSectionProps } from './utils';

export default function CommissionSection({ data }: BecomeSellerSectionProps) {
  if (!data?.items?.length && !data?.defaultCommissionDetails) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <Container>
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-3 text-3xl font-bold text-heading">{data.title}</h2>
          <p className="whitespace-pre-line text-body">{data.description}</p>
        </div>
        {data.defaultCommissionDetails ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="whitespace-pre-line text-body">{data.defaultCommissionDetails}</p>
            {data.defaultCommissionRate ? (
              <div className="mt-3 text-lg font-semibold text-accent">
                Commission par defaut: {data.defaultCommissionRate}%
              </div>
            ) : null}
          </div>
        ) : null}
        {data.items?.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((item: any, index: number) => (
              <div key={`${item.level}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-xl font-semibold text-heading">{item.level}</h3>
                <div className="mb-3 text-sm font-medium text-accent">{item.sub_level}</div>
                <p className="mb-4 whitespace-pre-line text-sm leading-7 text-body">{item.description}</p>
                <div className="space-y-1 text-sm text-body">
                  <div>Solde min: {item.min_balance || '-'}</div>
                  <div>Solde max: {item.max_balance || '-'}</div>
                  <div>Commission: {item.commission || '-'}%</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
