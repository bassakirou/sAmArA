import React, { useState } from 'react';
import Button from '@components/ui/button';
import Counter from '@components/common/counter';
import { getVariations } from '@framework/utils/get-variations';
import { useCart } from '@store/quick-cart/cart.context';
import usePrice from '@lib/use-price';
import { generateCartItem } from '@utils/generate-cart-item';
import { ProductAttributes } from './product-attributes';
import isEmpty from 'lodash/isEmpty';
import Link from '@components/ui/link';
import { toast } from 'react-toastify';
import { useWindowSize } from '@utils/use-window-size';
import { Attachment, Product } from '@type/index';
import { useSetAtom } from 'jotai';
import { chatAtom } from '@store/chat-atom';
import isEqual from 'lodash/isEqual';
import VariationPrice from '@components/product/product-variant-price';
import { useTranslation } from 'next-i18next';
import isMatch from 'lodash/isMatch';
import { ROUTES } from '@lib/routes';
import { checkIsLoggedIn } from '@store/authorization-atom';
import { useUI } from '@contexts/ui.context';
import { useRouter } from 'next/router';
import ProductMediaGallery from '@components/product/product-media-gallery';
import { IoPlay } from 'react-icons/io5';

type Props = {
  product: Product;
};

const ProductSingleDetails: React.FC<Props> = ({ product }: any) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { openModal, setModalView, setModalData } = useUI();
  const { width } = useWindowSize();
  const { addItemToCart } = useCart();
  const setChatState = useSetAtom(chatAtom);
  const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);
  const negotiationProduct = product
    ? {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        sale_price: product.sale_price,
        min_price: product.min_price,
        max_price: product.max_price,
        shop: product.shop,
      }
    : null;

  const { price, basePrice } = usePrice({
    amount: product?.sale_price ? product?.sale_price : product?.price!,
    baseAmount: product?.price,
  });

  const variations = getVariations(product?.variations!);
  const canDiscussPrice =
    Boolean(product?.can_discuss_price) ||
    Boolean(product?.is_negotiable);

  const isSelected = !isEmpty(variations)
    ? !isEmpty(attributes) &&
      Object.keys(variations).every((variation) =>
        attributes.hasOwnProperty(variation)
      )
    : true;

  let selectedVariation: any = {};
  if (isSelected) {
    selectedVariation = product?.variation_options?.find((o: any) =>
      isEqual(
        o.options.map((v: any) => v.value).sort(),
        Object.values(attributes).sort()
      )
    );
  }

  function addToCart() {
    if (!isSelected) return;
    // to show btn feedback while product carting
    setAddToCartLoader(true);
    setTimeout(() => {
      setAddToCartLoader(false);
    }, 600);

    const item = generateCartItem(product!, selectedVariation);
    addItemToCart(item, quantity);
    toast(t('add-to-cart'), {
      type: 'dark',
      progressClassName: 'fancy-progress-bar',
      position: width > 768 ? 'bottom-right' : 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  function handleAttribute(attribute: any) {
    // Reset Quantity
    if (!isMatch(attributes, attribute)) {
      setQuantity(1);
    }

    setAttributes((prev) => ({
      ...prev,
      ...attribute,
    }));
  }

  function handleClearAttribute() {
    setAttributes(() => ({}));
  }

  const selectedImage = !isEmpty(selectedVariation)
    ? isEmpty(selectedVariation?.image)
      ? product?.image
      : selectedVariation?.image
    : product?.image;
  const hasVideo = Boolean(
    Array.isArray(product?.video) && product.video.length && product.video[0]?.url
  );
  return (
    <div className="items-start block grid-cols-9 gap-x-10 pb-10 pt-7 lg:grid lg:min-w-0 lg:pb-14 xl:gap-x-14 2xl:pb-20">
      <div className="col-span-5 min-w-0">
        <ProductMediaGallery
          productName={String(product?.name ?? '')}
          coverImage={selectedImage}
          gallery={product?.gallery as Attachment[]}
          video={product?.video as any}
          onOpenVideo={
            hasVideo
              ? () => {
                  setModalView('VIDEO_VIEW');
                  setModalData(product?.video);
                  openModal();
                }
              : undefined
          }
        />
      </div>

      <div className="col-span-4 min-w-0 pt-8 lg:pt-0">
        <div className="border-b border-gray-300 pb-7">
          <h2 className="text-heading text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold hover:text-black mb-3.5">
            {product?.name}
          </h2>
          <p
            className="text-sm leading-6 text-body lg:text-base lg:leading-8"
            dangerouslySetInnerHTML={{ __html: product?.description }}
          />

          {hasVideo ? (
            <div className="mt-5">
              <Button
                type="button"
                variant="custom"
                onClick={() => {
                  setModalView('VIDEO_VIEW');
                  setModalData(product?.video);
                  openModal();
                }}
                className="h-11 w-full gap-2 bg-red-600 px-5 text-white hover:bg-red-700 sm:w-auto"
              >
                <IoPlay size={18} />
                <span>Voir la vidéo</span>
              </Button>
            </div>
          ) : null}

          <div className="flex items-center mt-5">
            {!isEmpty(variations) ? (
              <VariationPrice
                selectedVariation={selectedVariation}
                minPrice={product.min_price}
                maxPrice={product.max_price}
              />
            ) : (
              <>
                <div className="text-base font-semibold text-heading md:text-xl lg:text-2xl">
                  {price}
                </div>

                {basePrice && (
                  <del className="font-segoe text-gray-400 text-base lg:text-xl ltr:pl-2.5 rtl:pr-2.5 -mt-0.5 md:mt-0">
                    {basePrice}
                  </del>
                )}
              </>
            )}
          </div>
        </div>
        {!isEmpty(variations) && (
          <div className="pb-3 border-b border-gray-300 pt-7">
            {Object.keys(variations).map((variation) => {
              return (
                <ProductAttributes
                  key={variation}
                  title={variation}
                  attributes={variations[variation]}
                  active={attributes[variation]}
                  onClick={handleAttribute}
                  clearAttribute={handleClearAttribute}
                />
              );
            })}
          </div>
        )}

        <div className="flex items-center py-8 space-x-4 border-b border-gray-300 rtl:space-x-reverse ltr:md:pr-32 ltr:lg:pr-12 ltr:2xl:pr-32 ltr:3xl:pr-48 rtl:md:pl-32 rtl:lg:pl-12 rtl:2xl:pl-32 rtl:3xl:pl-48">
          {isEmpty(variations) && (
            <>
              {Number(product.quantity) > 0 ? (
                <Counter
                  quantity={quantity}
                  onIncrement={() => setQuantity((prev) => prev + 1)}
                  onDecrement={() =>
                    setQuantity((prev) => (prev !== 1 ? prev - 1 : 1))
                  }
                  disableDecrement={quantity === 1}
                  disableIncrement={Number(product.quantity) === quantity}
                />
              ) : (
                <div className="text-base text-red-500 whitespace-nowrap ltr:lg:ml-7 rtl:lg:mr-7">
                  {t('text-out-stock')}
                </div>
              )}
            </>
          )}

          {!isEmpty(selectedVariation) && (
            <>
              {selectedVariation?.is_disable ||
              selectedVariation.quantity === 0 ? (
                <div className="text-base text-red-500 whitespace-nowrap ltr:lg:ml-7 rtl:lg:mr-7">
                  {t('text-out-stock')}
                </div>
              ) : (
                <Counter
                  quantity={quantity}
                  onIncrement={() => setQuantity((prev) => prev + 1)}
                  onDecrement={() =>
                    setQuantity((prev) => (prev !== 1 ? prev - 1 : 1))
                  }
                  disableDecrement={quantity === 1}
                  disableIncrement={
                    Number(selectedVariation.quantity) === quantity
                  }
                />
              )}
            </>
          )}
          <Button
            onClick={addToCart}
            variant="slim"
            className={`w-full md:w-6/12 xl:w-full ${
              !isSelected && 'bg-gray-400 hover:bg-gray-400'
            }`}
            disabled={
              !isSelected ||
              !product?.quantity || product.status.toLowerCase() != 'publish' ||
              (!isEmpty(selectedVariation) && !selectedVariation?.quantity) ||
              (!isEmpty(selectedVariation) && selectedVariation?.is_disable)
            }
            loading={addToCartLoader}
          >
            <span className="py-2 3xl:px-8">
              {product?.quantity ||
              (!isEmpty(selectedVariation) && selectedVariation?.quantity)
                ? t('text-add-to-cart')
                : t('text-out-stock')}
            </span>
          </Button>
        </div>

        {canDiscussPrice ? (
          <div className="flex items-center pb-8 space-x-4 border-b border-gray-300 rtl:space-x-reverse ltr:md:pr-32 ltr:lg:pr-12 ltr:2xl:pr-32 ltr:3xl:pr-48 rtl:md:pl-32 rtl:lg:pl-12 rtl:2xl:pl-32 rtl:3xl:pl-48">
            <Button
              onClick={() => {
                if (!checkIsLoggedIn()) {
                  if (typeof window !== 'undefined') {
                    window.sessionStorage.setItem(
                      'samara:chat:intent',
                      JSON.stringify({
                        returnTo: router.asPath,
                        isExpanded: false,
                        activeShopId: (product as any)?.shop?.id ?? null,
                        activeProduct: negotiationProduct,
                      })
                    );
                  }
                  setModalView('LOGIN_VIEW');
                  openModal();
                  toast.error(
                    <div>
                      <div className="font-semibold">Unauthenticated</div>
                      <div>Vous devez être connecté pour discuter.</div>
                    </div>,
                    { toastId: 'chat-auth' }
                  );
                  return;
                }
                setChatState({
                  isOpen: true,
                  isExpanded: false,
                  activeProduct: negotiationProduct,
                  activeConversationId: null,
                  activeShopId: (product as any)?.shop?.id ?? null,
                });
              }}
              variant="outline"
              className="w-full"
            >
              {t('text-chat-with-seller')}
            </Button>
          </div>
        ) : null}
        <div className="py-6">
          <ul className="pb-1 space-y-5 text-sm">
            {product?.sku && (
              <li>
                <span className="inline-block font-semibold text-heading ltr:pr-2 rtl:pl-2">
                  SKU:
                </span>
                {product?.sku}
              </li>
            )}

            {product?.categories &&
              Array.isArray(product.categories) &&
              product.categories.length > 0 && (
                <li>
                  <span className="inline-block font-semibold text-heading ltr:pr-2 rtl:pl-2">
                    Category:
                  </span>
                  {product.categories.map((category: any, index: number) => (
                    <Link
                      key={index}
                      href={`${ROUTES.CATEGORY}/${category?.slug}`}
                      className="transition hover:underline hover:text-heading"
                    >
                      {product?.categories?.length === index + 1
                        ? category.name
                        : `${category.name}, `}
                    </Link>
                  ))}
                </li>
              )}

            {product?.tags &&
              Array.isArray(product.tags) &&
              product.tags.length > 0 && (
                <li className="productTags">
                  <span className="inline-block font-semibold text-heading ltr:pr-2 rtl:pl-2">
                    Tags:
                  </span>
                  {product.tags.map((tag: any) => (
                    <Link
                      key={tag.id}
                      href={`${ROUTES.COLLECTIONS}/${tag?.slug}`}
                      className="inline-block ltr:pr-1.5 rtl:pl-1.5 transition hover:underline hover:text-heading ltr:last:pr-0 rtl:last:pl-0"
                    >
                      {tag.name}
                      <span className="text-heading">,</span>
                    </Link>
                  ))}
                </li>
              )}

            <li>
              <span className="inline-block font-semibold text-heading ltr:pr-2 rtl:pl-2">
                {t('text-brand-colon')}
              </span>
              <Link
                href={`${ROUTES.BRAND}=${product?.type?.slug}`}
                className="inline-block ltr:pr-1.5 rtl:pl-1.5 transition hover:underline hover:text-heading ltr:last:pr-0 rtl:last:pl-0"
              >
                {product?.type?.name}
              </Link>
            </li>

            <li>
              <span className="inline-block font-semibold text-heading ltr:pr-2 rtl:pl-2">
                {t('text-shop-colon')}
              </span>
              <Link
                href={`${ROUTES.SHOPS}/${product?.shop?.slug}`}
                className="inline-block ltr:pr-1.5 rtl:pl-1.5 transition hover:underline hover:text-heading ltr:last:pr-0 rtl:last:pl-0"
              >
                {product?.shop?.name}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductSingleDetails;
