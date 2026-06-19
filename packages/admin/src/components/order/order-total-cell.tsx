import { Order } from '@/types';
import { useSettings } from '@/contexts/settings.context';
import { formatPrice } from '@/utils/use-price';

type Props = {
  order?: Order | null;
  amount: number;
  className?: string;
};

export default function OrderTotalCell({ order, amount, className }: Props) {
  const { currencyOptions } = useSettings();
  const locale = currencyOptions?.formation ?? 'fr-CM';

  const xaf = formatPrice({
    amount,
    currencyCode: 'XAF',
    locale,
    fractions: 0,
  });

  const paidCurrency = (order as any)?.paid_currency as string | undefined;
  const paidRate = (order as any)?.paid_currency_rate as number | undefined;

  if (!paidCurrency || paidCurrency === 'XAF' || !paidRate || paidRate <= 0) {
    return <span className={className}>{xaf}</span>;
  }

  const paidAmount = amount * paidRate;
  const paid = formatPrice({
    amount: paidAmount,
    currencyCode: paidCurrency,
    locale,
    fractions: 2,
  });

  return (
    <span className={className}>
      <span className="whitespace-nowrap">{paid}</span>
      <span className="mx-2 text-gray-500">→</span>
      <span className="whitespace-nowrap">{xaf}</span>
    </span>
  );
}
