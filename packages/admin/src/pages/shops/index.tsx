import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopList from '@/components/shop/shop-list';
import { useState } from 'react';
import Search from '@/components/common/search';
import { adminOnly } from '@/utils/auth-utils';
import { useShopsQuery } from '@/data/shop';
import { SortOrder } from '@/types';
import Button from '@/components/ui/button';

export default function AllShopPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const [isDeleted, setIsDeleted] = useState(false);
  const { shops, paginatorInfo, loading, error } = useShopsQuery({
    name: searchTerm,
    limit: 10,
    page,
    orderBy,
    sortedBy,
    is_deleted: isDeleted ? 'true' : 'false',
  } as any);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
  }

  function handlePagination(current: any) {
    setPage(current);
  }
  return (
    <>
      <Card className="mb-8 flex flex-col items-center justify-between md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <h1 className="text-lg font-semibold text-heading">
            {isDeleted
              ? t('common:text-trash') +
                ' - ' +
                t('common:sidebar-nav-item-shops')
              : t('common:sidebar-nav-item-shops')}
          </h1>
        </div>

        <div className="ms-auto flex w-full flex-col items-center md:w-3/4 md:flex-row gap-4">
          <Search onSearch={handleSearch} />
          <Button
            onClick={() => setIsDeleted(!isDeleted)}
            className="w-full md:w-auto"
            variant="outline"
          >
            {isDeleted
              ? t('common:text-back-to-list') ?? 'Retour à la liste'
              : t('common:text-trash') ?? 'Corbeille'}
          </Button>
        </div>
      </Card>
      <ShopList
        shops={shops}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
        isDeleted={isDeleted}
      />
    </>
  );
}
AllShopPage.authenticate = {
  permissions: adminOnly,
};
AllShopPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
