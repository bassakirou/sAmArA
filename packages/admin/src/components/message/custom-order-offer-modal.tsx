import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/button';
import Loader from '@/components/ui/loader/loader';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useMessagesQuery } from '@/data/conversations';
import { useCreateCustomOrderOffer } from '@/data/custom-order-offers';
import ProductMessageCard from '@/components/message/product-message-card';
import { Product } from '@/types';
import { useQueryClient } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';

function getReferencePrice(product?: Product | null) {
  return Number(
    product?.sale_price ??
      product?.price ??
      product?.min_price ??
      product?.max_price ??
      0
  );
}

export default function CustomOrderOfferModal() {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const queryClient = useQueryClient();
  const conversationId = String(data?.conversationId ?? '');
  const shopId = String(data?.shopId ?? '');
  const { mutate: createOffer, isLoading: isSubmitting } =
    useCreateCustomOrderOffer();
  const { messages, loading } = useMessagesQuery({
    slug: conversationId,
    limit: 50,
  });
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>('');

  const products = useMemo(() => {
    const unique = new Map<string, Product>();
    [...messages].reverse().forEach((message: any) => {
      const product = message?.product;
      if (!product?.id) return;
      if (shopId && String(product?.shop?.id ?? '') !== shopId) return;
      unique.set(String(product.id), product);
    });

    return Array.from(unique.values()).reverse();
  }, [messages, shopId]);

  const selectedProduct = useMemo(
    () =>
      products.find((product) => String(product.id) === selectedProductId) ??
      null,
    [products, selectedProductId]
  );

  const referencePrice = getReferencePrice(selectedProduct);
  const minimumAllowedPrice = referencePrice * 0.7;

  useEffect(() => {
    if (!products.length) {
      setSelectedProductId('');
      setNegotiatedPrice('');
      return;
    }

    const hasSelectedProduct = products.some(
      (product) => String(product.id) === selectedProductId
    );

    if (hasSelectedProduct) {
      return;
    }

    const nextProduct = products[0];
    setSelectedProductId(String(nextProduct.id));
    setNegotiatedPrice(String(getReferencePrice(nextProduct)));
  }, [products, selectedProductId]);

  const handleSubmit = () => {
    if (!selectedProductId || !Number(negotiatedPrice)) {
      return;
    }

    createOffer(
      {
        conversationId,
        product_id: selectedProductId,
        negotiated_price: Number(negotiatedPrice),
        message:
          'Une offre personnalisee a ete proposee dans cette discussion.',
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(API_ENDPOINTS.MESSAGE);
          queryClient.invalidateQueries(API_ENDPOINTS.CONVERSIONS);
          closeModal();
        },
      }
    );
  };

  return (
    <div className="w-full max-w-2xl rounded-xl bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-heading">
            Creer une commande personnalisee
          </h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Selectionnez un produit deja present dans cette discussion, puis
            fixez le prix negocie.
          </p>
        </div>
        <button
          type="button"
          onClick={closeModal}
          className="text-sm font-medium text-[#64748B] transition hover:text-heading"
        >
          Fermer
        </button>
      </div>

      {loading ? (
        <div className="py-10">
          <Loader text="Chargement..." />
        </div>
      ) : !products.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#D8E1EA] bg-[#F8FAFC] p-5 text-sm text-[#64748B]">
          Aucun produit reference dans cette conversation pour le moment.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-1">
            {products.map((product) => {
              const active = String(product.id) === selectedProductId;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setSelectedProductId(String(product.id));
                    setNegotiatedPrice(String(getReferencePrice(product)));
                  }}
                  className={`rounded-2xl border text-left transition ${
                    active
                      ? 'border-accent bg-[#F8FFFC]'
                      : 'border-[#E2E8F0] bg-white hover:border-accent/50'
                  }`}
                >
                  <ProductMessageCard product={product} compact />
                </button>
              );
            })}
          </div>

          {selectedProduct ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <div>
                  <p className="text-sm font-medium text-heading">
                    Conditions de l&apos;offre
                  </p>
                  <p className="mt-2 text-sm text-[#64748B]">
                    Prix de reference :{' '}
                    <span className="font-semibold text-heading">
                      {referencePrice.toFixed(2)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Prix minimum autorise :{' '}
                    <span className="font-semibold text-heading">
                      {minimumAllowedPrice.toFixed(2)}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Le backend applique la regle finale et refuse tout prix
                    negatif ou toute baisse excessive.
                  </p>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-heading">
                    Prix negocie
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={negotiatedPrice}
                    onChange={(event) => setNegotiatedPrice(event.target.value)}
                    className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-heading outline-none transition focus:border-accent"
                  />
                </label>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!selectedProductId || !Number(negotiatedPrice)}
            >
              Envoyer l&apos;offre
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
