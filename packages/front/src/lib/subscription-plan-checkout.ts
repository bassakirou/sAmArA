import {
  SUBSCRIPTION_CHECKOUT_PENDING,
  SUBSCRIPTION_CHECKOUT_PLAN,
} from '@lib/constants';
import {
  SubscriptionPlan,
  VendorSubscriptionBillingPeriod,
} from '@type/index';

export type PendingSubscriptionCheckout = {
  planId?: number | string;
  billingPeriod?: VendorSubscriptionBillingPeriod;
  sellerFlow?: boolean;
};

function isBrowser() {
  return typeof window !== 'undefined';
}

export function setSelectedSubscriptionPlan(plan: SubscriptionPlan) {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    SUBSCRIPTION_CHECKOUT_PLAN,
    JSON.stringify(plan)
  );
}

export function getSelectedSubscriptionPlan(): SubscriptionPlan | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(SUBSCRIPTION_CHECKOUT_PLAN);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SubscriptionPlan;
  } catch {
    return null;
  }
}

export function clearSelectedSubscriptionPlan() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SUBSCRIPTION_CHECKOUT_PLAN);
}

export function markSubscriptionCheckoutPending(
  payload: PendingSubscriptionCheckout = {}
) {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    SUBSCRIPTION_CHECKOUT_PENDING,
    JSON.stringify(payload)
  );
}

export function hasPendingSubscriptionCheckout() {
  if (!isBrowser()) return false;
  return Boolean(window.localStorage.getItem(SUBSCRIPTION_CHECKOUT_PENDING));
}

export function getPendingSubscriptionCheckout(): PendingSubscriptionCheckout | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(SUBSCRIPTION_CHECKOUT_PENDING);
  if (!raw) return null;
  if (raw === '1') return {};
  try {
    return JSON.parse(raw) as PendingSubscriptionCheckout;
  } catch {
    return null;
  }
}

export function clearPendingSubscriptionCheckout() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SUBSCRIPTION_CHECKOUT_PENDING);
}

export function getAdminBaseUrl() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ADMIN_URL) {
    return process.env.NEXT_PUBLIC_ADMIN_URL.replace(/\/$/, '');
  }

  if (isBrowser()) {
    const { protocol, hostname, port } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const adminPort = port === '3003' ? '3002' : port || '3002';
      return `${protocol}//${hostname}:${adminPort}`;
    }
  }

  return 'https://admin.samara-shopping.com';
}

export function getAdminSubscriptionCheckoutUrl(
  planId?: number | string,
  billingPeriod: VendorSubscriptionBillingPeriod = 'monthly'
) {
  const base = getAdminBaseUrl();
  const params = new URLSearchParams();

  if (planId !== undefined && planId !== null && String(planId).trim()) {
    params.set('plan', String(planId));
  }

  params.set('period', billingPeriod);

  const query = params.toString();
  return `${base}/subscriptions/checkout${query ? `?${query}` : ''}`;
}

export function getAdminVerifyEmailUrl() {
  return `${getAdminBaseUrl()}/verify-email`;
}
