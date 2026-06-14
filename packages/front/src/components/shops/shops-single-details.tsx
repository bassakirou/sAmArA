import StickyBox from 'react-sticky-box';
import Text from '@components/ui/text';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useUI } from '@contexts/ui.context';
import { getDirection } from '@utils/get-direction';
import Container from '@components/ui/container';
import { Drawer } from '@components/common/drawer/drawer';
import ShopSidebar from './shop-sidebar';
import ShopSidebarDrawer from './shop-sidebar-drawer';
import { Shop } from '@type/index';
import { productPlaceholder } from '@lib/placeholders';
import { useTranslation } from 'next-i18next';
import ShopProductsGrid from '@components/shops/shop-products-grid';
import Accordion from '@components/common/accordion';

const sanitizeRichTextHtml = (input: string) => {
  let html = String(input ?? '');

  html = html.replace(/\u0000/g, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(
    /<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ''
  );
  html = html.replace(
    /<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/\s*>/gi,
    ''
  );

  html = html.replace(/<\s*a\b([^>]*)>/gi, (_match, attrs) => {
    const hrefMatch = String(attrs ?? '').match(
      /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
    );
    const hrefRaw = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? '';
    const href = hrefRaw.trim();
    const isSafe = !href || /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href);

    if (!isSafe) {
      return '<a>';
    }

    const safeHref = href
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return safeHref
      ? `<a href="${safeHref}" target="_blank" rel="nofollow noopener noreferrer">`
      : '<a>';
  });

  html = html.replace(
    /<\s*(\/?)\s*([a-z0-9]+)(\s[^>]*)?>/gi,
    (_m, slash, tag) => {
      const normalizedTag = String(tag ?? '').toLowerCase();
      return `<${slash}${normalizedTag}>`;
    }
  );

  return html;
};

type Props = {
  data: Shop;
  termsAndConditions?: {
    id?: string | number;
    title: string;
    description: string;
  }[];
  faqs?: { id?: string | number; title: string; description: string }[];
};

type ContentSection = {
  id?: string | number;
  title: string;
  description: string;
  order?: number;
};

const normalizeFaqSections = (
  shopFaqs: unknown,
  fallbackFaqs?: ContentSection[]
): ContentSection[] => {
  if (Array.isArray(shopFaqs) && shopFaqs.length > 0) {
    return shopFaqs
      .reduce<ContentSection[]>((items, item, index) => {
        if (!item || typeof item !== 'object') {
          return items;
        }

        const faq = item as Record<string, unknown>;
        items.push({
          id:
            typeof faq.id === 'string' || typeof faq.id === 'number'
              ? faq.id
              : index,
          title:
            typeof faq.title === 'string'
              ? faq.title
              : typeof faq.question === 'string'
              ? faq.question
              : '',
          description:
            typeof faq.description === 'string'
              ? faq.description
              : typeof faq.answer === 'string'
              ? faq.answer
              : '',
          order: Number.isFinite(Number(faq.order)) ? Number(faq.order) : index,
        });
        return items;
      }, [])
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  }

  return fallbackFaqs ?? [];
};

const normalizeTermsSections = (
  shopTerms: unknown,
  fallbackTerms?: ContentSection[]
): ContentSection[] => {
  if (Array.isArray(shopTerms) && shopTerms.length > 0) {
    return shopTerms.reduce<ContentSection[]>((items, item, index) => {
      if (!item || typeof item !== 'object') {
        return items;
      }

      const section = item as Record<string, unknown>;
      items.push({
        id:
          typeof section.id === 'string' || typeof section.id === 'number'
            ? section.id
            : index,
        title: typeof section.title === 'string' ? section.title : '',
        description:
          typeof section.description === 'string' ? section.description : '',
        order: Number.isFinite(Number(section.order))
          ? Number(section.order)
          : index,
      });
      return items;
    }, []);
  }

  if (typeof shopTerms === 'string' && shopTerms.trim()) {
    return [
      {
        id: 'shop-terms',
        title: '',
        description: shopTerms.trim(),
        order: 0,
      },
    ];
  }

  return fallbackTerms ?? [];
};

const ShopsSingleDetails: React.FC<Props> = ({
  data,
  termsAndConditions,
  faqs,
}) => {
  const { openShop, displayShop, closeShop } = useUI();
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation();
  const dir = getDirection(locale);
  const contentWrapperCSS = dir === 'ltr' ? { left: 0 } : { right: 0 };
  const rawTab = typeof router.query.tab === 'string' ? router.query.tab : null;
  const activeTab =
    rawTab === 'terms' || rawTab === 'faq' || rawTab === 'shop'
      ? rawTab
      : 'shop';
  const shopTermsAndConditions = normalizeTermsSections(
    data?.settings?.terms_and_conditions,
    termsAndConditions
  );
  const shopFaqs = normalizeFaqSections(data?.settings?.faqs, faqs);

  return (
    <>
      <div className="flex items-center px-8 py-4 mb-4 border-b border-gray-300 lg:hidden">
        <div className="flex flex-shrink-0">
          <Image
            src={data?.logo?.original! ?? productPlaceholder}
            alt={data?.name}
            width={62}
            height={62}
            className="rounded-md"
          />
        </div>
        <div className="ltr:pl-4 rtl:pr-4">
          <Text variant="heading">{data?.name}</Text>
          <button
            className="text-sm font-semibold transition-all text-heading opacity-80 hover:opacity-100"
            onClick={openShop}
          >
            {t('text-more-info')}
          </button>
        </div>
      </div>
      <Container>
        <div className="flex flex-col pb-16 lg:flex-row lg:pt-7 lg:pb-20">
          <div className="flex-shrink-0 hidden lg:block lg:w-80 xl:w-96">
            <StickyBox offsetTop={50} offsetBottom={20}>
              <ShopSidebar
                data={data}
                className="w-full border border-gray-300 rounded-lg"
              />
            </StickyBox>
          </div>

          <div className="w-full ltr:lg:pl-7 rtl:lg:pr-7">
            {data?.cover_image?.original && (
              <div className="mb-4 lg:mb-7">
                <div
                  className="relative w-full overflow-hidden rounded-xl bg-gray-300"
                  style={{ aspectRatio: '16 / 6' }}
                >
                  <Image
                    src={data?.cover_image?.original!}
                    alt={data?.name}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {activeTab === 'shop' ? (
              <ShopProductsGrid shopId={data?.id} />
            ) : activeTab === 'terms' ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-heading">
                  {t('text-page-terms-of-service')}
                </h2>
                <div className="mt-6 space-y-8">
                  {shopTermsAndConditions.map((item: any) => (
                    <div key={item?.id ?? item?.title}>
                      {item?.title ? (
                        <h3 className="text-base font-semibold text-heading">
                          {item?.title}
                        </h3>
                      ) : null}
                      <div
                        className={`richText ${item?.title ? 'mt-3' : ''}`}
                        dangerouslySetInnerHTML={{
                          __html: sanitizeRichTextHtml(item?.description ?? ''),
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-heading">
                  {t('text-page-faq')}
                </h2>
                <div className="mt-6">
                  <Accordion
                    items={shopFaqs.map((item: any) => ({
                      title: item.title,
                      content: item.description,
                    }))}
                    translatorNS="faq"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
      <Drawer
        placement={dir === 'rtl' ? 'right' : 'left'}
        open={displayShop}
        onClose={closeShop}
        handler={false}
        showMask={true}
        level={null}
        contentWrapperStyle={contentWrapperCSS}
      >
        <ShopSidebarDrawer data={data} />
      </Drawer>
    </>
  );
};

export default ShopsSingleDetails;
