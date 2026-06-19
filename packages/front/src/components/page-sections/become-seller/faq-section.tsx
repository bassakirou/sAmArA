import Accordion from '@components/common/accordion';
import Container from '@components/ui/container';
import { BecomeSellerSectionProps } from './utils';

export default function FaqSection({ data }: BecomeSellerSectionProps) {
  if (!data?.items?.length) {
    return null;
  }

  return (
    <section id="become-seller-faq" className="py-16">
      <Container>
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-3 text-3xl font-bold text-heading">{data.title}</h2>
          <p className="whitespace-pre-line text-body">{data.description}</p>
        </div>
        <div className="mx-auto max-w-4xl">
          <Accordion
            items={data.items.map((item: any) => ({
              title: item.title,
              content: item.description,
            }))}
            translatorNS="faq"
          />
        </div>
      </Container>
    </section>
  );
}
