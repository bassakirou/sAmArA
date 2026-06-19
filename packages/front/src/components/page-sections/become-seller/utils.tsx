export const BECOME_SELLER_SECTION_ORDER = [
  'banner',
  'sellingSteps',
  'purpose',
  'userStory',
  'commission',
  'dashboard',
  'guideline',
  'faq',
  'contact',
  'sellerOpportunity',
] as const;

function createMeta(id: string, order: number) {
  return { id, enabled: true, order };
}

const DEFAULT_SECTIONS = {
  banner: { meta: createMeta('banner', 1), data: { newsTickerTitle: '', newsTickerURL: '', title: '', description: '', button1Name: '', button1Link: '', button2Name: '', button2Link: '', image: null } },
  sellingSteps: { meta: createMeta('sellingSteps', 2), data: { title: '', description: '', items: [] } },
  purpose: { meta: createMeta('purpose', 3), data: { title: '', description: '', items: [] } },
  userStory: { meta: createMeta('userStory', 4), data: { title: '', description: '', items: [] } },
  commission: { meta: createMeta('commission', 5), data: { title: '', description: '', defaultCommissionDetails: '', defaultCommissionRate: '', items: [] } },
  dashboard: { meta: createMeta('dashboard', 6), data: { title: '', description: '', buttonName: '', buttonLink: '', image: null } },
  guideline: { meta: createMeta('guideline', 7), data: { title: '', description: '', items: [] } },
  faq: { meta: createMeta('faq', 8), data: { title: '', description: '', items: [] } },
  contact: { meta: createMeta('contact', 9), data: { title: '', description: '' } },
  sellerOpportunity: { meta: createMeta('sellerOpportunity', 10), data: { title: '', description: '', buttonName: '', buttonLink: '', image: null } },
};

function normalizeSection(savedSection: any, defaultSection: any) {
  return {
    meta: {
      ...defaultSection.meta,
      ...(savedSection?.meta ?? {}),
    },
    data: {
      ...defaultSection.data,
      ...(savedSection?.data ?? {}),
    },
  };
}

function getLegacySectionData(pageOptions: any) {
  return {
    banner: pageOptions?.banner ?? {},
    sellingSteps: {
      title: pageOptions?.sellingSteps?.title ?? pageOptions?.sellingStepsTitle ?? '',
      description: pageOptions?.sellingSteps?.description ?? pageOptions?.sellingStepsDescription ?? '',
      items: pageOptions?.sellingSteps?.items ?? pageOptions?.sellingStepsItem ?? [],
    },
    purpose: {
      title: pageOptions?.purpose?.title ?? pageOptions?.purposeTitle ?? '',
      description: pageOptions?.purpose?.description ?? pageOptions?.purposeDescription ?? '',
      items: pageOptions?.purpose?.items ?? pageOptions?.purposeItems ?? [],
    },
    userStory: {
      title: pageOptions?.userStory?.title ?? pageOptions?.userStoryTitle ?? '',
      description: pageOptions?.userStory?.description ?? pageOptions?.userStoryDescription ?? '',
      items: pageOptions?.userStory?.items ?? pageOptions?.userStories ?? [],
    },
    commission: {
      title: pageOptions?.commission?.title ?? pageOptions?.commissionTitle ?? '',
      description: pageOptions?.commission?.description ?? pageOptions?.commissionDescription ?? '',
      defaultCommissionDetails: pageOptions?.commission?.defaultCommissionDetails ?? pageOptions?.defaultCommissionDetails ?? '',
      defaultCommissionRate: pageOptions?.commission?.defaultCommissionRate ?? pageOptions?.defaultCommissionRate ?? '',
      items: pageOptions?.commission?.items ?? pageOptions?.commissions ?? [],
    },
    dashboard: pageOptions?.dashboard ?? {},
    guideline: {
      title: pageOptions?.guideline?.title ?? pageOptions?.guidelineTitle ?? '',
      description: pageOptions?.guideline?.description ?? pageOptions?.guidelineDescription ?? '',
      items: pageOptions?.guideline?.items ?? pageOptions?.guidelineItems ?? [],
    },
    faq: {
      title: pageOptions?.faq?.title ?? pageOptions?.faqTitle ?? '',
      description: pageOptions?.faq?.description ?? pageOptions?.faqDescription ?? '',
      items: pageOptions?.faq?.items ?? pageOptions?.faqItems ?? [],
    },
    contact: pageOptions?.contact ?? {},
    sellerOpportunity: pageOptions?.sellerOpportunity ?? {},
  };
}

export function normalizeBecomeSellerSections(pageOptions: any = {}) {
  const sections = pageOptions?.sections;
  if (sections) {
    return BECOME_SELLER_SECTION_ORDER.reduce((result, key) => {
      result[key] = normalizeSection(sections?.[key], DEFAULT_SECTIONS[key]);
      return result;
    }, {} as Record<string, any>);
  }

  const legacyData = getLegacySectionData(pageOptions);
  return BECOME_SELLER_SECTION_ORDER.reduce((result, key) => {
    result[key] = normalizeSection({ data: legacyData[key] }, DEFAULT_SECTIONS[key]);
    return result;
  }, {} as Record<string, any>);
}

export function getOrderedBecomeSellerSections(pageOptions: any = {}) {
  const sections = normalizeBecomeSellerSections(pageOptions);
  return Object.values(sections)
    .filter((section: any) => section?.meta?.enabled)
    .sort((left: any, right: any) => {
      return Number(left?.meta?.order ?? 0) - Number(right?.meta?.order ?? 0);
    });
}

export function getImageSrc(image: any) {
  return image?.original || image?.thumbnail || '/assets/images/placeholder/collection.svg';
}

export function getSellerRegisterUrl() {
  const base = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.samara-shopping.com';
  return base.endsWith('/register') ? base : `${base}/register`;
}

export type BecomeSellerSectionProps<T = any> = {
  data: T;
  registerUrl: string;
};
