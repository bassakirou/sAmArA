import React from 'react';
import Link from '@components/ui/link';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import ButtonSamara from './button-samara';

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
  return (
    <div className="megaMenu shadow-header bg-white absolute ltr:-left-20 rtl:-right-20 ltr:xl:left-0 rtl:xl:right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
      <div className="flex w-full">
        <div className="w-1/5 bg-green-700 text-white p-6" key={firstColumn.id}>
          {firstColumn?.columnItems?.map((columnItem) => (
            <React.Fragment key={columnItem.id}>
              <h2 className="text-md font-bold">{t(columnItem.label)}</h2>
              <ul className="pb-7 2xl:pb-8 pt-6 2xl:pt-7">
                {columnItem?.columnItemItems?.map((item: any) => (
                  <li key={item.id} className="mb-1.5">
                    <Link
                      href={item.path}
                      className="block text-sm py-1.5 text-white font-semibold px-5 xl:px-2 2xl:px-2 hover:text-heading hover:bg-white hover:bg-opacity-30"
                    >
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
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
              <ul className="pb-7 2xl:pb-8 pt-6 2xl:pt-7 columns-2 ">
                {columnItem?.columnItemItems?.map((item: any) => (
                  <li key={item.id} className="mb-1.5">
                    <Link
                      href={item.path}
                      className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-2 2xl:px-2 hover:text-heading hover:bg-gray-300"
                    >
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </React.Fragment>
          ))}
          <div className="flex justify-center">
            <ButtonSamara type="submit" variant="normal">
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
