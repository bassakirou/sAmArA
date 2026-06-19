import { Routes } from '@/config/routes';
import { Shop } from '@/types';

type ResolveConversationHrefArgs = {
  conversationId: string | number;
  currentShopSlug?: string;
  noticeShopId?: string | number | null;
  ownedShops?: Shop[];
  fallbackToOwnerView?: boolean;
};

function findOwnedShopSlug(
  ownedShops: Shop[] | undefined,
  shopId?: string | number | null
) {
  if (shopId == null) return undefined;

  return ownedShops?.find(
    (shop) => String(shop?.id) === String(shopId)
  )?.slug;
}

export function resolveConversationHref({
  conversationId,
  currentShopSlug,
  noticeShopId,
  ownedShops,
  fallbackToOwnerView = false,
}: ResolveConversationHrefArgs) {
  const resolvedShopSlug =
    currentShopSlug || findOwnedShopSlug(ownedShops, noticeShopId);

  if (resolvedShopSlug) {
    return `/${resolvedShopSlug}${Routes.shopMessage.details(
      String(conversationId)
    )}`;
  }

  if (fallbackToOwnerView) {
    return Routes.shopMessage.details(String(conversationId));
  }

  return Routes.message.details(String(conversationId));
}

export function resolveConversationListHref({
  conversationId,
  currentShopSlug,
}: {
  conversationId: string | number;
  currentShopSlug?: string;
}) {
  if (currentShopSlug) {
    return `/${currentShopSlug}${Routes.shopMessage.details(
      String(conversationId)
    )}`;
  }

  return Routes.message.details(String(conversationId));
}
