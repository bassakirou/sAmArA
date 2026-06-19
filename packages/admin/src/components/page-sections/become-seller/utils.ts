const SECTION_DEFINITIONS = [
  { key: 'banner', order: 1 },
  { key: 'sellingSteps', order: 2 },
  { key: 'purpose', order: 3 },
  { key: 'userStory', order: 4 },
  { key: 'commission', order: 5 },
  { key: 'dashboard', order: 6 },
  { key: 'guideline', order: 7 },
  { key: 'faq', order: 8 },
  { key: 'contact', order: 9 },
  { key: 'sellerOpportunity', order: 10 },
] as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createMeta(id: string, order: number) {
  return {
    id,
    enabled: true,
    order,
  };
}

const DEFAULT_BECOME_SELLER_SECTIONS = {
  banner: {
    meta: createMeta('banner', 1),
    data: {
      newsTickerTitle: '',
      newsTickerURL: '',
      title: '',
      description: '',
      button1Name: '',
      button1Link: '',
      button2Name: '',
      button2Link: '',
      image: null,
    },
  },
  sellingSteps: {
    meta: createMeta('sellingSteps', 2),
    data: {
      title: '',
      description: '',
      items: [],
    },
  },
  purpose: {
    meta: createMeta('purpose', 3),
    data: {
      title: '',
      description: '',
      items: [],
    },
  },
  userStory: {
    meta: createMeta('userStory', 4),
    data: {
      title: '',
      description: '',
      items: [],
    },
  },
  commission: {
    meta: createMeta('commission', 5),
    data: {
      title: '',
      description: '',
      defaultCommissionDetails: '',
      defaultCommissionRate: '',
      items: [],
    },
  },
  dashboard: {
    meta: createMeta('dashboard', 6),
    data: {
      title: '',
      description: '',
      buttonName: '',
      buttonLink: '',
      image: null,
    },
  },
  guideline: {
    meta: createMeta('guideline', 7),
    data: {
      title: '',
      description: '',
      items: [],
    },
  },
  faq: {
    meta: createMeta('faq', 8),
    data: {
      title: '',
      description: '',
      items: [],
    },
  },
  contact: {
    meta: createMeta('contact', 9),
    data: {
      title: '',
      description: '',
    },
  },
  sellerOpportunity: {
    meta: createMeta('sellerOpportunity', 10),
    data: {
      title: '',
      description: '',
      buttonName: '',
      buttonLink: '',
      image: null,
    },
  },
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
      description:
        pageOptions?.sellingSteps?.description ??
        pageOptions?.sellingStepsDescription ??
        '',
      items:
        pageOptions?.sellingSteps?.items ?? pageOptions?.sellingStepsItem ?? [],
    },
    purpose: {
      title: pageOptions?.purpose?.title ?? pageOptions?.purposeTitle ?? '',
      description:
        pageOptions?.purpose?.description ??
        pageOptions?.purposeDescription ??
        '',
      items: pageOptions?.purpose?.items ?? pageOptions?.purposeItems ?? [],
    },
    userStory: {
      title: pageOptions?.userStory?.title ?? pageOptions?.userStoryTitle ?? '',
      description:
        pageOptions?.userStory?.description ??
        pageOptions?.userStoryDescription ??
        '',
      items: pageOptions?.userStory?.items ?? pageOptions?.userStories ?? [],
    },
    commission: {
      title:
        pageOptions?.commission?.title ?? pageOptions?.commissionTitle ?? '',
      description:
        pageOptions?.commission?.description ??
        pageOptions?.commissionDescription ??
        '',
      defaultCommissionDetails:
        pageOptions?.commission?.defaultCommissionDetails ??
        pageOptions?.defaultCommissionDetails ??
        '',
      defaultCommissionRate:
        pageOptions?.commission?.defaultCommissionRate ??
        pageOptions?.defaultCommissionRate ??
        '',
      items: pageOptions?.commission?.items ?? pageOptions?.commissions ?? [],
    },
    dashboard: pageOptions?.dashboard ?? {},
    guideline: {
      title:
        pageOptions?.guideline?.title ?? pageOptions?.guidelineTitle ?? '',
      description:
        pageOptions?.guideline?.description ??
        pageOptions?.guidelineDescription ??
        '',
      items:
        pageOptions?.guideline?.items ?? pageOptions?.guidelineItems ?? [],
    },
    faq: {
      title: pageOptions?.faq?.title ?? pageOptions?.faqTitle ?? '',
      description:
        pageOptions?.faq?.description ?? pageOptions?.faqDescription ?? '',
      items: pageOptions?.faq?.items ?? pageOptions?.faqItems ?? [],
    },
    contact: pageOptions?.contact ?? {},
    sellerOpportunity: pageOptions?.sellerOpportunity ?? {},
  };
}

export function getDefaultBecomeSellerSections() {
  return clone(DEFAULT_BECOME_SELLER_SECTIONS);
}

export function normalizeBecomeSellerSections(pageOptions: any = {}) {
  const defaults = getDefaultBecomeSellerSections();
  const savedSections = pageOptions?.sections;
  if (savedSections) {
    return SECTION_DEFINITIONS.reduce((result, section) => {
      result[section.key] = normalizeSection(
        savedSections?.[section.key],
        defaults[section.key]
      );
      return result;
    }, {} as Record<string, any>);
  }

  const legacyData = getLegacySectionData(pageOptions);
  return SECTION_DEFINITIONS.reduce((result, section) => {
    result[section.key] = normalizeSection(
      { data: legacyData[section.key] },
      defaults[section.key]
    );
    return result;
  }, {} as Record<string, any>);
}
