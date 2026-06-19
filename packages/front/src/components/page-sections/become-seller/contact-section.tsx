import Container from '@components/ui/container';
import { BecomeSellerSectionProps } from './utils';

export default function ContactSection({ data }: BecomeSellerSectionProps) {
  if (!data?.title && !data?.description) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl bg-slate-900 px-8 py-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">{data.title}</h2>
          <p className="whitespace-pre-line text-base leading-8 text-slate-200">{data.description}</p>
        </div>
      </Container>
    </section>
  );
}
