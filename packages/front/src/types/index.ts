import { QueryKey } from 'react-query';

export interface QueryOptions {
  language?: string;
}

export interface GetParams {
  slug: string;
  language?: string;
}

export type FaqType = 'customer' | 'seller';

export type Faq = {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  type: FaqType;
  language: string;
  order: number;
};

export type FaqQueryOptionsType = QueryOptions & {
  title?: string;
  type?: FaqType;
  limit?: number;
  page?: number;
  orderBy?: string;
  sortedBy?: string;
};

export type FaqPaginator = PaginatorInfo<Faq>;

export type TermsAndCondition = {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  language: string;
  order: number;
};

export type TermsAndConditionsQueryOptionsType = QueryOptions & {
  title?: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  sortedBy?: string;
};

export type TermsAndConditionPaginator = PaginatorInfo<TermsAndCondition>;

export interface ParamsType extends QueryOptions {
  type?: string;
  text?: string;
  category?: string;
  tags?: string;
  variations?: string;
  status?: string;
  is_active?: string;
  shop_id?: string;
  limit?: number;
  sortedBy?: string;
  orderBy?: string;
  min_price?: string;
  max_price?: string;
  parent?: string | null;
}

export interface CategoriesQueryOptionsType extends QueryOptions {
  type?: string;
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
  parent?: string | null;
}

export type TypeQueryOptionsType = {
  limit?: number;
};

export type BrandsQueryParamsType = {
  limit?: number;
};

export interface ProductsQueryOptionsType extends QueryOptions {
  type?: string;
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
  shop_id?: number;
  sortedBy?: string;
  orderBy?: string;
  variations?: string;
  tags?: string;
  min_price?: string;
  max_price?: string;
}

export type TagsQueryOptionsType = {
  limit?: number;
};

export type ShopsQueryOptionsType = {
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
  is_active?: number;
};
export type OrdersQueryOptionsType = {
  tracking_number?: string;
  orderBy?: string;
  sortedBy?: string;
  customer_id?: number;
  shop_id?: number;
  first?: number;
  page?: number;
  limit?: number;
};

export type QueryParamsType = {
  queryKey: QueryKey;
  pageParam?: string;
};
export type Banner = {
  title: string;
  description: string;
  image: {
    id: string;
    original: string;
    thumbnail: string;
  };
};

export declare type KeyBasedImage = {
  key: string;
  image: Attachment[];
};

export declare type Type = {
  id: number | string;
  name: string;
  slug: string;
  icon: string;
  banners: Banner[];
  promotional_sliders: any[];
  images: KeyBasedImage[];
  settings: {
    isHome: boolean;
    layoutType: string;
    productCard: string;
  };
  // products?: Maybe<ProductPaginator>;
  created_at: Date;
  updated_at: Date;
};
export declare type Coupon = {
  id: number | string;
  code: string;
  description: string;
  // orders: Order[];
  type: string;
  image: string;
  amount: number;
  active_from: Date;
  expire_at: Date;
  created_at: Date;
  updated_at: Date;
};
export declare type Category = {
  id: number | string;
  name: string;
  slug: string;
  parent?: number;
  parent_id?: number;
  products_count?: number;
  children: Category[];
  details?: string;
  image?: Attachment[];
  icon?: string;
  type: Type;
  products: Product[];
  created_at: Date;
  updated_at: Date;
  banner_image?: Attachment[];
};
export declare type Attachment = {
  id?: number | string;
  thumbnail?: string;
  original?: string;
};

export declare type ProductVideo = {
  url?: string;
  type?: string;
  attachment_id?: number | string;
};

export declare type AttributeValue = {
  id: string;
  attribute_id: string;
  value: string;
  meta?: string;
};

export declare type Attribute = {
  id: string;
  slug: string;
  name: string;
  values: [AttributeValue];
};

export declare type Variation = {
  id: string;
  options?: any;
};
export declare type Product = {
  id?: number | string;
  name?: string;
  slug?: string;
  type?: Type;
  categories?: Category[];
  variations: AttributeValue[];
  variation_options: Variation[];
  // pivot?: OrderProductPivot
  // orders: Order[]
  shop?: any;
  description?: string;
  in_stock?: boolean;
  is_negotiable?: boolean;
  can_discuss_price?: boolean;
  is_taxable?: boolean;
  sale_price?: number;
  sku?: string;
  video?: ProductVideo[];
  gallery?: Attachment[];
  image?: Attachment;
  // status?: ProductStatus
  status?: string;
  height?: string;
  length?: string;
  width?: string;
  price?: number;
  min_price?: number;
  max_price?: number;
  related_products?: Product[];
  quantity?: number;
  unit?: string;
  product_type: string;
  created_at?: Date;
  updated_at?: Date;
  orders_count?: number;
  sold: number;
};

export declare type Tag = {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  details?: string;
  products_count?: number;
};

export declare type UserAddress = {
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export declare type Order = {
  id: number | string;
  tracking_number: string;
  customer_id: number | string;
  customer_name: string;
  customer_contact: string;
  customer?: User;
  status: any;
  amount: number;
  children: Order[];
  sales_tax: number;
  total: number;
  paid_total: number;
  payment_id?: string;
  payment_gateway?: string;
  coupon?: Coupon;
  discount?: number;
  delivery_fee?: number;
  delivery_time: string;
  products: Product[];
  created_at: Date;
  updated_at: Date;
  billing_address?: UserAddress;
  shipping_address?: UserAddress;
  payment_intent?: PaymentIntent;
  payment_status?: string;
  order_status?: string;
  custom_order_offer?: CustomOrderOffer | null;
};

export interface PaymentIntent {
  id: number | string;
  order_id: number | string;
  payment_gateway: PaymentGateway;
  tracking_number: string;
  payment_intent_info: PaymentIntentInfo;
}

export type SettingsType = {
  id: number | string;
  options: SettingsOptions;
};

export type SettingsOptions = {
  siteTitle?: string;
  siteSubtitle?: string;
  currency?: string;
  logo?: Attachment;
  taxClass?: string;
  shippingClass?: string;
  contactDetails?: any;
  paymentGateway?: any;
  defaultPaymentGateway: string;
};

export interface Card {
  expires: string;
  network: string;
  origin: string;
  owner_name: string;
  payment_gateway_id: number | string;
  default_card: number;
}

export interface PaymentIntentInfo {
  is_redirect: boolean;
  client_secret?: string;
  payment_id?: string;
  redirect_url?: string;
  currency?: string;
  amount?: string | number;
  message?: string;
  [key: string]: any;
}

export interface CreateOrderPaymentInput {
  tracking_number: string;
  payment_gateway: string;
}

export interface PaymentIntentCollection {
  tracking_number?: string;
  payment_intent_info?: PaymentIntentInfo;
  payment_gateway?: string;
}
export interface UserPaymentGateway {
  id: number | string;
  customer_id: string;
  gateway_name: PaymentGateway;
  user_id: number | string;
}

export type Shop = {
  [key: string]: any;
};

export type Address = {
  [key: string]: any;
};

export type Social = {
  url: string;
  icon: string;
  label: string;
};

export type Instagram = {
  id: string;
  media_url: string;
  media_type: string;
  permalink: string;
  caption: string;
};

export type StaticBanner = {
  id: number;
  title: string;
  slug: string;
  image: {
    mobile: StaticBannerImage;
    desktop: StaticBannerImage;
  };
};

export type StaticBannerImage = {
  url: string;
  width: number;
  height: number;
};

export type CollectionBanner = {
  id: number;
  slug: string;
  image: string;
  title: string;
  description?: string;
};

export type FeatureBanner = {
  id: number;
  icon: string;
  title: string;
  description: string;
};

export type PaginatedTypes = {
  data: Type[];
  paginatorInfo: any;
};

export interface PaginatorInfo<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
  paginatorInfo?: any;
}

export type Message = {
  id: number | string;
  conversation_id: number | string;
  user_id: number | string;
  user?: User;
  body: string;
  product_id?: number | string | null;
  negotiated_price?: number | string | null;
  custom_offer?: CustomOrderOffer | null;
  product?: Product | null;
  created_at: string;
  updated_at: string;
};

export type CustomOrderOffer = {
  id: number | string;
  conversation_id: number | string;
  message_id?: number | string | null;
  order_id?: number | string | null;
  product_id: number | string;
  shop_id: number | string;
  seller_id: number | string;
  customer_id: number | string;
  original_price: number;
  negotiated_price: number;
  minimum_allowed_price: number;
  maximum_discount_percent: number;
  status: string;
  accepted_at?: string | null;
  converted_at?: string | null;
  product?: Product | null;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: number | string;
  user_id: number | string;
  user?: User;
  to_user_id?: number | string;
  to_user?: User;
  shop_id: number | string;
  shop?: Shop;
  messages?: Message[];
  latest_message?: Message | null;
  unseen?: number;
  created_at: string;
  updated_at: string;
};

export type LoginInputType = {
  email: string;
  password: string;
};
export type RegisterUserInputType = {
  name: string;
  email: string;
  password: string;
  permission?: string;
};

export type ChangePasswordInputType = {
  oldPassword: string;
  newPassword: string;
};
export type ForgetPasswordInputType = {
  email: string;
};
export type ResetPasswordInputType = {
  email: string;
  token: string;
  password: string;
};
export type VerifyPasswordInputType = {
  email: string;
  token: string;
};
export type SocialLoginInputType = {
  provider: string;
  access_token: string;
};
export type SendOtpCodeInputType = {
  phone_number: string;
};
export type VerifyOtpInputType = {
  phone_number: string;
  code: string;
  otp_id: string;
};
export type OtpLoginInputType = {
  phone_number: string;
  code: string;
  otp_id: string;
  name?: string;
  email?: string;
  permission?: string;
};
export type UpdateContactInput = {
  phone_number: string;
  code: string;
  otp_id: string;
  user_id: string;
};

export interface User {
  id: string;
  name: string;
  email: string;
  wallet: {
    total_points: number;
    points_used: number;
    available_points: number;
  };
  profile: {
    id?: string;
    contact?: string;
    bio?: string;
    avatar?: Attachment;
  };
  address: Address[];
}

export type VerifyCheckoutInputType = {
  amount: number;
  products: any[];
  billing_address: any;
  shipping_address: any;
  custom_order_offer_id?: number | string;
};

export type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  description: string;
};

export type VerifyCouponInputType = {
  code: string;
  sub_total: number;
};

export type CustomerType = {
  id: string;
  [key: string]: unknown;
};
export type ContactType = {
  name: string;
  email: string;
  subject: string;
  description: string;
};

export type OrderCreateInputType = {
  [key: string]: unknown;
};

export type SettingsResponse = {
  id: string;
  name: string;
  slug: string;
  options: {
    [key: string]: any;
  };
};
export interface Success {
  success: boolean;
  message: string;
}
export interface VerificationEmailUserInput extends Success {
  email: string;
}

export enum PhoneNumberStatus {
  NUMBER = 'PhoneNumber',
}

export enum PaymentGateway {
  STRIPE = 'STRIPE',
  COD = 'CASH_ON_DELIVERY',
  PAYPAL = 'PAYPAL',
  MOLLIE = 'MOLLIE',
  RAZORPAY = 'RAZORPAY',
  PAYSTACK = 'PAYSTACK',
  IYZICO = 'IYZICO',
  TARAMONEY = 'TARAMONEY',
  CAMPAY = 'CAMPAY',
}

export enum PaymentStatus {
  PENDING = 'payment-pending',
  PROCESSING = 'payment-processing',
  SUCCESS = 'payment-success',
  FAILED = 'payment-failed',
  REVERSAL = 'payment-reversal',
  COD = 'cash-on-delivery',
  AWAITING_FOR_APPROVAL = 'payment-awaiting-for-approval',
}

export enum OrderStatus {
  PENDING = 'order-pending',
  PROCESSING = 'order-processing',
  COMPLETED = 'order-completed',
  CANCELLED = 'order-cancelled',
  REFUNDED = 'order-refunded',
  FAILED = 'order-failed',
  AT_LOCAL_FACILITY = 'order-at-local-facility',
  OUT_FOR_DELIVERY = 'order-out-for-delivery',
}

export type NumberOrString = number | string;

export type PaginatedOrder = {
  data: Order[];
  paginatorInfo: any;
};

export interface GoogleMapLocation {
  lat?: number | string;
  lng?: number | string;
  street_number?: string;
  route?: string;
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  formattedAddress?: string;
  formatted_address?: string;
}

export interface SettingsQueryOptions extends QueryOptions {}
export interface AttributeQueryOptions extends QueryOptions {}

export interface TypePaginator extends PaginatorInfo<Type> {}
export interface CategoryPaginator extends PaginatorInfo<Category> {}
export interface CouponPaginator extends PaginatorInfo<Coupon> {}
export interface OrderPaginator extends PaginatorInfo<Order> {}
export interface ProductPaginator extends PaginatorInfo<Product> {}
export interface ShopPaginator extends PaginatorInfo<Shop> {}
export interface TagPaginator extends PaginatorInfo<Tag> {}
export interface ConversationPaginator extends PaginatorInfo<Conversation> {}
export interface MessagePaginator extends PaginatorInfo<Message> {}
export interface Faq {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  type: FaqType;
  language: string;
  order: number;
}
export type FaqType = 'customer' | 'seller';
export interface FaqQueryOptionsType extends QueryOptions {
  type?: FaqType;
}
export interface FaqPaginator extends PaginatorInfo<Faq> {}
export interface SubscriptionPlan {
  id: number | string;
  name: string;
  description: string;
  level: number;
  monthly_price: number;
  annual_monthly_prorata_price: number;
  permissions?: string[];
  max_products?: number | null;
  platform_commission_rate?: number | null;
  discount_percent?: number | null;
  discount_starts_at?: string | null;
  discount_ends_at?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
export interface SubscriptionPlanPaginator
  extends PaginatorInfo<SubscriptionPlan> {}
export type VendorSubscriptionBillingPeriod = 'monthly' | 'annual';
export interface VendorSubscription {
  id: number | string;
  user_id: number | string;
  subscription_plan_id: number | string;
  status: string;
  billing_period: VendorSubscriptionBillingPeriod;
  amount: number;
  currency: string;
  payment_gateway: string;
  payment_tracking_number: string;
  paid_at?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  payment_intent_info?: PaymentIntentInfo | null;
  plan?: SubscriptionPlan | null;
}
export interface VendorSubscriptionSummary {
  trial_ends_at?: string | null;
  active_subscription_plan?: SubscriptionPlan | null;
  active_subscription_billing_period?: VendorSubscriptionBillingPeriod | null;
  active_subscription_starts_at?: string | null;
  active_subscription_ends_at?: string | null;
}
export interface VendorSubscriptionStartInput {
  subscription_plan_id: number | string;
  billing_period: VendorSubscriptionBillingPeriod;
  payment_gateway: 'TARAMONEY' | 'CAMPAY';
  taramoney?: {
    phone_number?: string;
    network?: string;
    email?: string;
    return_url?: string;
    return_url_base?: string;
    webhook_url?: string;
  };
  campay?: {
    phone_number?: string;
  };
}
export interface VendorSubscriptionStartResponse {
  subscription: VendorSubscription;
  payment_intent: PaymentIntent;
}
export interface TermsAndCondition {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  language: string;
  order: number;
}
export interface TermsAndConditionsQueryOptionsType extends QueryOptions {}
export interface TermsAndConditionPaginator
  extends PaginatorInfo<TermsAndCondition> {}
export interface PrivacyPolicy {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  language: string;
  order: number;
}
export interface PrivacyPoliciesQueryOptionsType extends QueryOptions {}
export interface PrivacyPolicyPaginator extends PaginatorInfo<PrivacyPolicy> {}
