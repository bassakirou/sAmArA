import Card from '@/components/common/card';
import Search from '@/components/common/search';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import SubscriptionPlanList from '@/components/subscription-plan/subscription-plan-list';
import { Routes } from '@/config/routes';
import { useSubscriptionPlansQuery } from '@/data/subscription-plan';
import { SortOrder } from '@/types';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

export default function SubscriptionPlansPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const { plans, paginatorInfo, loading, error } = useSubscriptionPlansQuery({
    limit: 15,
    page,
    orderBy,
    sortedBy,
    name: searchTerm,
  } as any);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/2">
          <h1 className="text-xl font-semibold text-heading">Abonnements</h1>
        </div>

        <div className="flex w-full items-center justify-end md:w-1/2">
          <Search
            onSearch={(e) => {
              setSearchTerm(e.searchText);
              setPage(1);
            }}
          />
          <LinkButton href={Routes.subscriptionPlans.subscribers} className="ms-4" variant="outline">
            Voir les abonnés
          </LinkButton>
          <LinkButton href={Routes.subscriptionPlans.history} className="ms-4" variant="outline">
            Historique
          </LinkButton>
          <LinkButton href={Routes.subscriptionPlans.create} className="ms-4">
            {t('common:text-add')}
          </LinkButton>
        </div>
      </Card>

      <SubscriptionPlanList
        plans={plans}
        paginatorInfo={paginatorInfo ?? null}
        onPagination={setPage}
      />
    </>
  );
}

SubscriptionPlansPage.authenticate = {
  permissions: adminOnly,
};

SubscriptionPlansPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
