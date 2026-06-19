import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import ProductMessageCard from '@/components/message/product-message-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useProductsQuery } from '@/data/product';
import { useSendMessage } from '@/data/conversations';
import { Product, ProductStatus } from '@/types';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';

type ProductPickerPayload = {
  conversationId?: string | number;
  shopId?: string | number;
};

export default function ProductPickerModal() {
  const { t } = useTranslation('common');
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: sendMessage, isLoading: sending } = useSendMessage();
  const [searchText, setSearchText] = useState('');
  const payload = (data ?? {}) as ProductPickerPayload;

  const queryOptions = useMemo(
    () => ({
      limit: 20,
      page: 1,
      shop_id: payload.shopId ? String(payload.shopId) : undefined,
      name: searchText.trim() || undefined,
      status: ProductStatus.Publish,
      orderBy: 'updated_at',
      sortedBy: 'DESC' as any,
    }),
    [payload.shopId, searchText]
  );

  const { products, loading, error } = useProductsQuery(queryOptions, {
    enabled: Boolean(payload.shopId),
  });

  const handleSelectProduct = (product: Product) => {
    if (!payload.conversationId) return;

    sendMessage(
      {
        id: String(payload.conversationId),
        message: 'Je vous propose aussi ce produit.',
        product_id: String(product.id),
      } as any,
      {
        onSuccess: () => {
          closeModal();
        },
      }
    );
  };

  return (
    <div className="m-auto block w-[min(42rem,calc(100vw-2rem))] rounded-2xl bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-heading">
            Ajouter un produit a la conversation
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Selectionne un produit de la boutique pour l’envoyer dans le chat.
          </p>
        </div>
        <Button variant="outline" size="small" onClick={closeModal}>
          {t('text-close')}
        </Button>
      </div>

      <Input
        name="search-products"
        variant="outline"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="Rechercher un produit"
        className="mb-4"
      />

      <div className="max-h-[28rem] overflow-y-auto rounded-2xl border border-gray-200">
        {loading ? (
          <Loader className="!h-48" showText={false} />
        ) : error ? (
          <div className="p-4">
            <ErrorMessage message={error.message} />
          </div>
        ) : products.length ? (
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                disabled={sending}
                onClick={() => handleSelectProduct(product)}
                className="w-full p-2 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ProductMessageCard product={product} compact />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center px-4 text-sm text-gray-500">
            Aucun produit trouve pour cette boutique.
          </div>
        )}
      </div>
    </div>
  );
}
