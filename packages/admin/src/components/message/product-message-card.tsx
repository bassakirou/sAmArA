import Image from 'next/image';
import cn from 'classnames';
import { Product } from '@/types';
import usePrice from '@/utils/use-price';
import { siteSettings } from '@/settings/site.settings';

function getProductImageSrc(product?: Product | null) {
  if (!product) return siteSettings.product.placeholder;

  const image = Array.isArray(product.image) ? product.image[0] : product.image;

  return (
    image?.thumbnail ??
    image?.original ??
    siteSettings.product.placeholder
  );
}

export default function ProductMessageCard({
  product,
  compact = false,
}: {
  product?: Product | null;
  compact?: boolean;
}) {
  const { price } = usePrice({
    amount:
      Number(
        product?.sale_price ??
          product?.price ??
          product?.min_price ??
          product?.max_price ??
          0
      ) || 0,
    baseAmount: product?.sale_price ? Number(product.price ?? 0) : undefined,
  });

  const { price: minPrice } = usePrice({
    amount: product?.min_price ?? 0,
  });

  const { price: maxPrice } = usePrice({
    amount: product?.max_price ?? 0,
  });

  if (!product) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className={cn('flex gap-3 p-3', compact ? 'items-center' : 'items-start')}>
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={getProductImageSrc(product)}
            alt={product?.name ?? 'Produit'}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Produit
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-heading">
            {product?.name}
          </p>
          {product?.shop?.name ? (
            <p className="mt-1 text-xs text-gray-500">{product.shop.name}</p>
          ) : null}
          {product?.product_type === 'variable' ? (
            <p className="mt-2 text-sm font-semibold text-accent">
              {minPrice} - {maxPrice}
            </p>
          ) : price ? (
            <p className="mt-2 text-sm font-semibold text-accent">{price}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
