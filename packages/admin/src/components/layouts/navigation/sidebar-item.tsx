import Link from '@/components/ui/link';
import { getIcon } from '@/utils/get-icon';
import * as sidebarIcons from '@/components/icons/sidebar';
import { useUI } from '@/contexts/ui.context';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from '@/components/icons/chevron-right';
import { useTranslation } from 'next-i18next';

const resolveHref = (href: any, shop?: string) => {
  if (!href) return '';
  return typeof href === 'function' ? href(shop) : href;
};

const SidebarItem = ({
  item,
  shop,
  canViewItem,
  level = 0,
}: {
  item: any;
  shop?: string;
  canViewItem?: (entry: any) => boolean;
  level?: number;
}) => {
  const { closeSidebar } = useUI();
  const { t } = useTranslation('common');
  const router = useRouter();
  const sanitizedPath = router.asPath?.split('#')[0]?.split('?')[0];

  const visibleChildren = useMemo(
    () =>
      Array.isArray(item?.childMenu)
        ? item.childMenu.filter((child: any) =>
            canViewItem ? canViewItem(child) : true
          )
        : [],
    [canViewItem, item?.childMenu]
  );

  const href = resolveHref(item?.href, shop);

  const hasChildren = visibleChildren.length > 0;

  const isActive = useMemo(() => {
    if (href && sanitizedPath === href) return true;
    if (!hasChildren) return false;

    const hasActiveChild = (children: any[]): boolean =>
      children.some((child) => {
        const childHref = resolveHref(child?.href, shop);
        if (childHref && sanitizedPath === childHref) return true;
        if (Array.isArray(child?.childMenu) && child.childMenu.length > 0) {
          return hasActiveChild(
            child.childMenu.filter((entry: any) =>
              canViewItem ? canViewItem(entry) : true
            )
          );
        }
        return false;
      });

    return hasActiveChild(visibleChildren);
  }, [canViewItem, hasChildren, href, sanitizedPath, shop, visibleChildren]);

  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    setIsOpen(isActive);
  }, [isActive]);

  if (canViewItem && !canViewItem(item)) return null;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={cn(
            'flex w-full items-center rounded-lg px-3 py-2.5 text-start text-sm transition-colors',
            isOpen
              ? 'bg-gray-100 font-medium text-heading'
              : 'text-body-dark hover:bg-gray-100'
          )}
        >
          {level === 0 && item?.icon ? (
            <span className="text-gray-600">
              {getIcon({
                iconList: sidebarIcons,
                iconName: item.icon,
                className: 'h-5 w-5 me-3',
              })}
            </span>
          ) : null}
          <span className="flex-1">{t(item.label)}</span>
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
              isOpen ? 'rotate-90' : ''
            )}
          />
        </button>

        {isOpen ? (
          <div
            className={cn(
              'space-y-1 border-dashed border-gray-300',
              level === 0
                ? 'ms-5 border-s ps-2'
                : 'ms-4 border-s ps-3'
            )}
          >
            {visibleChildren.map((child: any) => (
              <SidebarItem
                key={`${child.label}-${resolveHref(child?.href, shop)}`}
                item={child}
                shop={shop}
                canViewItem={canViewItem}
                level={level + 1}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href={href || '#'}
      className={cn(
        'flex w-full items-center rounded-lg px-3 py-2.5 text-start text-sm transition-colors',
        isActive
          ? 'bg-accent/10 font-medium text-accent-hover'
          : 'text-body-dark hover:bg-gray-100'
      )}
      onClick={() => closeSidebar()}
    >
      {level === 0 && item?.icon ? (
        <span
          className={cn(
            'me-3',
            isActive ? 'text-accent-hover' : 'text-gray-600'
          )}
        >
          {getIcon({
            iconList: sidebarIcons,
            iconName: item.icon,
            className: 'h-5 w-5',
          })}
        </span>
      ) : null}
      <span>{t(item.label)}</span>
    </Link>
  );
};

export default SidebarItem;
