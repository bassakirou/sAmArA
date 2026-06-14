import React from 'react';
import Link from '@components/ui/link';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import ButtonSamara from './button-samara';
import { useCategories } from '@framework/categories';
import { useTags } from '@framework/tags';
import { Category, Tag } from '@type/index';

interface MenuItem {
  id: number | string;
  path: string;
  label: string;
  columnItemItems?: MenuItem[];
}
type MegaMenuProps = {
  columns: {
    id: number | string;
    columnItems: MenuItem[];
  }[];
};

const MegaMenu: React.FC<MegaMenuProps> = ({ columns }) => {
  const { t } = useTranslation('menu');
  const firstColumn = columns[0];
  const secondColumn = columns[1];
  const { data: categoriesData } = useCategories({ limit: 10, parent: null });
  const { data: tagsData } = useTags({ limit: 8 });

  const staticCollections = firstColumn?.columnItems?.[0]?.columnItemItems ?? [];
  const staticCategories = secondColumn?.columnItems?.[0]?.columnItemItems ?? [];
  const collections: Array<Tag | MenuItem> =
    tagsData?.pages?.flatMap((page) => page?.data ?? []) ?? [];
  const categories: Array<Category | MenuItem> = Array.isArray(
    (categoriesData as any)?.data
  )
    ? (categoriesData as any).data
    : Array.isArray(categoriesData)
      ? categoriesData
      : [];

  const collectionItems = collections.length ? collections : staticCollections;
  const categoryItems = categories.length ? categories : staticCategories;
  const categoryMidpoint = Math.ceil(categoryItems.length / 2);
  const categoryColumns = [
    categoryItems.slice(0, categoryMidpoint),
    categoryItems.slice(categoryMidpoint),
  ];

  const getCollectionLabel = (item: Tag | MenuItem) =>
    'name' in item ? item.name : t(item.label);
  const getCollectionHref = (item: Tag | MenuItem) =>
    'slug' in item ? `/collections/${item.slug}` : item.path;
  const getCollectionCount = (item: Tag | MenuItem) =>
    'products_count' in item ? item.products_count : undefined;

  const getCategoryLabel = (item: Category | MenuItem) =>
    'name' in item ? item.name : t(item.label);
  const getCategoryHref = (item: Category | MenuItem) =>
    'slug' in item ? `/category/${item.slug}` : item.path;
  const getCategoryCount = (item: Category | MenuItem) =>
    'products_count' in item ? item.products_count : undefined;

  return (
    <div className="megaMenu shadow-header bg-white absolute ltr:-left-20 rtl:-right-20 ltr:xl:left-0 rtl:xl:right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
      <div className="flex w-full">
        <div className="w-1/5 bg-green-700 text-white p-6" key={firstColumn.id}>
          {firstColumn?.columnItems?.map((columnItem) => (
            <React.Fragment key={columnItem.id}>
              <h2 className="text-md font-bold">{t(columnItem.label)}</h2>
              <ul className="pb-7 2xl:pb-8 pt-6 2xl:pt-7">
                {collectionItems.map((item: any) => (
                  <li key={item.id} className="mb-1.5">
                    <Link
                      href={getCollectionHref(item)}
                      className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-semibold text-white transition hover:bg-white hover:bg-opacity-30 hover:text-heading"
                    >
                      {typeof getCollectionCount(item) === 'number' && (
                        <span className="inline-flex min-w-[1.85rem] items-center justify-center rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-heading">
                          {getCollectionCount(item)}
                        </span>
                      )}
                      <span className="truncate">{getCollectionLabel(item)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex justify-center">
                <ButtonSamara type="button" variant="normal" size="small">
                  <Link href="/search">{t('menu-all-collections')}</Link>
                </ButtonSamara>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div
          className="w-2/5 p-6 border-r border-black relative cat-menu"
          key={secondColumn.id}
        >
          {secondColumn?.columnItems?.map((columnItem) => (
            <React.Fragment key={columnItem.id}>
              <h2 className="text-md font-bold">{t(columnItem.label)}</h2>
              <span className="absolute">
                <Image
                  src={'/assets/images/Polygone-menu.png'}
                  width={100}
                  height={16}
                  alt={''}
                />
              </span>
              <div className="grid grid-cols-2 gap-x-4 pb-7 pt-6 2xl:pb-8 2xl:pt-7">
                {categoryColumns.map((group, index) => (
                  <ul key={index}>
                    {group.map((item: any) => (
                      <li key={item.id} className="mb-1.5">
                        <Link
                          href={getCategoryHref(item)}
                          className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-semibold text-heading transition hover:bg-gray-300 hover:text-heading"
                        >
                          {typeof getCategoryCount(item) === 'number' && (
                            <span className="inline-flex min-w-[1.85rem] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                              {getCategoryCount(item)}
                            </span>
                          )}
                          <span className="truncate">{getCategoryLabel(item)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </React.Fragment>
          ))}
          <div className="flex justify-center">
            <ButtonSamara type="button" variant="normal">
              <Link href="/search">{t('menu-all-categories')}</Link>
            </ButtonSamara>
          </div>
        </div>

        <div className="w-2/5 p-6">
          <div className="grid grid-rows-2 grid-flow-col grid-cols-2 gap-4 h-full">
            <div className="row-start-1 col-start-1 row-span-2 relative">
              <Image
                src={'/assets/images/banner/banner-sale-offer.jpg'}
                width={200}
                // layout="fill"
                height={480}
                alt={''}
                className="h-full object-cover"
              />
            </div>
            <div className=" relative">
              <Image
                src={'/assets/images/banner/fashion-sale-banner-1.png'}
                width={200}
                height={180}
                alt={''}
                className="h-full object-cover"
              />
            </div>
            <div className=" relative">
              <Image
                src={'/assets/images/banner/fashion-sale-banner-2.png'}
                width={200}
                height={180}
                alt={''}
                className="h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
