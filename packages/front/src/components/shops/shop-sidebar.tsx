import Image from 'next/image';
import Text from '@components/ui/text';
import * as socialIcons from '@components/icons/social';
import { formatAddress } from '@lib/format-address';
import { getIcon } from '@lib/get-icon';
import { useTranslation } from 'next-i18next';
import isEmpty from 'lodash/isEmpty';
import cn from 'classnames';
import { productPlaceholder } from '@lib/placeholders';
import { useRouter } from 'next/router';
import { useUI } from '@contexts/ui.context';
import {
  IoDocumentTextOutline,
  IoHelpCircleOutline,
  IoStorefrontOutline,
} from 'react-icons/io5';
import Modal from '@components/common/modal/modal';
import { useMemo, useState } from 'react';

interface ShopSidebarProps {
  data: any;
  className?: string;
}

const ShopSidebar: React.FC<ShopSidebarProps> = ({ data, className }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { closeShop } = useUI();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const rawTab = typeof router.query.tab === 'string' ? router.query.tab : null;
  const activeTab =
    rawTab === 'terms' || rawTab === 'faq' || rawTab === 'shop'
      ? rawTab
      : 'shop';

  const sinceYear = useMemo(() => {
    const raw = data?.created_at ?? data?.createdAt ?? null;
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    return String(parsed.getFullYear());
  }, [data?.createdAt, data?.created_at]);

  const productsCount = useMemo(() => {
    const value =
      data?.products_count ??
      data?.productsCount ??
      (Array.isArray(data?.products) ? data.products.length : null);
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
    return null;
  }, [data?.products, data?.productsCount, data?.products_count]);

  const description =
    typeof data?.description === 'string' ? data.description.trim() : '';
  const descriptionPreview =
    description.length > 120
      ? `${description.slice(0, 120)}\u2026`
      : description;

  const setTab = (tab: 'shop' | 'terms' | 'faq') => {
    const nextQuery: Record<string, any> = { ...router.query };
    if (tab === 'shop') {
      delete nextQuery.tab;
    } else {
      nextQuery.tab = tab;
    }
    router.push({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
      scroll: false,
    });
    closeShop();
  };

  return (
    <div className={cn('flex flex-col pt-10 lg:pt-14 px-6', className)}>
      <div className="w-full pb-8 text-center border-b border-gray-300">
        <div className="flex items-center gap-4 text-left">
          <div className="h-14 w-14 flex-none overflow-hidden rounded-full bg-gray-100">
            <Image
              src={data?.logo?.original! ?? productPlaceholder}
              alt={data?.name}
              width={56}
              height={56}
              className="h-14 w-14 object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            {sinceYear ? (
              <div className="text-xs text-gray-500">
                {router.locale?.startsWith('fr') ? 'Depuis' : 'Since'}{' '}
                {sinceYear}
              </div>
            ) : null}
            <div className="mt-0.5 font-semibold text-heading truncate">
              {data?.name}
            </div>
            {productsCount !== null ? (
              <div className="mt-1 text-sm text-body">
                {productsCount}{' '}
                {productsCount === 1 ? t('text-product') : t('text-products')}
              </div>
            ) : null}
          </div>
        </div>

        {description ? (
          <div className="mt-4 text-left">
            <p className="text-sm text-body">{descriptionPreview}</p>
            {description.length > 120 ? (
              <button
                type="button"
                onClick={() => setIsDescriptionOpen(true)}
                className="mt-2 text-sm font-semibold text-heading hover:opacity-80"
              >
                {router.locale?.startsWith('fr') ? 'Lire plus' : 'Read more'}
              </button>
            ) : null}
          </div>
        ) : null}

        {!!data?.settings?.socials?.length ? (
          <div className="mt-4 flex items-center flex-wrap justify-start gap-2">
            {data?.settings?.socials?.map((item: any, index: number) => (
              <a
                key={index}
                href={item?.url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  'text-muted transition-colors duration-300 focus:outline-none',
                  item.hoverClass
                    ? `hover:${item.hoverClass}`
                    : 'hover:text-heading'
                )}
              >
                {getIcon({
                  iconList: socialIcons,
                  iconName: item?.icon,
                  className: 'h-6 w-6 transition-all hover:opacity-90',
                })}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <div className="py-6 border-b border-gray-300">
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTab('shop')}
            className={cn(
              'rounded-lg border p-3 text-center transition-colors',
              activeTab === 'shop'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            )}
          >
            <IoStorefrontOutline className="mx-auto h-6 w-6 text-heading" />
            <div className="mt-2 text-xs font-semibold text-heading">
              {t('text-shop')}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTab('terms')}
            className={cn(
              'rounded-lg border p-3 text-center transition-colors',
              activeTab === 'terms'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            )}
          >
            <IoDocumentTextOutline className="mx-auto h-6 w-6 text-heading" />
            <div className="mt-2 text-xs font-semibold text-heading">
              {t('text-page-terms-of-service')}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTab('faq')}
            className={cn(
              'rounded-lg border p-3 text-center transition-colors',
              activeTab === 'faq'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            )}
          >
            <IoHelpCircleOutline className="mx-auto h-6 w-6 text-heading" />
            <div className="mt-2 text-xs font-semibold text-heading">
              {t('text-page-faq')}
            </div>
          </button>
        </div>
      </div>
      <div className="space-y-6 py-7">
        {/* Address */}
        <div className="block">
          <h4 className="text-heading font-semibold text-sm mb-1.5">
            {t('text-address-colon')}
          </h4>
          {!isEmpty(formatAddress(data?.address)) ? (
            <Text>{formatAddress(data?.address)}</Text>
          ) : (
            t('common:text-no-address')
          )}
        </div>

        {/* Contact */}
        <div className="block">
          <h4 className="text-heading font-semibold text-sm mb-1.5">
            {t('text-phone')}
            {'\u00A0:'}
          </h4>
          <div className="flex items-center justify-between">
            {data?.settings?.contact ? (
              <>
                <Text>{data?.settings?.contact}</Text>
                <button className="flex-shrink-0 text-sm font-semibold transition-all text-heading hover:opacity-80">
                  {t('text-call-now')}
                </button>
              </>
            ) : (
              t('text-no-contact')
            )}
          </div>
        </div>

        {/* Website */}
        {data?.settings?.website && (
          <div className="block">
            <h4 className="text-heading font-semibold text-sm mb-1.5">
              {t('text-website-colon')}
            </h4>
            <div className="flex items-center justify-between">
              <Text>{data?.settings?.website}</Text>
              <a
                href={`https://${data?.settings?.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 text-sm font-semibold transition-all text-heading hover:opacity-80"
              >
                {t('text-visit-site')}
              </a>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={isDescriptionOpen}
        onClose={() => setIsDescriptionOpen(false)}
        variant="center"
        containerClassName="bg-white sm:w-[min(520px,calc(100vw-2rem))]"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-heading">
            {router.locale?.startsWith('fr')
              ? 'À propos de la boutique'
              : 'About this shop'}
          </h3>
          <div className="mt-4 text-sm leading-7 text-body whitespace-pre-line">
            {description}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShopSidebar;
