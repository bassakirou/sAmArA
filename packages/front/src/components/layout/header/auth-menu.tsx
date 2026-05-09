import { Menu, Transition } from '@headlessui/react';
import Link from "@components/ui/link";
import React from "react";
import { Fragment } from 'react';
import { useTranslation } from 'next-i18next';

import { useUser } from "@framework/auth";
import { ROUTES } from '@lib/routes';
import cn from 'classnames';



interface Props {
  href: string;
  className?: string;
  btnProps: React.ButtonHTMLAttributes<any>;
  isAuthorized: boolean;
  children: any
}

const AuthMenu: React.FC<Props> = ({
  isAuthorized,
  btnProps,
  children,
}) => {

  const { me } = useUser();
  const { t } = useTranslation('common');

  const links = [
    {
      path: ROUTES.ACCOUNT,
      label: t("text-dashboard")
    },

    {
      path: ROUTES.LOGOUT,
      label: t("text-logout")
    },
  ]

  return isAuthorized ? (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center focus:outline-none">
        {children}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="ul"
          className="absolute mt-1 w-48 rounded bg-white shadow-md end-0 origin-top-end focus:outline-none z-50"
        >
          <Menu.Item key={me?.email}>
            <li
              className="flex w-full flex-col space-y-1 rounded-t
             bg-black p-4 text-sm text-white"
            >
              <span className="font-semibold capitalize">{me?.name}</span>
              <span className="text-xs truncate">{me?.email}</span>
            </li>
          </Menu.Item>

          {links.map(({ path, label }) => (
            <Menu.Item key={`${path}${label}`}>
              {({ active }) => (
                <li className="cursor-pointer border-b border-gray-100 last:border-0 bg-linen">
                  <Link
                    href={path}
                    className={cn(
                      'block px-4 py-3 text-sm font-semibold capitalize transition duration-200 hover:text-accent',
                      active ? 'text-accent' : 'text-heading'
                    )}
                  >
                    {t(label)}
                  </Link>
                </li>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  ) : (
    <button {...btnProps} />
  );
};

export default AuthMenu;
