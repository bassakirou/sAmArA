import { OTP } from "@framework/otp";
import { useSettings } from "@framework/settings";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import React from "react";
import { useUI } from "@contexts/ui.context";
import PhoneNumberForm from "@components/auth/otp/phone-number-form";
import client from "@framework/utils/index";
import { useMutation, useQueryClient } from "react-query";
import { API_ENDPOINTS } from "@framework/utils/endpoints";

type Props = {
  data: {
    customerId: string;
    profileId: string;
    contactNumber: string;
  };
};

const ProfileAddOrUpdateContact: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation("common");
  const { customerId, contactNumber } = data;
  const { closeModal } = useUI();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const useOtp = settings?.options?.useOtp;

  const { mutate: updateProfileContact, isLoading: updating } = useMutation(
    client.auth.updateProfileContact,
    {
      onSuccess: (data: any) => {
        if (!data?.success) {
          toast.error(t(data?.message ?? "SOMETHING_WENT_WRONG"));
          return;
        }
        queryClient.invalidateQueries(API_ENDPOINTS.CUSTOMER);
        toast.success(t("profile-update-successful"));
        closeModal();
      },
      onError: () => {
        toast.error(t("error-something-wrong"));
      },
    }
  );

  function onContactUpdate() {
    toast.success(t("profile-update-successful"));
    closeModal();
  }

  function onDirectUpdate({ phone_number }: { phone_number: string }) {
    updateProfileContact({ contact: phone_number });
  }
  return (
    <div className="p-6 sm:p-8 bg-white rounded-lg md:rounded-xl flex flex-col justify-center md:min-h-0">
      <h3 className="text-heading text-sm md:text-base font-semibold mb-5 text-center">
        {contactNumber ? t("text-update") : t("text-add-new")}{" "}
        {t("text-contact-number")}
      </h3>
      {useOtp ? (
        <OTP
          phoneNumber={contactNumber}
          action="update-contact"
          userId={customerId}
          onVerify={onContactUpdate}
        />
      ) : (
        <PhoneNumberForm
          onSubmit={onDirectUpdate}
          phoneNumber={contactNumber}
          isLoading={updating}
        />
      )}
    </div>
  );
};

export default ProfileAddOrUpdateContact;
