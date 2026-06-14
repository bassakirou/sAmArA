import { CHECKOUT } from '@lib/constants';
import { Address, Coupon } from '@type/index';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
interface DeliveryTime {
  id: string;
  title: string;
  description: string;
}
interface VerifiedResponse {
  total_tax: number;
  shipping_charge: number;
  unavailable_products: any[];
}
interface CheckoutState {
  billing_address: Address | null;
  shipping_address: Address | null;
  payment_gateway: PaymentMethodName;
  delivery_time: DeliveryTime | null;
  customer_contact: string;
  campay_use_saved_contact: boolean;
  campay_operator: string | null;
  campay_phone_number: string;
  campay_auto_submit: boolean;
  taramoney_network: string | null;
  taramoney_phone_number: string;
  taramoney_email: string;
  taramoney_auto_submit: boolean;
  verified_response: VerifiedResponse | null;
  coupon: Coupon | null;
  custom_order_offer_id?: string | number | null;
  [key: string]: unknown;
}
export const defaultCheckout: CheckoutState = {
  billing_address: null,
  shipping_address: null,
  delivery_time: null,
  payment_gateway: 'STRIPE',
  customer_contact: '',
  campay_use_saved_contact: true,
  campay_operator: null,
  campay_phone_number: '',
  campay_auto_submit: false,
  taramoney_network: null,
  taramoney_phone_number: '',
  taramoney_email: '',
  taramoney_auto_submit: false,
  verified_response: null,
  coupon: null,
  custom_order_offer_id: null,
};
export type PaymentMethodName =
  | 'CASH_ON_DELIVERY'
  | 'STRIPE'
  | 'PAYPAL'
  | 'RAZORPAY'
  | 'MOLLIE'
  | 'PAYSTACK'
  | 'IYZICO'
  | 'TARAMONEY'
  | 'CAMPAY';

// Original atom.
export const checkoutAtom = atomWithStorage(CHECKOUT, defaultCheckout);
export const clearCheckoutAtom = atom(null, (_get, set, _data) => {
  return set(checkoutAtom, defaultCheckout);
});
export const billingAddressAtom = atom(
  (get) => get(checkoutAtom).billing_address,
  (get, set, data: Address) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, billing_address: data });
  }
);
export const shippingAddressAtom = atom(
  (get) => get(checkoutAtom).shipping_address,
  (get, set, data: Address) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, shipping_address: data });
  }
);
export const guestNameAtom = atom(
  (get) => get(checkoutAtom).customer_name,
  (get, set, data: string) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, customer_name: data });
  }
);
export const deliveryTimeAtom = atom(
  (get) => get(checkoutAtom).delivery_time,
  (get, set, data: DeliveryTime) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, delivery_time: data });
  }
);
export const paymentGatewayAtom = atom(
  (get) => get(checkoutAtom).payment_gateway,
  (get, set, data: PaymentMethodName) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, payment_gateway: data });
  }
);
export const verifiedTokenAtom = atom(
  (get) => get(checkoutAtom).token,
  (get, set, data: string) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, token: data });
  }
);
export const customerContactAtom = atom(
  (get) => get(checkoutAtom).customer_contact,
  (get, set, data: string) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, customer_contact: data });
  }
);

export const campayUseSavedContactAtom = atom(
  (get) => get(checkoutAtom).campay_use_saved_contact,
  (get, set, data: boolean) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, campay_use_saved_contact: data });
  }
);

export const campayOperatorAtom = atom(
  (get) => get(checkoutAtom).campay_operator,
  (get, set, data: string | null) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, campay_operator: data });
  }
);

export const campayPhoneNumberAtom = atom(
  (get) => get(checkoutAtom).campay_phone_number,
  (get, set, data: string) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, campay_phone_number: data });
  }
);

export const campayAutoSubmitAtom = atom(
  (get) => get(checkoutAtom).campay_auto_submit,
  (get, set, data: boolean) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, campay_auto_submit: data });
  }
);
export const orderNoteAtom = atom(
  (get) => get(checkoutAtom).note,
  (get, set, data: string) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, note: data });
  }
);

export const taramoneyNetworkAtom = atom(
  (get) => get(checkoutAtom).taramoney_network,
  (get, set, data: string | null) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, taramoney_network: data });
  }
);

export const taramoneyPhoneNumberAtom = atom(
  (get) => get(checkoutAtom).taramoney_phone_number,
  (get, set, data: string) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, taramoney_phone_number: data });
  }
);

export const taramoneyEmailAtom = atom(
  (get) => get(checkoutAtom).taramoney_email,
  (get, set, data: string) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, taramoney_email: data });
  }
);

export const taramoneyAutoSubmitAtom = atom(
  (get) => get(checkoutAtom).taramoney_auto_submit,
  (get, set, data: boolean) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, taramoney_auto_submit: data });
  }
);
export const verifiedResponseAtom = atom(
  (get) => get(checkoutAtom).verified_response,
  (get, set, data: VerifiedResponse | null) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, verified_response: data });
  }
);
export const couponAtom = atom(
  (get) => get(checkoutAtom).coupon,
  (get, set, data: Coupon | null) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, coupon: data });
  }
);
export const customOrderOfferAtom = atom(
  (get) => get(checkoutAtom).custom_order_offer_id,
  (get, set, data: string | number | null) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, custom_order_offer_id: data });
  }
);
export const discountAtom = atom((get) => get(checkoutAtom).coupon?.amount);
export const walletAtom = atom(
  (get) => get(checkoutAtom).use_wallet,
  (get, set) => {
    const prev = get(checkoutAtom);
    return set(checkoutAtom, { ...prev, use_wallet: !prev.use_wallet });
  }
);
