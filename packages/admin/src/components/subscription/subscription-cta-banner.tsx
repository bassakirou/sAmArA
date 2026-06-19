import LinkButton from '@/components/ui/link-button';
import { useVendorSubscriptionStatusQuery } from '@/data/vendor-subscription';
import {
  getAuthCredentials,
  isStoreOwner,
  isSuperAdmin,
} from '@/utils/auth-utils';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

export default function SubscriptionCtaBanner({
  isPlanRestrictionsExempt = false,
}: {
  isPlanRestrictionsExempt?: boolean;
}) {
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const isOwner = isStoreOwner(permissions);
  const isSuperAdminUser = isSuperAdmin(permissions);
  const shopParam =
    typeof router.query.shop === 'string' ? router.query.shop : undefined;

  const { data, isLoading } = useVendorSubscriptionStatusQuery({
    enabled: isOwner,
  });

  if (!isOwner) return null;
  if (isSuperAdminUser) return null;
  if (isPlanRestrictionsExempt) return null;
  if (isLoading) return null;

  const endsAt = data?.active_subscription_ends_at;
  const hasActivePaid =
    !!data?.active_subscription_plan &&
    !!endsAt &&
    dayjs(endsAt).isAfter(dayjs());

  if (hasActivePaid) return null;

  const href = shopParam ? `/${shopParam}/subscriptions` : '/subscriptions';

  return (
    <div className="mb-6 rounded border border-border-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-heading">
          Activez votre abonnement pour publier votre boutique et vos produits.
        </div>
        <LinkButton href={href} className="w-full md:w-auto" size="small">
          Voir les abonnements
        </LinkButton>
      </div>
    </div>
  );
}
