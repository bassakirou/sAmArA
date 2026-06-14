import { getAuthCredentials, isSuperAdmin } from '@/utils/auth-utils';
import dynamic from 'next/dynamic';

const AdminLayout = dynamic(() => import('@/components/layouts/admin'));
const OwnerLayout = dynamic(() => import('@/components/layouts/owner'));

export default function AppLayout({
  userPermissions,
  ...props
}: {
  userPermissions?: string[];
}) {
  const auth = getAuthCredentials();
  const effectivePermissions = userPermissions ?? auth.permissions;

  if (isSuperAdmin(userPermissions ? effectivePermissions : auth)) {
    return <AdminLayout {...props} />;
  }
  return <OwnerLayout {...props} />;
}
