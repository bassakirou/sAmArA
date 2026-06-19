import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { SortOrder, Faq, FaqType, MappedPaginatorInfo } from '@/types';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import { Routes } from '@/config/routes';

export type IProps = {
  faqs: any | undefined | null;
  onPagination: (key: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
  paginatorInfo: MappedPaginatorInfo | null;
};

const FaqList = ({ faqs, onPagination, onSort, onOrder, paginatorInfo }: IProps) => {
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();

  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const onHeaderClick = (column: string | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc
      );
      onOrder(column!);

      setSortingObj({
        sort: sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });

  const columns: any = [
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 90,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={sortingObj.sort === SortOrder.Asc && sortingObj.column === 'title'}
          isActive={sortingObj.column === 'title'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'title',
      key: 'title',
      align: alignLeft,
      onHeaderCell: () => onHeaderClick('title'),
    },
    {
      title: t('table:table-item-description'),
      dataIndex: 'description',
      key: 'description',
      align: alignLeft,
      ellipsis: true,
    },
    {
      title: t('table:table-item-type'),
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 160,
      render: (type: FaqType) =>
        type === FaqType.Seller ? t('form:faq-type-seller') : t('form:faq-type-customer'),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-order')}
          ascending={sortingObj.sort === SortOrder.Asc && sortingObj.column === 'order'}
          isActive={sortingObj.column === 'order'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'order',
      key: 'order',
      align: 'center',
      width: 120,
      onHeaderCell: () => onHeaderClick('order'),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: alignRight,
      render: (slug: string, record: Faq) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_FAQ"
          routes={Routes?.faq}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          columns={columns}
          emptyText={t('table:empty-table-data')}
          data={faqs}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default FaqList;
