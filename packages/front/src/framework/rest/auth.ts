import { initialOtpState, optAtom } from '@components/auth/otp/atom';
import { useUI } from '@contexts/ui.context';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import client from '@framework/utils/index';
import { useToken } from '@lib/use-token';
import { authorizationAtom } from '@store/authorization-atom';
import { clearCheckoutAtom } from '@store/checkout';
import {
  ChangePasswordInputType,
  RegisterUserInputType,
  SocialLoginInputType,
  User,
} from '@type/index';
import axios from 'axios';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import Router, { useRouter } from 'next/router';
import { useState } from 'react';
import { UseMutationOptions, useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';

import { AUTH_TOKEN } from '@lib/constants';
import { ROUTES } from '@lib/routes';
import Cookies from 'js-cookie';
import { useQueryClient } from 'react-query';

export function useChangePassword() {
  const { t } = useTranslation('');
  let [formError, setFormError] =
    useState<Partial<ChangePasswordInputType> | null>(null);

  const { mutate, isLoading } = useMutation(client.auth.changePassword, {
    onSuccess: (data: any) => {
      if (!data.success) {
        setFormError({
          oldPassword: data?.message ?? '',
        });
        return;
      }
      toast.success(t('password-update-success'));
    },
    onError: (error) => {
      const {
        response: { data },
      }: any = error ?? {};
      setFormError(data);
    },
  });

  return { mutate, isLoading, formError, setFormError };
}

export function useForgotPassword() {
  let [message, setMessage] = useState<string | null>(null);
  let [formError, setFormError] = useState<any>(null);

  const { mutate, mutateAsync, isLoading } = useMutation(
    client.auth.forgetPassword,
    {
      onSuccess: (data: any) => {
        setFormError(null);
        if (!data.success) {
          setFormError({
            email: data?.message ?? '',
          });
          return;
        }
        setMessage(data?.message ?? null);
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError(error)) {
          const data: any = error.response?.data;
          if (data?.message) {
            setMessage(data.message);
            return;
          }
          if (data?.errors && typeof data.errors === 'object') {
            const first = Object.values(data.errors)?.[0] as any;
            const firstMessage = Array.isArray(first) ? first[0] : first;
            if (firstMessage) {
              setMessage(String(firstMessage));
              return;
            }
          }
          if (data && typeof data === 'object') {
            const first = Object.values(data)?.[0] as any;
            const firstMessage = Array.isArray(first) ? first[0] : first;
            if (firstMessage) {
              setMessage(String(firstMessage));
              return;
            }
          }
        }
        setMessage((error as any)?.message ?? 'SOMETHING_WENT_WRONG');
      },
    }
  );

  return {
    mutate,
    mutateAsync,
    isLoading,
    message,
    formError,
    setFormError,
    setMessage,
  };
}

export function useResendVerificationEmail() {
  const { t } = useTranslation('common');
  const { mutate, isLoading } = useMutation(
    client.auth.resendVerificationEmail,
    {
      onSuccess: (data) => {
        if (data?.success) {
          toast.success(t('PICKBAZAR_MESSAGE.EMAIL_SENT_SUCCESSFUL'));
        }
      },
      onError: (error) => {
        const {
          response: { data },
        }: any = error ?? {};

        toast.error(data?.message);
      },
    }
  );

  return { mutate, isLoading };
}

export function useLogin() {
  const { t } = useTranslation('common');
  const [_, setAuthorized] = useAtom(authorizationAtom);
  const { closeModal } = useUI();
  const { setToken } = useToken();
  const queryClient = useQueryClient();
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isLoading } = useMutation(client.auth.login, {
    onSuccess: (data: any) => {
      setServerError(null);
      if (!data.token) {
        const message = t('forms:error-credential-wrong');
        setServerError(message);
        toast.error(message);
        return;
      }
      setToken(data.token);
      setAuthorized(true);
      queryClient.refetchQueries(API_ENDPOINTS.CUSTOMER);
      closeModal();
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const data: any = error.response?.data;
        if (data?.message) {
          const message = String(data.message);
          setServerError(message);
          toast.error(message);
          return;
        }
        if (data?.errors && typeof data.errors === 'object') {
          const first = Object.values(data.errors)?.[0] as any;
          const firstMessage = Array.isArray(first) ? first[0] : first;
          if (firstMessage) {
            const message = String(firstMessage);
            setServerError(message);
            toast.error(message);
            return;
          }
        }
      }
      const message = t('SOMETHING_WENT_WRONG');
      setServerError(message);
      toast.error(message);
    },
  });

  return { mutate, isLoading, serverError, setServerError };
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { setToken } = useToken();
  const [_, setAuthorized] = useAtom(authorizationAtom);
  const [_r, resetCheckout] = useAtom(clearCheckoutAtom);
  const { pathname, ...router } = useRouter();

  const { mutate: signOut, isLoading } = useMutation(client.auth.logout, {
    onSuccess: (data) => {
      if (data) {
        setToken('');
        setAuthorized(false);
        router.push('/');
        //@ts-ignore
        resetCheckout();
        queryClient.refetchQueries(API_ENDPOINTS.CUSTOMER);
      }
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
  function handleLogout() {
    signOut();
  }
  return {
    mutate: handleLogout,
    isLoading,
  };
}

export function useOtpLogin() {
  const [otpState, setOtpState] = useAtom(optAtom);
  const [_, setAuthorized] = useAtom(authorizationAtom);
  const { closeModal } = useUI();
  const { setToken } = useToken();
  const queryClient = useQueryClient();
  let [serverError, setServerError] = useState<string | null>(null);
  const { mutate: otpLogin, isLoading } = useMutation(client.auth.otpLogin, {
    onSuccess: (data: any) => {
      if (!data.token) {
        setServerError('text-otp-verify-failed');
        return;
      }
      setToken(data.token!);
      setAuthorized(true);
      setOtpState({
        ...initialOtpState,
      });
      closeModal();
    },
    onError: (error: Error) => {
      // console.log(error.message);
      setServerError(error?.message);
    },
    onSettled: () => {
      queryClient.clear();
    },
  });

  return { mutate: otpLogin, isLoading, serverError, setServerError };
}

export function useRegister() {
  const { t } = useTranslation('common');
  const { setToken } = useToken();
  const [_, setAuthorized] = useAtom(authorizationAtom);
  const { closeModal } = useUI();
  let [formError, setFormError] =
    useState<Partial<RegisterUserInputType> | null>(null);

  const { mutate, isLoading } = useMutation(client.auth.register, {
    onSuccess: (data: any) => {
      setFormError(null);
      if (data?.token && data?.permissions?.length) {
        setToken(data?.token);
        setAuthorized(true);
        closeModal();
        return;
      }
      if (!data.token) {
        toast.error(t('forms:error-credential-wrong'));
      }
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const data: any = error.response?.data;
        if (data && typeof data === 'object') {
          if (data?.errors && typeof data.errors === 'object') {
            setFormError(data.errors);
            return;
          }
          setFormError(data);
          return;
        }
      }
      toast.error(t('SOMETHING_WENT_WRONG'));
    },
  });

  return { mutate, isLoading, formError, setFormError };
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  const { closeModal } = useUI();

  return useMutation(client.auth.resetPassword, {
    onSuccess: (data: any) => {
      if (data?.success) {
        toast.success('Successfully Reset Password!');
        closeModal();
        return;
      }
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const data: any = error.response?.data;
        if (data?.message) {
          toast.error(String(data.message));
          return;
        }
        if (data?.errors && typeof data.errors === 'object') {
          const first = Object.values(data.errors)?.[0] as any;
          const firstMessage = Array.isArray(first) ? first[0] : first;
          if (firstMessage) {
            toast.error(String(firstMessage));
            return;
          }
        }
      }
      toast.error('SOMETHING_WENT_WRONG');
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
}

// export const useSendOtpCodeMutation = () => {
//   return useMutation((input: SendOtpCodeInputType) =>
//     client.auth.sendOtpCode(input)
//   );
// };

export function useSendOtpCode({
  verifyOnly,
}: Partial<{ verifyOnly: boolean }> = {}) {
  let [serverError, setServerError] = useState<string | null>(null);
  const [otpState, setOtpState] = useAtom(optAtom);

  const { mutate, isLoading } = useMutation(client.auth.sendOtpCode, {
    onSuccess: (data: any) => {
      if (!data.success) {
        setServerError(data.message!);
        return;
      }
      setServerError(null);
      setOtpState({
        ...otpState,
        otpId: data?.id!,
        isContactExist: data?.is_contact_exist!,
        phoneNumber: data?.phone_number!,
        step: data?.is_contact_exist! ? 'OtpForm' : 'RegisterForm',
        ...(verifyOnly && { step: 'OtpForm' }),
      });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const data: any = error.response?.data;
        setServerError(
          data?.message ??
            (data?.error ? String(data.error) : null) ??
            error.message
        );
        return;
      }
      setServerError((error as any)?.message ?? 'SOMETHING_WENT_WRONG');
    },
  });

  return { mutate, isLoading, serverError, setServerError };
}

export function useVerifyOtpCode({ onVerify }: { onVerify: Function }) {
  const [otpState, setOtpState] = useAtom(optAtom);
  let [serverError, setServerError] = useState<string | null>(null);
  const { mutate, isLoading } = useMutation(client.auth.verifyOtpCode, {
    onSuccess: (data: any) => {
      if (!data.success) {
        setServerError(data?.message!);
        return;
      }
      if (onVerify) {
        onVerify(otpState?.phoneNumber);
      }
      setOtpState({
        ...initialOtpState,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { mutate, isLoading, serverError, setServerError };
}

// export const useSocialLoginMutation = (
//   options: UseMutationOptions<any, unknown, SocialLoginInputType, unknown>
// ) => {
//   return useMutation(
//     (input: SocialLoginInputType) => client.auth.socialLogin(input),
//     {
//       onError: (error: any) => {
//         console.log(error.message);
//       },
//       ...options,
//     }
//   );
// };

export function useSocialLogin() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { setToken } = useToken();
  const [_, setAuthorized] = useAtom(authorizationAtom);

  return useMutation(client.auth.socialLogin, {
    onSuccess: (data: any) => {
      if (data?.token && data?.permissions?.length) {
        setToken(data?.token);
        setAuthorized(true);
        return;
      }
      if (!data.token) {
        toast.error(`${t('forms:error-credential-wrong')}`);
      }
    },
    onError: (error: Error) => {
      console.log(error.message);
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
}

export function useVerifyForgotPasswordToken() {
  const queryClient = useQueryClient();
  let [formError, setFormError] = useState<any>(null);

  const { mutate, mutateAsync, isLoading } = useMutation(
    client.auth.verifyForgetPassword,
    {
      onSuccess: (data: any) => {
        setFormError(null);
        if (!data.success) {
          setFormError({
            token: data?.message ?? '',
          });
          return;
        }
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError(error)) {
          const data: any = error.response?.data;
          if (data?.message) {
            setFormError({ token: String(data.message) });
            return;
          }
          if (data?.errors && typeof data.errors === 'object') {
            const first = Object.values(data.errors)?.[0] as any;
            const firstMessage = Array.isArray(first) ? first[0] : first;
            if (firstMessage) {
              setFormError({ token: String(firstMessage) });
              return;
            }
          }
        }
        setFormError({ token: 'SOMETHING_WENT_WRONG' });
      },
      onSettled: () => {
        queryClient.clear();
      },
    }
  );

  return { mutate, mutateAsync, isLoading, formError, setFormError };
}

export const useUser = () => {
  const { t } = useTranslation('common');
  const [isAuthorized] = useAtom(authorizationAtom);
  const setAuthorized = useSetAtom(authorizationAtom);
  const { setEmailVerified, getEmailVerified } = useToken();
  const { emailVerified } = getEmailVerified();
  const router = useRouter();
  const { data, isLoading, error } = useQuery<User, Error>(
    [API_ENDPOINTS.CUSTOMER],
    client.user.me,
    {
      enabled: isAuthorized,
      retry: false,
      onSuccess: (data) => {
        if (!emailVerified) {
          setEmailVerified(true);
          router.push(ROUTES.HOME);
          return;
        }
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 409) {
            setEmailVerified(false);
            if (router.pathname === ROUTES.verifyEmail) {
              return;
            }
            router.push(ROUTES.verifyEmail);
            return;
          }
          const responseData: any = err.response?.data;
          if (responseData?.message) {
            toast.error(String(responseData.message));
          } else if (
            responseData?.errors &&
            typeof responseData.errors === 'object'
          ) {
            const first = Object.values(responseData.errors)?.[0] as any;
            const firstMessage = Array.isArray(first) ? first[0] : first;
            if (firstMessage) {
              toast.error(String(firstMessage));
            } else {
              toast.error(t('SOMETHING_WENT_WRONG'));
            }
          } else {
            toast.error(t('SOMETHING_WENT_WRONG'));
          }
        }
        Cookies.remove(AUTH_TOKEN);
        setAuthorized(false);
      },
    }
  );
  return {
    me: data,
    loading: isLoading,
    error,
    isAuthorized,
  };
};

export function useSubscribe() {
  const queryClient = useQueryClient();
  let [formError, setFormError] = useState<any>(null);

  const { mutate, isLoading } = useMutation(client.auth.subscribe, {
    onSuccess: (data: any) => {
      if (!data.success) {
        setFormError({
          token: data?.message ?? '',
        });
        return;
      }
    },
    onSettled: () => {
      queryClient.clear();
    },
  });

  return { mutate, isLoading, formError, setFormError };
}
