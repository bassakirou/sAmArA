export const Routes = {
  dashboard: '/',
  login: '/login',
  logout: '/logout',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  adminMyShops: '/my-shops',
  profile: '/profile',
  verifyCoupons: '/coupons/verify',
  settings: '/settings',
  storeSettings: '/vendor/settings',
  storeKeepers: '/vendor/store_keepers',
  profileUpdate: '/profile-update',
  checkout: '/orders/checkout',
  verifyEmail: '/verify-email',
  faq: {
    ...routesFactory('/faqs'),
  },
  termsAndConditions: {
    ...routesFactory('/terms-and-conditions'),
  },
  privacyPolicies: {
    ...routesFactory('/privacy-policies'),
  },
  becameSeller: '/become-seller',
  admins: '/admins',
  vendors: '/vendors',
  customers: '/customers',
  staffUsers: '/staff',
  user: {
    ...routesFactory('/users'),
  },
  type: {
    ...routesFactory('/brands'),
  },
  category: {
    ...routesFactory('/categories'),
  },
  attribute: {
    ...routesFactory('/attributes'),
  },
  attributeValue: {
    ...routesFactory('/attribute-values'),
  },
  tag: {
    ...routesFactory('/tags'),
  },
  reviews: {
    ...routesFactory('/reviews'),
  },
  abuseReviews: {
    ...routesFactory('/abusive_reports'),
  },
  abuseReviewsReport: {
    ...routesFactory('/abusive_reports/reject'),
  },
  author: {
    ...routesFactory('/authors'),
  },
  coupon: {
    ...routesFactory('/coupons'),
  },
  manufacturer: {
    ...routesFactory('/manufacturers'),
  },
  order: {
    ...routesFactory('/orders'),
  },
  orderStatus: {
    ...routesFactory('/order-status'),
  },
  orderCreate: {
    ...routesFactory('/orders/create'),
  },
  product: {
    ...routesFactory('/products'),
  },
  shop: {
    ...routesFactory('/shops'),
  },
  tax: {
    ...routesFactory('/taxes'),
  },
  shipping: {
    ...routesFactory('/shippings'),
  },
  withdraw: {
    ...routesFactory('/withdraws'),
  },
  staff: {
    ...routesFactory('/staffs'),
  },
  refund: {
    ...routesFactory('/refunds'),
  },
  question: {
    ...routesFactory('/questions'),
  },
  message: {
    ...routesFactory('/message'),
  },
  shopMessage: {
    ...routesFactory('/shop-message'),
  },
  conversations: {
    ...routesFactory('/message/conversations'),
  },
  storeNotice: {
    ...routesFactory('/store-notices'),
  },
  storeNoticeRead: {
    ...routesFactory('/store-notices/read'),
  },
  notifications: {
    ...routesFactory('/notifications'),
  },
  subscriptionPlans: {
    ...routesFactory('/subscription-plans'),
    subscribers: '/subscription-plans/subscribers',
    history: '/subscription-plans/history',
  },
  subscriptions: {
    list: '/subscriptions',
    payment: '/subscriptions/payment',
  },
  shopDeliveryTimes: (shop: string) => `/${shop}/delivery-times`,
};

function routesFactory(endpoint: string) {
  return {
    list: `${endpoint}`,
    create: `${endpoint}/create`,
    editWithoutLang: (slug: string, shop?: string) => {
      return shop
        ? `/${shop}${endpoint}/${slug}/edit`
        : `${endpoint}/${slug}/edit`;
    },
    edit: (slug: string, language: string, shop?: string) => {
      return shop
        ? `/${language}/${shop}${endpoint}/${slug}/edit`
        : `${language}${endpoint}/${slug}/edit`;
    },
    translate: (slug: string, language: string, shop?: string) => {
      return shop
        ? `/${language}/${shop}${endpoint}/${slug}/translate`
        : `${language}${endpoint}/${slug}/translate`;
    },
    details: (slug: string) => `${endpoint}/${slug}`,
  };
}
