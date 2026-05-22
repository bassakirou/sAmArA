import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useCreateOrder } from '@framework/orders';
import { API_ENDPOINTS } from '@framework/utils/endpoints';

import ValidationError from '@components/ui/validation-error';
import Button from '@components/ui/button';
import isEmpty from 'lodash/isEmpty';
import { formatOrderedProduct } from '@lib/format-ordered-product';
import { useCart } from '@store/quick-cart/cart.context';
import { useAtom } from 'jotai';
import {
  checkoutAtom,
  discountAtom,
  taramoneyAutoSubmitAtom,
  taramoneyEmailAtom,
  taramoneyNetworkAtom,
  taramoneyPhoneNumberAtom,
  walletAtom,
} from '@store/checkout';
import {
  calculatePaidTotal,
  calculateTotal,
} from '@store/quick-cart/cart.utils';
import { useTranslation } from 'next-i18next';
import { useUser } from '@framework/auth';
import { useCurrency } from '@utils/use-currency';
import { useUI } from '@contexts/ui.context';
import { PaymentGateway } from '@type/index';
import { useSettings } from '@contexts/settings.context';
// import { useSettings } from "@contexts/settings.context";

export const PlaceOrderAction: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const { t } = useTranslation('common');
  const { openModal, setModalView } = useUI();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { createOrder, isLoading } = useCreateOrder();
  const { items } = useCart();
  useUser();
  const { targetCurrency } = useCurrency();
  const { deliveryTime: schedules } = useSettings();

  const [
    {
      billing_address,
      shipping_address,
      delivery_time,
      coupon,
      verified_response,
      customer_contact,
      customer_name,
      payment_gateway,
      note,
    },
  ] = useAtom(checkoutAtom);
  const [discount] = useAtom(discountAtom);
  const [use_wallet_points] = useAtom(walletAtom);
  const [taramoneyNetwork] = useAtom(taramoneyNetworkAtom);
  const [taramoneyPhoneNumber] = useAtom(taramoneyPhoneNumberAtom);
  const [taramoneyEmail] = useAtom(taramoneyEmailAtom);
  const [taramoneyAutoSubmit, setTaramoneyAutoSubmit] = useAtom(
    taramoneyAutoSubmitAtom
  );
  const taramoneyAutoSubmitGuardRef = useRef(false);

  useEffect(() => {
    setErrorMessage(null);
  }, [payment_gateway]);
  const available_items = items?.filter(
    (item) => !verified_response?.unavailable_products?.includes(item.id)
  );

  const subtotal = calculateTotal(available_items);
  // const {
  //   settings: { freeShippingAmount, freeShipping },
  // } = useSettings();
  // let freeShippings = freeShipping && Number(freeShippingAmount) <= subtotal;
  const total = calculatePaidTotal(
    {
      totalAmount: subtotal,
      tax: verified_response?.total_tax!,
      shipping_charge: verified_response?.shipping_charge!,
    },
    Number(discount)
  );

  const taramoneyRequiresPhone =
    payment_gateway === PaymentGateway.TARAMONEY &&
    ['orange_money', 'mtn_momo', 'wave', 'paypal'].includes(
      String(taramoneyNetwork ?? '')
    );
  const taramoneyRequiresEmail =
    payment_gateway === PaymentGateway.TARAMONEY &&
    String(taramoneyNetwork ?? '') === 'paypal';

  // place order handle function
  const handlePlaceOrder = useCallback(() => {
    if (payment_gateway === PaymentGateway.TARAMONEY && !taramoneyNetwork) {
      setErrorMessage(t('common:text-gateway-required'));
      return;
    }
    if (
      (taramoneyRequiresPhone && !taramoneyPhoneNumber) ||
      (taramoneyRequiresEmail && !taramoneyEmail)
    ) {
      setModalView('TARAMONEY_PHONE_MODAL');
      openModal();
      return;
    }
    if (!customer_contact) {
      setErrorMessage(t('common:contact-number-required'));
      return;
    }
    if (!payment_gateway) {
      setErrorMessage(t('common:text-gateway-required'));
      return;
    }
    // if (payment_gateway === "STRIPE" && !token) {
    //   setErrorMessage(t("common:text-pay-first"));
    //   return;
    // }
    let input = {
      //@ts-ignore
      products: available_items?.map((item) => formatOrderedProduct(item)),
      // status: orderStatusData?.orderStatuses?.data[0]?.id ?? "1",
      amount: subtotal,
      display_currency: targetCurrency,
      coupon_id: Number(coupon?.id),
      discount: discount ?? 0,
      paid_total: total,
      sales_tax: verified_response?.total_tax,
      delivery_fee: verified_response?.shipping_charge,
      total,
      delivery_time: delivery_time?.title,
      customer_contact,
      customer_name,
      note,
      use_wallet_points,
      payment_gateway,
      ...(payment_gateway === PaymentGateway.TARAMONEY
        ? {
            taramoney: {
              network: taramoneyNetwork,
              phone_number: taramoneyPhoneNumber,
              email: taramoneyEmail,
            },
          }
        : {}),
      billing_address: {
        ...(billing_address?.address && billing_address.address),
      },
      shipping_address: {
        ...(shipping_address?.address && shipping_address.address),
      },
    };
    // if (payment_gateway === "STRIPE") {
    //   //@ts-ignore
    //   input.token = token;
    // }

    delete input.billing_address.__typename;
    delete input.shipping_address.__typename;
    createOrder(input);
  }, [
    available_items,
    billing_address,
    coupon?.id,
    createOrder,
    customer_contact,
    customer_name,
    delivery_time?.title,
    discount,
    note,
    openModal,
    payment_gateway,
    setErrorMessage,
    setModalView,
    shipping_address,
    subtotal,
    t,
    taramoneyNetwork,
    taramoneyPhoneNumber,
    taramoneyRequiresPhone,
    taramoneyEmail,
    taramoneyRequiresEmail,
    targetCurrency,
    total,
    use_wallet_points,
    verified_response?.shipping_charge,
    verified_response?.total_tax,
  ]);

  useEffect(() => {
    if (!taramoneyAutoSubmit) {
      taramoneyAutoSubmitGuardRef.current = false;
      return;
    }
    if (taramoneyAutoSubmitGuardRef.current) return;
    if (!taramoneyRequiresPhone) return;
    if (!taramoneyPhoneNumber) return;
    taramoneyAutoSubmitGuardRef.current = true;
    setTaramoneyAutoSubmit(false);
    handlePlaceOrder();
  }, [
    handlePlaceOrder,
    setTaramoneyAutoSubmit,
    taramoneyAutoSubmit,
    taramoneyPhoneNumber,
    taramoneyRequiresPhone,
  ]);

  const isTaramoneySelectionSatisfied =
    payment_gateway === PaymentGateway.TARAMONEY
      ? !isEmpty(taramoneyNetwork)
      : true;
  const isCustomerContactSatisfied = taramoneyRequiresPhone
    ? true
    : !isEmpty(customer_contact);
  const isDeliveryTimeRequired = Boolean(schedules?.length);
  const isDeliveryTimeSatisfied = isDeliveryTimeRequired
    ? !isEmpty(delivery_time)
    : true;

  const isAllRequiredFieldSelected =
    [payment_gateway, billing_address, shipping_address, available_items].every(
      (item) => !isEmpty(item)
    ) &&
    isTaramoneySelectionSatisfied &&
    isCustomerContactSatisfied &&
    isDeliveryTimeSatisfied;

  return (
    <div className="px-6">
      <Button
        loading={isLoading}
        className="w-full my-5"
        onClick={handlePlaceOrder}
        disabled={!isAllRequiredFieldSelected}
        {...props}
      />
      {errorMessage && (
        <div className="my-3">
          <ValidationError message={errorMessage} />
        </div>
      )}
    </div>
  );
};
