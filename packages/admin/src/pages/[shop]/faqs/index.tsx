import Card from '@/components/common/card';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import ShopLayout from '@/components/layouts/shop';
import { useShopQuery, useUpdateShopMutation } from '@/data/shop';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Table } from '@/components/ui/table';
import { useIsRTL } from '@/utils/locals';
import Link from '@/components/ui/link';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import { toast } from 'react-toastify';
import { Routes } from '@/config/routes';

type FaqSection = {
  title: string;
  description: string;
  order: number;
};

const normalizeFaqs = (value: unknown): FaqSection[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;

      const faq = item as Record<string, unknown>;
      return {
        title:
          typeof faq.title === 'string'
            ? faq.title
            : typeof faq.question === 'string'
              ? faq.question
              : '',
        description:
          typeof faq.description === 'string'
            ? faq.description
            : typeof faq.answer === 'string'
              ? faq.answer
              : '',
        order: Number.isFinite(Number(faq.order)) ? Number(faq.order) : index,
      };
    })
    .filter((item): item is FaqSection => item !== null);
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export default function ShopFaqsPage() {
  const { t } = useTranslation(['common', 'table', 'form']);
  const { alignLeft, alignRight } = useIsRTL();
  const router = useRouter();
  const { shop } = router.query;

  const { data, isLoading, error } = useShopQuery(
    { slug: String(shop) },
    { enabled: Boolean(shop) }
  );
  const { mutateAsync: updateShop, isLoading: saving } = useUpdateShopMutation();

  const [searchTerm, setSearchTerm] = useState('');

  const faqs = useMemo(() => {
    const normalized = normalizeFaqs((data?.settings as any)?.faqs);
    return normalized.sort((a, b) => Number(a.order) - Number(b.order));
  }, [data?.settings]);

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return faqs
      .map((faq, index) => ({ ...faq, _index: index }))
      .filter((faq) => {
        if (!term) return true;
        return (
          faq.title.toLowerCase().includes(term) ||
          stripHtml(faq.description).toLowerCase().includes(term)
        );
      });
  }, [faqs, searchTerm]);

  const handleDelete = async (index: number) => {
    if (!data) return;

    const nextFaqs = faqs.filter((_, i) => i !== index);

    try {
      await updateShop({
        id: data.id,
        name: data.name,
        settings: {
          ...(data.settings ?? {}),
          faqs: nextFaqs,
        },
      } as any);
      toast.success(t('common:successfully-updated'));
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t('common:something-went-wrong'));
    }
  };

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const columns: any = [
    {
      title: t('table:table-item-title'),
      dataIndex: 'title',
      key: 'title',
      align: alignLeft,
    },
    {
      title: t('table:table-item-description'),
      dataIndex: 'description',
      key: 'description',
      align: alignLeft,
      ellipsis: true,
      render: (value: string) => stripHtml(String(value ?? '')),
    },
    {
      title: t('table:table-item-order'),
      dataIndex: 'order',
      key: 'order',
      align: 'center',
      width: 120,
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: '_index',
      key: 'actions',
      align: alignRight,
      width: 120,
      render: (index: number) => (
        <div className="inline-flex items-center gap-6">
          <Link
            href={`/${String(shop)}${Routes.faq.list}/${index}/edit`}
            className="text-body transition duration-200 hover:text-heading"
            title={t('common:text-edit')}
          >
            <EditIcon width={16} />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(index)}
            className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
            title={t('common:text-delete')}
            disabled={saving}
          >
            <TrashIcon width={16} />
          </button>
        </div>
      ),
    },
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
          <Search onSearch={({ searchText }) => setSearchTerm(searchText)} />
          <LinkButton
            href={`/${String(shop)}${Routes.faq.create}`}
            className="h-12 w-full md:ms-6 md:w-auto"
          >
            + {t('common:sidebar-nav-item-add-faq')}
          </LinkButton>
        </div>
      </Card>

      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          columns={columns}
          emptyText={t('table:empty-table-data')}
          data={rows}
          rowKey="_index"
          scroll={{ x: 800 }}
        />
      </div>
    </>
  );
}

ShopFaqsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ShopFaqsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
