import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import { useQuery } from 'react-query';
import client from '@framework/utils/index';
import { getLayout } from '@components/layout/layout';
import Divider from '@components/ui/divider';
import Container from '@components/ui/container';
import Subscription from '@components/common/subscription';
import Spinner from '@components/ui/loaders/spinner/spinner';
import { useUser } from '@framework/auth';
import { useCart } from '@store/quick-cart/cart.context';
import {
  billingAddressAtom,
  couponAtom,
  customOrderOfferAtom,
  shippingAddressAtom,
  verifiedResponseAtom,
} from '@store/checkout';
import { Address } from '@type/index';
import { AddressType } from '@framework/utils/constants';
import { useTranslation } from 'next-i18next';

export { getStaticProps } from '@framework/common.ssr';
export const getStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking' as const,
});

const ScheduleGrid = dynamic(
  () => import('@components/checkout/schedule/schedule-grid')
);
const AddressGrid = dynamic(() => import('@components/checkout/address-grid'));
const ContactGrid = dynamic(
  () => import('@components/checkout/contact/contact-grid')
);
const RightSideView = dynamic(
  () => import('@components/checkout/right-side-view')
);
const OrderNote = dynamic(() => import('@components/checkout/order-note'));

export default function OfferCheckoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const seedRef = useRef<string | null>(null);
  const { me, loading } = useUser();
  const { resetCart, addItemToCart } = useCart();
  const [, setVerifiedResponse] = useAtom(verifiedResponseAtom);
  const [, setCoupon] = useAtom(couponAtom);
  const [, setCustomOrderOfferId] = useAtom(customOrderOfferAtom);

  const { data: offer, isLoading } = useQuery(
    ['custom-order-offer', router.query.id],
    () => client.customOrderOffers.findOne(router.query.id as string),
    {
      enabled: !!router.query.id,
      retry: false,
    }
  );

  useEffect(() => {
    if (!offer?.id || !offer?.product?.id) return;
    if (seedRef.current === String(offer.id)) return;

    seedRef.current = String(offer.id);
    resetCart();
    setVerifiedResponse(null);
    setCoupon(null);
    setCustomOrderOfferId(offer.id);
    addItemToCart(
      {
        id: `offer-${offer.id}`,
        productId: offer.product.id,
        name: offer.product.name,
        slug: offer.product.slug,
        unit: offer.product.unit ?? 'piece',
        image: offer.product.image?.thumbnail ?? offer.product.image?.original,
        stock: offer.product.quantity ?? 1,
        price: Number(offer.negotiated_price),
        customOrderOfferId: offer.id,
      },
      1
    );
  }, [
    addItemToCart,
    offer,
    resetCart,
    setCoupon,
    setCustomOrderOfferId,
    setVerifiedResponse,
  ]);

  useEffect(() => {
    return () => {
      setCustomOrderOfferId(null);
    };
  }, [setCustomOrderOfferId]);

  if (loading || isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <Spinner showText={false} />
      </div>
    );
  }

  return (
    <>
      <Divider className="mb-0" />
      <Container>
        <div className="bg-gray-100 px-4 py-8 lg:px-8 lg:py-10 xl:px-16 xl:py-14 2xl:px-20">
          <div className="mx-auto mb-6 max-w-5xl rounded-2xl border border-[#D8E1EA] bg-white p-5 shadow-checkoutCard md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-olive">
              Offre negociee
            </p>
            <h1 className="mt-2 text-xl font-semibold text-heading">
              Finalisez cette commande au prix convenu
            </h1>
            <p className="mt-2 text-sm text-[#64748B]">
              Le prix de ce produit est verrouille selon l'accord conclu dans la
              messagerie.
            </p>
          </div>

          <div className="m-auto flex w-full max-w-5xl flex-col items-center rtl:space-x-reverse lg:flex-row lg:items-start lg:space-x-8">
            <div className="w-full space-y-6 lg:max-w-2xl">
              <ContactGrid
                className="rounded-md border border-gray-100 bg-white p-5 shadow-checkoutCard md:p-7"
                // @ts-ignore
                userId={me?.id!}
                profileId={me?.profile?.id!}
                contact={me?.profile?.contact!}
                label={t('text-contact-number')}
                count={1}
              />

              <AddressGrid
                userId={me?.id!}
                className="rounded-md border border-gray-100 bg-white p-5 shadow-checkoutCard md:p-7"
                label={t('text-billing-address')}
                count={2}
                // @ts-ignore
                addresses={me?.address?.filter(
                  (address: Address) => address?.type === AddressType.Billing
                )}
                // @ts-ignore
                atom={billingAddressAtom}
                type={AddressType.Billing}
              />
              <AddressGrid
                userId={me?.id!}
                className="rounded-md border border-gray-100 bg-white p-5 shadow-checkoutCard md:p-7"
                label={t('text-shipping-address')}
                count={3}
                // @ts-ignore
                addresses={me?.address?.filter(
                  (address: Address) => address?.type === AddressType.Shipping
                )}
                // @ts-ignore
                atom={shippingAddressAtom}
                type={AddressType.Shipping}
              />
              <ScheduleGrid
                className="bg-light p-5 shadow-700 md:p-8"
                label={t('text-delivery-schedule')}
                count={4}
              />
              <OrderNote
                count={5}
                label={t('text-order-note')}
                className="rounded-md border border-gray-100 bg-white p-5 shadow-checkoutCard md:p-7"
              />
            </div>
            <div className="mt-10 w-full shrink-0 sm:mt-12 lg:mt-0 lg:w-[320px] xl:w-[440px]">
              <RightSideView />
            </div>
          </div>
        </div>
        <Subscription />
      </Container>
    </>
  );
}

OfferCheckoutPage.authenticate = true;
OfferCheckoutPage.getLayout = getLayout;
