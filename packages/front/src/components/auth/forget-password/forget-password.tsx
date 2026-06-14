import React, { useState } from "react";
import Logo from "@components/ui/logo";
import Alert from "@components/ui/alert";
import { useUI } from "@contexts/ui.context";
import { useForgotPassword, useVerifyForgotPasswordToken, useResetPassword } from "@framework/auth";
import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { ROUTES } from "@lib/routes";
import { useMemo } from "react";

const EnterEmailView = dynamic(() => import("./enter-email-view"));
const EnterTokenView = dynamic(() => import("./enter-token-view"));
const EnterNewPasswordView = dynamic(() => import("./enter-new-password-view"));

type Props = {
  layout?: "modal" | "page"
}

const ForgotPassword: React.FC<Props> = ({ layout = "modal" }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { setModalView, openModal, closeModal, modalData } = useUI();
  const isSellerSubscriptionFlow = Boolean(modalData?.sellerSubscriptionFlow);
  const dividerBgClass = useMemo(
    () => (isSellerSubscriptionFlow ? "bg-sable" : "bg-white"),
    [isSellerSubscriptionFlow]
  );
  const { mutateAsync: forgetPassword, isLoading, formError } = useForgotPassword();
  const { mutateAsync: verifyToken, isLoading: verifying } = useVerifyForgotPasswordToken();
  const { mutateAsync: resetPassword, isLoading: resetting } = useResetPassword();

  const [errorMsg, setErrorMsg] = useState<string | null | undefined>("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");

  async function handleEmailSubmit({ email }: { email: string }) {
    setErrorMsg("");
    try {
      const data: any = await forgetPassword({ email });
      if (data?.success) {
        setVerifiedEmail(email);
        return;
      }
      setErrorMsg(data?.message ?? formError?.email ?? "SOMETHING_WENT_WRONG");
    } catch (error) {
      setErrorMsg(formError?.email ?? "SOMETHING_WENT_WRONG");
    }
  }

  async function handleTokenSubmit({ token }: { token: string }) {
    setErrorMsg("");
    try {
      const data: any = await verifyToken({
        email: verifiedEmail,
        token,
      });
      if (data?.success) {
        setVerifiedToken(token);
        return;
      }
      setErrorMsg(data?.message ?? "SOMETHING_WENT_WRONG");
    } catch (error) {
      setErrorMsg("SOMETHING_WENT_WRONG");
    }
  }

  async function handleResetPassword({ password }: { password: string }) {
    setErrorMsg("");
    try {
      const data: any = await resetPassword({
        email: verifiedEmail,
        token: verifiedToken,
        password,
      });
      if (data?.success) {
        if (layout === "page") {
          router.push(ROUTES.LOGIN);
          return;
        }
        setModalView("LOGIN_VIEW");
        return;
      }
      setErrorMsg(data?.message ?? "SOMETHING_WENT_WRONG");
    } catch (error) {
      setErrorMsg("SOMETHING_WENT_WRONG");
    }
  }

  function handleSignIn() {
    if (layout === "modal") {
      setModalView("LOGIN_VIEW");
      return openModal();
    } else {
      router.push(`${ROUTES.LOGIN}`);
    }
  }

  return (
    <div
      className={`mx-auto w-full rounded-lg border border-gray-300 px-5 py-6 sm:w-96 sm:p-8 md:w-450px ${
        isSellerSubscriptionFlow ? "bg-sable" : "bg-white"
      }`}
    >
      {isSellerSubscriptionFlow ? <div className="motif"></div> : null}
      <div className="text-center mb-9 pt-2.5">
        <div onClick={closeModal}>
          <Logo />
        </div>
        <p className="text-sm md:text-base text-body mt-3 sm:mt-4 mb-8 sm:mb-10">
          {!verifiedEmail ? t("common:forgot-password-helper")  : verifiedEmail && !verifiedToken ? t("common:reset-password-mail") : verifiedEmail && verifiedToken ? t("common:reset-password-helper"): 'Rénitialisation du passe'}
        </p>
      </div>
      {errorMsg && (
        <Alert
          variant="error"
          message={t(errorMsg)}
          className="mb-6"
          closeable={true}
          onClose={() => setErrorMsg("")}
        />
      )}
      {!verifiedEmail && (
        <EnterEmailView loading={isLoading} onSubmit={handleEmailSubmit} />
      )}
      {verifiedEmail && !verifiedToken && (
        <EnterTokenView loading={verifying} onSubmit={handleTokenSubmit} />
      )}
      {verifiedEmail && verifiedToken && (
        <EnterNewPasswordView
          loading={resetting}
          onSubmit={handleResetPassword}
        />
      )}
      <div className="flex flex-col items-center justify-center relative text-sm text-heading mt-8 sm:mt-10 mb-6 sm:mb-7">
        <hr className="w-full border-gray-300" />
        <span className={`absolute -top-2.5 px-2 ${dividerBgClass}`}>
          {t("common:text-or")}
        </span>
      </div>
      <div className="text-sm sm:text-base text-body text-center">
        {t("common:text-back-to")}{" "}
        <button
          type="button"
          className="text-sm sm:text-base text-heading underline font-bold hover:no-underline focus:outline-none"
          onClick={handleSignIn}
        >
          {t("common:text-login")}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
