import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import isEmpty from 'lodash/isEmpty';
import { ROUTES } from '@lib/routes';
import { useUI } from '@contexts/ui.context';
import Button from '@components/ui/button';
import Image from 'next/image';
import Counter from '@components/common/counter';
import { ProductAttributes } from '@components/product/product-attributes';
import { generateCartItem } from '@utils/generate-cart-item';
import usePrice from '@lib/use-price';
import { getVariations } from '@framework/utils/get-variations';
import { useTranslation } from 'next-i18next';
import { useProduct } from '@framework/products';
import isEqual from 'lodash/isEqual';
import Spinner from '@components/ui/loaders/spinner/spinner';
import VariationPrice from '@components/product/product-variant-price';
import { useCart } from '@store/quick-cart/cart.context';
import { toast } from 'react-toastify';
import isMatch from 'lodash/isMatch';
import { IoChatbubblesOutline } from 'react-icons/io5';
import { useAtom } from 'jotai';
import { authorizationAtom } from '@store/authorization-atom';
import { chatAtom } from '@store/chat-atom';
import ButtonSamara from '@components/ui/button-samara';
import { reportInternalDebug } from '@utils/report-internal-debug';

export default function ProductPopup({ productSlug }: { productSlug: string }) {
  const { t } = useTranslation('common');
  const { closeModal, openCart, openModal, setModalView } = useUI();
  const { data: product, isLoading: loading }: any = useProduct({
    slug: productSlug,
  });
  const router = useRouter();
  const { addItemToCart } = useCart();
  const [isAuthorized] = useAtom(authorizationAtom);
  const [, setChatState] = useAtom(chatAtom);
  const [quantity, setQuantity] = useState(1);
  const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
  const [viewCartBtn, setViewCartBtn] = useState<boolean>(false);
  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);
  const chatIntentKey = 'samara:chat:intent';

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
  const normalizedUnit = String(product?.unit ?? '').trim();
  const isNumericUnit = /^\d+([.,]\d+)?$/.test(normalizedUnit);
  const formattedUnit = normalizedUnit
    ? isNumericUnit
      ? `${normalizedUnit} unite${normalizedUnit === '1' ? '' : 's'}`
      : normalizedUnit
    : '';
  const canDiscussPrice =
    Boolean(product?.can_discuss_price) || Boolean(product?.is_negotiable);

  // #region debug-point A:popup-product-payload
  useEffect(() => {
    if (loading) return;
    reportInternalDebug({
      sessionId: 'chat-popup-negotiation',
      runId: 'pre-fix',
      hypothesisId: 'A',
      location: 'product-popup.tsx',
      msg: '[DEBUG] Popup product payload resolved',
      data: {
        productSlug,
        productId: product?.id ?? null,
        can_discuss_price: product?.can_discuss_price ?? null,
        is_negotiable: product?.is_negotiable ?? null,
        shopId: product?.shop?.id ?? null,
        shopSlug: product?.shop?.slug ?? null,
        canDiscussPrice,
      },
    });
  }, [
    canDiscussPrice,
    loading,
    product?.can_discuss_price,
    product?.id,
    product?.is_negotiable,
    product?.shop?.id,
    product?.shop?.slug,
    productSlug,
  ]);
  // #endregion

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
      setViewCartBtn(true);
    }, 600);
    const item = generateCartItem(product!, selectedVariation);

    addItemToCart(item, quantity);

    toast(t('add-to-cart'), {
      type: 'dark',
      progressClassName: 'fancy-progress-bar',
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  function navigateToProductPage() {
    closeModal();
    router.push(`${ROUTES.PRODUCT}/${productSlug}`, undefined, {
      locale: router.locale,
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

  function navigateToCartPage() {
    closeModal();
    setTimeout(() => {
      openCart();
    }, 300);
  }

  const handleDiscussPrice = () => {
    const activeShopId = product?.shop?.id ?? null;
    // #region debug-point B:popup-discuss-click
    reportInternalDebug({
      sessionId: 'chat-popup-negotiation',
      runId: 'pre-fix',
      hypothesisId: 'B',
      location: 'product-popup.tsx',
      msg: '[DEBUG] Popup discuss click',
      data: {
        isAuthorized,
        productId: negotiationProduct?.id ?? null,
        productSlug: negotiationProduct?.slug ?? null,
        activeShopId,
        canDiscussPrice,
      },
    });
    // #endregion

    if (isAuthorized) {
      closeModal();
      window.setTimeout(() => {
        // #region debug-point B:popup-set-chat-state
        reportInternalDebug({
          sessionId: 'chat-popup-negotiation',
          runId: 'pre-fix',
          hypothesisId: 'B',
          location: 'product-popup.tsx',
          msg: '[DEBUG] Popup opening chat for authorized user',
          data: {
            productId: negotiationProduct?.id ?? null,
            activeShopId,
          },
        });
        // #endregion
        setChatState((prev) => ({
          ...prev,
          isOpen: true,
          isExpanded: false,
          activeProduct: negotiationProduct,
          activeConversationId: null,
          activeShopId: activeShopId ?? prev.activeShopId ?? null,
        }));
      }, 150);
      return;
    }

    if (typeof window !== 'undefined') {
      // #region debug-point B:popup-store-intent
      reportInternalDebug({
        sessionId: 'chat-popup-negotiation',
        runId: 'pre-fix',
        hypothesisId: 'B',
        location: 'product-popup.tsx',
        msg: '[DEBUG] Popup storing chat intent for guest user',
        data: {
          returnTo: router.asPath,
          productId: negotiationProduct?.id ?? null,
          activeShopId,
        },
      });
      // #endregion
      window.sessionStorage.setItem(
        chatIntentKey,
        JSON.stringify({
          returnTo: router.asPath,
          isExpanded: false,
          activeShopId,
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
  };

  if (loading) {
    return (
      <div className="relative flex items-center justify-center overflow-hidden bg-white w-96 h-96">
        <Spinner />
      </div>
    );
  }
  const productImage = !isEmpty(selectedVariation)
    ? isEmpty(selectedVariation?.image)
      ? product?.image
      : selectedVariation?.image
    : product?.image;
  return (
    <div className="bg-white rounded-lg">
      <div className="mx-auto flex w-full flex-col lg:w-[960px] lg:flex-row md:w-[650px]">
        <div className="relative flex items-center justify-center flex-shrink-0 w-full overflow-hidden bg-gray-300 lg:w-430px aspect-[1/1.3] max-h-430px lg:max-h-full">
          <Image
            fill
            src={
              productImage?.original ??
              '/assets/placeholder/products/product-thumbnail.svg'
            }
            alt={product.name}
            className="object-cover"
            sizes="(max-width: 768px) 100vw"
          />
        </div>

        <div className="flex flex-col w-full p-5 md:p-8">
          <div className="motif"></div>
          <div className="pb-5">
            <div
              className="mb-2 md:mb-2.5 block -mt-1.5"
              onClick={navigateToProductPage}
              role="button"
            >
              <h2 className="text-lg font-semibold text-heading md:text-xl lg:text-2xl hover:text-black">
                {product.name}
              </h2>
            </div>

            {formattedUnit && isEmpty(variations) && (
              <div className="mb-3 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-body">
                <span className="font-semibold text-heading">
                  Conditionnement:
                </span>
                <span className="ltr:ml-2 rtl:mr-2">{formattedUnit}</span>
              </div>
            )}

            <p className="line-clamp-8 overflow-hidden text-sm leading-6 md:text-body md:leading-7 max-h-[200px]">
              {product.description}
            </p>

            <div className="flex items-center mt-3">
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

          {Object.keys(variations).map((variation) => {
            return (
              <ProductAttributes
                key={`popup-attribute-key${variation}`}
                title={variation}
                attributes={variations[variation]}
                active={attributes[variation]}
                onClick={handleAttribute}
                clearAttribute={handleClearAttribute}
              />
            );
          })}

          <div className="pt-2 md:pt-4">
            <div className="flex items-center justify-between mb-4 space-x-3 sm:space-x-4 rtl:space-x-reverse">
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
                    <div className="text-base text-red-500 whitespace-nowrap ltr:lg:ml-7 rtl:first:-mr-4">
                      {t('text-out-stock')}
                    </div>
                  )}
                </>
              )}

              {!isEmpty(selectedVariation) && (
                <>
                  {selectedVariation?.is_disable ||
                  selectedVariation.quantity === 0 ? (
                    <div className="text-base text-red-500 whitespace-nowrap ltr:lg:ml-7 rtl:first:-mr-4">
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
                className={`w-full lg:w-6/12 xl:w-full ${
                  !isSelected && 'bg-gray-400 hover:bg-gray-400'
                }`}
                disabled={
                  !isSelected ||
                  !product?.quantity ||
                  (!isEmpty(selectedVariation) &&
                    !selectedVariation?.quantity) ||
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

            {viewCartBtn && (
              <div className="relative mb-5 mt-5 flex w-full justify-center overflow-visible">
                <ButtonSamara
                  onClick={navigateToCartPage}
                  type="button"
                  variant="normal"
                >
                  {t('text-view-cart')}
                </ButtonSamara>
              </div>
            )}

            <div className="relative mt-4 flex w-full justify-center overflow-visible">
              <ButtonSamara
                onClick={navigateToProductPage}
                variant="normal"
                className="h-11 md:h-12"
                style={{ width: 'calc(100% - 50px)' }}
              >
                {t('text-view-details')}
              </ButtonSamara>
            </div>

            {canDiscussPrice ? (
              <button
                onClick={handleDiscussPrice}
                className="mt-4 w-full bg-black text-white py-3 rounded-lg shadow flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <IoChatbubblesOutline size={18} />
                <span className="font-semibold text-sm uppercase tracking-wider">
                  Discuter le prix
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
