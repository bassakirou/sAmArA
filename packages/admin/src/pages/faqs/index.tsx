import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { SortOrder, FaqType } from '@/types';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import { useFaqsQuery } from '@/data/faq';
import { useRouter } from 'next/router';
import { Config } from '@/config';
import FaqList from '@/components/faq/faq-list';
import Select from '@/components/ui/select/select';

export default function Faqs() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const [type, setType] = useState<{ label: string; value: FaqType } | null>(
    null
  );

  const { faqs, paginatorInfo, loading, error } = useFaqsQuery({
    limit: 10,
    orderBy,
    sortedBy,
    title: searchTerm,
    type: type?.value,
    page,
    language: locale!,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  const typeOptions = [
    { label: t('form:faq-type-customer'), value: FaqType.Customer },
    { label: t('form:faq-type-seller'), value: FaqType.Seller },
  ];

  return (
    <>
      <Card className="mb-8 flex flex-col items-center xl:flex-row">
        <div className="mb-4 md:w-1/4 xl:mb-0">
          <h1 className="text-xl font-semibold text-heading">
            {t('common:sidebar-nav-item-faqs')}
          </h1>
        </div>

        <div className="ms-auto flex w-full flex-col items-center space-y-4 md:flex-row md:space-y-0 xl:w-3/4">
          <Search onSearch={handleSearch} />

          <div className="w-full md:ms-6 md:w-64">
            <Select
              value={type}
              onChange={(option: any) => {
                setType(option);
                setPage(1);
              }}
              options={typeOptions}
              isClearable
            />
          </div>

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`${Routes.faq.create}`}
              className="h-12 w-full md:ms-6 md:w-auto"
            >
              <span className="block md:hidden xl:block">
                + {t('form:button-label-add-faq')}
              </span>
              <span className="hidden md:block xl:hidden">
                + {t('form:button-label-add')}
              </span>
            </LinkButton>
          )}
        </div>
      </Card>

      <FaqList
        faqs={faqs}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
        paginatorInfo={paginatorInfo}
      />
    </>
  );
}

Faqs.authenticate = {
  permissions: adminOnly,
};
Faqs.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
