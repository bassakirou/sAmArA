import dynamic from 'next/dynamic';
import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  allowedRoles,
  getAuthCredentials,
  hasAccess,
  isSuperAdmin,
  isAuthenticated,
} from '@/utils/auth-utils';
import AppLayout from '@/components/layouts/app';
import { Routes } from '@/config/routes';
import { Config } from '@/config';

const AdminDashboard = dynamic(() => import('@/components/dashboard/admin'));
const OwnerDashboard = dynamic(() => import('@/components/dashboard/owner'));

export default function Dashboard({
  userPermissions,
  primaryPermission,
}: {
  userPermissions: string[];
  primaryPermission?: string | null;
}) {
  if (
    isSuperAdmin({
      permissions: userPermissions,
      primary_permission: primaryPermission,
    })
  ) {
    return <AdminDashboard />;
  }
  return <OwnerDashboard />;
}

Dashboard.Layout = AppLayout;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale } = ctx;
  // TODO: Improve it
  const generateRedirectUrl =
    locale !== Config.defaultLanguage
      ? `/${locale}${Routes.login}`
      : Routes.login;
  const { token, permissions, primary_permission } = getAuthCredentials(ctx);
  if (
    !isAuthenticated({ token, permissions }) ||
    !hasAccess(allowedRoles, { token, permissions, primary_permission })
  ) {
    return {
      redirect: {
        destination: generateRedirectUrl,
        permanent: false,
      },
    };
  }
  if (locale) {
    return {
      props: {
        ...(await serverSideTranslations(locale, [
          'common',
          'table',
          'widgets',
        ])),
        userPermissions: permissions,
        primaryPermission: primary_permission ?? null,
      },
    };
  }
  return {
    props: {
      userPermissions: permissions,
      primaryPermission: primary_permission ?? null,
    },
  };
};
