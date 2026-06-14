import { adminAndOwnerOnly, adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';

type SidebarHref = string | ((shop: string) => string);

type SidebarItem = {
  href?: SidebarHref;
  label: string;
  icon?: string;
  permissions?: string[];
  requiresPlanPermission?: string;
  childMenu?: SidebarItem[];
};

type SidebarSection = {
  label: string;
  childMenu: SidebarItem[];
};

const link = (item: SidebarItem): SidebarItem => item;

const group = (
  label: string,
  childMenu: SidebarItem[],
  options: Omit<SidebarItem, 'label' | 'childMenu'> = {}
): SidebarItem => ({
  label,
  ...options,
  childMenu,
});

const section = (label: string, childMenu: SidebarItem[]): SidebarSection => ({
  label,
  childMenu,
});

const adminSidebarLinks = {
  main: section('sidebar-group-main', [
    link({
      href: Routes.dashboard,
      label: 'sidebar-nav-item-dashboard',
      icon: 'DashboardIcon',
    }),
  ]),
  shopManagement: section('sidebar-group-shop-management', [
    group(
      'sidebar-nav-item-shops',
      [
        link({
          href: Routes.shop.list,
          label: 'sidebar-nav-item-all-shops',
        }),
        link({
          href: Routes.shop.create,
          label: 'sidebar-nav-item-add-shop',
        }),
      ],
      { icon: 'ShopIcon' }
    ),
    link({
      href: Routes.adminMyShops,
      label: 'sidebar-nav-item-my-shops',
      icon: 'MyShopIcon',
    }),
  ]),
  productManagement: section('sidebar-group-product-management', [
    group(
      'sidebar-nav-item-products',
      [
        link({
          href: Routes.product.list,
          label: 'sidebar-nav-item-all-products',
        }),
        link({
          href: Routes.product.create,
          label: 'sidebar-nav-item-add-product',
        }),
      ],
      { icon: 'ProductsIcon' }
    ),
    link({
      href: Routes.type.list,
      label: 'sidebar-nav-item-brands',
      icon: 'TypesIcon',
    }),
    link({
      href: Routes.category.list,
      label: 'sidebar-nav-item-categories',
      icon: 'CategoriesIcon',
    }),
    link({
      href: Routes.tag.list,
      label: 'sidebar-nav-item-tags',
      icon: 'TagIcon',
    }),
    link({
      href: Routes.attribute.list,
      label: 'sidebar-nav-item-attributes',
      icon: 'AttributeIcon',
    }),
  ]),
  ecommerceManagement: section('sidebar-group-ecommerce-management', [
    link({
      href: Routes.tax.list,
      label: 'sidebar-nav-item-taxes',
      icon: 'TaxesIcon',
    }),
    link({
      href: Routes.shipping.list,
      label: 'sidebar-nav-item-shippings',
      icon: 'ShippingsIcon',
    }),
    link({
      href: Routes.withdraw.list,
      label: 'sidebar-nav-item-withdraws',
      icon: 'WithdrawIcon',
    }),
  ]),
  layoutPageControl: section('sidebar-group-layout-page-control', [
    group(
      'sidebar-nav-item-page-control',
      [
        group('sidebar-nav-item-faqs', [
          link({
            href: Routes.faq.list,
            label: 'sidebar-nav-item-all-faqs',
          }),
          link({
            href: Routes.faq.create,
            label: 'sidebar-nav-item-add-faq',
          }),
        ]),
        group('sidebar-nav-item-terms-and-conditions', [
          link({
            href: Routes.termsAndConditions.list,
            label: 'sidebar-nav-item-all-terms',
          }),
          link({
            href: Routes.termsAndConditions.create,
            label: 'sidebar-nav-item-add-terms',
          }),
        ]),
        group('sidebar-nav-item-privacy-policy', [
          link({
            href: Routes.privacyPolicies.list,
            label: 'sidebar-nav-item-all-privacy-policies',
          }),
          link({
            href: Routes.privacyPolicies.create,
            label: 'sidebar-nav-item-add-privacy-policy',
          }),
        ]),
        link({
          href: Routes.becameSeller,
          label: 'sidebar-nav-item-became-seller',
        }),
      ],
      { icon: 'StoreNoticeIcon' }
    ),
  ]),
  orderManagement: section('sidebar-group-order-management', [
    link({
      href: Routes.order.list,
      label: 'sidebar-nav-item-orders',
      icon: 'OrdersIcon',
    }),
    link({
      href: Routes.subscriptionPlans.list,
      label: 'sidebar-nav-item-subscription-plans',
      icon: 'CouponsIcon',
    }),
  ]),
  userControl: section('sidebar-group-user-control', [
    group(
      'sidebar-nav-item-users',
      [
        link({
          href: Routes.user.list,
          label: 'sidebar-nav-item-all-users',
        }),
        link({
          href: Routes.admins,
          label: 'sidebar-nav-item-admins',
        }),
        link({
          href: Routes.vendors,
          label: 'sidebar-nav-item-vendors',
        }),
        link({
          href: Routes.staffUsers,
          label: 'sidebar-nav-item-staffs',
        }),
        link({
          href: Routes.customers,
          label: 'sidebar-nav-item-customers',
        }),
      ],
      { icon: 'UsersIcon' }
    ),
  ]),
  promotionalManagement: section('sidebar-group-promotional-management', [
    group(
      'sidebar-nav-item-coupons',
      [
        link({
          href: Routes.coupon.list,
          label: 'sidebar-nav-item-all-coupons',
        }),
        link({
          href: Routes.coupon.create,
          label: 'sidebar-nav-item-add-coupon',
        }),
      ],
      { icon: 'CouponsIcon' }
    ),
  ]),
  siteManagement: section('sidebar-group-site-management', [
    link({
      href: Routes.settings,
      label: 'sidebar-nav-item-settings',
      icon: 'SettingsIcon',
    }),
  ]),
};

const shopSidebarLinks = {
  main: section('sidebar-group-main', [
    link({
      href: (shop: string) => `${Routes.dashboard}${shop}`,
      label: 'sidebar-nav-item-dashboard',
      icon: 'DashboardIcon',
      permissions: adminOwnerAndStaffOnly,
    }),
  ]),
  productManagement: section('sidebar-group-product-management', [
    group(
      'sidebar-nav-item-products',
      [
        link({
          href: (shop: string) => `/${shop}${Routes.product.list}`,
          label: 'sidebar-nav-item-all-products',
          permissions: adminOwnerAndStaffOnly,
        }),
        link({
          href: (shop: string) => `/${shop}${Routes.product.create}`,
          label: 'sidebar-nav-item-add-product',
          permissions: adminOwnerAndStaffOnly,
        }),
      ],
      {
        icon: 'ProductsIcon',
        permissions: adminOwnerAndStaffOnly,
      }
    ),
    link({
      href: (shop: string) => `/${shop}${Routes.attribute.list}`,
      label: 'sidebar-nav-item-attributes',
      icon: 'AttributeIcon',
      permissions: adminOwnerAndStaffOnly,
    }),
  ]),
  financialManagement: section('sidebar-group-financial-management', [
    link({
      href: (shop: string) => `/${shop}${Routes.withdraw.list}`,
      label: 'sidebar-nav-item-withdraws',
      icon: 'WithdrawIcon',
      permissions: adminAndOwnerOnly,
    }),
  ]),
  layoutControl: section('sidebar-group-layout-control', [
    group(
      'sidebar-nav-item-page-control',
      [
        group(
          'sidebar-nav-item-faqs',
          [
            link({
              href: (shop: string) => `/${shop}${Routes.faq.list}`,
              label: 'sidebar-nav-item-all-faqs',
              permissions: adminOwnerAndStaffOnly,
            }),
            link({
              href: (shop: string) => `/${shop}${Routes.faq.create}`,
              label: 'sidebar-nav-item-add-faq',
              permissions: adminOwnerAndStaffOnly,
            }),
          ],
          { permissions: adminOwnerAndStaffOnly }
        ),
        group(
          'sidebar-nav-item-terms-and-conditions',
          [
            link({
              href: (shop: string) =>
                `/${shop}${Routes.termsAndConditions.list}`,
              label: 'sidebar-nav-item-all-terms',
              permissions: adminOwnerAndStaffOnly,
            }),
            link({
              href: (shop: string) =>
                `/${shop}${Routes.termsAndConditions.create}`,
              label: 'sidebar-nav-item-add-terms',
              permissions: adminOwnerAndStaffOnly,
            }),
          ],
          { permissions: adminOwnerAndStaffOnly }
        ),
      ],
      {
        icon: 'DiaryIcon',
        permissions: adminOwnerAndStaffOnly,
      }
    ),
  ]),
  orderManagement: section('sidebar-group-order-management', [
    link({
      href: (shop: string) => `/${shop}${Routes.order.list}`,
      label: 'sidebar-nav-item-orders',
      icon: 'OrdersIcon',
      permissions: adminOwnerAndStaffOnly,
    }),
    link({
      href: (shop: string) => `/${shop}${Routes.subscriptions.list}`,
      label: 'sidebar-nav-item-subscriptions',
      icon: 'CouponsIcon',
      permissions: adminOwnerAndStaffOnly,
    }),
    link({
      href: (shop: string) => Routes.shopDeliveryTimes(shop),
      label: 'sidebar-nav-item-delivery-times',
      icon: 'CalendarScheduleIcon',
      permissions: adminOwnerAndStaffOnly,
    }),
  ]),
  userControl: section('sidebar-group-user-control', [
    link({
      href: (shop: string) => `/${shop}${Routes.staff.list}`,
      label: 'sidebar-nav-item-staffs',
      icon: 'UsersIcon',
      permissions: adminAndOwnerOnly,
    }),
  ]),
  messagesManagement: section('sidebar-group-messages-management', [
    link({
      href: (shop: string) => `/${shop}${Routes.shopMessage.list}`,
      label: 'sidebar-nav-item-discussions',
      icon: 'ChatIcon',
      permissions: adminOwnerAndStaffOnly,
      requiresPlanPermission: 'chat_negotiation',
    }),
    link({
      href: (shop: string) => `/${shop}${Routes.notifications.list}`,
      label: 'sidebar-nav-item-notifications',
      icon: 'StoreNoticeIcon',
      permissions: adminOwnerAndStaffOnly,
    }),
  ]),
};

export const siteSettings = {
  name: 'sAmArA',
  description: '',
  logo: {
    url: '/logo.svg',
    alt: 'sAmArA',
    href: '/',
    width: 128,
    height: 40,
  },
  defaultLanguage: 'en',
  author: {
    name: 'Digitaille, Sarl.',
    websiteUrl: 'https://samara-shopping.com',
    address: 'Yaounde',
  },
  headerLinks: [],
  authorizedLinks: [
    {
      href: Routes.profileUpdate,
      labelTransKey: 'authorized-nav-item-profile',
    },
    {
      href: Routes.logout,
      labelTransKey: 'authorized-nav-item-logout',
    },
  ],
  currencyCode: 'XAF',
  sidebarLinks: {
    admin: adminSidebarLinks,
    shop: shopSidebarLinks,
  },
  product: {
    placeholder: '/product-placeholder.svg',
  },
  avatar: {
    placeholder: '/avatar-placeholder.svg',
  },
};
