export const CART_KEY = 'samara-cart';
export const BOOKMARK_KEY = 'samara-bookmark';
export const TOKEN = 'token';
export const AUTH_TOKEN = 'auth_token';
export const AUTH_PERMISSIONS = 'auth_permissions';
export const LIMIT = 10;
export const SUPER_ADMIN = 'super_admin';
export const CUSTOMER = 'customer';
export const CHECKOUT = 'sAmArA-checkout';
export const DISPLAY_CURRENCY = 'sAmArA-display-currency';
export const RTL_LANGUAGES: ReadonlyArray<string> = ['ar', 'he'];
export const EMAIL_VERIFIED = 'EMAIL_VERIFIED';
export const SUBSCRIPTION_CHECKOUT_PLAN = 'samara-subscription-checkout-plan';
export const SUBSCRIPTION_CHECKOUT_PENDING =
  'samara-subscription-checkout-pending';

export const ORDER_STATUS = [
  { name: 'Order Pending', status: 'order-pending', serial: 1 },
  { name: 'Order Processing', status: 'order-processing', serial: 2 },
  {
    name: 'Order At Local Facility',
    status: 'order-at-local-facility',
    serial: 3,
  },
  {
    name: 'Order Out For Delivery',
    status: 'order-out-for-delivery',
    serial: 4,
  },
  { name: 'Order Completed', status: 'order-completed', serial: 5 },
  { name: 'Order Cancelled', status: 'order-cancelled', serial: 5 },
  { name: 'Order Refunded', status: 'order-refunded', serial: 5 },
  { name: 'Order Failed', status: 'order-failed', serial: 5 },
];

export function getDirection(language: string | undefined) {
  if (!language) return 'ltr';
  return RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
}
