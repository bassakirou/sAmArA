import React from 'react';
import Logo from '@components/ui/logo';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ROUTES } from '@lib/routes';
import { useUI } from '@contexts/ui.context';
import { OTPLoginForm } from '@components/auth/otp/otp-login-form';

type Props = {
  layout?: 'modal' | 'page';
};

const OtpLogin: React.FC<Props> = ({ layout = 'modal' }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { setModalView, openModal, closeModal } = useUI();

  const handleSignIn = () => {
    if (layout === 'modal') {
      setModalView('LOGIN_VIEW');
      return openModal();
    } else {
      return router.push(ROUTES.LOGIN);
    }
  };

  return (
    <div className="mx-auto w-full overflow-hidden rounded-lg border border-gray-300 bg-sable px-5 py-5 sm:w-96 sm:px-8 md:w-450px">
      <div className="motif"></div>
      <div className="text-center mb-9 pt-2.5">
        <div onClick={closeModal}>
          <Logo />
        </div>
        <p className="text-sm md:text-base text-body mt-3 sm:mt-4 mb-8 sm:mb-10">
          {t('common:otp-login-helper')}
        </p>
      </div>

      <OTPLoginForm />

      <div className="flex flex-col items-center justify-center relative text-sm text-heading mt-8 sm:mt-10 mb-6 sm:mb-7">
        <hr className="w-full border-gray-300" />
        <span className="absolute -top-2.5 bg-sable px-2">
          {t('common:text-or')}
        </span>
      </div>
      <div className="text-sm sm:text-base text-body text-center">
        {t('common:text-back-to')}{' '}
        <button
          type="button"
          className="text-sm sm:text-base text-heading underline font-bold hover:no-underline focus:outline-none"
          onClick={handleSignIn}
        >
          {t('common:text-login')}
        </button>
      </div>
    </div>
  );
};

export default OtpLogin;
