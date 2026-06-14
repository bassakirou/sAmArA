import cn from 'classnames';
import Image from 'next/image';
import { useState, type FC } from 'react';
import { useUI } from '@contexts/ui.context';
import usePrice from '@lib/use-price';
import { Product } from '@type/index';
import { siteSettings } from '@settings/site.settings';
import CartIconLine from '@components/icons/cart-icon-line';
import HeartIcon from '@components/icons/heart-icon';
import { toast } from 'react-toastify';
import { generateBookmarkItem } from '@utils/generate-bookmark-item';
import { useBookmark } from '@store/bookmarks/bookmark.context';
import { useCart } from '@store/quick-cart/cart.context';
import { generateCartItem } from '@utils/generate-cart-item';
import Spinner from '@components/ui/loaders/spinner/spinner';
import { useTranslation } from 'next-i18next';
import { useAtom } from 'jotai';
import { authorizationAtom } from '@store/authorization-atom';

interface ProductProps {
  product: Product;
  className?: string;
  contactClassName?: string;
  imageContentClassName?: string;
  variant?:
    | 'grid'
    | 'gridSmall'
    | 'gridSlim'
    | 'list'
    | 'listSmall'
    | 'gridSlimLarge';
  imgWidth?: number;
  imgHeight?: number;
  imgLoading?: 'eager' | 'lazy';
}

const ProductCard: FC<ProductProps> = ({
  product,
  className = '',
  contactClassName = '',
  imageContentClassName = '',
  variant = 'list',
  imgWidth = 340,
  imgHeight = 440,
  imgLoading,
}) => {
  const [isAuthorized] = useAtom(authorizationAtom);

  const { openModal, setModalView, setModalData } = useUI();
  const { name, image, min_price, max_price, product_type, description } =
    product ?? {};

  const { price, basePrice } = usePrice({
    amount: product?.sale_price ? product?.sale_price : product?.price!,
    baseAmount: product?.price,
  });

  const { price: minPrice } = usePrice({
    amount: min_price!,
  });

  const { price: maxPrice } = usePrice({
    amount: max_price!,
  });

  function handlePopupView() {
    setModalData(product.slug);
    setModalView('PRODUCT_VIEW');
    return openModal();
  }
  const { t } = useTranslation('common');

  const [addToBookmarkLoader, setAddToBookmarkLoader] =
    useState<boolean>(false);

  const { addItemToBookmark } = useBookmark();
  const { addItemToCart } = useCart();

  function addToBookmark(e?: any) {
    if (e?.stopPropagation) e.stopPropagation();
    // to show btn feedback while product carting
    setAddToBookmarkLoader(true);
    setTimeout(() => {
      setAddToBookmarkLoader(false);
    }, 600);
    const item = generateBookmarkItem(product as any);
    addItemToBookmark(item, item['id'] as number);

    toast(t('add-to-bookmark'), {
      theme: 'dark',
      progressClassName: 'fancy-progress-bar',
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  function addToCart(e?: any) {
    if (e?.stopPropagation) e.stopPropagation();
    if (!product) return;
    if (product_type?.toLocaleLowerCase?.() === 'variable') {
      return handlePopupView();
    }
    const item = generateCartItem(product as any, {} as any);
    addItemToCart(item as any, 1);
    toast(t('add-to-cart'), {
      theme: 'dark',
      progressClassName: 'fancy-progress-bar',
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  if (addToBookmarkLoader) {
    return (
      <div className="relative flex items-center justify-center overflow-hidden bg-white w-96 h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'sam-card group box-border overflow-hidden flex rounded-md cursor-pointer',
        {
          'ltr:pr-0 rtl:pl-0 pb-2 lg:pb-3 flex-col items-start bg-white transition duration-200 ease-in-out transform hover:-translate-y-1 hover:md:-translate-y-1.5 hover:shadow-product':
            variant === 'grid' || variant === 'gridSmall',
          'ltr:pr-0 rtl:pl-0 md:pb-1 flex-col items-start bg-white':
            variant === 'gridSlim' || variant === 'gridSlimLarge',
          'items-center bg-transparent border border-gray-100 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-listProduct':
            variant === 'listSmall',
          'flex-row items-center transition-transform ease-linear bg-gray-200 ltr:pr-2 ltr:lg:pr-3 ltr:2xl:pr-4 rtl:pl-2 rtl:lg:pl-3 rtl:2xl:pl-4':
            variant === 'list',
        },
        className
      )}
      role="button"
      title={name}
      onClick={handlePopupView}
    >
      <div
        className={cn(
          'flex relative ltr:rounded-l-md rtl:rounded-r-md ',
          {
            'mb-3 md:mb-3.5 w-full aspect-[17/22]': variant === 'grid',
            'mb-3 md:mb-3.5 w-full aspect-[1/1.3]': variant === 'gridSmall',
            'mb-3 md:mb-3.5 pb-0 aspect-square w-full rounded-md overflow-hidden':
              variant === 'gridSlim',
            'mb-3 md:mb-3.5 pb-0 aspect-[1/1.2] w-full rounded-md overflow-hidden':
              variant === 'gridSlimLarge',
            'flex-shrink-0 w-32 sm:w-44 md:w-36 lg:w-44 lg:h-44 aspect-square':
              variant === 'listSmall',
            'aspect-square': variant === 'list',
          },
          imageContentClassName
        )}
      >
        <div
          className="actions-btn opacity-0 group-hover:opacity-100 w-full h-full bg-black bg-opacity-70 top-0 right-0 left-0 bottom-0 absolute z-10"
          onClick={handlePopupView}
        >
          <div
            className="add-cart absolute cursor-pointer z-20"
            onClick={addToCart}
          >
            <CartIconLine size={25} bg="#ffffff" />
          </div>
          {isAuthorized && (
            <div
              className="add-wish absolute cursor-pointer z-20 transform rotate-180"
              onClick={addToBookmark}
            >
              <HeartIcon bg="#ffffff" size={25} />
            </div>
          )}
        </div>
        <Image
          src={image?.original ?? siteSettings?.product?.placeholderImage()}
          // fill
          loading={imgLoading}
          quality={100}
          width={imgWidth}
          height={imgHeight}
          alt={name || 'Product Image'}
          className={cn('bg-gray-300 object-cover', {
            'rounded-md transition duration-200 ease-in group-hover:rounded-b-none':
              variant === 'grid' || variant === 'gridSmall',
            'transition duration-150 ease-linear transform group-hover:scale-105':
              variant === 'gridSlim' || variant === 'gridSlimLarge',
            'ltr:rounded-l-md rtl:rounded-r-md transition duration-200 ease-linear transform group-hover:scale-105':
              variant === 'list',
          })}
          sizes="(max-width: 768px) 100vw"
        />
      </div>
      <div
        className={cn(
          'w-full overflow-hidden px-2',
          {
            'ltr:pl-0 rtl:pr-0 ltr:lg:pl-2.5 ltr:xl:pl-4 rtl:lg:pr-2.5 rtl:xl:pr-4 ltr:pr-2.5 ltr:xl:pr-4 rtl:pl-2.5 rtl:xl:pl-4':
              variant === 'grid',
            'ltr:pl-0 rtl:pr-0 ltr:lg:pl-2.5 ltr:xl:pl-4 rtl:lg:pr-2.5 rtl:xl:pr-4 ltr:pr-2.5 ltr:xl:pr-4 rtl:pl-2.5 rtl:xl:pl-5':
              variant === 'gridSlim',
            'px-4 lg:px-5 2xl:px-4': variant === 'listSmall',
          },
          contactClassName
        )}
      >
        <h2
          className={cn('text-heading font-semibold truncate mb-1', {
            'text-sm md:text-base':
              variant === 'grid' || variant === 'gridSmall',
            'md:mb-1.5 text-sm sm:text-base md:text-sm lg:text-base xl:text-lg':
              variant === 'gridSlim',
            'text-sm sm:text-base md:mb-1.5 pb-0': variant === 'listSmall',
            'text-sm sm:text-base md:text-sm lg:text-base xl:text-lg md:mb-1.5':
              variant === 'list',
          })}
        >
          {name}
        </h2>
        {description && (
          <p className="text-white text-body text-xs md:text-[13px] lg:text-sm leading-normal xl:leading-relaxed max-w-[250px] truncate">
            {description}
          </p>
        )}
        <div
          className={`text-heading font-semibold text-sm sm:text-base mt-1.5 space-x-1 rtl:space-x-reverse ${
            variant === 'grid' || variant === 'gridSmall'
              ? '3xl:text-lg lg:mt-2.5'
              : 'sm:text-lg md:text-base 3xl:text-xl md:mt-2.5 2xl:mt-3'
          }`}
        >
          {product_type.toLocaleLowerCase() === 'variable' ? (
            <>
              <span className="inline-block  text-white">{minPrice}</span>
              <span> - </span>
              <span className="inline-block  text-white">{maxPrice}</span>
            </>
          ) : (
            <>
              <span className="inline-block  text-white">{price}</span>

              {basePrice && (
                <del className="font-normal  text-white sm:text-base ltr:pl-1 rtl:pr-1">
                  {basePrice}
                </del>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
