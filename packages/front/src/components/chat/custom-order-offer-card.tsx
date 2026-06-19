import Link from '@components/ui/link';
import usePrice from '@lib/use-price';
import { ROUTES } from '@lib/routes';
import { CustomOrderOffer } from '@type/index';
import cn from 'classnames';
import ProductMessageCard from './product-message-card';

export default function CustomOrderOfferCard({
  offer,
  isMine,
}: {
  offer?: CustomOrderOffer | null;
  isMine?: boolean;
}) {
  const { price: negotiatedPrice } = usePrice({
    amount: Number(offer?.negotiated_price ?? 0) || 0,
  });
  const { price: originalPrice } = usePrice({
    amount: Number(offer?.original_price ?? 0) || 0,
  });

  if (!offer?.product) return null;

  return (
    <Link
      href={`${ROUTES.OFFERS}/${offer.id}`}
      className={cn(
        'group block overflow-hidden rounded-[20px] bg-[#ffa902] shadow-sm backdrop-blur-sm',
        isMine ? 'border-[#b9dfcf]' : 'border-white/15'
      )}
    >
      <div className="space-y-3 p-3">
        <div>
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-wide',
              isMine ? 'text-olive' : 'text-gray-500'
            )}
          >
            Offre negociee
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <div>
              <p className="text-xs text-gray-500">Prix convenu</p>
              <p className="text-sm font-semibold text-heading">
                {negotiatedPrice}
              </p>
            </div>
            {originalPrice ? (
              <div>
                <p className="text-xs text-gray-500">Prix initial</p>
                <p className="text-xs text-gray-500 line-through">
                  {originalPrice}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <ProductMessageCard product={offer.product} isMine={isMine} />
      </div>
    </Link>
  );
}
