import Image from 'next/image';
import { CheckMarkFill } from '@/components/icons/checkmark-circle-fill';
import { CloseFillIcon } from '@/components/icons/close-fill';
import { useTranslation } from 'next-i18next';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import Loader from '@/components/ui/loader/loader';
import { useMeQuery } from '@/data/user';
import { useRouter } from 'next/router';
import { useSettings } from '@/contexts/settings.context';
import { useVendorSubscriptionStatusQuery } from '@/data/vendor-subscription';
import dayjs from 'dayjs';

const UserDetails: React.FC = () => {
  const { t } = useTranslation('common');
  const { data, isLoading: loading } = useMeQuery();
  const { locale } = useRouter();
  const { customerService } = useSettings();
  const { data: subscriptionStatus } = useVendorSubscriptionStatusQuery();
  const activePlan = subscriptionStatus?.active_subscription_plan;
  const endsAt = subscriptionStatus?.active_subscription_ends_at;
  const hasActivePaid =
    !!activePlan && !!endsAt && dayjs(endsAt).isAfter(dayjs());

  if (loading) return <Loader text={t('text-loading')} />;

  return (
    <div className="flex h-full flex-col items-center p-5">
      <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200">
        <Image
          src={data?.profile?.avatar?.thumbnail ?? '/avatar-placeholder.svg'}
          fill
          sizes="(max-width: 768px) 100vw"
          alt={data?.name ?? ''}
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-heading">{data?.name}</h3>
      <p className="mt-1 text-sm text-muted">{data?.email}</p>
      <p className="mt-1 text-sm text-muted">{data?.phone}</p>
      {!data?.profile ? (
        <p className="mt-0.5 text-sm text-muted">
          {t('text-add-your')}{' '}
          <Link href={Routes.profileUpdate} className="text-accent underline">
            {t('authorized-nav-item-profile')}
          </Link>
        </p>
      ) : (
        <>
          <p className="mt-0.5 text-sm text-muted">{data?.profile.contact}</p>
        </>
      )}
      <div className="mt-6 flex items-center justify-center rounded border border-gray-200 px-3 py-2 text-sm text-body-dark">
        {data?.is_active ? (
          <CheckMarkFill width={16} className="text-accent me-2" />
        ) : (
          <CloseFillIcon width={16} className="text-red-500 me-2" />
        )}
        {data?.is_active ? t('text-enabled') : t('text-disabled')}
      </div>
      {activePlan ? (
        <div className="mt-3 w-full rounded border border-gray-200 px-3 py-2 text-center text-sm text-body-dark">
          <span className="font-semibold">Abonnement :</span>{' '}
          <span className="font-semibold text-heading">{activePlan?.name}</span>
          {hasActivePaid && endsAt ? (
            <div className="mt-1 text-xs text-muted">
              Valable jusqu’au {dayjs(endsAt).format('DD/MM/YYYY')}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="flex grow items-end justify-end">
        <p className="mt-1 text-sm text-muted">
          {' '}
          Service client: {customerService}
        </p>
      </div>
    </div>
  );
};
export default UserDetails;
