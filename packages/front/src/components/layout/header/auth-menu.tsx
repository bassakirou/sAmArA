import { Menu, Transition } from '@headlessui/react';
import React from 'react';
import { Fragment, useEffect } from 'react';
import NextLink from 'next/link';
import { useTranslation } from 'next-i18next';
import Portal from '@reach/portal';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react-dom-interactions';

import { useUser } from '@framework/auth';
import { ROUTES } from '@lib/routes';
import cn from 'classnames';

interface Props {
  href: string;
  className?: string;
  btnProps: React.ButtonHTMLAttributes<any>;
  isAuthorized: boolean;
  children: any;
}

const AuthMenu: React.FC<Props> = ({ isAuthorized, btnProps, children }) => {
  const { me } = useUser();
  const { t } = useTranslation('common');
  const { x, y, reference, floating, strategy, update, refs } = useFloating({
    strategy: 'fixed',
    placement: 'bottom-end',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });
  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) return;
    return autoUpdate(refs.reference.current, refs.floating.current, update);
  }, [refs.floating, refs.reference, update]);

  const links = [
    {
      path: ROUTES.ACCOUNT,
      label: t('text-dashboard'),
    },

    {
      path: ROUTES.LOGOUT,
      label: t('text-logout'),
    },
  ];

  return isAuthorized ? (
    <Menu as="div" className="relative inline-flex">
      {({ open }) => (
        <>
          <div ref={reference} className="flex items-center">
            <Menu.Button className="flex items-center focus:outline-none">
              {children}
            </Menu.Button>
          </div>

          <Portal>
            <Transition
              as={Fragment}
              show={open}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <div
                ref={floating}
                style={{
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                  zIndex: 50,
                }}
              >
                <Menu.Items
                  as="ul"
                  className="w-56 origin-top-right rounded-md bg-white shadow-md focus:outline-none"
                >
                  <li className="flex w-full flex-col space-y-1 rounded-t bg-black p-4 text-sm text-white">
                    <span className="font-semibold capitalize">{me?.name}</span>
                    <span className="text-xs truncate">{me?.email}</span>
                  </li>

                  {links.map(({ path, label }) => (
                    <Menu.Item key={`${path}${label}`}>
                      {({ active }) => (
                        <li className="border-b border-gray-100 bg-white last:border-0">
                          <NextLink
                            href={path}
                            className={cn(
                              'block px-4 py-3 text-sm font-semibold capitalize transition duration-200 hover:text-accent focus:outline-none',
                              active ? 'text-accent' : 'text-heading'
                            )}
                          >
                            {label}
                          </NextLink>
                        </li>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </div>
            </Transition>
          </Portal>
        </>
      )}
    </Menu>
  ) : (
    <button {...btnProps} />
  );
};

export default AuthMenu;
