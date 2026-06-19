import cn from 'classnames';
import { CustomOrderOffer } from '@/types';
import usePrice from '@/utils/use-price';
import ProductMessageCard from '@/components/message/product-message-card';

export default function CustomOrderOfferCard({
  offer,
  compact = false,
}: {
  offer?: CustomOrderOffer | null;
  compact?: boolean;
}) {
  const { price: negotiatedPrice } = usePrice({
    amount: Number(offer?.negotiated_price ?? 0) || 0,
  });
  const { price: originalPrice } = usePrice({
    amount: Number(offer?.original_price ?? 0) || 0,
  });

  if (!offer?.product) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#CFE8DA] bg-[#F7FCF9]">
      <div className={cn('p-3', compact ? 'space-y-3' : 'space-y-4')}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#166534]">
            Offre negociee
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <div>
              <p className="text-xs text-[#4B5563]">Prix convenu</p>
              <p className="text-base font-semibold text-heading">
                {negotiatedPrice}
              </p>
            </div>
            {originalPrice ? (
              <div>
                <p className="text-xs text-[#4B5563]">Prix initial</p>
                <p className="text-sm text-[#64748B] line-through">
                  {originalPrice}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <ProductMessageCard product={offer.product} compact />
      </div>
    </div>
  );
}
