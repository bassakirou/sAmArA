import Link from '@components/ui/link';
import Image from 'next/image';
import usePrice from '@lib/use-price';
import { ROUTES } from '@lib/routes';
import { Product } from '@type/index';
import cn from 'classnames';
import { getProductImageSrc, PRODUCT_PLACEHOLDER } from './chat-media';
import { isEmpty } from 'lodash';
export default function ProductMessageCard({
  product,
  isMine,
}: {
  product: Product;
  isMine?: boolean;
}) {
  const { price, basePrice } = usePrice({
    amount:
      product?.sale_price ??
      product?.price ??
      product?.min_price ??
      product?.max_price ??
      0,
    baseAmount: product?.sale_price ? product?.price : undefined,
  });

  const { price: minPrice } = usePrice({
    amount: product?.min_price ?? 0,
  });

  const { price: maxPrice } = usePrice({
    amount: product?.max_price ?? 0,
  });

  return (
    <Link
      href={product?.slug ? `${ROUTES.PRODUCT}/${product.slug}` : '#'}
      className={cn(
        'group block overflow-hidden rounded-[20px] bg-[#f6f5cf] shadow-sm backdrop-blur-sm',
        isMine ? 'border-[#b9dfcf]' : 'border-white/15'
      )}
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-linen">
          <Image
            src={getProductImageSrc(product)}
            alt={product?.name ?? 'Produit'}
            fill
            sizes="64px"
            className="object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.srcset = PRODUCT_PLACEHOLDER;
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-[11px] font-semibold mb-0 uppercase tracking-wide',
              isMine ? 'text-olive' : 'text-gray-500'
            )}
          >
            Produit concerné
          </p>
          <p className="mt-1 mb-0 line-clamp-2 text-sm font-semibold text-heading group-hover:text-black">
            {product?.name}
          </p>
          {product?.shop?.name ? (
            <p className="mt-1 mb-0 text-xs text-gray-500">
              {product.shop.name}
            </p>
          ) : null}
          {product?.product_type === 'variable' ? (
            <p className="mt-2 mb-0 text-sm font-semibold text-heading">
              {minPrice} - {maxPrice}
            </p>
          ) : price ? (
            <div className="mt-2 flex items-center gap-2">
              <p className="mb-0 text-sm font-semibold text-heading">{price}</p>
              {basePrice && (
                <del className="text-xs text-gray-400">{basePrice}</del>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
