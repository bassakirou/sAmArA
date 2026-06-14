import React, { useRef } from 'react';
import SearchIcon from '@components/icons/search-icon';
import Logo from '@components/ui/logo';
import { useUI } from '@contexts/ui.context';
import { ROUTES } from '@lib/routes';
import { addActiveScroll } from '@utils/add-active-scroll';
import dynamic from 'next/dynamic';
import { useAtom } from 'jotai';
import { authorizationAtom } from '@store/authorization-atom';
import { menu } from '@data/static/menus';
import HeaderMenu from '@components/layout/header/header-menu';
import CurrencySwitcher from '@components/ui/currency-switcher';
import ContacImg from '@components/icons/contact-img';
import SignInImg from '@components/icons/signin-img';
import UserImg from '@components/icons/user-img';
const AuthMenu = dynamic(() => import('./auth-menu'), { ssr: false });
const CartButton = dynamic(() => import('@components/cart/cart-button'), {
  ssr: false,
});

interface Props {
  variant?: 'default' | 'modern';
}

type DivElementRef = React.MutableRefObject<HTMLDivElement>;
const Header: React.FC<Props> = ({ variant = 'default' }) => {
  const { openSidebar, setDrawerView, openSearch, openModal, setModalView } =
    useUI();
  const [isAuthorize] = useAtom(authorizationAtom);
  const siteHeaderRef = useRef() as DivElementRef;
  addActiveScroll(siteHeaderRef);

  function handleLogin() {
    setModalView('LOGIN_VIEW');
    return openModal();
  }
  function handleMobileMenu() {
    setDrawerView('MOBILE_MENU');
    return openSidebar();
  }
  return (
    <header
      id="siteHeader"
      ref={siteHeaderRef}
      className="relative z-20 w-full h-16 sm:h-16 lg:h-[4.5rem]"
    >
      <div className="fixed z-20 w-full h-16 text-gray-700 transition duration-200 ease-in-out bg-white innerSticky body-font sm:h-16 lg:h-[4.5rem] ltr:pl-4 ltr:lg:pl-6 ltr:pr-4 ltr:lg:pr-6 rtl:pr-4 rtl:lg:pr-6 rtl:pl-4 rtl:lg:pl-6 bg-sable1">
        <div className="flex items-center justify-center mx-auto max-w-[1920px] h-full w-full">
          <button
            aria-label="Menu"
            className={`menuBtn md:flex ${
              variant !== 'modern'
                ? 'hidden lg:hidden px-5 2xl:px-7'
                : 'ltr:pr-7 rtl:pl-7 hidden md:block'
            } flex-col items-center justify-center flex-shrink-0 h-full outline-none focus:outline-none`}
            onClick={handleMobileMenu}
          >
            <span className="menuIcon">
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </span>
          </button>
          <Logo />

          {variant !== 'modern' ? (
            <HeaderMenu
              data={menu}
              className="hidden lg:flex ltr:md:ml-6 ltr:xl:ml-10 rtl:md:mr-6 rtl:xl:mr-10 drop-shadow-2xl"
            />
          ) : (
            ''
          )}

          <div className="-mt-0.5 hidden md:flex mr-3 flex-shrink-0">
            {/* <ButtonSamara> {t('text-become-owner-action')}</ButtonSamara> */}
            {/* <Button
              type="submit"
              className="w-full h-10 mt-1 text-sm lg:text-base sm:w-auto"
            >
              <Link
                href="https://admin.samara-shopping.com/register"
                //href={`${process?.env?.NEXT_ADMIN_SITE_URL}/register`}
                target="_blank"
              >
                {t('text-become-owner-action')}
              </Link>
            </Button> */}
          </div>

          <div className="items-center justify-end flex-shrink-0 hidden space-x-8 md:flex md:space-x-2 lg:space-x-2 xl:space-x-2 2xl:space-x-4 rtl:space-x-reverse ltr:ml-auto rtl:mr-auto">
            <div className="flex items-center flex-shrink-0 ms-auto">
              <CurrencySwitcher />
            </div>
            <button
              className="relative flex items-center justify-center flex-shrink-0 h-auto transform focus:outline-none"
              onClick={openSearch}
              aria-label="search-button"
            >
              <SearchIcon />
            </button>
            <ContacImg />
            <div className="-mt-0.5 flex-shrink-0">
              <AuthMenu
                isAuthorized={isAuthorize}
                href={ROUTES.ACCOUNT}
                className="text-sm font-semibold xl:text-base text-heading"
                btnProps={{
                  className:
                    'text-sm xl:text-base text-heading font-semibold focus:outline-none',
                  children: <SignInImg />,
                  onClick: handleLogin,
                }}
              >
                <UserImg />
                {}
              </AuthMenu>
            </div>
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
