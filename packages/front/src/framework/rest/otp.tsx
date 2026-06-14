import React from "react";
import {
  useSendOtpCode,
  useVerifyOtpCode,
} from "@framework/auth";
import Alert from "@components/ui/alert";
import { useTranslation } from "next-i18next";
import "react-phone-input-2/lib/bootstrap.css";
import { useAtom } from "jotai";
import { initialOtpState, optAtom } from "@components/auth/otp/atom";
import PhoneNumberForm from "@components/auth/otp/phone-number-form";
import OtpCodeForm from "@components/auth/otp/otp-verify-form";
import { API_ENDPOINTS } from "@framework/utils/endpoints";
import client from "@framework/utils/index";
import { PhoneNumberStatus } from "@type/index";
import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
interface OTPProps {
  phoneNumber: string | undefined;
  onVerify?: (phoneNumber: string) => void;
  action?: "verify" | "update-contact";
  userId?: string;
}
export const OTP: React.FC<OTPProps> = ({
  phoneNumber,
  onVerify,
  action = "verify",
  userId,
}) => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [otpState, setOtpState] = useAtom(optAtom);
  const [verifyServerError, setVerifyServerError] = React.useState<string | null>(null);

  const { mutate: verifyOtpCode, isLoading: otpVerifyLoading } = useVerifyOtpCode({
    onVerify: onVerify ?? (() => {}),
  });

  const { mutate: updateContact, isLoading: updateContactLoading } = useMutation(
    client.auth.updateContact,
    {
      onSuccess: (data: any) => {
        if (!data?.success) {
          setVerifyServerError(data?.message ?? "SOMETHING_WENT_WRONG");
          return;
        }
        setVerifyServerError(null);
        setOtpState({ ...initialOtpState });
        queryClient.invalidateQueries(API_ENDPOINTS.CUSTOMER);
        if (onVerify) {
          onVerify(otpState?.phoneNumber);
        }
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError(error)) {
          const data: any = error.response?.data;
          setVerifyServerError(
            data?.message ??
              (data?.error ? String(data.error) : null) ??
              error.message
          );
          return;
        }
        setVerifyServerError((error as any)?.message ?? "SOMETHING_WENT_WRONG");
      },
    }
  );
  const {
    mutate: sendOtpCode,
    isLoading,
    serverError,
    setServerError,
  } = useSendOtpCode({
    verifyOnly: true
  });

  function onSendCodeSubmission({ phone_number }: { phone_number: string }) {
    const normalized = phone_number?.startsWith("+")
      ? phone_number
      : `+${phone_number}`;
    sendOtpCode({
      phone_number: normalized,
    });
  }

  function onVerifyCodeSubmission({ code }: { code: string }) {
    if (action === "update-contact") {
      setVerifyServerError(null);
      updateContact({
        code,
        phone_number: otpState?.phoneNumber,
        otp_id: otpState?.otpId!,
        user_id: userId ?? "",
      });
      return;
    }

    verifyOtpCode({
      code,
      phone_number: otpState?.phoneNumber,
      otp_id: otpState?.otpId!,
    });
  }

  return (
    <>
      {otpState?.step === PhoneNumberStatus.NUMBER && (
        <>
          {
            serverError && (
              <Alert
                variant="error"
                message={serverError && t(serverError)}
                className="mb-4"
                closeable={true}
                onClose={() => setServerError(null)}
              />
            )
          }
          <PhoneNumberForm
            onSubmit={onSendCodeSubmission}
            isLoading={isLoading}
            phoneNumber={phoneNumber}
          />
        </>
      )}

      {otpState.step === 'OtpForm' && (
        <>
          {verifyServerError && (
            <Alert
              variant="error"
              message={verifyServerError && t(verifyServerError)}
              className="mb-4"
              closeable={true}
              onClose={() => setVerifyServerError(null)}
            />
          )}
          <OtpCodeForm
            onSubmit={onVerifyCodeSubmission}
            isLoading={action === "update-contact" ? updateContactLoading : otpVerifyLoading}
          />
        </>
      )}
    </>
  );
};
